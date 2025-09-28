/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as channels from "../channels.js";
import type * as conversations from "../conversations.js";
import type * as directMessages from "../directMessages.js";
import type * as members from "../members.js";
import type * as messages from "../messages.js";
import type * as profiles from "../profiles.js";
import type * as servers from "../servers.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  channels: typeof channels;
  conversations: typeof conversations;
  directMessages: typeof directMessages;
  members: typeof members;
  messages: typeof messages;
  profiles: typeof profiles;
  servers: typeof servers;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
