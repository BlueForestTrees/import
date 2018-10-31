import {parseAdemeCategories, writeCats} from "./rest/importCategoryRest"
import fs from 'fs'
import {importAdemeImpactEntries} from "./impact/importImpactEntryService"
import {bulkWriteImpactEntry, moveDamages} from "./rest/importImpactEntryRest"
import {col} from "mongo-registry"
import {cols} from "./collections"
import {getAdemeUserId} from "./api"
import {importAdemeTrunkEntries} from "./rest/importTrunkRest"
import {importImpactsByChunks} from "./rest/importImpactRest"
import {parseImpactCsv} from "./util/csv"

const debug = require('debug')('api:import')

export const importAll = ENV => async () => {
    debug("categorie d'impact...")
    await importAdemeImpactEntries({ademeUserId: await getAdemeUserId(), buffer: fs.readFileSync(ENV.ADEME_CATIMPACT_FILE)})
        .then(data => col(cols.IMPACT_ENTRY).bulkWrite(data, {ordered: false}))
        .then(({result}) => debug("insertion impact+damage", JSON.stringify(result)))
        .then(moveDamages(col(cols.IMPACT_ENTRY), col(cols.DAMAGE_ENTRY)))
        .then(result => debug("déplacement damage", JSON.stringify(result)))
    debug("categorie d'impact OK")

    debug("categorie de produits...")
    await parseAdemeCategories(fs.readFileSync(ENV.ADEME_CATPRODUIT_FILE))
        .then(writeCats)
        .then((res) => debug(res))
    debug("categorie de produits OK")

    debug("produit...")
    await importAdemeTrunkEntries(fs.readFileSync(ENV.ADEME_PRODUIT_FILE))
        .then(debug)
    debug("produit OK")

    debug("impact de produit...")
    await parseImpactCsv(fs.readFileSync(ENV.ADEME_PRODUIT_IMPACT_FILE))
        .then(importImpactsByChunks)
        .then(debug)
    debug("impact de produit OK")
}
