import {run} from 'express-blueforest'
import {Router} from "express-blueforest"
import {cols} from "../collections"
import {col} from "mongo-registry"
import configure from "items-service"
import fileUpload from "express-fileupload"

import {map, filter} from 'lodash'
import {createObjectId} from "mongo-registry"
import {parseImpactCsv} from "../parse/csv"
import {chunkify} from "../util/util"

const router = Router()
const impactService = configure(() => col(cols.IMPACT))
const damageService = configure(() => col(cols.DAMAGE))
const impactEntryService = configure(() => col(cols.IMPACT_ENTRY))
const damageEntryService = configure(() => col(cols.DAMAGE_ENTRY))
const trunkService = configure(() => col(cols.TRUNK))

module.exports = router

const importImpactsByChunks = async raws => {
    const chunk = chunkify(raws,100)
    let c
    while(c = chunk()){
        let impactsEtDamages = await ademeToBlueforestImpact(c)

        let impacts = filter(impactsEtDamages, i => i.insertOne.impactId)
        if (impacts.length > 0) {
            await impactService.bulkWrite(impacts)
        }

        let damages = filter(impactsEtDamages, i => i.insertOne.damageId)
        if (damages.length > 0) {
            await damageService.bulkWrite(damages)
        }
    }
    return {ok: 1, nInserted: raws.length}
}

const ademeToBlueforestImpact = raws => Promise.all(map(raws, async raw => ({
    insertOne: {
        _id: createObjectId(),
        ...await resolveTrunk(raw),
        ...await resolveImpactOrDamageEntry(raw),
        bqt: raw.bqt
    }
})))

const resolveTrunk = async raw => {
    const doc = (await trunkService.findOne({externId: raw.trunkExternId}, {_id: 1}))
    return (doc && {trunkId: doc._id}) || {trunkExternId: raw.trunkExternId}
}
const resolveImpactOrDamageEntry = async raw => {
    let result = null

    let entry = await impactEntryService.findOne({externId: raw.impactExternId}, {_id: 1})
    if(entry) {
        result = {impactId: entry._id}
    }else if(entry = await damageEntryService.findOne({externId: raw.impactExternId}, {_id: 1})){
        result = {damageId: entry._id}
    }else{
        result = {externId: raw.impactExternId}
    }

    return result
}

router.post('/api/import/ademe/impact',
    fileUpload({files: 1, limits: {fileSize: 5 * 1024 * 1024}}),
    run(({}, req) => parseImpactCsv(req.files.file && req.files.file.data || req.files['csv.ademe.impact'].data)),
    run(importImpactsByChunks)
)