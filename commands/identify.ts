import ExifParser from 'exif-parser';
import { supabaseClient } from '../lib/database/supabaseClient';
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { storyProtocolLogo } from '../lib/utils/logos';
import path from 'path';
import * as fs from 'fs';

async function getArtcastImage(imagePath: string) {
    const { data, error } = await supabaseClient
        .storage
        .from('artcast_images')
        .download(imagePath)

    console.log(data);
    return data;
};

async function blobToBuffer(blob: Blob) {
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

const execute = async (interaction, imageUrl: string) => {
    await interaction.deferReply({ ephemeral: true });

    const response = await fetch(imageUrl);
    // const image = await getArtcastImage(imageUrl);
    const imageBlob = await response.blob();
    let buffer = await blobToBuffer(imageBlob);

    // const imagePath = path.join(__dirname, '..', 'static', '696.jpeg'); // Replace 'image.jpg' with the actual filename
    // const buffer = fs.readFileSync(imagePath);

    let parser = ExifParser.create(buffer);
    let result = parser.parse();
    console.log(result)
    let imageDescription = result.tags.ImageDescription;

    console.log({ imageDescription })

    const embed = new EmbedBuilder()
        .setColor('#5bc595')
        .addFields([
            { name: 'ipId', value: imageDescription, inline: true }
        ])
        .setAuthor({ name: 'Story Protocol', iconURL: storyProtocolLogo, url: 'https://discord.com/invite/storyprotocol' })
    // .setImage(imageBlob);

    await interaction.editReply({ embeds: [embed] }).catch(e => console.log(e));
}

module.exports = {
    name: 'identify',
    description: 'Identify information about an image from Artcast.',
    options: [
        {
            name: 'image_url',
            description: 'The image path.',
            required: true,
            type: ApplicationCommandOptionType.String
        }
    ],
    execute
}