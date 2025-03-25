import { GuildMember } from "discord.js";

/**
 * Toggles a role for a guild member - adds the role if they don't have it, removes it if they do
 * @param member The guild member to toggle the role for
 * @param roleId The ID of the role to toggle
 * @returns Object containing success status and whether the role was added or removed
 */
export async function toggleUserRole(
  member: GuildMember,
  roleId: string
): Promise<{ success: boolean; added: boolean; removed: boolean }> {
  try {
    // Check if the member already has the role
    const hasRole = member.roles.cache.has(roleId);
    
    if (hasRole) {
      // Remove the role if they already have it
      await member.roles.remove(roleId);
      console.log(`Removed role ${roleId} from user ${member.user.tag} (${member.id})`);
      return { success: true, added: false, removed: true };
    } else {
      // Add the role if they don't have it
      await member.roles.add(roleId);
      console.log(`Added role ${roleId} to user ${member.user.tag} (${member.id})`);
      return { success: true, added: true, removed: false };
    }
  } catch (error) {
    console.error(`Error toggling role ${roleId} for user ${member.user.tag}:`, error);
    return { success: false, added: false, removed: false };
  }
}
