import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";


export default defineSchema({
  profiles: defineTable({
    id: v.string(),
    clerkId: v.string(),
    name: v.string(),
    imageUrl: v.string(),
    email: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_uuid", ["id"])
    .index("by_clerkId", ["clerkId"]),

  servers: defineTable({
    id: v.string(),
    name: v.string(),
    imageUrl: v.string(),
    inviteCode: v.string(),
    profileId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_uuid", ["id"])
    .index("by_profileId", ["profileId"])
    .index("by_inviteCode", ["inviteCode"]),

  members: defineTable({
    id: v.string(),
    role: v.string(),
    profileId: v.string(),
    serverId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_uuid", ["id"])
    .index("by_profileId", ["profileId"])
    .index("by_serverId", ["serverId"]),

  channels: defineTable({
    id: v.string(),
    name: v.string(),
    type: v.string(),
    profileId: v.string(),
    serverId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_uuid", ["id"])
    .index("by_profileId", ["profileId"])
    .index("by_serverId", ["serverId"]),

  messages: defineTable({
    id: v.string(),
    content: v.string(),
    fileUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileKey: v.optional(v.string()),
    fileType: v.optional(v.string()),
    memberId: v.string(),
    memberName: v.optional(v.string()),
    memberAvatar: v.optional(v.string()),
    channelId: v.string(),
    deleted: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_uuid", ["id"])
    .index("by_channelId", ["channelId"])
    .index("by_memberId", ["memberId"]),

  conversations: defineTable({
    id: v.string(),
    serverId: v.string(),
    memberOneId: v.string(),
    memberTwoId: v.string(),
  })
    .index("by_uuid", ["id"])
    .index("by_serverId", ["serverId"])
    .index("by_memberTwoId", ["memberTwoId"])
    .index("by_memberPair", ["memberOneId", "memberTwoId"]),

  directMessages: defineTable({
    id: v.string(),
    content: v.string(),
    fileUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileKey: v.optional(v.string()),
    fileType: v.optional(v.string()),
    memberId: v.string(),
    memberName: v.string(),
    memberAvatar: v.string(),
    conversationId: v.string(),
    deleted: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_uuid", ["id"])
    .index("by_memberId", ["memberId"])
    .index("by_conversationId", ["conversationId"]),
});
