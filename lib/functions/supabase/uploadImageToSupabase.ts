import { supabaseClient } from "../../database/supabaseClient";

export async function uploadImageToSupabase(
  bucketName: string,
  authorDiscordId: string,
  fileName: string,
  fileBlob: Blob
) {
  const filePath = `${authorDiscordId}/${fileName}`;
  const { data, error } = await supabaseClient.storage
    .from(bucketName)
    .upload(filePath, fileBlob, {
      cacheControl: "3600", // Optional: Cache control settings
      upsert: false, // Optional: Do not overwrite if the file already exists
    });

  if (error) {
    return { errorMessage: error.message };
  }

  return { data };
}
