import { ContextMenuCommandBuilder } from "@discordjs/builders";
import {
  ApplicationCommandType,
  EmbedBuilder,
  MessageContextMenuCommandInteraction,
} from "discord.js";
import { storyLogo } from "../lib/utils/constants";
import { fetchDiscordUser } from "../lib/functions/fetchDiscordUser";
import { fetchUserDiscordWallet } from "../lib/functions/supabase/fetchUserDiscordWallet";
import { fetchDiscordImageArrayBuffer } from "../lib/functions/fetchDiscordImageArrayBuffer";
import { calculatePerceptualHash } from "../lib/functions/calculatePerceptualHash";
import { fetchImageFromPHash } from "../lib/functions/supabase/fetchImageFromPHash";
import { findMostSimilarPHash } from "../lib/functions/supabase/findMostSimilarPHash";

// Define the target ipId and role ID
const TARGET_IP_ID = "0x8940073726D1853aB4D0C13855aa82F021A2c180";
const ROLE_ID = "1265879282140577823"; // Replace with the actual role ID to assign

// Message Command
const command = {
  data: new ContextMenuCommandBuilder()
    .setName("View IP")
    .setType(ApplicationCommandType.Message),
  async execute(interaction: MessageContextMenuCommandInteraction) {
    const message = interaction.targetMessage;

    // Checking if the message has attachments
    if (message.attachments.size > 0) {
      const attachment = message.attachments.first();
      const arrayBuffer = await fetchDiscordImageArrayBuffer(attachment.url);
      const pHash = await calculatePerceptualHash(arrayBuffer);

      const imageData = await fetchImageFromPHash(pHash);
      if (!imageData) {
        return await interaction.editReply(
          "This image is not registered on Story, so we do not know any attribution data."
        );
      }
      const imageAuthor = await fetchDiscordUser(
        imageData.user_discord_id,
        interaction.guildId
      );
      const authorWallet = await fetchUserDiscordWallet(
        imageData.user_discord_id
      );
      if (!imageAuthor) {
        return await interaction.editReply(
          "Could not find details about the Discord creator."
        );
      }
      let fields = [
        {
          name: "Explorer",
          value: `[View Data](https://explorer.story.foundation/ipa/${imageData.ip_id})`,
          inline: true,
        },
        {
          name: "Creator Wallet",
          value: authorWallet.wallet_address,
          inline: true,
        },
      ];
      if (imageData.description) {
        fields.push({
          name: "Description",
          value: imageData.description,
          inline: true,
        });
      }
      const embed = new EmbedBuilder()
        .setColor("#efebed") // Set the color of the embed
        .setAuthor({
          name: imageAuthor.nickname || imageAuthor.displayName,
          iconURL: imageAuthor.displayAvatarURL(),
        })
        .setTitle("Image data found!")
        .setDescription(
          "This image is registered as IP on Story. View all of the IP metadata below."
        )
        .addFields(fields)
        .setTimestamp()
        .setThumbnail(attachment.url)
        .setFooter({
          text: "Story",
          iconURL: storyLogo,
        });
      await interaction.editReply({
        embeds: [embed],
      });

      // Check if the image's ipId matches the target and assign role
      if (imageData.ip_id === TARGET_IP_ID) {
        const member = await interaction.guild.members.fetch(
          interaction.user.id
        );
        if (!member.roles.cache.has(ROLE_ID)) {
          try {
            await member.roles.add(ROLE_ID);
            await interaction.followUp({
              content: `Congratulations! You found the secret <@&${ROLE_ID}> role. Well done ;)`,
              ephemeral: true,
            });
          } catch (e) {
            console.log(e);
          }
        }
      }
    } else {
      await interaction.editReply("This message has no attachments.");
    }
  },
};

export default command;
