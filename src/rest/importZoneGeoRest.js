import fileUpload from "express-fileupload"
import {run} from "express-blueforest"
import {Router} from "express-blueforest"
import {parseImpactCsv, parseZoneGeoCsv} from "../util/csv"
import {chunkify} from "../util/util"
import {map} from "lodash"
import configure from "items-service"
import {col} from "mongo-registry"
import {cols} from "../collections"

const router = Router()
const zonesService = configure(() => col(cols.ZONES_GEO))

const importZoneGeo = async raws => {
    const chunk = chunkify(raws,100)
    let c
    while(c = chunk()){
        await zonesService.bulkWrite(ademeToBlueforestZone(c))
    }
    return {ok: 1, nInserted: raws.length}
}

const ademeToBlueforestZone = raws => map(raws, raw => ({insertOne: {...raw}}))

router.post('/api/import/ademe/zone',
    fileUpload({files: 1, limits: {fileSize: 5 * 1024 * 1024}}),
    run(({}, req) => parseZoneGeoCsv(req.files.file && req.files.file.data || req.files['csv.ademe.zone'].data)),
    run(importZoneGeo)
)

module.exports = router