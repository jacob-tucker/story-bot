import { UserDiscordWallet } from "../../../types/types";
import { supabaseClient } from "../../database/supabaseClient";

export async function fetchUserDiscordWallet(
  discordId: string
): Promise<UserDiscordWallet | null> {
  const { data } = await supabaseClient
    .from("user_wallets")
    .select()
    .eq("discord_id", discordId);
  if (!data || !data[0]) {
    return null;
  }
  return data[0];
}
