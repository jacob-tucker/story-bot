import { SlashCommandBuilder } from "@discordjs/builders";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../types/types";
import { storyLogo } from "../lib/utils/constants";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("notifications")
    .setDescription(
      "Configure your notification preferences for Story updates"
    ),

  async execute(interaction: CommandInteraction) {
    // Create the embed for notification settings
    const notificationEmbed = new EmbedBuilder()
      .setColor("#000000")
      .setTitle("Notification Settings")
      .setDescription(
        "Choose which notifications you'd like to receive from Story."
      )
      .addFields(
        {
          name: "🛠️ SDK Notifications",
          value:
            "Stay up to date with the latest SDK release notes, breaking changes, and updates.",
          inline: true,
        },
        {
          name: "⛓️ Protocol Notifications",
          value:
            "Stay up to date with the latest protocol release notes, breaking changes, and updates.",
          inline: true,
        },
        {
          name: "🏗️ Surreal World Assets",
          value:
            "Stay up to date with the current Surreal World assets buildathon.",
          inline: false,
        }
      )
      .setTimestamp()
      .setFooter({
        text: "Story",
        iconURL: storyLogo,
      });

    // Create the buttons
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("sdk_notifications")
        .setLabel("SDK Notifications")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("🛠️"),
      new ButtonBuilder()
        .setCustomId("protocol_notifications")
        .setLabel("Protocol Notifications")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("⛓️"),
      new ButtonBuilder()
        .setCustomId("surreal_world_assets")
        .setLabel("Surreal World Assets")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("🏗️")
    );

    // Send the embed with buttons
    await interaction.reply({
      embeds: [notificationEmbed],
      components: [row],
    });
  },
};

export default command;
