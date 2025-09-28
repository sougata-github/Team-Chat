import { v4 as uuidv4 } from "uuid";

import { mutation, query } from "./_generated/server";

export const getProfileByClerkId = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorised");
    }

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!existing) throw new Error("Profile does not exist");

    return existing;
  },
});

export const getOrCreateProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorised");
    }

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (existing) return existing;

    const newProfileId = await ctx.db.insert("profiles", {
      id: uuidv4(),
      clerkId: identity.subject,
      name: `${identity.givenName ?? "Username"} ${identity.familyName ?? ""}`,
      imageUrl: identity.pictureUrl ?? "",
      email: identity.email ?? "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return await ctx.db.get(newProfileId);
  },
});
