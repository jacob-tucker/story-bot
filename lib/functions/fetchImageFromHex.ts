import { supabaseClient } from "../database/supabaseClient";

interface ImageIp {
  user_discord_id: string;
  image_hex: string;
  ip_id: string;
}

export async function fetchImageFromHex(
  hexString: string
): Promise<ImageIp | null> {
  console.log(hexString);
  const { data, error } = await supabaseClient
    .from("images")
    .select()
    .eq("image_hex", hexString);
  console.log(error);
  if (!data || !data.length) {
    return null;
  }

  return data[0];
}
