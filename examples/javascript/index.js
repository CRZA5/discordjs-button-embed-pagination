const { Client, EmbedBuilder } = require("discord.js");
const { Pagination } = require("discordjs-button-embed-pagination");
const data = require("../data.json");

class Bot extends Client {
  constructor() {
    super({
      intents: ["Guilds", "GuildMessages", "MessageContent"],
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
        return new EmbedBuilder()
          .setColor("Random")
          .addFields([
            {
              name: "Name",
              value: x.name.title + " " + x.name.last + " " + x.name.last,
            },
            {
              name: "Gender",
              value: x.gender,
            },
            {
              name: "Email",
              value: x.email,
            },
            {
              name: "Date of Birth",
              value: new Date(x.dob).toDateString(),
            },
            {
              name: "Age",
              value: x.age.toString(),
            },
            {
              name: "Phone",
              value: x.phone,
            },
          ])

          .setThumbnail(x.image);
      });
      // without options
      await new Pagination(message.channel, embeds, "page").paginate();
      // with option
      await new Pagination(message.channel, embeds, "page", 60000, [
        {
          style: "PRIMARY",
          label: "First",
          emoji: "⏮️",
        },
        {
          style: "PRIMARY",
          label: "Next",
          emoji: "◀️",
        },
        {
          style: "DANGER",
          label: "Stop",
          emoji: "⏹️",
        },
        {
          style: "PRIMARY",
          label: "Prev",
          emoji: "▶️",
        },
        {
          style: "PRIMARY",
          label: "Last",
          emoji: "⏭️",
        },
      ]).paginate();
    }
  }
}
module.exports = Bot;
