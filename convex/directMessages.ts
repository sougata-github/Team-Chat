import { paginationOptsValidator } from "convex/server";
import { v4 as uuidv4 } from "uuid";
import { v } from "convex/values";

import { query, mutation } from "./_generated/server";


export const listByConversation = query({
  args: {
    paginationOpts: paginationOptsValidator,
    conversationId: v.string(),
  },
  handler: async (ctx, { paginationOpts, conversationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorised");

    const results = await ctx.db
      .query("directMessages")
      .filter((q) => q.eq(q.field("conversationId"), conversationId))
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
    conversationId: v.string(),
    memberId: v.string(),
    memberName: v.string(),
    memberIcon: v.string(),
    content: v.string(),
    fileUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileKey: v.optional(v.string()),
    fileType: v.optional(v.string()),
  },
  handler: async (
    ctx,
    {
      conversationId,
      memberId,
      memberName,
      memberIcon,
      content,
      fileUrl,
      fileName,
      fileKey,
      fileType,
    }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorised");

    const now = Date.now();

    return await ctx.db.insert("directMessages", {
      id: uuidv4(),
      conversationId,
      memberId,
      memberName,
      memberAvatar: memberIcon,
      content,
      fileUrl,
      fileName,
      fileKey,
      fileType,
      deleted: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: { id: v.id("directMessages"), content: v.string() },
  handler: async (ctx, { id, content }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorised");

    const message = await ctx.db.get(id);
    if (!message) return;

    await ctx.db.patch(id, {
      content,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("directMessages") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorised");

    await ctx.db.patch(id, { deleted: true });
  },
});
