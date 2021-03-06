import {parseZoneGeoCsv} from "../util/csv"
import {chunkify} from "../util/util"
import {map} from "lodash"
import {col} from "mongo-registry"
import {cols} from "../collections"

const zonesService = () => col(cols.ZONES_GEO)

const importZoneGeo = async raws => {
    const chunk = chunkify(raws,100)
    let c
    while(c = chunk()){
        await zonesService().bulkWrite(ademeToBlueforestZone(c))
    }
    return {ok: 1, nInserted: raws.length}
}

const ademeToBlueforestZone = raws => map(raws, raw => ({insertOne: {...raw}}))

// router.post('/api/import/ademe/zone',
//     fileUpload({files: 1, limits: {fileSize: 5 * 1024 * 1024}}),
//     run(({}, req) => parseZoneGeoCsv(req.files.file && req.files.file.data || req.files['csv.ademe.zone'].data)),
//     run(importZoneGeo)
// )