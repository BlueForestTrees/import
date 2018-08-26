import Excel from "exceljs"
import {streamIt} from "./streams"

export const parse = (buffer, desc) => {
    const workbook = new Excel.Workbook()
    const docs = []
    return workbook.xlsx.read(streamIt(buffer)).then(() => {
        const startAt = desc.firstDocAt
        const endAt = workbook.getWorksheet(1).getRow(1).values.length
        for (let i = startAt; i < endAt; i++) {
            docs.push(parseDocument(workbook, desc.fields, i))
        }
    }).then(() => docs)
}

export const parseDocument = (workbook, map, colIdx) => {
    const obj = {}
    const values = workbook.getWorksheet(1).getColumn(colIdx).values
    for (let i = 0; i < map.length; i++) {
        assign(obj, map[i], parseValue(map[i], values[map[i].idx]))
    }
    return obj
}

const parseValue = (field, rawValue) => {
    rawValue = rawValue ? rawValue.trim() : null
    if (rawValue) {
        if (field.type === "array") {
            return rawValue.split(field.sep)
        } else {
            return rawValue
        }
    } else {
        return "pas de valeur"
    }
}

const assign = (obj, field, value) => {
    if (field.under) {
        if (!obj[field.under]) {
            obj[field.under] = {}
        }
        if (field.subunder) {
            if (!obj[field.under][field.subunder]) {
                obj[field.under][field.subunder] = {}
            }
            obj[field.under][field.subunder][field.fieldName] = value
        } else {
            obj[field.under][field.fieldName] = value
        }
    } else {
        obj[field.fieldName] = value
    }
}