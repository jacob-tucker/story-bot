import axios from "axios";
import { base64ToBlob } from "../base64ToBlob";
import { blobToBuffer } from "../blobToBuffer";
import sharp from "sharp";
import { arrayBufferToBuffer } from "../arrayBufferToBuffer";

export async function modifyImage(
  originalAttachmentArrayBuffer: ArrayBuffer,
  prompt: string,
  strength: number
) {
  const buffer = arrayBufferToBuffer(originalAttachmentArrayBuffer);

  const payload = {
    image: buffer,
    prompt,
    strength,
    output_format: "jpeg",
    mode: "image-to-image",
  };

  const response = await axios.postForm(
    `https://api.stability.ai/v2beta/stable-image/generate/sd3`,
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
    console.error(`${response.status}: ${await response.data.toString()}`);
    return null;
  }

  const imageData = await response.data;
  const imageBlob = base64ToBlob(imageData.image, "image/jpeg");
  const imageBuffer = await blobToBuffer(imageBlob);
  const consenscedImageBuffer = await sharp(imageBuffer)
    .jpeg({ quality: 50 }) // Adjust the quality value as needed (between 0 and 100)
    .toBuffer();
  return new Blob([consenscedImageBuffer], { type: "image/jpeg" });
}
