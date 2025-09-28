"use client";

import { cn } from "@/lib/utils";

import { ShieldAlert, ShieldCheck } from "lucide-react";

import { useParams, useRouter } from "next/navigation";

import UserAvatar from "../UserAvatar";
import { Doc } from "@/convex/_generated/dataModel";

interface ServerMemberProps {
  member: Doc<"members"> & { profile: Doc<"profiles"> | null };
  server: Doc<"servers">;
}

const roleIconMap: Record<string, React.ReactNode | null> = {
  guest: null,
  moderator: <ShieldCheck className="size-4 mr-2 text-indigo-500" />,
  admin: <ShieldAlert className="size-4 mr-2 text-rose-500" />,
};

const ServerMember = ({ member }: ServerMemberProps) => {
  const params = useParams();
  const router = useRouter();

  const icon = roleIconMap[member.role];

  const onClick = () => {
    router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
  };

  return (
    <button
      className={cn(
        "group p-2 rounded-md flex items-center gap-x-1 sm:gap-x-2 w-full hover:bg-muted-foreground/10 transition mb-1",
        params?.memberId === member.id && "bg-muted-foreground/15"
      )}
      onClick={onClick}
    >
      <UserAvatar src={member.profile?.imageUrl} className="size-7 md:size-8" />
      <p
        className={cn(
          "font-semibold text-sm text-muted-foreground transition",
          params?.memberId === member.id &&
            "text-primary dark:text-zinc-200 dark:group-hover:text-white text-sm"
        )}
      >
        {member.profile?.name}
      </p>
      {icon}
    </button>
  );
};

export default ServerMember;
