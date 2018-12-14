import {cols} from "../collections"
import {col} from "mongo-registry"

import {map, filter} from 'lodash'
import {createObjectId} from "mongo-registry"
import {chunkify} from "../util/util"
import {getAdemeUser, getAdemeUserId} from "../api"

const debug = require('debug')('api:import')

export const importImpactsByChunks = async raws => {
    const impactCol = col(cols.IMPACT)
    const damageCol = col(cols.DAMAGE)
    const ademeUserId = await getAdemeUserId()

    let totalImpacts = 0
    let totalDamages = 0

    const chunk = chunkify(raws, 100)
    let c, i = 0
    while (c = chunk()) {
        i++
        let impactsEtDamages = await ademeToBlueforestImpact(ademeUserId, c)

        let impacts = filter(impactsEtDamages, i => i.updateOne.filter.impactId)
        if (impacts.length > 0) {
            await impactCol.bulkWrite(impacts, {ordered: false})
            totalImpacts += impacts.length
        }

        let damages = filter(impactsEtDamages, i => i.updateOne.filter.damageId)
        if (damages.length > 0) {
            await damageCol.bulkWrite(damages, {ordered: false})
            totalDamages += impacts.length
        }
        if (i % 50 === 0) {
            debug("chunk produit i=%o/%o ti=%o td=%o", i * 100, raws.length, totalImpacts, totalDamages)
        }
    }
    return {ok: 1, impacts: totalImpacts, damages: totalDamages}
}

const ademeToBlueforestImpact = (ademeUserId, raws) => Promise.all(map(raws, async raw => ({
    updateOne: {
        filter: {
            ...await trunkId(raw),
            ...await impactOrDamageId(raw),
        },
        update: {
            $set: {
                oid: ademeUserId,
                bqt: raw.bqt,
            },
            $setOnInsert: {
                _id: createObjectId()
            }
        },
        upsert: true
    }
})))


const trunkId = async raw => {
    const doc = (await col(cols.TRUNK).findOne({externId: raw.trunkExternId}, {_id: 1}))
    return (doc && {trunkId: doc._id}) || {trunkExternId: raw.trunkExternId}
}
const impactOrDamageId = async raw => {
    let result = null

    let entry = await col(cols.IMPACT_ENTRY).findOne({externId: raw.impactExternId}, {_id: 1})
    if (entry) {
        result = {impactId: entry._id}
    } else if (entry = await col(cols.DAMAGE_ENTRY).findOne({externId: raw.impactExternId}, {_id: 1})) {
        result = {damageId: entry._id}
    } else {
        result = {externId: raw.impactExternId}
    }

    return result
}