"use strict"
import { Client, Structures } from "discord.js";

Structures.extend("Guild", Guild => {
    class Vanity extends Guild {
        constructor(client, data) {
            super(client, data);
        }
        setVanityURL(code, reason) {
            if(!code) return;
            return this.client.api.guilds(this.id, "vanity-url").patch({ data: {code: code}, reason })
            .then((newData) => {
                this.client.actions.GuildUpdate.handle(newData);
            });
        }
    }
    return Vanity;
})

const client = new Client();
const logChannelId = "REDACTED";
const botToken = "REDACTED";
const ownerIds = ["450421563267874817"];

client.once("ready", async () => {
    console.log(client.user.tag+" ready");
});

client.on("guildUpdate", async (oldGuild, newGuild) => {
    if(!oldGuild || !oldGuild.me.hasPermission(["ADMINISTRATOR"])) return;
    const auditLog = await newGuild.fetchAuditLogs({type: "GUILD_UPDATE", limit: 1}).then((log) => log.entries.first()).catch(() => false);
    if(!auditLog || !auditLog.executor || Date.now()-auditLog.createdTimestamp > 5000 || auditLog.executor.id == client.user.id || ownerIds.includes(auditLog.executor.id)) return;

    if(oldGuild.vanityURLCode != newGuild.vanityURLCode) await oldGuild.setVanityURL(oldGuild.vanityURLCode).catch();

    const logChannel = client.channels.cache.find(channel => channel.id === logChannelId);
    if(logChannel) {
        if(auditLog.executor.id) {
            logChannel.send("Sunucu ayarları <@"+auditLog.executor.id+"> tarafından güncellendi.").catch();
        } else {
            logChannel.send("Sunucu ayarları güncellendi fakat kimin güncellediği tespit edilemedi.").catch();
        }
    }

})


client.login(botToken);