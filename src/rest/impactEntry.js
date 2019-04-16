import {map} from 'lodash'
import {grandeur} from "unit-manip"
import {parse} from "../util/excel"
import {col} from "mongo-registry"
import {cols} from "../collections"
import {parseImpactEntryCsv} from "../util/csv"

const damages = ["PDF", "CTUe", "CTUh", "DALY", "PNOF", "$"]
//AL => DALY
//TU => CTUh    //question ADEME
//TU => CTUe    //question ADEME
//'' => $   //informer ADEME
//éq. m3 => nouveau => m3
//D => PDF
//NO => PNOF


export const importAdemeImpactEntries = async ({buffer, ademeUserId}) => ademeToBlueforestImpactEntries(ademeUserId, await parseImpactEntryCsv(buffer))

export const ademeToBlueforestImpactEntries = (ademeUserId, raws) => map(raws, raw => {

    console.log(raw)

    const impactEntry = {
        updateOne: {
            filter: {externId: raw.externId},
            update: {
                $set: {
                    externId: raw.externId,
                    name: raw.nom,
                    ...ademeUnitToGrandeurEq(raw.unit),
                    color: "#696969",
                    origin: "ADEME base Impact v1.11",
                    oid: ademeUserId,
                    dateUpdate: new Date()
                }
            },
            upsert: true
        }
    }
    if (damages.indexOf(raw.unit) !== -1) {
        impactEntry.updateOne.update.$set.damage = true
    }
    return impactEntry
})

export const ademeUnitToGrandeurEq = ademeUnit => {
    const splitted = ademeUnit.split("éq.")
    if (splitted.length === 1) {
        return {g: grandeur(ademeUnit)}
    } else if (splitted.length === 2) {
        return {g: grandeur(splitted[0].trim()), eq: splitted[1].trim()}
    }
}

export const writeImpactEntries = data => col(cols.IMPACT_ENTRY).bulkWrite(data, {ordered: false}).then(() => data.length)

export const moveDamages = (impactEntries, damageEntries) => async () => {
    const damages = map(await impactEntries.find({damage: true}).toArray(), id => {
        const _id = id._id
        delete id.damage
        delete id._id
        return ({
            updateOne: {
                filter: {externId: id.externId},
                update: {
                    $set: id,
                    $setOnInsert: {_id}
                },
                upsert: true
            }
        })
    })

    damages.length && await damageEntries.bulkWrite(damages, {ordered: false})
    damages.length && await impactEntries.deleteMany({damage: true})

    return damages.length
}
