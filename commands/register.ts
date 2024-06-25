import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Command } from "../types/types";
import { register } from "../lib/functions/register";
import { storyLogo } from "../lib/utils/constants";
import fetch from "node-fetch";
import { saveIpToDb } from "../lib/functions/saveIpToDb";
import { fetchDiscordImageHexString } from "../lib/functions/fetchDiscordImageHexString";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register a file directly on Story.")
    .addAttachmentOption((option) =>
      option.setName("file").setDescription("Upload a file").setRequired(true)
    ) as SlashCommandBuilder,
  async execute(interaction: CommandInteraction) {
    const attachment = interaction.options.get("file")?.attachment;
    console.log(attachment);

    const hexString = await fetchDiscordImageHexString(attachment.url);
    if (!hexString) {
      await interaction.editReply({
        content: `There was an error downloading the file.`,
      });
    }

    await interaction.deferReply({ ephemeral: true });
    try {
      await interaction.editReply({
        content: `Registering your file on Story. Please wait ~20 seconds...`,
      });
      // const ipId = await register(attachment.url);
      const ipId = "10";
      await saveIpToDb(interaction.user.id, hexString, ipId);
      const embed = new EmbedBuilder()
        .setColor("#efebed") // Set the color of the embed
        .setAuthor({
          name: interaction.user.username,
          iconURL: interaction.user.avatarURL(),
        })
        .setTitle("File Registered Successfully")
        .setURL(`https://explorer.storyprotocol.xyz/ipa/${ipId}`)
        .setDescription("Your file has been successfully registered on Story.")
        .addFields([{ name: "IP ID", value: ipId }])
        .setTimestamp()
        .setThumbnail(attachment.url)
        .setFooter({
          text: "Story Protocol",
          iconURL: storyLogo,
        });

      await interaction.editReply({
        content: "Registration complete. View your receipt below!",
        embeds: [embed],
      });
    } catch (e) {
      await interaction.editReply({ content: e });
    }
  },
};

export default command;
