import {run} from 'express-blueforest'
import {Router} from "express-blueforest"
import fileUpload from "express-fileupload"
import {col} from "mongo-registry"
import {cols} from "../collections"
import {importAdemeImpactEntries} from "../impact/importImpactEntryService"
import {forEach} from 'lodash'
import {getAdemeUser} from "../api"
import {validGod} from "../validations"

const router = Router()

module.exports = router

const impactEntries = col(cols.IMPACT_ENTRY)
const damageEntries = col(cols.DAMAGE_ENTRY)

const bulkWrite = data => impactEntries.bulkWrite(data, {ordered: false})

const moveDamages = async () => {
    const damages = await impactEntries.find({damage: true}).toArray()
    damageEntries.insertMany(forEach(damages, d => delete d.damage))
    impactEntries.deleteMany({damage: true})
    return {ok: 1}
}

router.post('/api/import/ademe/impactEntry',
    validGod,
    fileUpload({files: 1, limits: {fileSize: 5 * 1024 * 1024}}),
    run(
        async ({}, req) => ({
            buffer: req.files.file && req.files.file.data || req.files['xlsx.ademe.impactEntry'].data,
            ademeUser: await getAdemeUser()
        })
    ),
    run(importAdemeImpactEntries),
    run(bulkWrite),
    run(moveDamages)
)