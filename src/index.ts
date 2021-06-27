import {DMChannel, Message, MessageButton, MessageEmbed, TextChannel,} from "discord.js";
import {ButtonOption} from "./types/ButtonOption";

const availableEmojis = ["⏮️", "◀️", "⏹️", "▶️", "⏭️"];

class Pagination {
    private message?: Message;
    private readonly channel: TextChannel | DMChannel;
    private readonly pages: MessageEmbed[];
    private index = 0;

    /**
     *
     * @param {TextChannel | DMChannel} channel - The target channel
     * @param {MessageEmbed[]} pages - Embed pages
     * @param {string} [footerText] - Optional footer text, will show `Text 1 of 5` if you pass `Text`, for example
     * @param {number} timeout - How long button need to be active
     * @param {ButtonOption[]} options - optional options for the buttons
     */
    constructor(
        channel: TextChannel | DMChannel,
        pages: MessageEmbed[],
        private readonly footerText = "Page",
        private readonly timeout?: number,
        private readonly options ?: ButtonOption[]
    ) {
        if (options && options.length > 5) {
            throw new TypeError("You have passed more than 5 buttons as options")
        } else if (options && options.length < 4) {
            throw new TypeError("You have passed less than 5 buttons as options")
        }
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
                    components: this.options ? this.options.map((x, i) => {
                        return new MessageButton(
                            {
                                emoji: x.emoji,
                                style: x.style,
                                type: 2,
                                label: x.label,
                                customID: availableEmojis[i]
                            }
                        )
                    }) : [
                        {
                            type: 2,
                            style: "PRIMARY",
                            label: "First",
                            emoji: "⏮️",
                            customID: "⏮️"
                        }, {
                            type: 2,

                            style: "PRIMARY",
                            label: "Next",
                            emoji: "◀️",
                            customID: "◀️"

                        }, {
                            type: 2,
                            style: "DANGER",
                            label: "Stop",
                            emoji: "⏹️",
                            customID: "⏹️"

                        }, {
                            type: 2,
                            style: "PRIMARY",
                            label: "Prev",
                            emoji: "▶️",
                            customID: "▶️"
                        }, {
                            type: 2,
                            style: "PRIMARY",
                            label: "Last",
                            emoji: "⏭️",
                            customID: "⏭️"
                        },

                    ]
                },
            ],
        });
        if (this.pages.length < 2) {
            return;
        }
        const interactionCollector =
            this.message.createMessageComponentInteractionCollector(
                {
                    max: this.pages.length * 5,
                }
            );
        setTimeout(async () => {
            interactionCollector?.stop("Timeout");
            await this?.message?.edit({
                components: [],
            });
        }, this.timeout ? this.timeout : 60000)
        interactionCollector.on("collect", async (interaction) => {
            const {customID} = interaction;
            switch (customID) {
                case availableEmojis[0]:
                    // Start
                    if (this.index !== 0) {
                        this.index = 0;
                        await interaction.update({
                            embeds: [this.pages[this.index]],
                        });
                    }
                    break;
                case availableEmojis[1]:
                    // Prev
                    this.index--;
                    if (this.index <= 0) this.index = this.pages.length - 1;
                    await interaction.update({
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
                    await interaction.update({
                        embeds: [this.pages[this.index]],
                    });
                    break;
                case availableEmojis[4]:
                    // End
                    if (this.index !== this.pages.length - 1) {
                        this.index = this.pages.length - 1;
                        await interaction.update({
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

export {
    ButtonOption,
    Pagination
}