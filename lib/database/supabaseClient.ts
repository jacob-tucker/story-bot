import { giveUserRole } from "../functions/discord/giveUserRole";

// Supabase
const { createClient } = require("@supabase/supabase-js");

// Create a single supabase client for interacting with your database
export const supabaseClient = createClient(
  process.env.PUBLIC_BOT_SUPABASE_URL,
  process.env.BOT_SUPABASE_SERVICE_KEY
);

const STORY_GUILD_ID = "1133510822975512708";
const STORY_IP_ROLE_ID = "1268081412943249509";

const channel = supabaseClient
  .channel("schema-db-changes")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "user_twitters", // Optional: specify table if needed
    },
    async (payload) => {
      console.log(payload);
      if (payload.new.twitter_name.includes("꧁IP꧂")) {
        await giveUserRole(
          payload.new.discord_id,
          STORY_IP_ROLE_ID,
          STORY_GUILD_ID
        );
      }
    }
  )
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "user_twitters", // Optional: specify table if needed
    },
    async (payload) => {
      console.log(payload);
      if (payload.new.twitter_name.includes("꧁IP꧂")) {
        await giveUserRole(
          payload.new.discord_id,
          STORY_IP_ROLE_ID,
          STORY_GUILD_ID
        );
      }
    }
  )
  .subscribe();
