import { supabaseClient } from "../database/supabaseClient";
import { shortenHexString } from "./hashHex";

export async function saveIpToDb(data: {
  userDiscordId: string;
  imageHex: string;
  ipId: string;
  description: string | undefined;
}) {
  const { error } = await supabaseClient.from("images").insert({
    user_discord_id: data.userDiscordId,
    image_hex: data.imageHex,
    ip_id: data.ipId,
    description: data.description,
  });
}
