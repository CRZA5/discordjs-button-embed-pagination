import {
  MessageEmbed,
  TextChannel,
  DMChannel,
  Message,
  MessageButton,
  MessageComponentInteraction,
} from "discord.js";
const availableEmojis = ["⏮️", "◀️", "⏹️", "▶️", "⏭️"];
export class Pagination {
  private message?: Message;
  private readonly channel: TextChannel | DMChannel;
  private readonly pages: MessageEmbed[];
  private index = 0;

  /**
   *
   * @param {TextChannel | DMChannel} channel - The target channel
   * @param {MessageEmbed[]} pages - Embed pages
   * @param {string} [footerText] - Optional footer text, will show `Text 1 of 5` if you pass `Text`, for example
   */
  constructor(
    channel: TextChannel | DMChannel,
    pages: MessageEmbed[],
    private readonly footerText = "Page"
  ) {
    this.channel = channel;
    this.pages = pages.map((page, pageIndex) => {
      if (page.footer && (page.footer.text || page.footer.iconURL)) return page;
      return page.setFooter(
        `${footerText} ${pageIndex + 1} of ${pages.length}`
      );
    });
  }

  /**
   * Starts the pagination
   */
  async paginate(): Promise<void> {
    this.message = await this.channel.send({
      embeds: [this.pages[this.index]],
      components: [
        {
          type: 1,
          components: availableEmojis.map((x) => {
            return new MessageButton({
              emoji: x,
              style: 1,
              type: 2,
              customID: x,
            });
          }),
        },
      ],
    });
    if (this.pages.length < 2) {
      return;
    }
    const interactionCollector =
      this.message.createMessageComponentInteractionCollector(
        (_interaction: MessageComponentInteraction) => {
          return true;
        },
        {
          time: 60000,
          max: this.pages.length * 5,
        }
      );
    interactionCollector.on("collect", async (interaction) => {
      const { customID } = interaction;
      switch (customID) {
        case availableEmojis[0]:
          // Start
          if (this.index !== 0) {
            this.index = 0;
            interaction.update({
              embeds: [this.pages[this.index]],
            });
          }
          break;
        case availableEmojis[1]:
          // Prev
          this.index--;
          if (this.index <= 0) this.index = this.pages.length - 1;
          interaction.update({
            embeds: [this.pages[this.index]],
          });
          break;
        case availableEmojis[2]:
          // Stop
          interactionCollector.stop("stopped by user");
          await interaction.update({
            components: [],
          });
          break;
        case availableEmojis[3]:
          // Next
          this.index++;
          if (this.index >= this.pages.length) {
            this.index = 0;
          }
          interaction.update({
            embeds: [this.pages[this.index]],
          });
          break;
        case availableEmojis[4]:
          // End
          if (this.index !== this.pages.length - 1) {
            this.index = this.pages.length - 1;
            interaction.update({
              embeds: [this.pages[this.index]],
            });
          }
          break;
      }
    });
    interactionCollector.on("end", async () => {
      await this?.message?.edit({
        components: [],
      });
    });
  }
}
