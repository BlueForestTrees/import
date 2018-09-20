import api from "../src/index"
import ENV from "../src/env"
import {cols} from "../src/collections"
import {init, request, withTest} from "test-api-express-mongo"
import path from "path"
import {authGod} from "./database/users"

describe('POST ALL', function () {

    beforeEach(init(api, ENV, cols))

    it('IMPORT ALL', withTest([
        {
            req: {
                url: "/api/import/ademe/categories",
                method: "POST",
                headers: authGod,
                file: {
                    field: "xlsx.ademe.trunk",
                    path: path.resolve("files/BI_1.09__02_Procedes_Details.xlsx")
                }
            }
        },
        {
            req: {
                url: "/api/import/ademe/trunk",
                method: "POST",
                headers: authGod,
                file: {
                    field: "xlsx.ademe.trunk",
                    path: path.resolve("files/BI_1.09__02_Procedes_Details.xlsx")
                }
            }
        },
        {
            req: {
                url: "/api/import/ademe/impactEntry",
                method: "POST",
                headers: authGod,
                file: {
                    field: "xlsx.ademe.impactEntry",
                    path: path.resolve("files/BI_1.09__06_CatImpacts_Details.xlsx")
                }
            }
        },
        {
            req: {
                url: "/api/import/ademe/impact",
                method: "POST",
                headers: authGod,
                file: {
                    field: "csv.ademe.impact",
                    path: path.resolve("files/BI_1.09__03_Procedes_Impacts.csv")
                }
            }
        }
    ]))
})