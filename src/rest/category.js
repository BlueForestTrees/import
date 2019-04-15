import {col, createObjectId} from "mongo-registry"
import {parse} from "../util/excel"
import {groupBy, map} from 'lodash'
import {cols} from "../collections"
import {getAdemeUserId} from "./user"

const debug = require('debug')('api:categories')
const categories = () => col(cols.CATEGORIES)


const getCatId = async filter => {
    const cat = await categories().findOne(filter, {projection: {_id: 1}})
    return cat && cat._id || createObjectId()
}

export const parseAdemeCategories = async buffer => {

    const catsUpserts = []

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

    const ademeCatId = await getAdemeCatId(ademeUserId, catsUpserts)

    return ademeToBfCats(ademeUserId, ademeCatId, rawCats, ["Catégorie 1", "Catégorie 2", "Catégorie 3", "Catégorie 4"], 0, catsUpserts)
}

const ademeToBfCats = async (ademeUserId, pCat, rawCats, catPath, ci, catsUpserts) => {
    let cats = groupBy(rawCats, rawCats => rawCats[catPath[ci]])

    await Promise.all(Object.keys(cats).map(async catName => {
        const subcats = cats[catName]
        if ("pas de valeur" !== catName) {
            let _id = await getCatId({pids: pCat, name: catName})
            const cat = {_id, oid: ademeUserId, pids: [pCat], name: catName, color: getRandomColor(), dateUpdate: new Date()}
            catsUpserts.push({
                updateOne: {
                    filter: {_id: cat._id},
                    update: {$set: cat},
                    upsert: true
                }
            })

            if (ci + 1 < catPath.length) {
                await ademeToBfCats(ademeUserId, _id, subcats, catPath, ci + 1, catsUpserts)
            }
        }
    }))

    return catsUpserts
}

export const writeCats = async (bfCats = []) => categories().bulkWrite(bfCats, {ordered: false}).then(({result}) => ({mat: result.nMatched, ins: result.nUpserted, upd: result.nModified}))

const getCat = filter => categories().findOne(filter)
const getAdemeCatId = (ademeUserId, catsUpserts) => getCat({oid: ademeUserId, name: "ADEME", pid: null})
    .then(cat => {
        const _id = cat && cat._id || createObjectId()
        catsUpserts.push({
            updateOne: {
                filter: {_id},
                update: {$set: {_id, oid: ademeUserId, pids: null, name: "ADEME", color: "#c91111", dateUpdate: new Date()}},
                upsert: true
            }
        })
        return _id
    })

const getRandomColor = () => {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}