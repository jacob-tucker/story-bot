export async function fetchDiscordImageHexString(
  attachmentUrl: string
): Promise<string | null> {
  try {
    const response = await fetch(attachmentUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString("hex");
  } catch (error) {
    console.error("Error downloading file:", error);
    return null;
  }
}
