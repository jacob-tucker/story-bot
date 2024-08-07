import { supabaseClient } from "../../database/supabaseClient";

interface ImageIp {
  user_discord_id: string;
  image_hex: string;
  ip_id: string;
  description: string | null;
}

export async function fetchImageFromHex(
  hexString: string
): Promise<ImageIp | null> {
  const { data } = await supabaseClient
    .from("images")
    .select()
    .eq("image_hex", hexString);
  if (!data || !data.length) {
    return null;
  }

  return data[0];
}
