import { supabaseClient } from "../../database/supabaseClient";

export function getImagePublicUrl(
  bucketName: string,
  authorDiscordId: string,
  fileName: string
): string | null {
  const filePath = `${authorDiscordId}/${fileName}`;
  const { data } = supabaseClient.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return data.publicUrl;
}
