import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import { Command } from "../types/types";
import dotenv from "dotenv";
dotenv.config();

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
    Partials.Message,
    Partials.Reaction,
    Partials.User,
    Partials.ThreadMember,
  ],
}) as Client & { commands: Collection<string, Command> };

// This is the bot's token
// Must be at the bottom of the file
client.login(process.env.TOKEN);
