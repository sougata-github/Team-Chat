"use client";

import { cn } from "@/lib/utils";

import { Edit, Hash, Lock, Mic, Trash, Video } from "lucide-react";

import { useParams, useRouter } from "next/navigation";
import { ModalType, useModal } from "@/hooks/useModalStore";

import ActionTooltip from "../ActionTooltip";
import { Doc } from "@/convex/_generated/dataModel";

interface ServerChannelProps {
  channel: Doc<"channels">;
  server: Doc<"servers">;
  role?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  text: <Hash className="mr-2 h-4 w-4 text-muted-foreground" />,
  audio: <Mic className="mr-2 h-4 w-4 text-muted-foreground" />,
  video: <Video className="mr-2 h-4 w-4 text-muted-foreground" />,
};

const ServerChannel = ({ channel, server, role }: ServerChannelProps) => {
  const params = useParams();
  const router = useRouter();

  const { onOpen } = useModal();

  const icon = iconMap[channel.type];

  const onClick = () => {
    router.push(`/servers/${params?.serverId}/channels/${channel.id}`);
  };

  const onAction = (e: React.MouseEvent, action: ModalType) => {
    e.stopPropagation();
    onOpen(action, { channel, server });
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "group p-2 rounded-md flex items-center gap-x-2 w-full mb-1.5 hover:bg-muted-foreground/10 transition duration-300",
        params?.channelId === channel.id && "bg-muted-foreground/10"
      )}
    >
      {icon}
      <p
        className={cn(
          "line-clamp-1 font-semibold text-sm text-muted-foreground",
          params?.channelId === channel.id && "text-primary"
        )}
      >
        {channel.name}
      </p>
      {channel.name !== "general" && role !== "guest" && (
        <div className="ml-auto flex items-center gap-x-2">
          <ActionTooltip label="Edit">
            <Edit
              className="md:hidden group-hover:block w-4 h-4 transition text-muted-foreground"
              onClick={(e) => onAction(e, "editChannel")}
            />
          </ActionTooltip>
          <ActionTooltip label="Delete">
            <Trash
              className="md:hidden group-hover:block w-4 h-4 transition text-muted-foreground"
              onClick={(e) => onAction(e, "deleteChannel")}
            />
          </ActionTooltip>
        </div>
      )}
      {channel.name === "general" && (
        <Lock className="ml-auto w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );
};

export default ServerChannel;
