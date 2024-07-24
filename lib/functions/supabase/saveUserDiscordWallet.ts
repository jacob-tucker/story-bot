import { supabaseClient } from "../../database/supabaseClient";
import { UserDiscordWallet } from "../../../types/types";

export async function saveUserDiscordWallet(
  userDiscordWallet: UserDiscordWallet
) {
  const { error } = await supabaseClient
    .from("user_wallets")
    .insert(userDiscordWallet);
  console.log({ error });
}
