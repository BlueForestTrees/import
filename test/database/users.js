import {X_ACCESS_TOKEN} from "../../src/headers"
import jwt from "jsonwebtoken"
import {object} from "mongo-registry"

const getRandomColor = () => {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}

export const god = {
    _id: object("987987987987987987987987"),
    status: 1,//confirmed
    mail: "god@test.fr",
    fullname: "God Test",
    wantSuscribeDate: new Date(),
    password: "not_sha1_never_used_password",
    confirmDate: new Date(),
    color: getRandomColor(),
    rights: "G"
}
export const simple = {
    _id: object("123123123123123313212332")
}

export const authGod = {[X_ACCESS_TOKEN]: jwt.sign({user: god}, "megasecret", {expiresIn: "1d"})}
export const authSimple = {[X_ACCESS_TOKEN]: jwt.sign({user: simple}, "megasecret", {expiresIn: "1d"})}