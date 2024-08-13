import { imageHash } from "image-hash";

export async function calculatePerceptualHash(
  arrayBuffer: ArrayBuffer
): Promise<string> {
  // Convert ArrayBuffer to Buffer
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    imageHash({ data: buffer }, 16, true, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}
