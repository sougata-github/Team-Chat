"use client";

import ChatWelcome from "./ChatWelcome";
import ChatItem from "./ChatItem";

import { useChatScroll } from "@/hooks/useChatScroll";

import { Loader2 } from "lucide-react";

import { Fragment, useRef, ElementRef } from "react";

import { format } from "date-fns";
import { Doc } from "@/convex/_generated/dataModel";
import { usePaginatedQuery } from "convex-helpers/react/cache/hooks";
import { api } from "@/convex/_generated/api";

const DATE_FORMAT = "d MMM yyyy, HH:mm";

interface ChatMessagesProps {
  isAuthenticated: boolean;
  name: string;
  member?: Doc<"members">;
  chatId: string;
  type: "channel" | "conversation";
}

export const ChatMessagesSkeleton = () => {
  return (
    <div className="flex flex-col flex-1 justify-center items-center">
      <Loader2 className="size-7 text-muted-foreground animate-spin my-4" />
      <p className="text-xs text-muted-foreground">Loading messages</p>
    </div>
  );
};

const ChatMessages = ({
  chatId,
  name,
  member,
  type,
  isAuthenticated,
}: ChatMessagesProps) => {
  const chatRef = useRef(null);
  const bottomRef = useRef(null);

  const { results, status, loadMore } = usePaginatedQuery(
    isAuthenticated && type === "channel"
      ? api.messages.listByChat
      : api.directMessages.listByConversation,
    isAuthenticated && type === "channel"
      ? { channelId: chatId }
      : { conversationId: chatId },
    { initialNumItems: 20 }
  );

  useChatScroll({
    chatRef,
    bottomRef,
    loadMore: () => loadMore(20),
    shouldLoadMore: status === "CanLoadMore",
    count: results.length ?? 0,
  });

  if (status === "LoadingFirstPage") {
    return <ChatMessagesSkeleton />;
  }

  return (
    <div
      className="flex-1 flex flex-col py-4 overflow-y-auto custom-scrollbar"
      ref={chatRef}
    >
      <div className="flex flex-col-reverse mt-auto">
        {results.map((message) => (
          <Fragment key={message._id}>
            <ChatItem
              id={message._id}
              type={type}
              currentMember={member!}
              member={message.member}
              memberName={message.memberName!}
              memberIcon={message.memberAvatar!}
              content={message.content}
              fileUrl={message.fileUrl}
              fileName={message.fileName}
              fileType={message.fileType}
              deleted={message.deleted}
              timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
              isUpdated={message.updatedAt !== message.createdAt}
            />
          </Fragment>
        ))}
      </div>
      {results.length === 0 && <ChatWelcome type={type} name={name} />}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;
