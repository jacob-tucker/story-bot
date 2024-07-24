import { Collection, CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Address } from "viem";

declare module "discord.js" {
  export interface Client {
    commands: Collection<string, Command>;
  }
}

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void>;
}

export interface UserDiscordWallet {
  discord_id: string;
  wallet_address: Address;
  private_key: string;
}
