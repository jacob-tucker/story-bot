import { supabaseClient } from "../database/supabaseClient";
import { shortenHexString } from "./hashHex";

interface ImageIp {
  user_discord_id: string;
  image_hex: string;
  ip_id: string;
  description: string;
}

export async function fetchImageFromHex(
  hexString: string
): Promise<ImageIp | null> {
  const s = await shortenHexString(hexString);
  const { data } = await supabaseClient
    .from("images")
    .select()
    .eq("image_hex", s);
  if (!data || !data.length) {
    return null;
  }

  return data[0];
}
