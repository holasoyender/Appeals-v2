import { Router } from "express";
const router = Router();
import passport from "passport";
import { checkBans, getBanByUserID, sendAppealEmbed } from "../bot";
import { getFormHTML } from "./views/form";
import Appeal from "../database/Appeal";
import mongoose from "mongoose";
import BlockedUser from "../database/Blocked";
import error from "./views/error";
import blocked from "./views/blocked";
import doubleForm from "./views/doubleForm";
import unknownError from "./views/unknownError";
import success from "./views/success";
import badDate from "./views/badDate";
import revision from "./views/revision";
import banned from "./views/banned";
import unbanned from "./views/unbanned";
import { GuildBan } from "discord.js";
import config from "../config";

router.get("/discord", passport.authenticate("discord"));

router.get("/discord/redirect", async (req, res, next) => {

    try {
        passport.authenticate("discord", (err, user, info) => {
            if (err) return res.append("Content-Type", "text/html").send(unknownError)
            if (!user) return res.append("Content-Type", "text/html").send(unknownError)

            req.login(user, async (e) => {
                if (e) return res.append("Content-Type", "text/html").send(unknownError)

                let _Appeal: any = await Appeal.findOne({ UserID: user.ID })
                if (!_Appeal) {

                    let isBanned = await checkBans(user.ID)
                    if (!isBanned) return res.redirect(req.baseUrl + '/error');
                    let blockedData = await BlockedUser.find({ ID: user.ID })
                    if (blockedData[0]) return res.redirect(req.baseUrl + '/blocked');

                    return res.redirect(req.baseUrl + '/form');
                } else {
                    if (_Appeal.Unbanned) {
                        if (_Appeal.success)
                            return res.redirect(req.baseUrl + '/unbanned');
                        else
                            return res.redirect(req.baseUrl + '/banned');
                    } else
                        return res.redirect(req.baseUrl + '/revision');
                }
            })
        })(req, res, next)
    } catch (e) {
        console.log(e)
        return res.append("Content-Type", "text/html").send(unknownError)
    }
})

router.get("/error", async (req, res) => {
    return res.append("Content-Type", "text/html").send(error)
})
router.get("/blocked", async (req, res) => {
    return res.append("Content-Type", "text/html").send(blocked)
})
router.get("/badDate", async (req, res) => {
    return res.append("Content-Type", "text/html").send(badDate)
})
router.get("/unbanned", async (req, res) => {
    return res.append("Content-Type", "text/html").send(unbanned)
})
router.get("/banned", async (req, res) => {
    return res.append("Content-Type", "text/html").send(banned)
})
router.get("/revision", async (req, res) => {
    return res.append("Content-Type", "text/html").send(revision)
})

router.get("/form", async (req, res) => {
    if (!req.user) return res.redirect(req.baseUrl + '/discord/redirect');

    let user: any = await req.user;
    let isBanned = await checkBans(user.ID)
    if (!isBanned) return res.redirect(req.baseUrl + '/error');

    let exist = await Appeal.findOne({
        UserID: user.ID,
        //Unbanned: false
    })

    if (exist) return res.append("Content-Type", "text/html").send(doubleForm)
    let blockedData = await BlockedUser.find({ ID: user.ID })
    if (blockedData[0]) return res.redirect(req.baseUrl + '/blocked');

    let rawBan = await getBanByUserID(user.ID);
    if (rawBan == false) return res.redirect(req.baseUrl + '/error');
    let ban: GuildBan = rawBan;
    let time;

    if (ban.guild.me?.permissions.has("VIEW_AUDIT_LOG")) {
        let allBans = await ban.guild.fetchAuditLogs({ type: "MEMBER_BAN_ADD", limit: 100 })
        // @ts-ignore
        let bans = allBans.entries.filter(entry => entry !== null && entry.target !== null && entry.target.id === user.ID)
        if (!bans || !bans.first()) return res.append("Content-Type", "text/html").send(getFormHTML(req.user));
        time = bans.first()?.createdAt;
    }
    else
        return res.append("Content-Type", "text/html").send(getFormHTML(req.user));

    if (!time) return res.append("Content-Type", "text/html").send(getFormHTML(req.user));
    let newTime = new Date(time).getTime() + (config.wait_days * 24 * 60 * 60 * 1000); //Milisegundos del ban + X dias
    let now30 = new Date().getTime();// Milisegundos actuales

    if (newTime < now30) return res.append("Content-Type", "text/html").send(getFormHTML(req.user));
    else return res.redirect(req.baseUrl + '/badDate');
})

router.get("/form/get", async (req, res) => {

    let user: any = req.user;
    if (!req.user) return res.redirect(req.baseUrl + '/discord/redirect');

    let isBanned = await checkBans(user.ID)
    if (!isBanned) return res.redirect(req.baseUrl + '/error');
    let blockedData = await BlockedUser.find({ ID: user.ID })
    if (blockedData[0]) return res.redirect(req.baseUrl + '/blocked');

    if (
        !req.query ||
        !req.query.appealText ||
        !req.query.futureActions
    ) return res.redirect(req.baseUrl + '/unknown');

    let { appealText, futureActions } = req.query;
    let AppealID = await generateToken()

    let exist = await Appeal.findOne({
        UserID: user.ID,
        //Unbanned: false
    })

    if (exist) return res.append("Content-Type", "text/html").send(doubleForm)

    const newAppeal = new Appeal({
        _id: new mongoose.Types.ObjectId(),

        AppealID,
        MessageID: "none",
        UserID: user.ID,
        User: {
            ID: user.ID,
            Tag: user.Tag,
            Avatar: user.Avatar
        },
        Unbanned: false,
        success: false,

        appealText,
        futureActions
    })

    newAppeal.save()
        .then(async (doc: any) => {
            console.log(doc)
            let appeal = await sendAppealEmbed(user, doc);
            if (!appeal) {
                console.log("Error: Ha ocurrido un error intentado mandar el embed de apelaci??n al canal\nPor favor, comprueba la configuraci??n")
                return res.append("Content-Type", "text/html").send(unknownError)
            }
        })
        .catch((e: any) => { console.log(e); return res.append("Content-Type", "text/html").send(unknownError) })

    return res.append("Content-Type", "text/html").send(success)
})

async function generateToken() {

    const token = Math.floor(Math.random() * 50000) + 1;

    let id = await Appeal.findOne({
        AppealID: token
    })

    if (!id) return token.toString();
    await generateToken();
}


export default router