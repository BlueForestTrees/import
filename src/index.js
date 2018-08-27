import ENV from "./env"
import {dbInit} from "mongo-registry"
import {registry} from "./dbRegistry"
import startExpress from "express-blueforest"
import {initUnits} from "unit-manip"
import {loadGrandeurs} from "./grandeur/grandeurService"

const errorMapper = err => {
    if (err.code === 11000) {
        err.status = 400
        err.body = {errorCode: 1, message: "allready exists"}
    }
}

export default dbInit(ENV, registry)
    .then(loadGrandeurs)
    .then(initUnits)
    .then(startExpress(ENV, errorMapper))
    .catch(e => console.error("BOOT ERROR\n",e))