import { SlashCommandBuilder } from "@discordjs/builders";
import {
  AttachmentBuilder,
  CommandInteraction,
  TextBasedChannel,
} from "discord.js";
import { Command } from "../types/types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("reverse")
    .setDescription("JZ Uno Reverse."),
  async execute(interaction: CommandInteraction) {
    const channel = (await interaction.guild.channels.fetch(
      interaction.channelId
    )) as TextBasedChannel;

    const attachment = new AttachmentBuilder(
      "https://cdn.discordapp.com/attachments/918037680934256643/1265884370971918419/jz-reverse-disc.png?ex=66a32231&is=66a1d0b1&hm=2ff50a868ddd622be8b77b72253f0fa4ffff71069ad8def34ab7c72a0b41c0f4&"
    );

    // Send the image along with an optional description
    await channel.send({ files: [attachment] });
  },
};

export default command;
