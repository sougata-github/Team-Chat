import { Hash } from "lucide-react";

import ChatVideoButton from "../ChatVideoButton";
import MobileToggle from "../MobileToggle";
import UserAvatar from "../UserAvatar";


interface ChatHeaderProps {
  serverId: string;
  name: string;
  type: "channel" | "conversation";
  imageUrl?: string;
}

const ChatHeader = ({ serverId, name, type, imageUrl }: ChatHeaderProps) => {
  return (
    <div className="text-md font-semibold py-4 px-3 flex items-center h-12 border-b">
      <MobileToggle />
      {type === "channel" && <Hash className="size-5 text-muted-foreground" />}
      {type === "conversation" && (
        <UserAvatar src={imageUrl} className="mr-2" />
      )}
      <p className="font-semibold text-base ml-1.5">{name}</p>
      <div className="ml-auto flex items-center">
        {type === "conversation" && <ChatVideoButton />}
      </div>
    </div>
  );
};

export default ChatHeader;
