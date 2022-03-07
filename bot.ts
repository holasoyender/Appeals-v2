import { Client, Message, MessageEmbed, Intents, MessageButton, MessageActionRow, ButtonInteraction } from "discord.js"
import Appeal from "./database/Appeal";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import commands from "./commands";
import Blocked from "./database/Blocked";
import mongoose from "mongoose";

//@ts-ignroe @ts-expect-error
const client = new Client({
    partials: ["CHANNEL"],
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.DIRECT_MESSAGES]
})

const _commands = [];

for (const command of commands) {
    _commands.push(command.toJSON());
}

// @ts-ignore
const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log('Cargando todos los comandos... (/)');

        // @ts-ignore
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log('Todos los comandos han sido recargados! (/)');
    } catch (error) {
        console.error(error);
    }
})();

client.on("ready", () => {
    client.user?.setActivity("kenabot.xyz", { type: "WATCHING" })
    console.log(`Bot iniciado como ${client.user?.username}!`)
});

client.on("interactionCreate", async (interaction) => {

    //@ts-ignore
    if (!interaction.member.roles.cache.find(r => r.id === process.env.ROL_MODERADOR)) return interaction.reply({
        content: ":no_entry_sign:  No tienes permisos para realizar esta acción!",
        ephemeral: true
    })

    if (interaction.isButton()) {

        let args = interaction.customId.split("-")

        if (args[0] !== "btn") return
        if (args[1] === "yes") return await doYes(args[2], interaction)
        if (args[1] === "no") return await doNo(args[2], interaction)
    }

    if (interaction.isCommand()) {

        switch (interaction.commandName) {
            case "block":
                if (!interaction.options.data[0]) return interaction.reply({
                    content: ":no_entry_sign:  Ese usuario no existe",
                    ephemeral: true
                });
                Blocked.findOne({
                    ID: interaction.options.data[0].user?.id
                }, (err: any, res: any) => {
                    if (err || res) return interaction.reply({
                        content: ":no_entry_sign:  Ese usuario ya está bloqueado",
                        ephemeral: true
                    });
                    new Blocked({
                        _id: new mongoose.Types.ObjectId(),
                        ID: interaction.options.data[0].user?.id
                    }).save().then((doc: any) => {
                        return interaction.reply({
                            content: `✅  El usuario **${interaction.options.data[0].user?.tag}** ha sido bloqueado.`,
                        }).catch((e: unknown) => {
                            console.log(e)
                            return interaction.reply({
                                content: ":no_entry_sign:  Ha ocurrido un error!",
                                ephemeral: true
                            });
                        });
                    })
                })
                break;
            case "unblock":
                if (!interaction.options.data[0]) return interaction.reply({
                    content: ":no_entry_sign:  Ese usuario no existe",
                    ephemeral: true
                });
                Blocked.findOne({
                    ID: interaction.options.data[0].user?.id
                }, (err: any, res: any) => {
                    if (err || !res) return interaction.reply({
                        content: ":no_entry_sign:  Ese usuario no está bloqueado",
                        ephemeral: true
                    });
                    res.delete();
                    return interaction.reply({
                        content: `✅  El usuario **${interaction.options.data[0].user?.tag}** ha sido desbloqueado.`,
                    })
                })
                break;
        }
    }

})

export async function checkBans(userId: any) {
    // @ts-ignore
    let guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) return false
    try {
        let bans = await guild.bans.fetch();
        console.log(bans)
        return bans.has(userId)
    } catch (e) {
        console.log("No tengo permisos para ver los bans del servidor!")
        return false
    }
}

export async function getBanByUserID(userId: any) {
    // @ts-ignore
    let guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) return false
    try {
        let bans = await guild.bans.fetch();
        return bans.get(userId) || false
    } catch (e) {
        console.log("No tengo permisos para ver los bans del servidor!")
        return false
    }
}

