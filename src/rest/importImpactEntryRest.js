import {forEach, map} from 'lodash'

export const moveDamages = (impactEntries, damageEntries) => async () => {
    const impactdamages = await impactEntries.find({damage: true}).toArray()
    const damages = map(impactdamages, id => {
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
    return {
        upsertDamages: (await damageEntries.bulkWrite(damages, {ordered: false})).result,
        deleteImpactDamages: (await impactEntries.deleteMany({damage: true})).result
    }
}