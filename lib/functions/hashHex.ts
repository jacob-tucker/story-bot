import crypto from "crypto";

export async function shortenHexString(hexString) {
  // Convert the hex string to a Uint8Array
  const hexBytes = new Uint8Array(
    hexString.match(/[\da-f]{2}/gi).map((h) => parseInt(h, 16))
  );

  // Use the SubtleCrypto API to compute the SHA-256 hash
  const hashBuffer = await crypto.subtle.digest("SHA-256", hexBytes);

  // Convert the hash (ArrayBuffer) to a Base64 string
  const hashArray = new Uint8Array(hashBuffer);
  // @ts-ignore
  const base64String = btoa(String.fromCharCode(...hashArray));

  return base64String;
}
