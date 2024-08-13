import { supabaseClient } from "../../database/supabaseClient";

export async function findMostSimilarPHash(
  pHash: string,
  tolerance: number = 10
) {
  const { data, error } = await supabaseClient.rpc("find_most_similar_phash", {
    new_phash: pHash,
    tolerance,
  });

  if (error || !data.id) {
    console.error("Error finding most similar pHash:", error);
    return null;
  }

  return data;
}
