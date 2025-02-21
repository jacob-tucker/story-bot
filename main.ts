import { Collection, EmbedBuilder } from "discord.js";
import express from "express";
import fs from "fs";
import dotenv from "dotenv";
import { client } from "./lib/bot";
import { remixExecution } from "./lib/commands/remixExecution";
import { modalStorage } from "./lib/database/storage";
import { DEVELOPERS_ROLE_ID } from "./lib/utils/constants";
import {
  DEVELOPER_ANNOUNCEMENTS_CHANNEL_ID,
  DEVELOPER_CHAT_CHANNEL_ID,
} from "./lib/utils/constants";
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

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

  // send a message every 12 hours in the developer chat
  setInterval(async () => {
    const channel = client.channels.cache.get(DEVELOPER_CHAT_CHANNEL_ID);
    if (channel && channel.isTextBased()) {
      try {
        const embed = new EmbedBuilder()
          .setTitle("Scheduled Message")
          .setDescription(
            `This channel is for developer discussion ONLY. Any non-dev talk will result in a temporary mute in this Discord.\nIf you'd like to chat in this channel, go to the <#${DEVELOPER_ANNOUNCEMENTS_CHANNEL_ID}> channel and receive the <@&${DEVELOPERS_ROLE_ID}> role.`
          )
          .setColor("#efebed")
          .addFields([
            {
              name: "Documentation",
              value: `[Go to Docs](https://docs.story.foundation)`,
              inline: true,
            },
            {
              name: "Block Explorer",
              value: `[Go to Explorer](https://explorer.story.foundation)`,
              inline: true,
            },
          ]);
        await channel.send({ embeds: [embed] });
      } catch (error) {
        console.error("Failed to send scheduled message:", error);
      }
    }
  }, 48 * 60 * 60 * 1000);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction) return;
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
      });
    }
  } else if (interaction.isModalSubmit()) {
    if (interaction.customId === "remixModal") {
      const name = interaction.fields.getTextInputValue("name");
      const prompt = interaction.fields.getTextInputValue("prompt");
      const strengthInput = interaction.fields.getTextInputValue("strength");
      const strength = parseInt(strengthInput, 10);
      // Validate that the strength is a number and within the range [0, 100]
      if (isNaN(strength) || strength < 0 || strength > 100) {
        await interaction.reply({
          content:
            "Invalid strength value. Please enter a number between 0 and 100.",
        });
        return;
      }

      // Retrieve the stored attachment URL
      const attachmentUrl = modalStorage.get(interaction.user.id);

      if (!attachmentUrl) {
        await interaction.reply({
          content: "Failed to retrieve image data. Please try again.",
        });
        return;
      }

      await remixExecution(
        interaction,
        attachmentUrl,
        name,
        prompt,
        strength / 100
      );

      // Clean up storage
      modalStorage.delete(interaction.user.id);
    }
  }
});

client.on("messageReactionAdd", async (reaction, user) => {
  // Ignore bot reactions
  if (user.bot) return;

  // Check if the reaction emoji matches the target emoji
  if (
    (reaction.emoji.name === "🔔" || reaction.emoji.name === "🔕") &&
    reaction.message.channelId === DEVELOPER_ANNOUNCEMENTS_CHANNEL_ID
  ) {
    const guild = reaction.message.guild; // Access the guild from the reaction message
    const member = await guild.members.fetch(user.id); // Fetch the member from the guild

    if (
      reaction.emoji.name === "🔔" &&
      !member.roles.cache.has(DEVELOPERS_ROLE_ID)
    ) {
      return await member.roles
        .add(DEVELOPERS_ROLE_ID)
        .catch((e) => console.log(e));
    }
    if (
      reaction.emoji.name === "🔕" &&
      member.roles.cache.has(DEVELOPERS_ROLE_ID)
    ) {
      return await member.roles
        .remove(DEVELOPERS_ROLE_ID)
        .catch((e) => console.log(e));
    }
  }

  // uno reverse card
  // if (
  //   reaction.emoji.id === "1275837340673380414" &&
  //   reaction.message.channelId === "1134233250236211271"
  // ) {
  //   const guild = reaction.message.guild; // Access the guild from the reaction message
  //   const member = await guild.members.fetch(user.id); // Fetch the member from the guild
  //   return await member.roles
  //     .add("1265879282140577823")
  //     .catch((e) => console.log(e));
  // }
});

// Add reactions to new messages in the target channel
client.on("messageCreate", async (message) => {
  if (message.channelId === DEVELOPER_ANNOUNCEMENTS_CHANNEL_ID) {
    try {
      await message.react("🔕");
      await message.react("🔔");
    } catch (error) {
      console.error("Failed to add reactions:", error);
    }
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
