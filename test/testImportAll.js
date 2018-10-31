import api from "../src/index"
import ENV from "../src/env"
import {cols} from "../src/collections"
import {init} from "test-api-express-mongo"

import importAll from "../src/index"

describe('IMPORT ALL', function () {

    beforeEach(init(api, ENV, cols))

    it('IMPORT ALL', async ()=>{
        await importAll()
    })
})