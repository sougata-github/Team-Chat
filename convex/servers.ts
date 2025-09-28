import { v4 as uuidv4 } from "uuid";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";


export const getServerForProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!profile) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_profileId", (q) => q.eq("profileId", profile.id))
      .first();

    if (!member) return null;

    //get the server from member
    const server = await ctx.db
      .query("servers")
      .withIndex("by_uuid", (q) => q.eq("id", member.serverId))
      .first();

    return server;
  },
});

export const getServersForProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!profile) {
      throw new Error("Unauthorized");
    }

    const members = await ctx.db
      .query("members")
      .withIndex("by_profileId", (q) => q.eq("profileId", profile.id))
      .collect();

    if (!members.length) return [];

    const servers = await Promise.all(
      members.map((m) =>
        ctx.db
          .query("servers")
          .withIndex("by_uuid", (q) => q.eq("id", m.serverId))
          .unique()
      )
    );

    return servers.filter(Boolean);
  },
});

export const joinByInvite = mutation({
  args: { inviteCode: v.string() },
  handler: async (ctx, { inviteCode }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!profile) {
      throw new Error("Unauthorized");
    }

    const server = await ctx.db
      .query("servers")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", inviteCode))
      .unique();

    if (!server) {
      return null;
    }

    const existingMember = await ctx.db
      .query("members")
      .withIndex("by_serverId", (q) => q.eq("serverId", server.id))
      .filter((q) => q.eq(q.field("profileId"), profile.id))
      .unique();

    //already member of that server
    if (existingMember) {
      return server;
    }

    //if not a part of that server, become a member
    await ctx.db.insert("members", {
      id: uuidv4(),
      role: "guest",
      serverId: server.id,
      profileId: profile.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return server;
  },
});

export const getServerWithChannelsAndMembers = query({
  args: { serverId: v.string() },
  handler: async (ctx, { serverId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!profile) throw new Error("Unauthorized");

    const member = await ctx.db
      .query("members")
      .withIndex("by_profileId", (q) => q.eq("profileId", profile.id))
      .filter((q) => q.eq(q.field("serverId"), serverId))
      .unique();

    if (!member) return null;

    const server = await ctx.db
      .query("servers")
      .withIndex("by_uuid", (q) => q.eq("id", serverId))
      .unique();

    if (!server) return null;

    const channels = await ctx.db
      .query("channels")
      .withIndex("by_serverId", (q) => q.eq("serverId", serverId))
      .order("asc")
      .collect();

    const members = await ctx.db
      .query("members")
      .withIndex("by_serverId", (q) => q.eq("serverId", serverId))
      .collect();

    const membersWithProfiles = await Promise.all(
      members.map(async (m) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_uuid", (q) => q.eq("id", m.profileId))
          .unique();
        return { ...m, profile };
      })
    );

    return { server, channels, membersWithProfiles };
  },
});

export const getInitialChannel = query({
  args: { serverId: v.string() },
  handler: async (ctx, { serverId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!profile) throw new Error("Unauthorized");

    const member = await ctx.db
      .query("members")
      .withIndex("by_profileId", (q) => q.eq("profileId", profile.id))
      .filter((q) => q.eq(q.field("serverId"), serverId))
      .unique();

    if (!member) return null;

    const general = await ctx.db
      .query("channels")
      .withIndex("by_serverId", (q) => q.eq("serverId", serverId))
      .filter((q) => q.eq(q.field("name"), "general"))
      .order("asc")
      .first();

    return general;
  },
});

