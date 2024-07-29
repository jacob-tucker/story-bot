import { Buffer } from "buffer";
import { imageHash } from "image-hash";

export async function arrayBufferToPerceptualHash(arrayBuffer: ArrayBuffer) {
  // Convert ArrayBuffer to Node.js Buffer
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    imageHash({ data: buffer }, 16, true, (error, hash) => {
      if (error) {
        reject(error);
      } else {
        resolve(hash);
      }
    });
  });
}
