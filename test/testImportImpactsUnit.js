import {init} from "test-api-express-mongo"
import ENV from "../src/env"
import {cols} from "../src/collections"
import path from 'path'
import {expect} from "chai"
import {countFromDbByDoc} from "test-api-express-mongo"
import api from "../src/index"
import fs from 'fs'
import {importAdemeImpactEntries} from "../src/impact/impactEntry"

describe('Imports', function () {
    const impactBuffer = fs.readFileSync(path.resolve("files/BI_1.09__06_CatImpacts_Details.xlsx"))

    beforeEach(init(api, ENV, cols))

    it('first impact imports entry', async () => {
        const actual = await importAdemeImpactEntries({buffer:impactBuffer, ademeUser:{_id:11}})

        expect(actual.length).to.equal(27)

    })
    it('two impact imports entry', async () => {
        await importAdemeImpactEntries({buffer:impactBuffer, ademeUser:{_id:11}})
        const actual = await importAdemeImpactEntries({buffer:impactBuffer, ademeUser:{_id:11}})

        expect(actual.length).to.equal(27)
    })


})