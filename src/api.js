import client from "request-promise-native"
import env from "./env"

const debug = require('debug')('api:import')

const get = (path, opts) => {
    const url = `${env.USER_BASE_URL}${path}`
    debug("GET %o", url)
    return client.get(url, {json: true, ...opts})
}

export const getAdemeUser = () => get(`/api/user/mail/ademe@ademe.fr`, {headers: {mixin: "_id"}})