import {init} from "test-api-express-mongo/dist/api"
import ENV from "../src/env"
import {cols} from "../src/const/collections"
import path from 'path'
import {expect} from "chai"
import {countFromDbByDoc} from "test-api-express-mongo/dist/db"
import api from "../src/index"
import fs from 'fs'
import {importAdemeImpactEntries} from "../src/service/impactEntryService"

describe('Imports', function () {
    const impactBuffer = fs.readFileSync(path.resolve("files/BI_1.09__06_CatImpacts_Details.xlsx"))

    beforeEach(init(api, ENV, cols))

    it('first impact imports entry', async () => {
        await importAdemeImpactEntries(impactBuffer)
        expect(await countFromDbByDoc(cols.IMPACT_ENTRY, {origin: "ADEME"})).to.equal(27)
    })
    it('two impact imports entry', async () => {
        await importAdemeImpactEntries(impactBuffer)
        await importAdemeImpactEntries(impactBuffer)

        expect(await countFromDbByDoc(cols.IMPACT_ENTRY, {origin: "ADEME"})).to.equal(27)
    })


})