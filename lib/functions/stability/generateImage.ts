import axios from "axios";
import { base64ToBlob } from "../base64ToBlob";
import { blobToBuffer } from "../blobToBuffer";
import sharp from "sharp";

export async function generateImage(prompt: string) {
  const payload = {
    prompt,
    output_format: "jpeg",
  };

  const response = await axios.postForm(
    `https://api.stability.ai/v2beta/stable-image/generate/core`,
    axios.toFormData(payload, new FormData()),
    {
      headers: {
        // "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
      },
      method: "POST",
    }
  );

  if (response.status !== 200) {
    throw new Error(`${response.status}: ${await response.data.toString()}`);
  }

  const imageData = await response.data;
  const imageBlob = base64ToBlob(imageData.image, "image/jpeg");
  const imageBuffer = await blobToBuffer(imageBlob);
  const consenscedImageBuffer = await sharp(imageBuffer)
    .jpeg({ quality: 50 }) // Adjust the quality value as needed (between 0 and 100)
    .toBuffer();
  return new Blob([consenscedImageBuffer], { type: "image/jpeg" });
}
