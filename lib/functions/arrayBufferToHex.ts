import crypto from "crypto";
export async function arrayBufferToHex(arrayBuffer: ArrayBuffer) {
  // Use SubtleCrypto API to compute the SHA-256 hash
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);

  // Convert the hash to a hexadecimal string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}
