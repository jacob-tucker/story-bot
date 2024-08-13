import { supabaseClient } from "../../database/supabaseClient";

export async function fileExistsInBucket(
  bucketName: string,
  authorDiscordId: string,
  fileName: string
): Promise<boolean> {
  const { data, error } = await supabaseClient.storage
    .from(bucketName)
    .list(authorDiscordId, { search: fileName });

  return data.length > 0;
}
