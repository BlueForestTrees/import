import path from 'path'
import api from "../src"
import ENV from "../src/env"
import {init, withTest} from "test-api-express-mongo"
import {cols} from "../src/collections"
import {authGod, authSimple} from "./database/users"


describe('Import Categories', function () {

    beforeEach(init(api, ENV, {CAT: cols.CATEGORIES}))

    it('CATEGORIES bad auth', withTest({
        req: {
            url: "/api/import/ademe/categories",
            method: "POST",
            file: {
                field: "xlsx.ademe.trunk",
                path: path.resolve("files/CUT_BIG_BI_1.09__02_Procedes_Details.xlsx")
            },
            headers: authSimple
        },
        res: {
            code: 403
        }
    }))

    it('CATEGORIES no auth', withTest({
        req: {
            url: "/api/import/ademe/categories",
            method: "POST",
            file: {
                field: "xlsx.ademe.trunk",
                path: path.resolve("files/CUT_BIG_BI_1.09__02_Procedes_Details.xlsx")
            }
        },
        res: {
            code: 401
        }
    }))

    it('CATEGORIES', withTest([
        {
            req: {
                url: "/api/import/ademe/categories",
                method: "POST",
                file: {
                    field: "xlsx.ademe.trunk",
                    path: path.resolve("files/CUT_BIG_BI_1.09__02_Procedes_Details.xlsx")
                },
                headers: authGod
            },
            res: {
                bodypath: [
                    {path: "$.errors", value: 0},
                    {path: "$.inserts", value: 25},
                ]
            }
        },
        {
            req: {
                url: "/api/import/ademe/categories",
                method: "POST",
                file: {
                    field: "xlsx.ademe.trunk",
                    path: path.resolve("files/CUT_BIG_BI_1.09__02_Procedes_Details.xlsx")
                },
                headers: authGod
            },
            res: {
                bodypath: [
                    {path: "$.errors", value: 0},
                    {path: "$.inserts", value: 0},
                ]
            }
        }
    ]))

})