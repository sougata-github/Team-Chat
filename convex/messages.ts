import { paginationOptsValidator } from "convex/server";
import { v4 as uuidv4 } from "uuid";
import { v } from "convex/values";

import { query, mutation } from "./_generated/server";

export const listByChat = query({
  args: {
    paginationOpts: paginationOptsValidator,
    channelId: v.string(),
  },
  handler: async (ctx, { paginationOpts, channelId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorised");
    }

    const results = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("channelId"), channelId))
      .order("desc")
      .paginate(paginationOpts);

    const page = await Promise.all(
      results.page.map(async (message) => {
        const member = await ctx.db
          .query("members")
          .withIndex("by_uuid", (q) => q.eq("id", message.memberId))
          .unique();
        const profile = member
          ? await ctx.db
              .query("profiles")
              .withIndex("by_uuid", (q) => q.eq("id", member.profileId))
              .unique()
          : null;

        return {
          ...message,
          member: member ? { ...member, profile } : null,
        };
      })
    );

    return { ...results, page };
  },
});

export const create = mutation({
  args: {
    channelId: v.string(),
    content: v.string(),
    memberId: v.string(),
    memberName: v.string(),
    memberIcon: v.string(),
    fileUrl: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { channelId, content, memberId, memberName, memberIcon, fileUrl }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorised");
    }

    const now = Date.now();

    return await ctx.db.insert("messages", {
      id: uuidv4(),
      channelId,
      memberId,
      memberName,
      memberAvatar: memberIcon,
      content,
      fileUrl,
      deleted: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: { id: v.id("messages"), content: v.string() },
  handler: async (ctx, { id, content }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorised");
    }

    const message = await ctx.db.get(id);
    if (!message) return;

    await ctx.db.patch(id, {
      content,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorised");
    }

    await ctx.db.patch(id, { deleted: true });
  },
});
