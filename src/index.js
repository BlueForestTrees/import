import ENV from "./env"
import {dbInit} from "mongo-registry"
import startExpress from "express-blueforest"
import {initUnits} from "unit-manip"
import {loadGrandeurs} from "./grandeur/grandeurService"

const errorMapper = err => {
    if (err.code === 11000) {
        err.status = 400
        err.body = {errorCode: 1, message: "allready exists"}
    } else if (err.code === "bf500") {
        err.status = 500
        err.body = {errorCode: 0, message: "No ADEME user"}
    } else if (err.code === "bf401") {
        err.status = 401
    } else if (err.code === "bf403") {
        err.status = 403
    }
}

export default dbInit(ENV, [])
    .then(loadGrandeurs)
    .then(initUnits)
    .then(startExpress(ENV, errorMapper))
    .catch(e => console.error("BOOT ERROR\n", e))
