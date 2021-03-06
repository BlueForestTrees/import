import {expect} from "chai"
import {countFromDbByDoc, init} from "test-api-express-mongo"
import {ademeToBlueforestImpactEntries, ademeUnitToGrandeurEq} from "../src/impact/impactEntry"
import {loadGrandeurs} from "../src/grandeur/grandeurService"
import {initUnits} from "unit-manip"

describe('Imports utils', function () {

    beforeEach(() => loadGrandeurs().then(initUnits))

    it('convert ademe unit to blueforest unit', () => {
        expect(ademeUnitToGrandeurEq("kg éq. CO2")).to.deep.equal({g: "Mass", eq: "CO2"})
        expect(ademeUnitToGrandeurEq("kg éq.CO2")).to.deep.equal({g: "Mass", eq: "CO2"})
        expect(ademeUnitToGrandeurEq("kg")).to.deep.equal({g: "Mass"})
    })

    it('convert ademe impact parse to blueforest impact', () => {
        const ademe = {
            externId: '370960f4-0a3a-415d-bf3e-e5ce63160bb9',
            nom: 'Changement climatique',
            'nom origine ILCD': 'ILCD2011; Climate change; midpoint; GWP100; IPCC2007',
            commentaire: 'Factors issued from the baseline model of the IPCC (2007)',
            'Niveau de recommendation': 'I',
            'Unité de référence': 'kg éq. CO2',
            unitDescription: 'Mass CO2-equivalents',
            referenceYear: 'no time reference',
            validUntil: '100 years',
            dataSource: ['IPCC (2007)'],
            dataSourceOrigin: 'IPCC (2007)',
            commanditaire: ['Intergovernmental Panel on Climate Change'],
            datasetFormat: 'ILCD format',
            datasetVersion: '01.00.000'
        }
        const blueforest = {
            updateOne: {
                filter: {
                    externId: "370960f4-0a3a-415d-bf3e-e5ce63160bb9"
                },
                update: {
                    $set: {
                        color: "#696969",
                        eq: "CO2",
                        oid:69,
                        externId: "370960f4-0a3a-415d-bf3e-e5ce63160bb9",
                        g: "Mass",
                        name: "Changement climatique",
                        origin: "ADEME",
                        raw: ademe
                    }
                },
                upsert: true
            }
        }
        expect(ademeToBlueforestImpactEntries(69, [ademe])).to.deep.equal([blueforest])
    })

    it('convert ademe damage parse to blueforest impact', () => {
        const ademe = {
            externId: '370960f4-0a3a-415d-bf3e-e5ce63160bb9',
            nom: 'Changement climatique',
            'nom origine ILCD': 'ILCD2011; Climate change; midpoint; GWP100; IPCC2007',
            commentaire: 'Factors issued from the baseline model of the IPCC (2007)',
            'Niveau de recommendation': 'I',
            'Unité de référence': 'D',
            unitDescription: 'Mass CO2-equivalents',
            referenceYear: 'no time reference',
            validUntil: '100 years',
            dataSource: ['IPCC (2007)'],
            dataSourceOrigin: 'IPCC (2007)',
            commanditaire: ['Intergovernmental Panel on Climate Change'],
            datasetFormat: 'ILCD format',
            datasetVersion: '01.00.000'
        }
        const blueforest = {
            updateOne: {
                filter: {
                    externId: "370960f4-0a3a-415d-bf3e-e5ce63160bb9"
                },
                update: {
                    $set: {
                        color: "#696969",
                        oid:67,
                        damage: true,
                        externId: "370960f4-0a3a-415d-bf3e-e5ce63160bb9",
                        g: "D",
                        name: "Changement climatique",
                        origin: "ADEME",
                        raw: ademe
                    }
                },
                upsert: true
            }
        }
        expect(ademeToBlueforestImpactEntries(67, [ademe])).to.deep.equal([blueforest])
    })

})