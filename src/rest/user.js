import client from "request-promise-native"
import env from "./../env"
import {object} from "mongo-registry"

export const getAdemeUserId = async () => {
    const ademeUser = await client.get(`${env.USER_BASE_URL}/api/user/mail/ademe@ademe.fr`, {json:true, headers: {mixin: "_id"}})
    if (!ademeUser._id) {
        throw {code: "bf500"}
    } else {
        return object(ademeUser._id)
    }
}