export async function sendAppealEmbed(user: any, _appeal: any) {
    // @ts-ignore
    let guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) return false
    // @ts-ignore
    let channel = client.channels.cache.get(process.env.CHANNEL_ID)
    if (!channel || channel.type !== "GUILD_TEXT") return false;
    let ban = await guild.bans.fetch(user.ID)
    if (!ban) return false;

    let reason = ban.reason || "Sin razón"
    if (!reason) return false;

    let appeal = await _appeal
    if (!appeal) return false;

    let mod = reason.split(" Baneado por: ")[1]
    if (!mod) mod = "Sin moderador"; else reason = reason.split(" Baneado por: ")[0] || "Sin razón"

    let avatar;
    if (user.Avatar !== "https://cdn.discordapp.com/embed/avatars/0.png")
        avatar = `https://cdn.discordapp.com/avatars/${user.ID}/${user.Avatar}.webp`
    else
        avatar = "https://cdn.discordapp.com/embed/avatars/0.png"

    let embed = new MessageEmbed()
        .setColor("#2cfff7")
        .setAuthor({ name: "¡ Nueva apelación recibida !", iconURL: "https://cdn.discordapp.com/attachments/855118494005198939/942810242364895302/animacion_icono_4.gif", url: "https://kenabot.xyz/" })
        .setThumbnail(avatar)
        .addField("Información del usuario:", `- Usuario: <@!${user.ID}>\n- Nombre: \`${user.Tag}\`\n- ID: \`${user.ID}\`\n\n- ID del caso: \`${appeal.AppealID}\`\n- Razón del baneo: \`${reason}\`\n- Moderador: \`${mod}\``, false)
        .addField("¿Por qué has sido baneado?", appeal.banReason, false)
        .addField("¿Por qué crees que deberíamos levantarte el ban?", appeal.appealText, false)
        .addField("¿Qué harás para evitar ser baneado en el futuro?", appeal.futureActions, false)

    let voteYesButton = new MessageButton()
        .setStyle("SUCCESS")
        .setLabel("Desbanear")
        .setEmoji("835916126050451536")
        .setCustomId(`btn-yes-${appeal.AppealID}`)

    let voteNoButton = new MessageButton()
        .setStyle("DANGER")
        .setLabel("Banear")
        .setEmoji("835912635856977950")
        .setCustomId(`btn-no-${appeal.AppealID}`)

    try {
        //@ts-ignore
        let msg = await channel.send({
            embeds: [embed],
            components: [new MessageActionRow().addComponents(voteYesButton, voteNoButton)]
        })

        let user: any = await Appeal.findOne(
            {
                AppealID: appeal.AppealID
            });

        if (!user) return false;
        user.MessageID = msg.id;
        user.save();
        return true;
    } catch (e) {
        console.log("No se ha podido mandar el mensaje: " + e)
        return false
    }
}
export function start() {
    client.login(process.env.BOT_TOKEN).catch()
}
async function doYes(AppealID: any, interaction: ButtonInteraction) {

    let _Appeal: any = await Appeal.findOne({ AppealID })
    if (!_Appeal) return interaction.reply({
        content: ":no_entry_sign:  Esta petición de apelación no existe!",
        ephemeral: true
    })
    let args = interaction.customId.split("-")
    // @ts-ignore
    let channel = client.channels.cache.get(process.env.CHANNEL_ID)
    if (!channel || channel.type !== "GUILD_TEXT") return;
    Appeal.findOne({ AppealID: args[2], Unbanned: false }, (err: any, res: any) => {
        if (!res) return interaction.reply({
            content: ":no_entry_sign:  Esta votación ya ha acabado!",
            ephemeral: true
        })
        res.Unbanned = true;
        res.save();
        let _voteYesButton = new MessageButton()
            .setStyle("SUCCESS")
            .setLabel("Desbanear")
            .setEmoji("835916126050451536")
            .setDisabled(true)
            .setCustomId(`btn-yes-${res.AppealID}`)
        let _voteNoButton = new MessageButton()
            .setStyle("DANGER")
            .setLabel("Banear")
            .setEmoji("835912635856977950")
            .setDisabled(true)
            .setCustomId(`btn-no-${res.AppealID}`)

        //@ts-ignore
        let embed: MessageEmbed = interaction.message.embeds[0]

        embed.setColor("#57F287").setAuthor({ name: "Usuario desbaneado", iconURL: "https://cdn.discordapp.com/attachments/855118494005198939/942810242364895302/animacion_icono_4.gif", url: "https://kenabot.xyz/" })
        //@ts-ignore
        interaction.message.edit({
            components: [new MessageActionRow().addComponents(_voteYesButton, _voteNoButton)],
            embeds: [embed]
        }).catch((e: any) => {
        })

        try {
            if (!process.env.GUILD_ID) return;
            let guild = client.guilds.cache.get(process.env.GUILD_ID)
            guild?.bans.remove(res.UserID, "Apelación aprobada").catch((e: unknown) => { })
            return interaction.reply({
                content: `✅  Has **aprobado** la apelación del usuario <@!${_Appeal.UserID}> y ha sido desbaneado.`,
                ephemeral: true
            });
        } catch (e) {
            interaction.reply({
                content: ":no_entry_sign:  Ha ocurrido un error, por favor, comprueba la consola",
                ephemeral: true
            });
            return console.log(e)
        }
    })
}
async function doNo(AppealID: any, interaction: ButtonInteraction) {

    let _Appeal: any = await Appeal.findOne({ AppealID })
    if (!_Appeal) return interaction.reply({
        content: ":no_entry_sign:  Esta petición de apelación no existe!",
        ephemeral: true
    })

    let args = interaction.customId.split("-")
    // @ts-ignore
    let channel = client.channels.cache.get(process.env.CHANNEL_ID)
    if (!channel || channel.type !== "GUILD_TEXT") return;

    Appeal.findOne({ AppealID: args[2], Unbanned: false }, (err: any, res: any) => {
        if (!res) return interaction.reply({
            content: ":no_entry_sign:  Esta votación ya ha acabado!",
            ephemeral: true
        })

        res.Unbanned = true;
        res.save();

        let _voteYesButton = new MessageButton()
            .setStyle("SUCCESS")
            .setLabel("Desbanear")
            .setEmoji("835916126050451536")
            .setDisabled(true)
            .setCustomId(`btn-yes-${res.AppealID}`)

        let _voteNoButton = new MessageButton()
            .setStyle("DANGER")
            .setLabel("Banear")
            .setEmoji("835912635856977950")
            .setDisabled(true)
            .setCustomId(`btn-no-${res.AppealID}`)


        let embed = interaction.message.embeds[0]
        //@ts-ignore
        embed.setColor("#ED4245").setAuthor({ name: "Usuario no desbaneado", iconURL: "https://cdn.discordapp.com/attachments/855118494005198939/942810242364895302/animacion_icono_4.gif", url: "https://kenabot.xyz/" })

        //@ts-ignore
        interaction.message.edit({
            components: [new MessageActionRow().addComponents(_voteYesButton, _voteNoButton)],
            embeds: [embed]
        }).catch((e: any) => {
        })

        return interaction.reply({
            content: `✅  Has **rechazado** la apelación del usuario <@!${_Appeal.UserID}> y no ha sido desbaneado.`,
            ephemeral: true
        });

    })
}