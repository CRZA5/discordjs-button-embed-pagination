import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  DMChannel,
  EmbedBuilder,
  Message,
  TextChannel,
  UserResolvable,
} from "discord.js";
import { ButtonOption } from "./types/ButtonOption";

const availableEmojis = ["⏮️", "◀️", "⏹️", "▶️", "⏭️"];

class Pagination {
  private message?: Message;
  private readonly channel: TextChannel | DMChannel;
  private readonly pages: EmbedBuilder[];
  private index = 0;
  private readonly defaultOptions: ButtonOption[] = [
    {
      style: ButtonStyle.Primary,
      label: "First",
      emoji: "⏮️",
    },
    {
      style: ButtonStyle.Primary,
      label: "Prev",
      emoji: "◀️",
    },
    {
      style: ButtonStyle.Danger,
      label: "Stop",
      emoji: "⏹️",
    },
    {
      style: ButtonStyle.Primary,
      label: "Next",
      emoji: "▶️",
    },
    {
      style: ButtonStyle.Primary,
      label: "Last",
      emoji: "⏭️",
    },
  ];

  /**
   *
   * @param {TextChannel | DMChannel} channel - The target channel
   * @param {EmbedBuilder[]} pages - Embed pages
   * @param {string} [footerText] - Optional footer text, will show `Text 1 of 5` if you pass `Text`, for example
   * @param {number} timeout - How long button need to be active
   * @param {ButtonOption[]} options - optional options for the buttons
   * @param {UserResolvable} Author - To limit the pagination to a specific author
   * @param {AttachmentBuilder[]} files - Optional files to attach
   */
  constructor(
    channel: TextChannel | DMChannel,
    pages: EmbedBuilder[],
    private readonly footerText = "Page",
    private readonly timeout?: number,
    private readonly options?: ButtonOption[],
    private readonly Author?: UserResolvable,
    private readonly files?: AttachmentBuilder[]
  ) {
    if (options && options.length > 5) {
      throw new TypeError("You have passed more than 5 buttons as options");
    } else if (options && options.length < 4) {
      throw new TypeError("You have passed less than 5 buttons as options");
    }
    this.channel = channel;
    if (files) {
      this.files = files;
    }

    this.pages = pages.map((page, pageIndex) => {
      if (
        page.data.footer &&
        (page.data.footer.text || page.data.footer.icon_url)
      )
        return page;
      return page.setFooter({
        text: `${footerText} ${pageIndex + 1} of ${pages.length}`,
      });
    });
  }

  /**
   * Starts the pagination
   */
  async paginate(): Promise<void> {
    const options = this.options || this.defaultOptions;
    this.message = await this.channel.send({
      embeds: [this.pages[this.index]],
      ...(this.files && { files: [this.files[this.index]] }),
      components: [
        new ActionRowBuilder<ButtonBuilder>({
          components: options.map((x, i) => {
            return new ButtonBuilder({
              emoji: x.emoji,
              style: x.style,
              type: 2,
              label: x.label,
              customId: availableEmojis[i],
            });
          }),
        }),
      ],
    });
    if (this.pages.length < 2) {
      return;
    }
    const author = this.Author
      ? this.channel.client.users.resolve(this.Author)
      : undefined;
    const interactionCollector = this.message?.createMessageComponentCollector({
      max: this.pages.length * 5,
      filter: (x) => {
        return !(author && x.user.id !== author.id);
      },
    });
    setTimeout(
      async () => {
        interactionCollector?.stop("Timeout");
        await this?.message?.edit({
          components: [],
        });
      },
      this.timeout ? this.timeout : 60000
    );
    interactionCollector?.on("collect", async (interaction) => {
      const { customId } = interaction;
      let newIndex =
        customId === availableEmojis[0]
          ? 0 // Start
          : customId === availableEmojis[1]
          ? this.index - 1 // Prev
          : customId === availableEmojis[2]
          ? NaN // Stop
          : customId === availableEmojis[3]
          ? this.index + 1 // Next
          : customId === availableEmojis[4]
          ? this.pages.length - 1 // End
          : this.index;
      if (isNaN(newIndex)) {
        // Stop
        interactionCollector.stop("stopped by user");
        await interaction.update({
          components: [],
        });
      } else {
        if (newIndex < 0) newIndex = 0;
        if (newIndex >= this.pages.length) newIndex = this.pages.length - 1;
        this.index = newIndex;
        await interaction.update({
          embeds: [this.pages[this.index]],
          ...(this.files && { files: [this.files[this.index]] }),
        });
      }
    });
    interactionCollector?.on("end", async () => {
      await this?.message?.edit({
        components: [],
      });
    });
  }
}

export { ButtonOption, Pagination };
