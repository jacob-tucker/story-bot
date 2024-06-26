import { supabaseClient } from "../database/supabaseClient";
import { shortenHexString } from "./hashHex";

export async function saveIpToDb(
  userDiscordId: string,
  imageHex: string,
  ipId: string
) {
  const s = await shortenHexString(imageHex);
  const { error } = await supabaseClient.from("images").insert({
    user_discord_id: userDiscordId,
    image_hex: s,
    ip_id: ipId,
  });
}
