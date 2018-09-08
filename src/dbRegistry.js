import {col} from "mongo-registry"
import {neverClearedCols} from "./collections"

export const registry = [
    {
        version: "1.0.5",
        log: "User ADEME",
        script: () => col(neverClearedCols.USER).insertOne({
            shortname: "ADEME",
            fullname: "Agence de l'environnement et de la maîtrise de l'énergie",
            color: "#c62828"
        })
    }
]