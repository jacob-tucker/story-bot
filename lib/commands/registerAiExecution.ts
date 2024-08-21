import { CommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { arrayBufferToHex } from "../functions/arrayBufferToHex";
import { storyExplorer, storyLogo } from "../utils/constants";
import { fetchUserDiscordWallet } from "../functions/supabase/fetchUserDiscordWallet";
import { ethers } from "ethers";
import { Address } from "viem";
import { saveUserDiscordWallet } from "../functions/supabase/saveUserDiscordWallet";
import { uploadAndMintAndRegister } from "../functions/story/uploadAndMintAndRegister";
import { saveIpToDb } from "../functions/saveIpToDb";
import { generateImage } from "../functions/stability/generateImage";
import { uploadImageToSupabase } from "../functions/supabase/uploadImageToSupabase";
import { convertStringToFileName } from "../functions/convertStringToFileName";
import { getImagePublicUrl } from "../functions/supabase/getImagePublicUrl";
import { fileExistsInBucket } from "../functions/supabase/fileExistsInBucket";
import { calculatePerceptualHash } from "../functions/calculatePerceptualHash";

export async function registerAiExecution(interaction: CommandInteraction) {
  const prompt = interaction.options.get("prompt").value as string;
  const name = interaction.options.get("name").value as string;

  await interaction.editReply({
    content: `Generating your image using Stability AI. Please wait ~20 seconds...`,
  });

  const fileExists = await fileExistsInBucket(
    "ai_generated_images",
    interaction.user.id,
    convertStringToFileName(name)
  );

  if (fileExists) {
    return await interaction.editReply({
      content: `You have already generated an image using the name '${name}'. Please use a different name!`,
    });
  }

  const imageBlob = await generateImage(prompt);
  if (!imageBlob) {
    return await interaction.editReply({
      content: `There was an error generating your image. Please contract the Story team for further help.`,
    });
  }

  const { data, errorMessage } = await uploadImageToSupabase(
    "ai_generated_images",
    interaction.user.id,
    convertStringToFileName(name),
    imageBlob
  );
  if (errorMessage) {
    return await interaction.editReply({
      content: `There was an error generating & storing your image: "${errorMessage}". Please contact the Story team for further help.`,
    });
  }

  const arrayBuffer = await imageBlob.arrayBuffer();
  const hashHex = await arrayBufferToHex(arrayBuffer);
  const pHash = await calculatePerceptualHash(arrayBuffer);

  //   const imageIPFSHash = await uploadFileToIPFS(imageBlob);
  const imageUrl = getImagePublicUrl(
    "ai_generated_images",
    interaction.user.id,
    convertStringToFileName(name)
  );
  if (!imageUrl) {
    return await interaction.editReply({
      content: `There was an error generating & storing your image. Please contact the Story team.`,
    });
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
      imageUrl,
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

    await saveIpToDb({
      userDiscordId: interaction.user.id,
      hash: hashHex,
      pHash,
      ipId,
      name,
      description: prompt,
      createdWithAi: true,
    });
    let fields: { name: string; value: string; inline: boolean }[] = [
      { name: "IP ID", value: ipId, inline: true },
    ];
    if (prompt) {
      fields.push({
        name: "Prompt",
        value: prompt,
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
      .setURL(`${storyExplorer}/ipa/${ipId}`)
      .setDescription("Your file has been successfully registered on Story.")
      .addFields(fields)
      .setTimestamp()
      .setThumbnail(imageUrl)
      .setFooter({
        text: "Story",
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
