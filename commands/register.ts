import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { Command } from "../types/types";
import {
  ipAssetRegistryContractAddress,
  nftContractAddress,
  storyLogo,
} from "../lib/utils/constants";
import { saveIpToDb } from "../lib/functions/saveIpToDb";
import { fetchDiscordImageHexString } from "../lib/functions/fetchDiscordImageHexString";
import { ethers } from "ethers";
import { Account, Address, toHex, zeroAddress } from "viem";
import { AccessPermission } from "@story-protocol/core-sdk";
import { ipAssetRegistryAbi } from "../lib/utils/ipAssetRegistryAbi";
import { publicClient } from "../lib/utils/publicClient";
import { uploadJSONToIPFS } from "../lib/functions/pinata/uploadJSONToIPFS";
import { mintNFT } from "../lib/functions/mintNFT";
import { adminAccount, adminClient } from "../lib/utils/storyClient";
import { fetchUserDiscordWallet } from "../lib/functions/supabase/fetchUserDiscordWallet";
import { saveUserDiscordWallet } from "../lib/functions/supabase/saveUserDiscordWallet";
import { uploadAndMintAndRegister } from "../lib/functions/uploadAndMintAndRegister";
import { fetchImageFromHex } from "../lib/functions/supabase/fetchImageFromHex";
import { fetchDiscordUser } from "../lib/functions/fetchDiscordUser";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register a file directly on Story.")
    .addAttachmentOption((option) =>
      option.setName("file").setDescription("Upload a file").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Add a description to your file")
    ) as SlashCommandBuilder,
  async execute(interaction: CommandInteraction) {
    await interaction.editReply({
      content: "This command is coming soon... Shhhh :)",
    });
    return;
    const attachment = interaction.options.get("file")?.attachment;
    await interaction.deferReply({ ephemeral: true });

    const hexString = await fetchDiscordImageHexString(attachment.url);
    if (!hexString) {
      await interaction.editReply({
        content: `There was an error downloading the file.`,
      });
    }

    // check if this was already registered
    const imageFromHex = await fetchImageFromHex(hexString);
    if (imageFromHex) {
      let fields: { name: string; value: string; inline: boolean }[] = [
        { name: "IP ID", value: imageFromHex.ip_id, inline: true },
      ];
      if (imageFromHex.description) {
        fields.push({
          name: "Description",
          value: imageFromHex.description,
          inline: true,
        });
      }
      const imageAuthor = await fetchDiscordUser(
        imageFromHex.user_discord_id,
        interaction.guildId
      );
      const embed = new EmbedBuilder()
        .setColor("#FF0000") // Set the color of the embed
        .setAuthor({
          name: imageAuthor.nickname || imageAuthor.displayName,
          iconURL: imageAuthor.displayAvatarURL(),
        })
        .setTitle("File Already Registered!")
        .setURL(`https://explorer.storyprotocol.xyz/ipa/${imageFromHex.ip_id}`)
        .setDescription("Below are some details related to this IP.")
        .addFields(fields)
        .setTimestamp()
        .setThumbnail(attachment.url)
        .setFooter({
          text: "Story Protocol",
          iconURL: storyLogo,
        });

      await interaction.editReply({
        content:
          "Hey, this image is already registered! You cannot register someone else's image. If this was your image and someone stole it, let us know!",
        embeds: [embed],
      });
      return;
    }

    try {
      await interaction.editReply({
        content: `Registering your file on Story. Please wait ~20 seconds...`,
      });

      let userDiscordWallet = await fetchUserDiscordWallet(interaction.user.id);
      if (!userDiscordWallet) {
        // create wallet
        const randomWallet = ethers.Wallet.createRandom();
        userDiscordWallet = {
          wallet_address: randomWallet.address as Address,
          discord_id: interaction.user.id,
          private_key: randomWallet.privateKey,
        };
        await saveUserDiscordWallet(userDiscordWallet);
      }

      const ipId = await uploadAndMintAndRegister(
        attachment.url,
        userDiscordWallet.wallet_address
      );

      // set all permissions using signature (executeWithSig)
      // try {
      //   const setPermissionResponse =
      //     await adminClient.permission.createSetPermissionSignature({
      //       ipId,
      //       signer: adminAccount.address,
      //       to: zeroAddress,
      //       permission: AccessPermission.ALLOW,
      //       txOptions: {
      //         waitForTransaction: true,
      //       },
      //     });

      //   console.log({ setPermissionResponse });
      // } catch (e) {
      //   console.log(e);
      // }

      const description = interaction.options.get("description")?.value as
        | string
        | undefined;
      await saveIpToDb({
        userDiscordId: interaction.user.id,
        imageHex: hexString,
        ipId,
        description,
      });
      let fields: { name: string; value: string; inline: boolean }[] = [
        { name: "IP ID", value: ipId, inline: true },
      ];
      if (description) {
        fields.push({
          name: "Description",
          value: description,
          inline: true,
        });
      }
      const member = interaction.member as GuildMember;
      const embed = new EmbedBuilder()
        .setColor("#efebed") // Set the color of the embed
        .setAuthor({
          name: member.nickname || member.displayName,
          iconURL: member.displayAvatarURL(),
        })
        .setTitle("File Registered Successfully")
        .setURL(`https://explorer.storyprotocol.xyz/ipa/${ipId}`)
        .setDescription("Your file has been successfully registered on Story.")
        .addFields(fields)
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
