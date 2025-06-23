import { ButtonInteraction } from "discord.js";
import {
  SDK_NOTIFICATIONS_ROLE_ID,
  PROTOCOL_NOTIFICATIONS_ROLE_ID,
} from "../utils/constants";
import { toggleUserRole } from "../functions/discord/toggleUserRole";

/**
 * Handles the SDK notification button interaction
 * @param interaction The button interaction
 */
export async function handleSdkNotificationButton(
  interaction: ButtonInteraction
): Promise<void> {
  try {
    await interaction.deferReply({ ephemeral: true });

    // Get the guild member who clicked the button
    const member = interaction.guild?.members.cache.get(interaction.user.id);

    if (!member) {
      await interaction.editReply({
        content:
          "❌ Unable to find your user information. Please try again later.",
      });
      return;
    }

    // Toggle the SDK notifications role
    const result = await toggleUserRole(member, SDK_NOTIFICATIONS_ROLE_ID);

    if (result.success) {
      if (result.added) {
        await interaction.editReply({
          content: `✅ You've successfully **subscribed** to SDK notifications! You'll receive updates about the latest SDK release notes, breaking changes, and updates.`,
        });
      } else if (result.removed) {
        await interaction.editReply({
          content: `✅ You've successfully **unsubscribed** from SDK notifications. You'll no longer receive SDK updates.`,
        });
      }
    } else {
      await interaction.editReply({
        content:
          "❌ There was an error updating your notification preferences. Please try again later.",
      });
    }

    // Log the action for tracking
    console.log(
      `User ${interaction.user.tag} (${interaction.user.id}) toggled SDK notifications`
    );
  } catch (error) {
    console.error("Error handling SDK notification button:", error);

    // If there was an error, let the user know
    if (!interaction.replied) {
      await interaction.reply({
        content:
          "Sorry, there was an error processing your request. Please try again later.",
        ephemeral: true,
      });
    } else {
      await interaction.editReply({
        content:
          "Sorry, there was an error processing your request. Please try again later.",
      });
    }
  }
}

/**
 * Handles the Protocol notification button interaction
 * @param interaction The button interaction
 */
export async function handleProtocolNotificationButton(
  interaction: ButtonInteraction
): Promise<void> {
  try {
    await interaction.deferReply({ ephemeral: true });

    // Get the guild member who clicked the button
    const member = interaction.guild?.members.cache.get(interaction.user.id);

    if (!member) {
      await interaction.editReply({
        content:
          "❌ Unable to find your user information. Please try again later.",
      });
      return;
    }

    // Toggle the Protocol notifications role
    const result = await toggleUserRole(member, PROTOCOL_NOTIFICATIONS_ROLE_ID);

    if (result.success) {
      if (result.added) {
        await interaction.editReply({
          content: `✅ You've successfully **subscribed** to Protocol notifications! You'll receive updates about the latest protocol release notes, breaking changes, and updates.`,
        });
      } else if (result.removed) {
        await interaction.editReply({
          content: `✅ You've successfully **unsubscribed** from Protocol notifications. You'll no longer receive Protocol updates.`,
        });
      }
    } else {
      await interaction.editReply({
        content:
          "❌ There was an error updating your notification preferences. Please try again later.",
      });
    }

    // Log the action for tracking
    console.log(
      `User ${interaction.user.tag} (${interaction.user.id}) toggled Protocol notifications`
    );
  } catch (error) {
    console.error("Error handling Protocol notification button:", error);

    // If there was an error, let the user know
    if (!interaction.replied) {
      await interaction.reply({
        content:
          "Sorry, there was an error processing your request. Please try again later.",
        ephemeral: true,
      });
    } else {
      await interaction.editReply({
        content:
          "Sorry, there was an error processing your request. Please try again later.",
      });
    }
  }
}
