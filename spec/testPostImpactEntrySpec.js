import path from "path"

export const postAdemeImpactEntryFileSpec = {
    req: {
        url: "/api/impactEntryBulk/ademe",
        method: "POST",
        file: {
            field: "xlsx.ademe.impactEntry",
            path: path.resolve("files/BI_1.09__06_CatImpacts_Details.xlsx")
        }
    },
    res: {
        bodypath: [
            {path: "$.ok", value: [true]},
            {path: "$.upsertions", value: [27]},
            {path: "$.insertions", value: [0]},
        ]
    }
}