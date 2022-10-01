import { ComponentEmojiResolvable, ButtonStyle } from "discord.js";

export interface ButtonOption {
  emoji?: ComponentEmojiResolvable;
  label?: string;
  style: Exclude<ButtonStyle, ButtonStyle.Link>;
}
