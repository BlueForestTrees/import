import {cols} from "../collections"
import {col} from "mongo-registry"
import {createObjectId} from "mongo-registry"
import {getAdemeUserId} from "./user"
import {getTrunkId} from "./trunk"

const debug = require('debug')('api:import')

export const importImpacts = sendImpact => async raws => {
    const ademeUserId = await getAdemeUserId()
    let totalImpacts = 0

    for (let i = 0; i < raws.length; i++) {
        if (i % 5000 === 0) {
            debug("%o impacts on %o/%o lines", totalImpacts, i, raws.length)
        }
        const raw = raws[i]
        const trunkId = await getTrunkId(raw.trunkExternId)
        if (trunkId) {//cas bug dans fichier source, trunk dans trunk_impact mais pas dans trunk
            const entryId = await getEntryId(raw.impactExternId)
            const impactEntryId = entryId.impactId
            if (impactEntryId) {
                const iOuD = ({
                    _id: await getImpactId(trunkId, impactEntryId),
                    trunkId,
                    impactId: impactEntryId,
                    oid: ademeUserId,
                    bqt: raw.bqt,
                    dateUpdate: new Date()
                })
                sendImpact(iOuD)
                totalImpacts++
            }
        }
    }

    return {ok: 1, impacts: totalImpacts}
}

const impactEntryIdCache = {}
const damageEntryIdCache = {}
const getEntryId = async externId => {
    if (impactEntryIdCache[externId]) {
        return {impactId: impactEntryIdCache[externId]}
    } else if (damageEntryIdCache[externId]) {
        return {damageId: damageEntryIdCache[externId]}
    } else {
        const doc = await col(cols.IMPACT_ENTRY).findOne({externId: externId}, {projection: {_id: 1}})
        if (doc && doc._id) {
            impactEntryIdCache[externId] = doc._id
            return getEntryId(externId)
        } else {
            const doc = await col(cols.DAMAGE_ENTRY).findOne({externId: externId}, {projection: {_id: 1}})
            if (doc && doc._id) {
                damageEntryIdCache[externId] = doc._id
                return getEntryId(externId)
            } else {
                throw new Error("entry not found" + externId)
            }
        }
    }
}

const getImpactId = async (trunkId, impactId) => {
    const doc = await col(cols.IMPACT).findOne({trunkId, impactId})
    return doc && doc._id || createObjectId()
}