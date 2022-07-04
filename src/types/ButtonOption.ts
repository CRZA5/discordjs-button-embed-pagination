import {
  EmojiIdentifierResolvable,
  MessageButtonStyleResolvable,
} from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";

export interface ButtonOption {
  emoji?: EmojiIdentifierResolvable;
  label?: string;
  style: Exclude<
    MessageButtonStyleResolvable,
    "LINK" | MessageButtonStyles.LINK
  >;
}
