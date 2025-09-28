import { v4 as uuidv4 } from "uuid";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";


export const getChannelById = query({
  args: { serverId: v.string(), channelId: v.string() },
  handler: async (ctx, { serverId, channelId }) => {
    const channel = await ctx.db
      .query("channels")
      .withIndex("by_uuid", (q) => q.eq("id", channelId))
      .unique();

    if (!channel) return null;

    if (channel.serverId !== serverId) return null;

    return channel;
  },
});

export const createChannel = mutation({
  args: {
    serverId: v.string(),
    name: v.string(),
    type: v.string(),
  },
  handler: async (ctx, { serverId, name, type }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!profile) throw new Error("Profile not found");

    if (name.toLowerCase() === "general") {
      throw new Error("Channel name cannot be general");
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_serverId", (q) => q.eq("serverId", serverId))
      .filter((q) =>
        q.and(
          q.eq(q.field("profileId"), profile.id),
          q.or(
            q.eq(q.field("role"), "admin"),
            q.eq(q.field("role"), "moderator")
          )
        )
      )
      .first();

    if (!member)
      throw new Error("You must be an admin or moderator to create a channel");

    const channelId = uuidv4();

    await ctx.db.insert("channels", {
      id: channelId,
      serverId,
      profileId: profile.id,
      name,
      type,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const editChannel = mutation({
  args: {
    serverId: v.string(),
    channelId: v.string(),
    name: v.string(),
    type: v.string(),
  },
  handler: async (ctx, { serverId, channelId, name, type }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!profile) throw new Error("Profile not found");

    if (name.toLowerCase() === "general") {
      throw new Error("Channel name cannot be 'general'");
    }
    const member = await ctx.db
      .query("members")
      .withIndex("by_serverId", (q) => q.eq("serverId", serverId))
      .filter((q) =>
        q.and(
          q.eq(q.field("profileId"), profile.id),
          q.or(
            q.eq(q.field("role"), "admin"),
            q.eq(q.field("role"), "moderator")
          )
        )
      )
      .first();

    if (!member)
      throw new Error("You must be an admin or moderator to edit a channel");

    const channel = await ctx.db
      .query("channels")
      .withIndex("by_uuid", (q) => q.eq("id", channelId))
      .unique();
    if (!channel) throw new Error("Channel not found");
    if (channel.name.toLowerCase() === "general") {
      throw new Error("Cannot edit the 'general' channel");
    }

    await ctx.db.patch(channel._id, {
      name,
      type,
      updatedAt: Date.now(),
    });
  },
});

export const deleteChannel = mutation({
  args: {
    serverId: v.string(),
    channelId: v.string(),
  },
  handler: async (ctx, { serverId, channelId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const member = await ctx.db
      .query("members")
      .withIndex("by_serverId", (q) => q.eq("serverId", serverId))
      .filter((q) =>
        q.and(
          q.eq(q.field("profileId"), profile.id),
          q.or(
            q.eq(q.field("role"), "admin"),
            q.eq(q.field("role"), "moderator")
          )
        )
      )
      .first();

    if (!member)
      throw new Error("You must be an admin or moderator to delete a channel");

    const channel = await ctx.db
      .query("channels")
      .withIndex("by_uuid", (q) => q.eq("id", channelId))
      .unique();

    if (!channel) throw new Error("Channel not found");

    if (channel.name.toLowerCase() === "general") {
      throw new Error("Cannot delete the 'general' channel");
    }

    //delete all the messages in the channel
    const channelMessages = await ctx.db
      .query("messages")
      .withIndex("by_channelId", (q) => q.eq("channelId", channel.id))
      .collect();

    await Promise.all(
      channelMessages.map((message) => ctx.db.delete(message._id))
    );

    await ctx.db.delete(channel._id);
  },
});
