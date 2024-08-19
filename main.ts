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
  if (interaction.isCommand()) {
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
          ephemeral: true,
        });
        return;
      }

      // Retrieve the stored attachment URL
      const attachmentUrl = modalStorage.get(interaction.user.id);

      if (!attachmentUrl) {
        await interaction.reply({
          content: "Failed to retrieve image data. Please try again.",
          ephemeral: true,
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

const TARGET_EMOJI_ID = "1210162862824095744"; // Replace with the emoji you want to listen for

// client.on("messageReactionAdd", async (reaction, user) => {
//   // Ignore bot reactions
//   if (user.bot) return;

//   // Check if the reaction emoji matches the target emoji
//   if (reaction.emoji.id === TARGET_EMOJI_ID) {
//     // Fetch the message if it wasn't cached
//     if (reaction.message.partial) await reaction.message.fetch();

//     // Check if the message has an attachment
//     if (reaction.message.attachments.size > 0) {
//       reaction.message.attachments.forEach(async (attachment) => {
//         console.log(
//           `User ${user.tag} reacted to a message with image URL: ${attachment.url}`
//         );
//         const ipId = await register(attachment.url);
//         reaction.message.channel.send(
//           `The image has been registered on Story: https://explorer.story.foundation/ipa/${ipId}`
//         );
//       });
//     } else {
//       console.log(
//         `User ${user.tag} reacted to the message has no attachments.`
//       );
//     }
//   }
// });

app.listen(port, () => console.log(`Listening on port ${port}`));
