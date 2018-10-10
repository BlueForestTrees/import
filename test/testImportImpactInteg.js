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
import {authGod} from "./database/users"

const postImpactPetitFileSpec = {
    req: {
        url: "/api/import/ademe/impact",
        method: "POST",
        file: {
            field: "csv.ademe.impact",
            path: path.resolve("files/PETIT_BI_1.09__03_Procedes_Impacts.csv")
        },
        headers: authGod

    }
}

describe('POST Impact file', function () {

    beforeEach(init(api, ENV, cols))

    it('post ademe impacts entries, trunk then impacts', withTest([
        postAdemeImpactEntryFileSpec,
        postTrunkFileSpec,
        {
            ...postImpactPetitFileSpec,
            res: {
                bodypath: [
                    {path: "$.ok", value: 1},
                    {path: "$.impacts", value: 2},
                    {path: "$.damages", value: 2}
                ]
            }
        }
    ]))

    it('post ademe impact entry file', withTest(postAdemeImpactEntryFileSpec))
})