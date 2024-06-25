import { User } from "discord.js";
import { client } from "../../main";

export async function fetchDiscordUser(userId: string): Promise<User> {
  const user = await client.users.fetch(userId);
  return user;
}
