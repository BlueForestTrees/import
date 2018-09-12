import Excel from "exceljs"

import {expect} from "chai"
import fs from "fs"
import {parse, parseDocument} from "../src/util/excel"

describe('xlsx read', function () {

    const filename = "files/BI_1.09__06_CatImpacts_Details.xlsx"

    it('read cell A1 value', () => {
        const workbook = new Excel.Workbook()
        return workbook.xlsx.readFile(filename)
            .then(() => {
                expect(workbook.getWorksheet(1).getCell("A1").value).to.equal(" Informations sur la catégorie d'impact ")
            })
    })

    it('read column 3 line 3', () => {
        const workbook = new Excel.Workbook()
        return workbook.xlsx.readFile(filename)
            .then(() => {
                const column = workbook.getWorksheet(1).getColumn(3).values
                expect(column[5]).to.equal(" Photochemical ozone formation ")
            })
    })

    it('read column 1', () => {
        const workbook = new Excel.Workbook()
        return workbook.xlsx.readFile(filename)
            .then(() => {
                const headerColumnIdx = 1
                const column = workbook.getWorksheet(1).getColumn(headerColumnIdx).values
            })
    })

    it('build an impact from file & fileDescription', () => {
        const fields = [
            {fieldName: "externId", xlsName: " UUID ", idx: 3},
            {fieldName: "nom", xlsName: " Nom français ", idx: 4},
        ]
        const expectedObject = {
            externId: "ec7836be-83eb-41da-bcda-1a6a3fe2d149",
            nom: "Formation d'ozone photochimique"
        }
        const workbook = new Excel.Workbook()
        return workbook.xlsx.readFile(filename).then(() => {
            expect(parseDocument(workbook, fields, 3)).to.deep.equal(expectedObject)
        })
    })

    it('parse an entire impact file', async () => {
        const parseDesc = {
            firstDocAt: 3,
            fields: [
                {fieldName: "externId", xlsName: " UUID ", idx: 3},
                {fieldName: "nom", xlsName: " Nom français ", idx: 4},
            ]
        }

        const docs = await parse(fs.readFileSync(filename), parseDesc)

        expect(docs.length).to.equal(27)
        expect(docs[1].externId).to.equal("865c4fbe-11cc-4905-9b0a-80a99d94f7e6")
        expect(docs[docs.length - 1].externId).to.equal("b49c662d-4662-4944-a80a-093dd03d3f4f")
    })
})