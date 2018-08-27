import {run} from 'express-blueforest'
import {Router} from "express-blueforest"
import {cols} from "../collections"
import {col} from "mongo-registry"
import configure from "items-service"
import fileUpload from "express-fileupload"

import {map, filter} from 'lodash'
import {createObjectId} from "mongo-registry"
import {parseImpactCsv} from "../parse/csv"

const router = Router()
const impactService = configure(() => col(cols.IMPACT))
const impactEntryService = configure(() => col(cols.IMPACT_ENTRY))
const trunkService = configure(() => col(cols.TRUNK))

module.exports = router

const importImpactsByChunks = async raws => {
    const length = raws.length
    let insertions = 0
    for (let i = 0, chunk = 100; i < length; i += chunk) {
        let impactsEtDamages = await ademeToBlueforestImpact(raws.slice(i, i + chunk))
        let impacts = filter(impactsEtDamages, i => {
            let keep = !i.insertOne.damage
            delete i.insertOne.damage
            return keep
        })
        if (impacts.length > 0) {
            await impactService.bulkWrite(impacts)
            insertions += impacts.length
        }
    }
    return {ok: 1, nInserted: insertions}
}

const ademeToBlueforestImpact = raws => Promise.all(map(raws, async raw => ({
    insertOne: {
        _id: createObjectId(),
        ...await resolveTrunk(raw),
        ...await resolveImpactEntry(raw),
        bqt: raw.bqt
    }
})))

const resolveTrunk = async raw => {
    const doc = (await trunkService.findOne({externId: raw.trunkExternId}, {_id: 1}))
    return (doc && {trunkId: doc._id}) || {trunkExternId: raw.trunkExternId}
}
const resolveImpactEntry = async raw => {
    const doc = await impactEntryService.findOne({externId: raw.impactExternId}, {_id: 1, damage: 1})
    return (doc && {impactId: doc._id, damage: doc.damage}) || {impactExternId: raw.impactExternId}
}

router.post('/api/import/ademe/impact',
    fileUpload({files: 1, limits: {fileSize: 5 * 1024 * 1024}}),
    run(({}, req) => parseImpactCsv(req.files.file && req.files.file.data || req.files['csv.ademe.impact'].data)),
    run(importImpactsByChunks)
)