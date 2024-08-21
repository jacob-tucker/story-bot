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

const TARGET_EMOJI_ID = "1275837340673380414"; // Replace with the emoji you want to listen for
const TARGET_MESSAGE_ID = "1275786846160293899";
const ROLE_ID = "1265879282140577823";
const TARGET_CHANNEL_ID = "1266597892077129801";

client.on("messageReactionAdd", async (reaction, user) => {
  // Ignore bot reactions
  if (user.bot) return;

  // Check if the reaction emoji matches the target emoji
  if (
    reaction.emoji.id === TARGET_EMOJI_ID &&
    reaction.message.id === TARGET_MESSAGE_ID
  ) {
    const guild = reaction.message.guild; // Access the guild from the reaction message
    const member = await guild.members.fetch(user.id); // Fetch the member from the guild
    if (!member.roles.cache.has(ROLE_ID)) {
      try {
        await member.roles.add(ROLE_ID);
        // Optional: Send a DM to the user or a follow-up message in the channel if needed
        // const targetChannel = guild.channels.cache.get(TARGET_CHANNEL_ID);
        // if (targetChannel && targetChannel.isTextBased()) {
        //   await targetChannel.send({
        //     content: `Congratulations <@${user.id}>! You found the secret <@&${ROLE_ID}> role. Well done ;)`,
        //   });
        // } else {
        //   console.log(`Channel with ID ${TARGET_CHANNEL_ID} not found`);
        // }
      } catch (e) {
        console.log(e);
      }
    }
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
