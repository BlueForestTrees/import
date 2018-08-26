import {run} from 'express-blueforest'
import {Router} from "express-blueforest"
import fileUpload from "express-fileupload"
import {col} from "mongo-registry"
import {cols} from "../collections"
import {importAdemeImpactEntries} from "../service/impactEntryService"

const router = Router()

module.exports = router

const bulkWrite = data => col(cols.IMPACT_ENTRY).bulkWrite(data, {ordered: false})
const mapResult = ({res}) => ({
    ok: res.ok === 1,
    insertions: res.nInserted,
    upsertions: res.nUpserted,
    matches: res.nMatched,
    modifieds: res.nModified,
    removeds: res.nRemoved
})

router.post('/api/impactEntryBulk/ademe',
    fileUpload({files: 1, limits: {fileSize: 5 * 1024 * 1024}}),
    run(({}, req) => importAdemeImpactEntries(req.files.file && req.files.file.data || req.files['xlsx.ademe.impactEntry'].data)),
    run(bulkWrite),
    run(mapResult)
)