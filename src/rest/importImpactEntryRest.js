import {run} from 'express-blueforest'
import {Router} from "express-blueforest"
import fileUpload from "express-fileupload"
import {col} from "mongo-registry"
import {grandeur} from "unit-manip"
import {map, filter} from 'lodash'
import damages from "../const/damages"
import {parse} from "../excel/excel"
import {cols} from "../collections"

const router = Router()

module.exports = router

const impactsEntry = () => col(cols.IMPACT_ENTRY)


const parseDesc = {
    firstDocAt: 3,
    fields: [
        {idx: 3, fieldName: "externId"},
        {idx: 4, fieldName: "nom"},
        {idx: 6, fieldName: "nom origine ILCD"},
        {idx: 10, fieldName: "commentaire"},
        {idx: 11, fieldName: "Niveau de recommendation"},
        {idx: 13, fieldName: "Unité de référence"},
        {idx: 14, fieldName: "unitDescription"},
        {idx: 16, fieldName: "referenceYear"},
        {idx: 17, fieldName: "validUntil"},
        {idx: 24, fieldName: "dataSource", type: "array", sep: "; "},
        {idx: 37, fieldName: "dataSourceOrigin"},
        {idx: 32, fieldName: "commanditaire", type: "array", sep: ", "},
        {idx: 36, fieldName: "datasetFormat"},
        {idx: 39, fieldName: "datasetVersion"},
    ]
}

export const ademeToBlueforestImpactEntries = raws => map(raws, raw => ({
    updateOne: {
        filter: {externId: raw.externId},
        update: {
            $set: {
                externId: raw.externId,
                name: raw.nom,
                ...ademeUnitToGrandeurEq(raw['Unité de référence']),
                color: "#696969",
                origin: "ADEME",
                damage: damages.indexOf(raw['Unité de référence']) !== -1,
                raw
            }
        },
        upsert: true
    }
}))

export const ademeUnitToGrandeurEq = ademeUnit => {
    // if (!ademeUnit) return null
    const splitted = ademeUnit.split("éq.")
    if (splitted.length === 1) {
        return {g: grandeur(ademeUnit)}
    } else if (splitted.length === 2) {
        return {g: grandeur(splitted[0].trim()), eq: splitted[1].trim()}
    }
}

export const importAdemeImpactEntries = async buffer => {
    const result = await impactsEntry().bulkWrite(ademeToBlueforestImpactEntries(await parse(buffer, parseDesc)), {ordered: false})
    return {
        ok: result.ok === 1,
        insertions: result.nInserted,
        upsertions: result.nUpserted,
        matches: result.nMatched,
        modifieds: result.nModified,
        removeds: result.nRemoved
    }
}

router.post('/api/impactEntryBulk/ademe',
    fileUpload({files: 1, limits: {fileSize: 5 * 1024 * 1024}}),
    run(({}, req) => importAdemeImpactEntries(req.files.file && req.files.file.data || req.files['xlsx.ademe.impactEntry'].data))
)