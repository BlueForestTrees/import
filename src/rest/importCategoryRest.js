import {Router, run} from 'express-blueforest'
import fileUpload from "express-fileupload"
import configure from "items-service"
import {col, createObjectId} from "mongo-registry"
import {parse} from "../excel/excel"
import {forIn, groupBy} from 'lodash'
import {cols} from "../collections"

const debug = require('debug')('api:categories')
const router = Router()
module.exports = router
const categoryService = configure(() => col(cols.CATEGORIES))

router.post('/api/import/categories/ademe',
    fileUpload({files: 1, limits: {fileSize: 10 * 1024 * 1024}}),
    run(({}, req) => importAdemeTrunkCategories(req.files.file && req.files.file.data || req.files['xlsx.ademe.trunk'].data))
)

export const importAdemeTrunkCategories = async buffer => {
    
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
    const bfCats = ademeToBfCats(null, rawCats, ["Catégorie 1", "Catégorie 2", "Catégorie 3", "Catégorie 4"], 0, [])
    
    return categoryService.bulkWrite(bfCats)
}

const ademeToBfCats = (pCat, rawCats, catPath, ci, toImport) => {
    forIn(groupBy(rawCats, rawCats => rawCats[catPath[ci]]),
        (subcats, catName) => {
            if (catName !== "pas de valeur") {
                let cat = {_id: createObjectId(), pid: pCat, name: catName, color: getRandomColor()}
                toImport.push({insertOne: cat})
                if (ci + 1 < catPath.length) {
                    ademeToBfCats(cat._id, subcats, catPath, ci + 1, toImport)
                }
            }
        }
    )
    return toImport
}

const getRandomColor = () => {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}