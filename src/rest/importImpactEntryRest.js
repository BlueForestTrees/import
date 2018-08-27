import {run} from 'express-blueforest'
import {Router} from "express-blueforest"
import fileUpload from "express-fileupload"
import {col} from "mongo-registry"
import {cols} from "../collections"
import {importAdemeImpactEntries} from "../impact/impactEntryService"

const router = Router()

module.exports = router

const bulkWrite = data => col(cols.IMPACT_ENTRY).bulkWrite(data, {ordered: false})
const mapResult = ({result}) => ({
    ok: result.ok === 1,
    insertions: result.nInserted,
    upsertions: result.nUpserted,
    matches: result.nMatched,
    modifieds: result.nModified,
    removeds: result.nRemoved
})

router.post('/api/import/ademe/impactEntry',
    fileUpload({files: 1, limits: {fileSize: 5 * 1024 * 1024}}),
    run(({}, req) => importAdemeImpactEntries(req.files.file && req.files.file.data || req.files['xlsx.ademe.impactEntry'].data)),
    run(bulkWrite),
    run(mapResult)
)