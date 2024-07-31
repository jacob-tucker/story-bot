import { fetchDiscordUser } from "../fetchDiscordUser";

export async function giveUserRole(
  discordId: string,
  roleId: string,
  guildId: string
) {
  const member = await fetchDiscordUser(discordId, guildId);
  if (member && !member.roles.cache.has(roleId)) {
    try {
      await member.roles.add(roleId);
    } catch (e) {
      console.log(e);
    }
  }
}
