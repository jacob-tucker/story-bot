import { supabaseClient } from "../../database/supabaseClient";

export async function findSimilarPHashes(pHash: string) {
  const { data, error } = await supabaseClient.rpc("find_similar_phashes", {
    new_phash: pHash,
    tolerance: 10,
  });

  if (error) {
    console.error("Error finding similar pHashes:", error);
    return [];
  }

  return data;
}
