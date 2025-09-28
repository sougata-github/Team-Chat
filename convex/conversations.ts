import { v4 as uuidv4 } from "uuid";
import { v } from "convex/values";

import { mutation } from "./_generated/server";


export const getOrCreateConversation = mutation({
  args: {
    memberOneId: v.string(),
    memberTwoId: v.string(),
    serverId: v.string(),
  },
  handler: async (ctx, { memberOneId, memberTwoId, serverId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // ensure both members exist
    const memberOne = await ctx.db
      .query("members")
      .withIndex("by_uuid", (q) => q.eq("id", memberOneId))
      .unique();

    const memberTwo = await ctx.db
      .query("members")
      .withIndex("by_uuid", (q) => q.eq("id", memberTwoId))
      .unique();

    if (!memberOne || !memberTwo) return null;

    // try to find conversation in both directions
    let conversation =
      (await ctx.db
        .query("conversations")
        .withIndex("by_memberPair", (q) =>
          q.eq("memberOneId", memberOneId).eq("memberTwoId", memberTwoId)
        )
        .unique()) ||
      (await ctx.db
        .query("conversations")
        .withIndex("by_memberPair", (q) =>
          q.eq("memberOneId", memberTwoId).eq("memberTwoId", memberOneId)
        )
        .unique());

    // create conversation if not found
    if (!conversation) {
      const newConversationId = await ctx.db.insert("conversations", {
        id: uuidv4(),
        serverId,
        memberOneId,
        memberTwoId,
      });

      conversation = await ctx.db.get(newConversationId);
    }

    // members with profiles
    const [profileOne, profileTwo] = await Promise.all([
      ctx.db
        .query("profiles")
        .withIndex("by_uuid", (q) => q.eq("id", memberOne.profileId))
        .unique(),
      ctx.db
        .query("profiles")
        .withIndex("by_uuid", (q) => q.eq("id", memberTwo.profileId))
        .unique(),
    ]);

    return {
      conversation,
      memberOne: { ...memberOne, profile: profileOne },
      memberTwo: { ...memberTwo, profile: profileTwo },
    };
  },
});
