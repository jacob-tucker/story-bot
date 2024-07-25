import { GuildMember } from "discord.js";
import { client } from "../bot";

export async function fetchDiscordUser(
  userId: string,
  guildId: string
): Promise<GuildMember> {
  const guild = await client.guilds.fetch(guildId);

  // Fetch the member object for the user in that guild
  const member = await guild.members.fetch(userId);
  return member;
}
