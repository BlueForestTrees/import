import path from 'path'
import api from "../src"
import ENV from "../src/env"
import {init, withTest} from "test-api-express-mongo"
import {cols} from "../src/collections"


describe('Import Categories', function () {
    
    beforeEach(init(api, ENV, {CAT: cols.CATEGORIES}))
    
    it('POST ademe categories file', withTest({
        req: {
            url: "/api/import/ademe/categories",
            method: "POST",
            file: {
                field: "xlsx.ademe.trunk",
                path: path.resolve("files/CUT_BIG_BI_1.09__02_Procedes_Details.xlsx")
            }
        },
        res: {
            bodypath: [
                {path: "$.ok", value: 1},
                {path: "$.writeErrors", value: [[]]},
                {path: "$.insertedIds.length", value: 25},
            ]
        }
    }))
    
})