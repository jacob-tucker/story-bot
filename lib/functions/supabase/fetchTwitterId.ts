import { supabaseClient } from "../../database/supabaseClient";

export async function fetchTwitterId(discordId: string) {
  const { data } = await supabaseClient
    .from("user_twitters")
    .select("twitter_id")
    .eq("discord_id", discordId);
  if (!data || !data[0]) {
    return "";
  }
  return data[0].twitter_id;
}
