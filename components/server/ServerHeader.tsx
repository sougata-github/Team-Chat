"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import {
  ChevronDown,
  LogOut,
  PlusCircle,
  Settings,
  Trash,
  UserPlus,
  Users,
} from "lucide-react";

import { useModal } from "@/hooks/useModalStore";
import { Doc } from "@/convex/_generated/dataModel";
import { Skeleton } from "../ui/skeleton";

export type serverWithMemeberProfiles = Doc<"members"> & {
  profile: Doc<"profiles"> | null;
};

interface ServerHeaderProps {
  serverMembersWithProfiles: serverWithMemeberProfiles[] | null;
  server: Doc<"servers">;
  role?: string;
}

export const ServerHeaderSkeleton = () => {
  return (
    <div className="w-full px-3 flex items-center h-12 border-b">
      <Skeleton className="h-5 w-32 rounded" />
      <Skeleton className="h-5 w-5 ml-2 md:ml-auto rounded-sm" />
    </div>
  );
};

const ServerHeader = ({
  serverMembersWithProfiles,
  server,
  role,
}: ServerHeaderProps) => {
  const { onOpen } = useModal();

  const isAdmin = role === "admin";
  const isModerator = isAdmin || role === "moderator";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none" asChild>
        <button className="w-full text-md font-semibold px-3 flex items-center h-12 border-b transition">
          <p className="line-clamp-1">{server.name}</p>
          <ChevronDown className="h-5 w-5 ml-2 md:ml-auto" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 text-xs font-medium space-y-[2px]">
        {isModerator && (
          <DropdownMenuItem
            className="text-indigo-600 dark:text-indigo-400 px-3 py-2 text-sm cursor-pointer"
            onClick={() => onOpen("invite", { server })}
          >
            Invite People
            <UserPlus className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem
            className="px-3 py-2 text-sm cursor-pointer"
            onClick={() => onOpen("editServer", { server })}
          >
            Server Settings
            <Settings className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem
            className="px-3 py-2 text-sm cursor-pointer"
            onClick={() =>
              onOpen("members", { serverMembersWithProfiles, server })
            }
          >
            Manage Members
            <Users className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {isModerator && (
          <DropdownMenuItem
            className="px-3 py-2 text-sm cursor-pointer"
            onClick={() => onOpen("createChannel")}
          >
            Create Channel
            <PlusCircle className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {isModerator && <DropdownMenuSeparator />}
        {isAdmin && (
          <DropdownMenuItem
            className=" text-rose-500 px-3 py-2 text-sm cursor-pointer"
            onClick={() => onOpen("deleteServer", { server })}
          >
            Delete Server
            <Trash className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {!isAdmin && (
          <DropdownMenuItem
            className=" text-rose-500 px-3 py-2 text-sm cursor-pointer"
            onClick={() => onOpen("leaveServer", { server })}
          >
            Leave Server
            <LogOut className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ServerHeader;
