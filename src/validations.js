import {X_ACCESS_TOKEN} from "./headers"
import jwt from "jsonwebtoken"
import {run} from "express-blueforest"

export const validGod = run((o, req) => {
    let token = jwt.decode(req.headers[X_ACCESS_TOKEN])
    if (!token || !token.user) {
        throw {code: "bf401"}
    } else if (!token.user.rights || token.user.rights.charAt(0) !== 'G') {
        throw {code: "bf403"}
    }
    return o
})