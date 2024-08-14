import { fetchDiscordUser } from "../fetchDiscordUser";

export async function giveUserRole(
  discordId: string,
  roleId: string,
  guildId: string
) {
  console.log("Giving user role...");
  const member = await fetchDiscordUser(discordId, guildId);
  if (member && !member.roles.cache.has(roleId)) {
    console.log("Giving role actually...");
    try {
      await member.roles.add(roleId).catch((e) => console.log(e));
    } catch (e) {
      console.log(e);
    }
  }
}
