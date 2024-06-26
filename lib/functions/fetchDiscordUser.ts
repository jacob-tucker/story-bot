import { User } from "discord.js";
import fetch from "node-fetch";

export async function fetchDiscordUser(userId: string): Promise<User | null> {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/users/${userId}`,
      {
        headers: {
          Authorization: `Bot ${process.env.TOKEN}`,
        },
      }
    );
    const result = await response.json();
    // Check if the avatar is animated
    const format = result.avatar.startsWith("a_") ? "gif" : "png";
    // Construct the URL
    const avatarURL = `https://cdn.discordapp.com/avatars/${userId}/${result.avatar}.${format}`;
    return { ...result, avatarURL };
  } catch (error) {
    console.error("Failed to fetch user:", error);

    return null;
  }
}
