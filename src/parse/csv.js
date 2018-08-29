import readline from 'readline'
import {streamIt} from "./streams"

export const parseImpactCsv = async buffer => await new Promise(function (resolve) {
    const rl = readline.createInterface({input: streamIt(buffer)})
    
    const impacts = []
    let head = true
    let ignoreCount = 1
    let idProduits = null
    
    rl.on('line', (lineProduits) => {
        if (head) {
            head = false
            idProduits = tagLine(lineProduits)
            idProduits.skip(4)
        } else if (ignoreCount === 0) {
            const tl = tagLine(lineProduits)
            let qt
            let impactId = tl.next()
            tl.skip(3)
            idProduits.reset()
            idProduits.skip(4)
            while (qt = tl.next()) {
                impacts.push({trunkExternId: idProduits.next(), impactExternId: impactId, bqt: parseFloat(qt)})
            }
        } else {
            ignoreCount--
        }
    })
    
    rl.on('close', () => {
        resolve(impacts)
    })
    
})

export const pairTagInside = (line, start, end) => {
    let count = 0
    let i = start
    
    if (start === end) return undefined
    
    while (i < end) {
        i = line.indexOf("\"", i)
        if (i === -1) {
            break
        }
        if (i < end) {
            count++
            i++
        }
    }
    
    return count % 2 === 0
}
export const tagLine = line => {
    let i = 0
    let sep = ";"
    let end
    
    let column = -1
    
    return {
        col: () => column,
        reset: () => {
            i = 0
            column = -1
        },
        skip: function (n) {
            n = n || 1
            for (let j = 0; j < n; j++) {
                i = indexOfWithPairTag(line, sep, i)
                if (i === -1) break
                i++
            }
            column += n
        },
        next: () => {
            if (i === -1 || i > line.length) {
                column = -1
                return null
            }
            end = indexOfWithPairTag(line, sep, i)
            if (end === -1) {
                end = line.length
            }
            const res = line.substring(i, end)
            i = end + 1
            column++
            return res
        }
    }
}
export const indexOfWithPairTag = (line, sep, start) => {
    let i = start
    let lookAt = i
    while (true) {
        lookAt = line.indexOf(sep, lookAt)
        if (lookAt === -1 || pairTagInside(line, i, lookAt)) {
            break
        } else {
            lookAt++
        }
    }
    return lookAt
}