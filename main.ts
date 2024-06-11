require("dotenv").config();
import path from "path";
import fs from "fs";
import {
  ApplicationCommandType,
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import express from "express";

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
});

client.once("ready", () => {
  console.log("Story bot is online!");
});

const TARGET_EMOJI_ID = "1210162862824095744"; // Replace with the emoji you want to listen for

client.on("messageReactionAdd", async (reaction, user) => {
  // Ignore bot reactions
  // if (user.bot) return;
  console.log(reaction);

  // Check if the reaction emoji matches the target emoji
  if (reaction.emoji.id === TARGET_EMOJI_ID) {
    // Fetch the message if it wasn't cached
    if (reaction.message.partial) await reaction.message.fetch();

    // Check if the message has an attachment
    if (reaction.message.attachments.size > 0) {
      reaction.message.attachments.forEach((attachment) => {
        console.log(
          `User ${user.tag} reacted to a message with image URL: ${attachment.proxyURL}`
        );
        // You can also send a message or take other actions here
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
