const debug = require('debug')('api:import')
import {version, name} from './../package.json'

const ENV = {
    NAME: name,
    PORT: process.env.PORT || 80,

    REST_PATH: process.env.REST_PATH || "rest",

    DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING,
    DB_NAME: process.env.DB_NAME || "BlueForestTreesDB",
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_PORT: process.env.DB_PORT || 27017,
    DB_USER: process.env.DB_USER || "doudou",
    DB_PWD: process.env.DB_PWD || "masta",

    NODE_ENV: process.env.NODE_ENV || null,
    VERSION: version,
    MORGAN: process.env.MORGAN || ':status :method :url :response-time ms - :res[content-length]',
}

ENV.USER_BASE_URL = {
    "production": process.env.USER_BASE_URL || "http://user:80",
    "test": "http://localhost:9999",
    "development": "http://localhost:8084"
}[ENV.NODE_ENV]

debug(JSON.stringify(ENV))

export default ENV