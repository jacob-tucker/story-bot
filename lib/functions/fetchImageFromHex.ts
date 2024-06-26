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
  const { data, error } = await supabaseClient
    .from("images")
    .select()
    .eq("image_hex", s);
  console.log(error);
  if (!data || !data.length) {
    return null;
  }

  return data[0];
}
