import {assertDb} from "test-api-express-mongo/dist/db"
import {init, request, withTest} from "test-api-express-mongo/dist/api"
import api from "../src"
import ENV from "../src/env"
import {cols} from "../src/const/collections"
import path from 'path'
import {withIdBqtG} from "test-api-express-mongo/dist/domain"
import {replaceItem, oneResponse, oneModifiedResponse} from "test-api-express-mongo/dist/domain"
import {postAdemeImpactEntryFileSpec} from "../spec/testPostImpactEntrySpec"
import {postTrunkFileSpec} from "../spec/testPostTrunkSpec"

const postImpactPetitFileSpec = {
    req: {
        url: "/api/impactBulk/ademe",
        method: "POST",
        file: {
            field: "csv.ademe.impact",
            path: path.resolve("files/PETIT_BI_1.09__03_Procedes_Impacts.csv")
        }
    }
}

describe('POST Impact file', function () {
    
    beforeEach(init(api, ENV, cols))
    
    it('post ademe impacts, resolve fail', withTest([
            postImpactPetitFileSpec,
            {
                db: {
                    expected: {
                        list: [
                            {
                                colname: cols.IMPACT,
                                doc: {trunkExternId: "81cd479b-6536-40ac-be2a-ab18b6e79bb8", impactExternId: "ec7836be-83eb-41da-bcda-1a6a3fe2d149", bqt: 0.0000434245},
                            },
                            {
                                colname: cols.IMPACT,
                                doc: {trunkExternId: "940bf6ef-aaae-4559-9dd3-0cd68d30b2f4", impactExternId: "865c4fbe-11cc-4905-9b0a-80a99d94f7e6", bqt: 0.000000311443},
                            },
                            {
                                colname: cols.IMPACT,
                                doc: {trunkExternId: "940bf6ef-aaae-4559-9dd3-0cd68d30b2f4", impactExternId: "ec7836be-83eb-41da-bcda-1a6a3fe2d149", bqt: 0.00175113},
                            },
                            {
                                colname: cols.IMPACT,
                                doc: {trunkExternId: "81cd479b-6536-40ac-be2a-ab18b6e79bb8", impactExternId: "865c4fbe-11cc-4905-9b0a-80a99d94f7e6", bqt: 0.0000000373707},
                            }
                        ]
                    }
                }
            }
        ])
    )
    
    it('post ademe impacts entries, trunk then impacts', withTest([
        postAdemeImpactEntryFileSpec,
        postTrunkFileSpec,
        {
            ...postImpactPetitFileSpec,
            res: {
                bodypath: [
                    {path: "$.ok", value: 1},
                    {path: "$.nInserted", value: 2}
                ]
            }
        }
    ]))
    
    it('post ademe impact entry file', withTest(postAdemeImpactEntryFileSpec))
})