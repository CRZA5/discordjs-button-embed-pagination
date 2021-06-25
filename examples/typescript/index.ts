import {
  Client,
  Intents,
  Message,
  MessageEmbed,
  TextChannel,
} from "discord.js";
import { Pagination } from "discordjs-button-embed-pagination";
import data from "../data.json";
export class Bot extends Client {
  constructor() {
    super({
      intents: Intents.NON_PRIVILEGED,
    });
    this.on("ready", this.onReady);
    this.on("message", this.onMessage);
    this.login(process.env.TOKEN);
  }
  private async onReady() {
    console.log(`Ready with ${this.guilds.cache.size} guilds.`);
  }
  private async onMessage(message: Message) {
    if (message.content == "paginate") {
      // fill embed here
      const embeds = data.map((x) => {
        const embed = new MessageEmbed()
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
        return embed;
      });
      new Pagination(message.channel as TextChannel, embeds, "page").paginate();
    }
  }
}
