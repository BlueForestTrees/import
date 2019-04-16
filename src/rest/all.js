import {parseAdemeCategories, writeCats} from "./../rest/category"
import fs from 'fs'
import {moveDamages, importAdemeImpactEntries} from "./../rest/impactEntry"
import {col} from "mongo-registry"
import {cols} from "./../collections"
import {getAdemeUserId} from "./user"
import {importAdemeTrunkEntries} from "../rest/trunk"
import {importImpacts} from "../rest/impact"
import {parseImpactCsv} from "../util/csv"
import {writeImpactEntries} from "./impactEntry"

const debug = require('debug')('api:import')

export const all = ENV => async ([sendTrunks, sendImpact]) => {
    debug("impact entry...")
    await importAdemeImpactEntries({ademeUserId: await getAdemeUserId(), buffer: fs.readFileSync(ENV.ADEME_PRODUIT_IMPACT_FILE, "latin1")})
        .then(writeImpactEntries)
        .then(debug)
        .then(moveDamages(col(cols.IMPACT_ENTRY), col(cols.DAMAGE_ENTRY)))
        .then(debug)

    debug("trunk categorie...")
    await parseAdemeCategories(fs.readFileSync(ENV.ADEME_CATPRODUIT_FILE))
        .then(writeCats)
        .then(debug)

    debug("trunk...")
    await importAdemeTrunkEntries(fs.readFileSync(ENV.ADEME_PRODUIT_FILE))
        .then(sendTrunks)
        .then(debug)

    debug("trunk impact...")
    await parseImpactCsv(fs.readFileSync(ENV.ADEME_PRODUIT_IMPACT_FILE, "latin1"))
        .then(importImpacts(sendImpact))
        .then(debug)
}
