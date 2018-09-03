import {expect} from 'chai'
import {chunkify} from "../src/util/util"

describe('Utils', function () {
    it('chunkify', ()=>{
        const full = [1,2,3,4,5,6,7,8,9,10]
        const chunks = chunkify(full, 3)
        expect(chunks()).to.deep.equal([1,2,3])
        expect(chunks()).to.deep.equal([4,5,6])
        expect(chunks()).to.deep.equal([7,8,9])
        expect(chunks()).to.deep.equal([10])
        expect(chunks()).to.equal(null)
    })
})