import { CommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { fetchDiscordImageArrayBuffer } from "../functions/fetchDiscordImageArrayBuffer";
import { arrayBufferToHex } from "../functions/arrayBufferToHex";
import { fetchDiscordUser } from "../functions/fetchDiscordUser";
import { storyLogo } from "../utils/constants";
import { fetchUserDiscordWallet } from "../functions/supabase/fetchUserDiscordWallet";
import { ethers } from "ethers";
import { Address } from "viem";
import { saveUserDiscordWallet } from "../functions/supabase/saveUserDiscordWallet";
import { uploadAndMintAndRegister } from "../functions/uploadAndMintAndRegister";
import { saveIpToDb } from "../functions/saveIpToDb";
import { calculatePerceptualHash } from "../functions/calculatePerceptualHash";
import { fetchImageFromPHash } from "../functions/supabase/fetchImageFromPHash";

export async function registerCustom(interaction: CommandInteraction) {
  const attachment = interaction.options.get("file")?.attachment;
  const name = interaction.options.get("name").value as string;

  const arrayBuffer = await fetchDiscordImageArrayBuffer(attachment.url);
  if (!arrayBuffer) {
    await interaction.editReply({
      content: `There was an error downloading the file.`,
    });
  }

  const hashHex = await arrayBufferToHex(arrayBuffer);
  const pHash = await calculatePerceptualHash(arrayBuffer);

  // check if this was already registered
  const imageFromPHash = await fetchImageFromPHash(pHash);
  if (imageFromPHash) {
    let fields: { name: string; value: string; inline: boolean }[] = [
      { name: "IP ID", value: imageFromPHash.ip_id, inline: true },
    ];
    if (imageFromPHash.description) {
      fields.push({
        name: "Description",
        value: imageFromPHash.description,
        inline: true,
      });
    }
    const imageAuthor = await fetchDiscordUser(
      imageFromPHash.user_discord_id,
      interaction.guildId
    );
    const embed = new EmbedBuilder()
      .setColor("#FF0000") // Set the color of the embed
      .setAuthor({
        name: imageAuthor.nickname || imageAuthor.displayName,
        iconURL: imageAuthor.displayAvatarURL(),
      })
      .setTitle("File Already Registered!")
      .setURL(`https://explorer.storyprotocol.xyz/ipa/${imageFromPHash.ip_id}`)
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
      hash: hashHex,
      pHash,
      ipId,
      name,
      description,
      createdWithAi: false,
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
}
