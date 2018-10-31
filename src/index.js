import ENV from "./env"
import {dbInit} from "mongo-registry"
import {initUnits} from "unit-manip"
import {loadGrandeurs} from "./grandeur/grandeurService"
import {importAll} from "./importAll"

export default dbInit(ENV)
    .then(loadGrandeurs)
    .then(initUnits)
    .then(importAll(ENV))
    .catch(console.error)
