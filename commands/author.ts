import { ContextMenuCommandBuilder } from "@discordjs/builders";
import {
  ApplicationCommandType,
  ContextMenuCommandInteraction,
  EmbedBuilder,
  TextBasedChannel,
} from "discord.js";
import { storyLogo } from "../lib/utils/constants";
import { fetchDiscordImageHexString } from "../lib/functions/fetchDiscordImageHexString";
import { fetchImageFromHex } from "../lib/functions/fetchImageFromHex";
import { fetchDiscordUser } from "../lib/functions/fetchDiscordUser";

// Message Command
const command = {
  data: new ContextMenuCommandBuilder()
    .setName("Get Author")
    .setType(ApplicationCommandType.Message),
  async execute(interaction: ContextMenuCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    // Accessing the message that was right-clicked
    const channel = (await interaction.guild.channels.fetch(
      interaction.channelId
    )) as TextBasedChannel;
    const message = await channel.messages.fetch(interaction.targetId);

    // Checking if the message has attachments
    if (message.attachments.size > 0) {
      const attachment = message.attachments.first();
      const attachmentHex = await fetchDiscordImageHexString(attachment.url);
      const imageData = await fetchImageFromHex(attachmentHex);
      if (!imageData) {
        return await interaction.editReply(
          "This image is not registered on Story, so we do not know any attribution data."
        );
      }
      const imageAuthor = await fetchDiscordUser(imageData.user_discord_id);
      const embed = new EmbedBuilder()
        .setColor("#efebed") // Set the color of the embed
        .setAuthor({
          name: imageAuthor.username,
          iconURL: imageAuthor.avatarURL(),
        })
        .setTitle("Image data found!")
        .setDescription("View all of the image data below.")
        .addFields([
          { name: "IP ID", value: imageData.ip_id, inline: true },
          {
            name: "Explorer",
            value: `[View Data](https://explorer.storyprotocol.xyz/ipa/${imageData.ip_id})`,
            inline: true,
          },
        ])
        .setTimestamp()
        .setThumbnail(attachment.url)
        .setFooter({
          text: "Story Protocol",
          iconURL: storyLogo,
        });
      await interaction.editReply({
        embeds: [embed],
      });
    } else {
      await interaction.editReply("This message has no attachments.");
    }
  },
};

export default command;
