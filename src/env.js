const debug = require('debug')('api:import')
import {version, name} from './../package.json'
import fs from "fs"

const baseVersion = "1.11"

const ENV = {
    NAME: name,
    BASE_VERSION: process.env.BASE_VERSION || baseVersion,
    ADEME_CATIMPACT_FILE: process.env.ADEME_CATIMPACT_FILE || `files/BI_${baseVersion}__06_CatImpacts_Details.xlsx`,
    ADEME_CATPRODUIT_FILE: process.env.ADEME_CATPRODUIT_FILE || `files/BI_${baseVersion}__02_Procedes_Details.xlsx`,
    ADEME_PRODUIT_FILE: process.env.ADEME_PRODUIT_FILE || `files/BI_${baseVersion}__02_Procedes_Details.xlsx`,
    ADEME_PRODUIT_IMPACT_FILE: process.env.ADEME_PRODUIT_IMPACT_FILE || `files/BI_${baseVersion}__03_Procedes_Impacts.csv`,


    DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING,
    DB_NAME: process.env.DB_NAME || "BlueForestTreesDB",
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_PORT: process.env.DB_PORT || 27017,
    DB_USER: process.env.DB_USER || "doudou",
    DB_PWD: process.env.DB_PWD || "masta",

    NODE_ENV: process.env.NODE_ENV || null,
    VERSION: version,

    RK_TRUNK_UPSERT: process.env.RK_TRUNK_UPSERT || "trunk-upsert",
    RK_IMPACT_TANK_UPSERT: process.env.RK_IMPACT_TANK_UPSERT || "impactTank-upsert",
    RB_PATH: process.env.RB_PATH || "mq.json",
}

ENV.RB = JSON.parse(fs.readFileSync(ENV.RB_PATH, 'utf8'))

ENV.USER_BASE_URL = {
    "production": process.env.USER_BASE_URL || "http://user:80",
    "test": "http://localhost:9999",
    "development": "http://localhost:8084"
}[ENV.NODE_ENV]

debug(JSON.stringify(ENV))

export default ENV