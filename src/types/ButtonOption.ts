import {EmojiIdentifierResolvable, MessageButtonStyleResolvable} from "discord.js";

export interface ButtonOption {
    emoji?: EmojiIdentifierResolvable;
    label?: string;
    style: MessageButtonStyleResolvable;
}