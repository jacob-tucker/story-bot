import {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  MessageContextMenuCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
} from "discord.js";
import { modalStorage } from "../lib/database/storage";
import { fetchDiscordImageArrayBuffer } from "../lib/functions/fetchDiscordImageArrayBuffer";
import { fetchImageFromPHash } from "../lib/functions/supabase/fetchImageFromPHash";
import { calculatePerceptualHash } from "../lib/functions/calculatePerceptualHash";

const command = {
  data: new ContextMenuCommandBuilder()
    .setName("Remix Image")
    .setType(ApplicationCommandType.Message),

  async execute(interaction: MessageContextMenuCommandInteraction) {
    await interaction.editReply({
      content: "This command is coming soon... Shhhh :)",
    });
    return;
    const message = interaction.targetMessage;

    if (!message.attachments.size) {
      await interaction.editReply({
        content: "This message has no attachments.",
      });
      return;
    }

    const attachment = message.attachments.first(); // Get the first attachment (assuming it's an image)
    if (!attachment || !attachment.contentType?.startsWith("image/")) {
      await interaction.editReply({
        content: "The selected message does not contain an image.",
      });
      return;
    }
    const attachmentArrayBuffer = await fetchDiscordImageArrayBuffer(
      attachment.url
    );
    const attachmentPHash = await calculatePerceptualHash(
      attachmentArrayBuffer
    );
    const imageData = await fetchImageFromPHash(attachmentPHash);
    if (!imageData) {
      await interaction.editReply({
        content:
          "The original image is not registered on Story, so it cannot be remixed.",
      });
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId("remixModal")
      .setTitle("Remix Image")
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("name")
            .setLabel("Image Name")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("prompt")
            .setLabel("Image Prompt")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("strength")
            .setLabel("Strength [0 - 100]")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("83")
            .setRequired(true)
        )
      );

    await interaction.showModal(modal);

    // Store the attachment URL in some way to use it later in the modal submission handler
    modalStorage.set(interaction.user.id, attachment.url);
  },
};

export default command;
