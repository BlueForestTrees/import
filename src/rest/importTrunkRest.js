import fileUpload from "express-fileupload"
import {col} from "mongo-registry"
import {map, omit} from 'lodash'
import {grandeur, unit} from "unit-manip"
import {parse} from "../parse/excel"
import {cols} from "../collections"
import {getRandomColor} from "../util/util"
import {run} from 'express-blueforest'
import {Router} from "express-blueforest"

const trunks = () => col(cols.TRUNK)
const cats = () => col(cols.CATEGORIES)

const importAdemeTrunkEntries = async buffer => {
    const result = await trunks().bulkWrite(await ademeToBlueforestTrunk(await parse(buffer, parseDesc)), {ordered: false})
    return {
        ok: result.ok === 1,
        insertions: result.nInserted,
        upsertions: result.nUpserted,
        matches: result.nMatched,
        modifieds: result.nModified,
        removeds: result.nRemoved
    }
}

const parseDesc = {
    firstDocAt: 3,
    fields: [
        {idx: 3, fieldName: "externId", xlsName: " UUID "},
        {idx: 4, fieldName: "Nom", xlsName: " Nom du flux "},
        {idx: 6, fieldName: "Version", xlsName: " Version "},
        {idx: 8, fieldName: "Synonymes", xlsName: " Synonymes "},
        {idx: 10, fieldName: "Catégorie 1", xlsName: " Catégorisation (niveau 1) "},
        {idx: 11, fieldName: "Catégorie 2", xlsName: " Catégorisation (niveau 2) "},
        {idx: 12, fieldName: "Catégorie 3", xlsName: " Catégorisation (niveau 3) "},
        {idx: 13, fieldName: "Catégorie 4", xlsName: " Catégorisation (niveau 4) "},
        {idx: 18, fieldName: "Commentaire Général", xlsName: " Commentaire Général "},
        {idx: 21, fieldName: "Flux de référence", xlsName: " Flux de référence ", under: "Quantité"},
        {idx: 22, fieldName: "Quantité de référence", xlsName: " Quantité de référence ", under: "Quantité"},
        {idx: 23, fieldName: "Unité", xlsName: " Unité ", under: "Quantité"},
        {idx: 25, fieldName: "Année de référence", xlsName: " Année de référence ", under: "Temps"},
        {idx: 26, fieldName: "Valable jusqu'au", xlsName: " Jeu de données valable jusqu'au ", under: "Temps"},
        {idx: 27, fieldName: "Description représentative du temps", xlsName: " Description représentative du temps ", under: "Temps"},
        {idx: 29, fieldName: "Localisation", xlsName: " Localisation "},
        {idx: 31, fieldName: "Description", xlsName: " Description de la technologie et des processus inclus ", under: "Technologie"},
        {idx: 32, fieldName: "Objectif", xlsName: " Objectif technique du produit ou du procédé ", under: "Technologie"},
        {idx: 33, fieldName: "Diagramme de flux", xlsName: " Diagramme de flux ", under: "Technologie"},
        
        {idx: 36, fieldName: "Type de dataset", xlsName: " Type de dataset ", under: "Modélisation et Validation", subunder: "Méthode et allocation LCI"},
        {idx: 37, fieldName: "Principe de la méthode LCI", xlsName: " Principe de la méthode LCI ", under: "Modélisation et Validation", subunder: "Méthode et allocation LCI"},
        {idx: 38, fieldName: "Déviations principe", xlsName: " Deviations from LCI method principle ", offsetX: true, under: "Modélisation et Validation", subunder: "Méthode et allocation LCI"},
        {idx: 39, fieldName: "Approches de la méthode LCI", xlsName: " Approches de la méthode LCI ", under: "Modélisation et Validation", subunder: "Méthode et allocation LCI"},
        {idx: 40, fieldName: "Déviations approches", xlsName: " Deviations from LCI method approaches ", offsetX: true, under: "Modélisation et Validation", subunder: "Méthode et allocation LCI"},
    ]
}

const resolveCategorie = filter => cats().findOne(filter)

const resolveCategories = async raw => {
    const categories = {}
    const c1 = await resolveCategorie({name:raw["Catégorie 1"], pid:null})
    if (c1) {
        categories.c1 = c1._id
        const c2 = await resolveCategorie({name: raw["Catégorie 2"], pid: c1._id})
        if (c2) {
            categories.c2 = c2._id
            const c3 = await resolveCategorie({name: raw["Catégorie 3"], pid: c2._id})
            if (c3) {
                categories.c3 = c3._id
                const c4 = await resolveCategorie({name: raw["Catégorie 4"], pid: c3._id})
                if (c4) {
                    categories.c4 = c4._id
                }
            }
        }
    }
    return categories
}

export const ademeToBlueforestTrunk = raws => Promise.all(map(raws, async raw => ({
    updateOne: {
        filter: {externId: raw.externId},
        update: {
            $set: {
                externId: raw.externId,
                name: raw.Nom,
                quantity: {
                    bqt: raw["Quantité"]["Quantité de référence"] * unit(raw["Quantité"]["Unité"]).coef,
                    g: grandeur(raw["Quantité"]["Unité"]) || erreurGrandeur(raw["Quantité"]["Unité"]),
                },
                cat: await resolveCategories(raw),
                color: getRandomColor(),
                origin: "ADEME",
                raw
            }
        },
        upsert: true
    }
})))

const erreurGrandeur = shortname => {
    const error = new Error(`grandeur non trouvée pour l'unité "${shortname}"`)
    error.status = 422
    throw error
}

const router = Router()
module.exports = router

router.post('/api/import/ademe/trunk',
    fileUpload({files: 1, limits: {fileSize: 10 * 1024 * 1024}}),
    run(({}, req) => importAdemeTrunkEntries(req.files.file && req.files.file.data || req.files['xlsx.ademe.trunk'].data))
)