export const createServer = mutation({
  args: {
    name: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, { name, imageUrl }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!profile) throw new Error("Profile not found");

    const serverId = uuidv4();
    const memberId = uuidv4();
    const channelId = uuidv4();

    // create server
    await ctx.db.insert("servers", {
      id: serverId,
      profileId: profile.id,
      name,
      imageUrl,
      inviteCode: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // create default channel
    await ctx.db.insert("channels", {
      id: channelId,
      name: "general",
      type: "text",
      profileId: profile.id,
      serverId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // add creator as member
    await ctx.db.insert("members", {
      id: memberId,
      profileId: profile.id,
      serverId,
      role: "admin",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { serverId };
  },
});

export const regenerateInviteCode = mutation({
  args: { serverId: v.string() },
  handler: async (ctx, { serverId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!profile) throw new Error("Profile not found");

    const member = await ctx.db
      .query("members")
      .filter((q) =>
        q.and(
          q.eq(q.field("serverId"), serverId),
          q.eq(q.field("profileId"), profile.id),
          q.eq(q.field("role"), "admin")
        )
      )
      .first();

    if (!member)
      throw new Error(
        "You must be an admin or moderator to update the invite code"
      );

    const server = await ctx.db
      .query("servers")
      .withIndex("by_uuid", (q) => q.eq("id", serverId))
      .unique();

    if (!server) throw new Error("Server not found");

    const newInviteCode = uuidv4();

    await ctx.db.patch(server._id, {
      inviteCode: newInviteCode,
      updatedAt: Date.now(),
    });

    return { ...server, inviteCode: newInviteCode };
  },
});

export const editServer = mutation({
  args: {
    serverId: v.string(),
    name: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, { serverId, name, imageUrl }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const member = await ctx.db
      .query("members")
      .filter((q) =>
        q.and(
          q.eq(q.field("serverId"), serverId),
          q.eq(q.field("profileId"), profile.id),
          q.eq(q.field("role"), "admin")
        )
      )
      .first();

    if (!member) throw new Error("You must be an admin to edit this server");

    const server = await ctx.db
      .query("servers")
      .withIndex("by_uuid", (q) => q.eq("id", serverId))
      .unique();

    if (!server) throw new Error("Server not found");

    await ctx.db.patch(server._id, {
      name,
      imageUrl,
      updatedAt: Date.now(),
    });

    return { ...server, name, imageUrl };
  },
});

export const deleteServer = mutation({
  args: { serverId: v.string() },
  handler: async (ctx, { serverId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const member = await ctx.db
      .query("members")
      .filter((q) =>
        q.and(
          q.eq(q.field("serverId"), serverId),
          q.eq(q.field("profileId"), profile.id),
          q.eq(q.field("role"), "admin")
        )
      )
      .first();
    if (!member) throw new Error("You must be an admin to delete this server");

    const server = await ctx.db
      .query("servers")
      .withIndex("by_uuid", (q) => q.eq("id", serverId))
      .unique();
    if (!server) throw new Error("Server not found");

    const [members, channels, conversations] = await Promise.all([
      ctx.db
        .query("members")
        .filter((q) => q.eq(q.field("serverId"), serverId))
        .collect(),
      ctx.db
        .query("channels")
        .filter((q) => q.eq(q.field("serverId"), serverId))
        .collect(),
      ctx.db
        .query("conversations")
        .filter((q) => q.eq(q.field("serverId"), serverId))
        .collect(),
    ]);

    const memberMessagesAndDMs = await Promise.all(
      members.map(async (m) => {
        const [msgs, dms] = await Promise.all([
          ctx.db
            .query("messages")
            .withIndex("by_memberId", (q) => q.eq("memberId", m.id))
            .collect(),
          ctx.db
            .query("directMessages")
            .withIndex("by_memberId", (q) => q.eq("memberId", m.id))
            .collect(),
        ]);
        return { msgs, dms };
      })
    );

    const messagesToDelete = memberMessagesAndDMs.flatMap((r) => r.msgs);
    const directMessagesToDelete = memberMessagesAndDMs.flatMap((r) => r.dms);

    await Promise.all([
      ...messagesToDelete.map((msg) => ctx.db.delete(msg._id)),
      ...directMessagesToDelete.map((dm) => ctx.db.delete(dm._id)),
      ...members.map((m) => ctx.db.delete(m._id)),
      ...channels.map((c) => ctx.db.delete(c._id)),
      ...conversations.map((convo) => ctx.db.delete(convo._id)),
    ]);

    await ctx.db.delete(server._id);
  },
});

export const leaveServer = mutation({
  args: { serverId: v.string() },
  handler: async (ctx, { serverId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!profile) throw new Error("Profile not found");

    const server = await ctx.db
      .query("servers")
      .withIndex("by_uuid", (q) => q.eq("id", serverId))
      .unique();

    if (!server) throw new Error("Server not found");

    // prevent admin from leaving
    if (server.profileId === profile.id) {
      throw new Error("Server owner cannot leave");
    }

    const member = await ctx.db
      .query("members")
      .filter((q) =>
        q.and(
          q.eq(q.field("serverId"), serverId),
          q.eq(q.field("profileId"), profile.id)
        )
      )
      .first();

    if (!member) throw new Error("You are not a member of this server");

    await ctx.db.delete(member._id);
  },
});
