import {assertDb} from "test-api-express-mongo"
import {init, request, withTest} from "test-api-express-mongo"
import api from "../src"
import ENV from "../src/env"
import {cols} from "../src/collections"
import path from 'path'
import {withIdBqtG} from "test-api-express-mongo"
import {replaceItem, oneResponse, oneModifiedResponse} from "test-api-express-mongo"
import {postAdemeImpactEntryFileSpec} from "../spec/testPostImpactEntrySpec"
import {postTrunkFileSpec} from "../spec/testPostTrunkSpec"

describe('POST Zone geo file', function () {
    
    beforeEach(init(api, ENV, cols))
    
    it('post ademe zones.', withTest({
        req: {
                url: "/api/import/ademe/zone",
                method: "POST",
                file: {
                    field: "csv.ademe.zone",
                    path: path.resolve("files/BI_1.09__10_Zone_Geographiques.csv")
                }
            }
        }
    ))

})