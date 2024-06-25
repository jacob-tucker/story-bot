import {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  CommandInteraction,
} from "discord.js";
import express from "express";
import { register } from "./lib/functions/register";
import fs from "fs";
import dotenv from "dotenv";
import { Command } from "./types/types";
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

const client = new Client({
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

client.commands = new Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".ts"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`).default;
  client.commands.set(command.data.name, command);
}

client.once("ready", () => {
  console.log("Story bot is online!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

const TARGET_EMOJI_ID = "1210162862824095744"; // Replace with the emoji you want to listen for

client.on("messageReactionAdd", async (reaction, user) => {
  // Ignore bot reactions
  if (user.bot) return;

  // Check if the reaction emoji matches the target emoji
  if (reaction.emoji.id === TARGET_EMOJI_ID) {
    // Fetch the message if it wasn't cached
    if (reaction.message.partial) await reaction.message.fetch();

    // Check if the message has an attachment
    if (reaction.message.attachments.size > 0) {
      reaction.message.attachments.forEach(async (attachment) => {
        console.log(
          `User ${user.tag} reacted to a message with image URL: ${attachment.url}`
        );
        const ipId = await register(attachment.url);
        reaction.message.channel.send(
          `The image has been registered on Story: https://explorer.storyprotocol.xyz/ipa/${ipId}`
        );
      });
    } else {
      console.log(
        `User ${user.tag} reacted to the message has no attachments.`
      );
    }
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));

// This is the bot's token
// Must be at the bottom of the file
client.login(process.env.TOKEN);
