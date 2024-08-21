import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Command } from "../types/types";
import { registerAiExecution } from "../lib/commands/registerAiExecution";
import { registerCustomExecution } from "../lib/commands/registerCustomExecution";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register a file directly on Story.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("ai")
        .setDescription("Register an AI-generated image on Story.")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Give your image a name")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("prompt")
            .setDescription("Input a prompt for your image")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("custom")
        .setDescription("Register your own image on Story.")
        .addAttachmentOption((option) =>
          option
            .setName("file")
            .setDescription("Upload a file")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Give your image a name")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("description")
            .setDescription("Add a description to your file")
        )
    ) as SlashCommandBuilder,
  async execute(interaction: CommandInteraction) {
    await interaction.editReply({
      content: "This command is coming soon... Shhhh :)",
    });
    return;
    // @ts-ignore
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "ai") {
      await registerAiExecution(interaction);
    } else if (subcommand === "custom") {
      await registerCustomExecution(interaction);
    } else {
      await interaction.editReply({ content: "Invalid command!" });
    }
  },
};

export default command;
