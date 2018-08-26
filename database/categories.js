import ENV from "../src/env"
import {object} from "mongo-registry"

export const database = {
    [ENV.DB_COLLECTION]: [//XXX
        {
            "template": "value",
        }
    ]
}