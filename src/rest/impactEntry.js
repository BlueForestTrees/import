import {map} from 'lodash'
import {grandeur} from "unit-manip"
import {parse} from "../util/excel"
import {col} from "mongo-registry"
import {cols} from "../collections"

const damages = ["PDF", "CTUe", "CTUh", "DALY", "PNOF", "$"]

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

export const ademeToBlueforestImpactEntries = (ademeUserId, raws) => map(raws, raw => {
    const impactEntry = {
        updateOne: {
            filter: {externId: raw.externId},
            update: {
                $set: {
                    externId: raw.externId,
                    name: raw.nom,
                    ...ademeUnitToGrandeurEq(raw['Unité de référence']),
                    color: "#696969",
                    origin: "ADEME base Impact v1.11",
                    raw,
                    oid: ademeUserId,
                    dateUpdate: new Date()
                }
            },
            upsert: true
        }
    }
    if (damages.indexOf(raw['Unité de référence']) !== -1) {
        impactEntry.updateOne.update.$set.damage = true
    }
    return impactEntry
})

export const ademeUnitToGrandeurEq = ademeUnit => {
    const splitted = ademeUnit.split("éq.")
    if (splitted.length === 1) {
        return {g: grandeur(ademeUnit)}
    } else if (splitted.length === 2) {
        return {g: grandeur(splitted[0].trim()), eq: splitted[1].trim()}
    }
}

export const importAdemeImpactEntries = async ({buffer, ademeUserId}) => ademeToBlueforestImpactEntries(ademeUserId, await parse(buffer, parseDesc))

export const moveDamages = (impactEntries, damageEntries) => async () => {
    const damages = map(await impactEntries.find({damage: true}).toArray(), id => {
        const _id = id._id
        delete id.damage
        delete id._id
        return ({
            updateOne: {
                filter: {externId: id.externId},
                update: {
                    $set: id,
                    $setOnInsert: {_id}
                },
                upsert: true
            }
        })
    })

    await damageEntries.bulkWrite(damages, {ordered: false})
    await impactEntries.deleteMany({damage: true})

    return damages.length
}

export const writeImpactEntries = data => col(cols.IMPACT_ENTRY).bulkWrite(data, {ordered: false}).then(() => data.length)