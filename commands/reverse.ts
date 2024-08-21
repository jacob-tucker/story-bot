import { SlashCommandBuilder } from "@discordjs/builders";
import { AttachmentBuilder, CommandInteraction } from "discord.js";
import { Command } from "../types/types";
import * as path from "path";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("reverse")
    .setDescription("JZ Uno Reverse."),
  async execute(interaction: CommandInteraction) {
    await interaction.reply({
      content: "You don't have to type this anymore :)",
      ephemeral: true,
    });
    return;
    await interaction.deferReply({ ephemeral: false });
    const filePath = path.join(__dirname, "..", "static", "jz-reverse.png");
    const attachment = new AttachmentBuilder(filePath);

    // Send the image along with an optional description
    await interaction.editReply({ files: [attachment] });
  },
};

export default command;
