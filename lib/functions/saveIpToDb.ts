import { supabaseClient } from "../database/supabaseClient";

export async function saveIpToDb(
  userDiscordId: string,
  imageHex: string,
  ipId: string
) {
  const { error } = await supabaseClient.from("images").insert({
    user_discord_id: userDiscordId,
    image_hex: imageHex,
    ip_id: ipId,
  });
}
