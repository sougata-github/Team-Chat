"use client";

import ActionTooltip from "../ActionTooltip";

import { Plus, Settings } from "lucide-react";

import { useModal } from "@/hooks/useModalStore";
import { Doc } from "@/convex/_generated/dataModel";
import { serverWithMemeberProfiles } from "./ServerHeader";

interface ServerSectionProps {
  serverMembersWithProfiles: serverWithMemeberProfiles[] | null;
  label: string;
  role?: string;
  sectionType: string;
  channelType?: string;
  server?: Doc<"servers">;
}

const ServerSection = ({
  serverMembersWithProfiles,
  label,
  role,
  sectionType,
  channelType,
  server,
}: ServerSectionProps) => {
  const { onOpen } = useModal();

  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      {role !== "guest" && sectionType === "channels" && (
        <ActionTooltip label="Create Channel" side="top">
          <button
            className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
            onClick={() => onOpen("createChannel", { channelType })}
          >
            <Plus className="h-4 w-4" />
          </button>
        </ActionTooltip>
      )}
      {role === "admin" && sectionType === "members" && (
        <ActionTooltip label="Manage Members" side="top">
          <button
            className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
            onClick={() =>
              onOpen("members", { serverMembersWithProfiles, server })
            }
          >
            <Settings className="h-4 w-4" />
          </button>
        </ActionTooltip>
      )}
    </div>
  );
};

export default ServerSection;
