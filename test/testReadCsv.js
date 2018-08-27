import fs from "fs"
import {indexOfWithPairTag, pairTagInside, parseImpactCsv, smartSplit, tagLine} from "../src/parse/csv"
import {expect} from 'chai'

let line = "-1-2;0\"00;\"12;34\";5678;1\"\"\"011;1213"

describe('csv', function () {
    it('parse an entire csv file', async () => {
        
        const impacts = await parseImpactCsv(fs.readFileSync("files/PETIT_BI_1.09__03_Procedes_Impacts.csv"))
        
        const expectedImpacts = [
            {trunkExternId: "940bf6ef-aaae-4559-9dd3-0cd68d30b2f4", impactExternId: "ec7836be-83eb-41da-bcda-1a6a3fe2d149", bqt: 0.00175113},
            {trunkExternId: "81cd479b-6536-40ac-be2a-ab18b6e79bb8", impactExternId: "ec7836be-83eb-41da-bcda-1a6a3fe2d149", bqt: 0.0000434245},
            {trunkExternId: "940bf6ef-aaae-4559-9dd3-0cd68d30b2f4", impactExternId: "865c4fbe-11cc-4905-9b0a-80a99d94f7e6", bqt: 0.000000311443},
            {trunkExternId: "81cd479b-6536-40ac-be2a-ab18b6e79bb8", impactExternId: "865c4fbe-11cc-4905-9b0a-80a99d94f7e6", bqt: 0.0000000373707},
        ]
        
        expect(impacts).to.deep.equal(expectedImpacts)
    })
    
    it('pair number inside none', () => {
        expect(line.substring(0, 4)).equals("-1-2")
        expect(pairTagInside(line, 0, 4)).to.equal(true)
    })
    it('impair number inside one', () => {
        expect(line.substring(4, 9)).equals(";0\"00")
        expect(pairTagInside(line, 4, 9)).to.equal(false)
    })
    it('pair number inside two', () => {
        expect(line.substring(9, 17)).equals(";\"12;34\"")
        expect(pairTagInside(line, 9, 17)).to.equal(true)
    })
    it('impair number inside three', () => {
        expect(line.substring(22, 30)).equals(";1\"\"\"011")
        expect(pairTagInside(line, 22, 30)).to.equal(false)
    })
    it('pair number inside bordel', () => {
        let line = "\"\"\"\"\"\"\"\"\"\"\""
        expect(line.substring(3, 7)).equals("\"\"\"\"")
        expect(pairTagInside(line, 3, 7)).to.equal(true)
    })
    it('impair number inside bordel', () => {
        let line = "\"\"\"\"\"\"\"\"\"\"\""
        expect(line.substring(3, 8)).equals("\"\"\"\"\"")
        expect(pairTagInside(line, 3, 8)).to.equal(false)
    })
    it('undefined number inside  nothing', () => {
        let line = "\"\"\"\"\"\"\"\"\"\"\""
        expect(line.substring(3, 3)).equals("")
        expect(pairTagInside(line, 3, 3)).to.equal(undefined)
    })
    
    it('find part with pair \" \"', () => {
        expect(indexOfWithPairTag(line, ";", 0)).to.equal(4)
    })
    
    it('next but one \"', () => {
        expect(indexOfWithPairTag("coucou;\"mec;32 ans\";ça va", ";", 7)).to.equal(19)
    })
    it('next but end \"', () => {
        expect(indexOfWithPairTag("coucou\";ertgf", 0)).to.equal(-1)
    })
    
    it('tagLine -1', () => {
        const tl = tagLine("dfg")
        expect(tl.next()).equal("dfg")
    })
    
    it('tagLine 0', () => {
        const tl = tagLine("dfg;ol")
        expect(tl.next()).equal("dfg")
    })
    
    it('tagLine 1', () => {
        const tl = tagLine("dfg;ol")
        tl.next()
        expect(tl.next()).equal("ol")
    })
    
    it('tagLine 1.1', () => {
        let tl = tagLine("dfg;ert;uui;abc")
        tl.next()
        tl.next()
        expect(tl.next()).equal("uui")
    })
    
    it('tagLine 2', () => {
        let tl = tagLine("dfg;ert;uui;abc")
        tl.next()
        tl.next()
        tl.next()
        expect(tl.next()).equal("abc")
    })
    
    it('tagLine 3', () => {
        const tl = tagLine("dfg;ert;uui;abc")
        tl.skip(2)
        expect(tl.next()).equal("uui")
    })
    
    it('tagLine 4', () => {
        let tl = tagLine("dfg;ert;uui;abc")
        tl.skip(3)
        expect(tl.next()).equal("abc")
    })
    
    it('tagLine 5', () => {
        let tl = tagLine("dfg;ert;uui;abc")
        tl.skip(4)
        expect(tl.next()).is.null
    })
    
    it('tagLine 6', () => {
        let tl = tagLine("dfg;ert;uui;abc")
        tl.skip(30)
        expect(tl.next()).is.null
    })
    
    it('tagLine 8', () => {
        let tl = tagLine("1;2;\"3\";4")
        tl.skip()
        expect(tl.next()).equal("2")
        expect(tl.next()).equal("\"3\"")
        expect(tl.next()).equal("4")
    })
    
    it('tagLine 9', () => {
        let tl = tagLine("1;2;3\"3;4")
        tl.skip()
        expect(tl.next()).equal("2")
        expect(tl.next()).equal("3\"3;4")
        expect(tl.next()).is.null
    })
    
    it('tagLine 10', () => {
        let tl = tagLine("1;2;3\"3;4\";5")
        tl.skip()
        expect(tl.next()).equal("2")
        expect(tl.next()).equal("3\"3;4\"")
        expect(tl.next()).equal("5")
        expect(tl.next()).is.null
    })
    
    it('tagLine 11', () => {
        let tl = tagLine("00;10;20;30;40")
        expect(tl.col()).equal(-1)
        
        tl.skip()
        expect(tl.col()).equal(0)
        
        expect(tl.next()).equal("10")
        expect(tl.col()).equal(1)
        
        expect(tl.next()).equal("20")
        expect(tl.col()).equal(2)
        
        expect(tl.next()).equal("30")
        expect(tl.col()).equal(3)
        
        expect(tl.next()).equal("40")
        expect(tl.col()).equal(4)
        
        expect(tl.next()).is.null
        expect(tl.col()).equal(-1)
    })
})

