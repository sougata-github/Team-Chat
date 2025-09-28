import { v } from "convex/values";

import { mutation, query } from "./_generated/server";


export const getMemberForProfile = query({
  args: { serverId: v.string() },
  handler: async (ctx, { serverId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!profile) return null;

    const member = await ctx.db
      .query("members")
      .withIndex("by_profileId", (q) => q.eq("profileId", profile.id))
      .filter((q) => q.eq(q.field("serverId"), serverId))
      .unique();

    return member ?? null;
  },
});

export const checkMember = query({
  args: { serverId: v.string(), memberTwoId: v.string() },
  handler: async (ctx, { serverId, memberTwoId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const memberTwo = await ctx.db
      .query("members")
      .withIndex("by_uuid", (q) => q.eq("id", memberTwoId))
      .filter((q) => q.eq(q.field("serverId"), serverId))
      .unique();

    if (!memberTwo) return null;

    return memberTwo;
  },
});

export const getMemberProfileByProfile = query({
  args: { serverId: v.string() },
  handler: async (ctx, { serverId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!profile) return null;

    const member = await ctx.db
      .query("members")
      .withIndex("by_profileId", (q) => q.eq("profileId", profile.id))
      .filter((q) => q.eq(q.field("serverId"), serverId))
      .unique();

    if (!member) return null;

    return { member, profile };
  },
});

export const deleteMember = mutation({
  args: {
    serverId: v.string(),
    memberId: v.string(),
  },
  handler: async (ctx, { serverId, memberId }) => {
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

    if (server.profileId !== profile.id)
      throw new Error("Only admins can remove members");

    const memberToDelete = await ctx.db
      .query("members")
      .withIndex("by_uuid", (q) => q.eq("id", memberId))
      .first();

    if (memberToDelete) {
      if (memberToDelete.profileId === profile.id) {
        throw new Error("Cannot remove yourself");
      }

      await ctx.db.delete(memberToDelete._id);
    }

    const serverMembers = await ctx.db
      .query("members")
      .withIndex("by_serverId", (q) => q.eq("serverId", serverId))
      .collect();

    const serverMembersWithProfiles = await Promise.all(
      serverMembers.map(async (member) => {
        const memberProfiles = await ctx.db
          .query("profiles")
          .withIndex("by_uuid", (q) => q.eq("id", member.profileId))
          .unique();

        return { ...member, profile: memberProfiles };
      })
    );

    return serverMembersWithProfiles;
  },
});

export const updateMemberRole = mutation({
  args: {
    serverId: v.string(),
    memberId: v.string(),
    role: v.string(),
  },
  handler: async (ctx, { serverId, memberId, role }) => {
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

    if (server.profileId !== profile.id)
      throw new Error("Only admins can manage members");

    const memberToUpdate = await ctx.db
      .query("members")
      .withIndex("by_uuid", (q) => q.eq("id", memberId))
      .first();

    if (memberToUpdate) {
      if (memberToUpdate.profileId === profile.id) {
        throw new Error("Cannot update your own role");
      }

      await ctx.db.patch(memberToUpdate._id, {
        role,
      });
    }

    const serverMembers = await ctx.db
      .query("members")
      .withIndex("by_serverId", (q) => q.eq("serverId", serverId))
      .collect();

    const serverMembersWithProfiles = await Promise.all(
      serverMembers.map(async (member) => {
        const memberProfiles = await ctx.db
          .query("profiles")
          .withIndex("by_uuid", (q) => q.eq("id", member.profileId))
          .unique();

        return { ...member, profile: memberProfiles };
      })
    );

    return serverMembersWithProfiles;
  },
});
