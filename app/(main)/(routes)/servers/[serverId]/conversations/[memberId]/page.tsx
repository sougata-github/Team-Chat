"use client";

import MediaRoom from "@/components/MediaRoom";

import ChatInput from "@/components/chat/ChatInput";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessages, {
  ChatMessagesSkeleton,
} from "@/components/chat/ChatMessages";

import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache/hooks";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Doc } from "@/convex/_generated/dataModel";
import { DEFAULT_AVATAR } from "@/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

const ConversationSkeleton = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden sm:overflow-y-auto custom-scrollbar bg-muted-foreground/5">
      <div className="h-12 border-b flex py-4 px-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-5 rounded w-20" />
        </div>
        <Skeleton className="h-5 rounded w-10" />
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
    memberId: string;
  }>();

  const searchParams = useSearchParams();

  const isVideo = searchParams?.get("video") === "true";

  const serverId = Array.isArray(params?.serverId)
    ? params.serverId[0]
    : params?.serverId;

  const memberId = Array.isArray(params?.memberId)
    ? params.memberId[0]
    : params?.memberId;

  const profile = useQuery(
    api.profiles.getProfileByClerkId,
    isAuthenticated ? {} : "skip"
  );

  const currentMember = useQuery(
    api.members.getMemberProfileByProfile,
    profile ? { serverId } : "skip"
  );

  const memberExists = useQuery(
    api.members.checkMember,
    profile
      ? {
          serverId,
          memberTwoId: memberId,
        }
      : "skip"
  );

  const [conversationWithMembers, setConversationWithMembers] = useState<{
    conversation: Doc<"conversations"> | null;
    memberOne: Doc<"members"> & {
      profile: Doc<"profiles"> | null;
    };
    memberTwo: Doc<"members"> & {
      profile: Doc<"profiles"> | null;
    };
  } | null>(null);

  const getOrCreateConversation = useMutation(
    api.conversations.getOrCreateConversation
  );

  //when member leaves or gets kicked out
  useEffect(() => {
    if (currentMember === null || memberExists === null) {
      router.push("/");
      return;
    }
  }, [currentMember, memberExists]);

  useEffect(() => {
    if (!profile || !currentMember) return;

    (async () => {
      const conversationWithMembers = await getOrCreateConversation({
        serverId,
        memberOneId: currentMember.member.id,
        memberTwoId: memberId,
      });
      setConversationWithMembers(conversationWithMembers);
    })();
  }, [currentMember, memberId, profile, getOrCreateConversation]);

  if (!conversationWithMembers) {
    return <ConversationSkeleton />;
  }

  const { memberOne, memberTwo, conversation } = conversationWithMembers;

  const otherMember =
    memberOne.profileId === profile?.id ? memberTwo : memberOne;

  return (
    <div className="bg-muted-foreground/5 flex flex-col h-full overflow-hidden sm:overflow-y-auto custom-scrollbar">
      {profile && currentMember && otherMember.profile && conversation && (
        <>
          <ChatHeader
            imageUrl={otherMember.profile.imageUrl}
            name={otherMember.profile.name}
            serverId={serverId}
            type="conversation"
          />
          {isVideo && (
            <MediaRoom chatId={conversation.id} video={true} audio={true} />
          )}
          {!isVideo && (
            <>
              <ChatMessages
                isAuthenticated={isAuthenticated}
                member={currentMember?.member}
                name={otherMember.profile.name}
                chatId={conversation.id}
                type="conversation"
              />
              <ChatInput
                memberName={profile?.name ?? "Unknown User"}
                memberIcon={profile?.imageUrl ?? DEFAULT_AVATAR}
                type="conversation"
                memberId={currentMember.member.id}
                name={otherMember.profile.name}
                conversationId={conversation.id}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Page;
