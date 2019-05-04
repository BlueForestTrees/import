import ENV from "./env"
import {dbInit} from "mongo-registry"
import {initUnits} from "unit-manip"
import {loadGrandeurs} from "./grandeur/grandeurService"
import {all} from "./rest/all"
import {createSender, initRabbit} from "simple-rbmq"

const multiSend = send => msgs => Promise.all(msgs.map(async msg => await send(msg))).then(msgs => msgs.length)

export default initRabbit(ENV.RB)
    .then(() => dbInit(ENV))
    .then(loadGrandeurs)
    .then(initUnits)
    .then(() => Promise.all([
        Promise.resolve(multiSend(createSender(ENV.RB.exchange, ENV.RK_TRUNK_UPSERT))),
        Promise.resolve(createSender(ENV.RB.exchange, ENV.RK_IMPACT_TANK_UPSERT))
    ]))
    .then(all(ENV))
    .then(() => process.exit(0))
    .catch(console.error)
