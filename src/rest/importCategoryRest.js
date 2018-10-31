import {col, createObjectId} from "mongo-registry"
import {parse} from "../util/excel"
import {groupBy, map} from 'lodash'
import {cols} from "../collections"
import {getAdemeUserId} from "../api"

const debug = require('debug')('api:categories')
const categories = () => col(cols.CATEGORIES)

export const parseAdemeCategories = async buffer => {

    const ademeUserId = await getAdemeUserId()

    const parseDesc = {
        firstDocAt: 3,
        fields: [
            {idx: 10, fieldName: "Catégorie 1", xlsName: " Catégorisation (niveau 1) "},
            {idx: 11, fieldName: "Catégorie 2", xlsName: " Catégorisation (niveau 2) "},
            {idx: 12, fieldName: "Catégorie 3", xlsName: " Catégorisation (niveau 3) "},
            {idx: 13, fieldName: "Catégorie 4", xlsName: " Catégorisation (niveau 4) "},
        ]
    }

    const rawCats = await parse(buffer, parseDesc)

    const ademeCat = await getAdemeCat(ademeUserId)

    return ademeToBfCats(ademeUserId, ademeCat._id, rawCats, ["Catégorie 1", "Catégorie 2", "Catégorie 3", "Catégorie 4"], 0, [])
}

const ademeToBfCats = async (ademeUserId, pCat, rawCats, catPath, ci, toImport) => {
    let cats = groupBy(rawCats, rawCats => rawCats[catPath[ci]])

    await Promise.all(Object.keys(cats).map(async catName => {
        const subcats = cats[catName]
        if ("pas de valeur" !== catName) {
            let cat = await getCat({pid: pCat, name: catName})
            if (!cat) {
                cat = {_id: createObjectId(), oid: ademeUserId, pid: pCat, name: catName, color: getRandomColor()}
                toImport.push({insertOne: cat})
            }
            if (ci + 1 < catPath.length) {
                await ademeToBfCats(ademeUserId, cat._id, subcats, catPath, ci + 1, toImport)
            }
        }
    }))

    return toImport
}

export const writeCats = async bfCats => {
    if (bfCats.length > 0) {
        const write = await categories().bulkWrite(bfCats, {ordered: false})
        return {
            inserts: write.result.insertedIds.length,
            errors: write.result.writeErrors.length
        }
    } else {
        return {inserts: 0, errors: 0}
    }
}

const getCat = filter => categories().findOne(filter)

const getAdemeCat = ademeUserId =>
    getCat({oid: ademeUserId, name: "ADEME", pid: null})
        .then(ademeCat => {
            if (!ademeCat) {
                ademeCat = {_id: createObjectId(), oid: ademeUserId, pid: null, name: "ADEME", color: "#c91111"}
                categories().insertOne(ademeCat)
            }
            return ademeCat
        })

const getRandomColor = () => {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}