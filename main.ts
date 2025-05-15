import { Collection, InteractionType } from "discord.js";
import express from "express";
import fs from "fs";
import dotenv from "dotenv";
import { client } from "./lib/bot";
import {
  handleSdkNotificationButton,
  handleProtocolNotificationButton,
  handleSurrealWorldAssetsButton,
} from "./lib/commands/notificationButtonsExecution";
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

  // Handle slash commands
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
  }

  // Handle button interactions
  if (interaction.isButton()) {
    const customId = interaction.customId;

    try {
      // Route to the appropriate button handler
      switch (customId) {
        case "sdk_notifications":
          await handleSdkNotificationButton(interaction);
          break;
        case "protocol_notifications":
          await handleProtocolNotificationButton(interaction);
          break;
        case "surreal_world_assets":
          await handleSurrealWorldAssetsButton(interaction);
          break;
        default:
          console.log(`Unknown button interaction: ${customId}`);
      }
    } catch (error) {
      console.error(`Error handling button ${customId}:`, error);
      if (!interaction.replied) {
        await interaction.reply({
          content: "There was an error processing your request.",
          ephemeral: true,
        });
      }
    }
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
