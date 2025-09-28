"use client";

import MediaRoom from "@/components/MediaRoom";
import ChatInput from "@/components/chat/ChatInput";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessages, {
  ChatMessagesSkeleton,
} from "@/components/chat/ChatMessages";

import { useParams, useRouter } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { DEFAULT_AVATAR } from "@/constants";
import { useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { Skeleton } from "@/components/ui/skeleton";

const ChannelSkeleton = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden sm:overflow-y-auto custom-scrollbar bg-muted-foreground/5">
      <div className="h-12 border-b flex py-4 px-3">
        <Skeleton className="h-5 rounded w-20" />
      </div>
      <ChatMessagesSkeleton />
      <div className="pb-6 p-4">
        <Skeleton className="h-12 w-full rounded" />
      </div>
    </div>
  );
};

const Page = () => {
  const { isAuthenticated } = useConvexAuth();

  const router = useRouter();

  const params = useParams<{
    serverId: string;
    channelId: string;
  }>();

  const serverId = Array.isArray(params?.serverId)
    ? params.serverId[0]
    : params?.serverId;

  const channelId = Array.isArray(params?.channelId)
    ? params.channelId[0]
    : params?.channelId;

  const profile = useQuery(
    api.profiles.getProfileByClerkId,
    isAuthenticated ? {} : "skip"
  );

  const channel = useQuery(
    api.channels.getChannelById,
    profile
      ? {
          serverId,
          channelId,
        }
      : "skip"
  );
  const member = useQuery(
    api.members.getMemberForProfile,
    profile
      ? {
          serverId,
        }
      : "skip"
  );

  useEffect(() => {
    if (channel === null) {
      router.push(`/servers/${serverId}`);
      return;
    }
  }, [channel]);

  useEffect(() => {
    if (member === null) {
      router.push("/");
      return;
    }
  }, [member]);

  if (!profile || channel === undefined || member === undefined) {
    return <ChannelSkeleton />;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden sm:overflow-y-auto custom-scrollbar bg-muted-foreground/5">
      {profile && channel && member && (
        <>
          <ChatHeader
            name={channel.name}
            serverId={channel.serverId}
            type="channel"
          />

          {channel.type === "text" && (
            <>
              <ChatMessages
                isAuthenticated={isAuthenticated}
                member={member}
                name={channel.name}
                chatId={channel.id}
                type="channel"
              />
              <ChatInput
                memberName={profile?.name ?? "Unknown User"}
                memberIcon={profile?.imageUrl ?? DEFAULT_AVATAR}
                memberId={member.id}
                name={channel.name}
                type="channel"
                channelId={channel.id}
              />
            </>
          )}
          {channel.type === "audio" && (
            <MediaRoom chatId={channel.id} video={false} audio={true} />
          )}
          {channel.type === "video" && (
            <MediaRoom chatId={channel.id} video={true} audio={true} />
          )}
        </>
      )}
    </div>
  );
};

export default Page;
