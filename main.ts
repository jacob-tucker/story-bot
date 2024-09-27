import { Collection } from "discord.js";
import express from "express";
import fs from "fs";
import dotenv from "dotenv";
import { client } from "./lib/bot";
import { remixExecution } from "./lib/commands/remixExecution";
import { modalStorage } from "./lib/database/storage";
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

const ROLE_ID = "1279408746141061142";
const TARGET_CHANNEL_ID = "1230926987263082618";

client.on("messageReactionAdd", async (reaction, user) => {
  // Ignore bot reactions
  if (user.bot) return;

  // Check if the reaction emoji matches the target emoji
  if (
    (reaction.emoji.name === "🔔" || reaction.emoji.name === "🔕") &&
    reaction.message.channelId === TARGET_CHANNEL_ID
  ) {
    const guild = reaction.message.guild; // Access the guild from the reaction message
    const member = await guild.members.fetch(user.id); // Fetch the member from the guild

    if (reaction.emoji.name === "🔔" && !member.roles.cache.has(ROLE_ID)) {
      return await member.roles.add(ROLE_ID).catch((e) => console.log(e));
    }
    if (reaction.emoji.name === "🔕" && member.roles.cache.has(ROLE_ID)) {
      return await member.roles.remove(ROLE_ID).catch((e) => console.log(e));
    }
  }

  if (
    reaction.emoji.id === "1275837340673380414" &&
    reaction.message.channelId === "1266597892077129801"
  ) {
    const guild = reaction.message.guild; // Access the guild from the reaction message
    const member = await guild.members.fetch(user.id); // Fetch the member from the guild
    return await member.roles
      .add("1265879282140577823")
      .catch((e) => console.log(e));
  }
});

// Add reactions to new messages in the target channel
client.on("messageCreate", async (message) => {
  if (message.channelId === TARGET_CHANNEL_ID) {
    try {
      await message.react("🔕");
      await message.react("🔔");
    } catch (error) {
      console.error("Failed to add reactions:", error);
    }
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
