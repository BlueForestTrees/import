import ENV from "./../env"
import {col, createObjectId} from "mongo-registry"
import {map} from 'lodash'
import {grandeur, unit, filter} from "unit-manip"
import {parse} from "../util/excel"
import {cols} from "../collections"
import {getRandomColor} from "../util/util"
import {getAdemeUserId} from "./user"

const trunks = () => col(cols.TRUNK)
const cats = () => col(cols.CATEGORIES)

export const importAdemeTrunkEntries = async buffer => {

    const ademeUserId = await getAdemeUserId()

    if (!ademeUserId) {
        throw {code: "bf500"}
    }

    let raws = await parse(buffer, parseDesc)

    return ademeToBlueforestTrunk(raws, ademeUserId)
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
        {
            idx: 27,
            fieldName: "Description représentative du temps",
            xlsName: " Description représentative du temps ",
            under: "Temps"
        },
        {idx: 29, fieldName: "Localisation", xlsName: " Localisation "},
        {
            idx: 31,
            fieldName: "Description",
            xlsName: " Description de la technologie et des processus inclus ",
            under: "Technologie"
        },
        {
            idx: 32,
            fieldName: "Objectif",
            xlsName: " Objectif technique du produit ou du procédé ",
            under: "Technologie"
        },
        {idx: 33, fieldName: "Diagramme de flux", xlsName: " Diagramme de flux ", under: "Technologie"},

        {
            idx: 36,
            fieldName: "Type de dataset",
            xlsName: " Type de dataset ",
            under: "Modélisation et Validation",
            subunder: "Méthode et allocation LCI"
        },
        {
            idx: 37,
            fieldName: "Principe de la méthode LCI",
            xlsName: " Principe de la méthode LCI ",
            under: "Modélisation et Validation",
            subunder: "Méthode et allocation LCI"
        },
        {
            idx: 38,
            fieldName: "Déviations principe",
            xlsName: " Deviations from LCI method principle ",
            offsetX: true,
            under: "Modélisation et Validation",
            subunder: "Méthode et allocation LCI"
        },
        {
            idx: 39,
            fieldName: "Approches de la méthode LCI",
            xlsName: " Approches de la méthode LCI ",
            under: "Modélisation et Validation",
            subunder: "Méthode et allocation LCI"
        },
        {
            idx: 40,
            fieldName: "Déviations approches",
            xlsName: " Deviations from LCI method approaches ",
            offsetX: true,
            under: "Modélisation et Validation",
            subunder: "Méthode et allocation LCI"
        },
    ]
}

const resolveCategorie = filter => cats().findOne(filter)

const resolveCategories = async raw => {
    const categories = []
    const c0 = await resolveCategorie({name: "ADEME", pids: null})
    if (c0) {
        categories.push(c0._id)
        const c1 = await resolveCategorie({name: raw["Catégorie 1"], pids: c0._id})
        if (c1) {
            categories.push(c1._id)
            const c2 = await resolveCategorie({name: raw["Catégorie 2"], pids: c1._id})
            if (c2) {
                categories.push(c2._id)
                const c3 = await resolveCategorie({name: raw["Catégorie 3"], pids: c2._id})
                if (c3) {
                    categories.push(c3._id)
                    const c4 = await resolveCategorie({name: raw["Catégorie 4"], pids: c3._id})
                    if (c4) {
                        categories.push(c4._id)
                    }
                }
            }
        }
    }
    return categories
}

export const ademeToBlueforestTrunk = async (raws, ownerId) =>
    filter(await Promise.all(map(raws,
        async raw => {
            let rawUnit = raw["Quantité"]["Unité"]
            let u = unit(rawUnit)

            if (!u) {
                console.warn(`unité inconnue "${rawUnit}" dans ${JSON.stringify(raw)}`)
                return null
            }

            return {
                _id: await getTrunkId(raw.externId),
                externId: raw.externId,
                name: raw.Nom,
                quantity: {
                    bqt: raw["Quantité"]["Quantité de référence"] * u.coef,
                    g: grandeur(rawUnit) || erreurGrandeur(rawUnit),
                },
                cats: await resolveCategories(raw),
                color: getRandomColor(),
                origin: "ADEME base Impact v" + ENV.BASE_VERSION,
                date: getDate(raw),
                dateUntil: getUntilDate(raw),
                dateComment: getDateComment(raw),
                comment: getComment(raw),
                oid: ownerId,
                dateUpdate: new Date()
            }
        }
    )), o => o)

const erreurGrandeur = shortname => {
    const error = new Error(`grandeur non trouvée pour l'unité "${shortname}"`)
    error.status = 422
    throw error
}

const trunkIdCache = {}
export const getTrunkId = async (externId) => {
    if (!trunkIdCache[externId]) {
        const trunk = await trunks().findOne({externId}, {projection: {_id: 1}})
        trunkIdCache[externId] = trunk && trunk._id || createObjectId()
    }
    return trunkIdCache[externId]
}

const getDate = raw => new Date(parseInt(raw.Temps["Année de référence"]), 0)
const getUntilDate = raw => new Date(parseInt(raw.Temps["Valable jusqu'au"]), 0)
const getDateComment = raw => raw.Temps["Description représentative du temps"]
const getComment = raw => raw["Commentaire Général"] + "<br><br>" + raw.Technologie.Description