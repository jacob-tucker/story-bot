import { supabaseClient } from "../database/supabaseClient";

export async function saveIpToDb(data: {
  userDiscordId: string;
  hash: string;
  pHash: string;
  ipId: string;
  name: string | undefined;
  description: string | undefined;
  createdWithAi: boolean;
}) {
  const { error } = await supabaseClient.from("images").insert({
    user_discord_id: data.userDiscordId,
    hash: data.hash,
    p_hash: data.pHash,
    ip_id: data.ipId,
    name: data.name,
    description: data.description,
    created_with_ai: data.createdWithAi,
  });
}
