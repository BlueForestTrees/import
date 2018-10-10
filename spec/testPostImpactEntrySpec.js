import path from "path"
import {authGod} from "../test/database/users"

export const postAdemeImpactEntryFileSpec = {
    req: {
        url: "/api/import/ademe/impactEntry",
        method: "POST",
        file: {
            field: "xlsx.ademe.impactEntry",
            path: path.resolve("files/BI_1.09__06_CatImpacts_Details.xlsx")
        },
        headers:authGod
    },
    res: {
        bodypath: [
            {path: "$.ok", value: 1}
        ]
    }
}