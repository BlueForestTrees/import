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
        const raw = raws[i]
        const trunkId = await getTrunkId(raw.trunkExternId)
        const impactEntryId = trunkId && await getImpactEntryId(raw)
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

        if (i % 5000 === 0) {
            debug("%o/%o", totalImpacts, raws.length)
        }
    }
    return {ok: 1, impacts: totalImpacts}
}

const impactEntryIdCache = {}
const getImpactEntryId = async ({impactExternId}) => {
    if (!impactEntryIdCache[impactExternId]) {
        const doc = await col(cols.IMPACT_ENTRY).findOne({externId: impactExternId}, {projection: {_id: 1}})
        if(!doc || doc._id){
            debug("impactEntry not found %o", impactExternId)
        }else{
            debug("impactEntry found %o", impactExternId)
        }
        impactEntryIdCache[impactExternId] = doc && doc._id || createObjectId()
    }
    return impactEntryIdCache[impactExternId]
}

const getImpactId = async (trunkId, impactId) => {
    const doc = await col(cols.IMPACT).findOne({trunkId, impactId})
    return doc && doc._id || createObjectId()
}