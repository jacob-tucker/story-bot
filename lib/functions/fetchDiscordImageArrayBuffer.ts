export async function fetchDiscordImageArrayBuffer(
  attachmentUrl: string
): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(attachmentUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;
  } catch (error) {
    console.error("Error downloading file:", error);
    return null;
  }
}
