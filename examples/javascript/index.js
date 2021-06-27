const {Client, Intents, MessageEmbed} = require("discord.js");
const {Pagination} = require("discordjs-button-embed-pagination");
const data = require("../data.json");

export class Bot extends Client {
    constructor() {
        super({
            intents: Intents.NON_PRIVILEGED,
        });
        this.on("ready", this.onReady);
        this.on("message", this.onMessage);
        this.login(process.env.TOKEN);
    }

    async onReady() {
        console.log(`Ready with ${this.guilds.cache.size} guilds.`);
    }

    async onMessage(message) {
        if (message.content === "paginate") {
            // fill embed here
            const embeds = data.map((x) => {
                return new MessageEmbed()
                    .setColor("RANDOM")
                    .addField(
                        "Name",
                        x.name.title + " " + x.name.last + " " + x.name.last
                    )
                    .addField("Gender", x.gender)
                    .addField("Email", x.email)
                    .addField("Date of Birth", new Date(x.dob).toDateString())
                    .addField("Age", x.age.toString())
                    .addField("Phone", x.phone)
                    .setThumbnail(x.image);
            });
            // without options
            await new Pagination(message.channel, embeds, "page").paginate();
            // with option
            await new Pagination(message.channel, embeds, "page", 60000, [
                {
                    style: "PRIMARY",
                    label: "First",
                    emoji: "⏮️"
                }, {
                    style: "PRIMARY",
                    label: "Next",
                    emoji: "◀️"
                }, {
                    style: "DANGER",
                    label: "Stop",
                    emoji: "⏹️"
                }, {
                    style: "PRIMARY",
                    label: "Prev",
                    emoji: "▶️"
                }, {
                    style: "PRIMARY",
                    label: "Last",
                    emoji: "⏭️"
                },

            ]).paginate();
        }
    }
}
