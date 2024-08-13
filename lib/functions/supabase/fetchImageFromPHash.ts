import { Address } from "viem";
import { supabaseClient } from "../../database/supabaseClient";
import { findMostSimilarPHash } from "./findMostSimilarPHash";

interface ImageIp {
  user_discord_id: string;
  image_hex: string;
  ip_id: Address;
  description: string | null;
}

export async function fetchImageFromPHash(
  pHash: string
): Promise<ImageIp | null> {
  const { data } = await supabaseClient
    .from("images")
    .select()
    .eq("p_hash", pHash);

  // if no exact match is found, try to find the closest option
  if (!data || !data.length) {
    return await findMostSimilarPHash(pHash);
  }

  return data[0];
}
