"use client";

import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";

import { ScrollArea } from "../ui/scroll-area";
import ServerSection from "./ServerSection";
import ServerChannel from "./ServerChannel";
import { Separator } from "../ui/separator";
import ServerSearch, { ServerSearchSkeleton } from "./ServerSearch";
import ServerMember from "./ServerMember";
import ServerHeader, { ServerHeaderSkeleton } from "./ServerHeader";
import { useParams } from "next/navigation";
import { Skeleton } from "../ui/skeleton";

const iconMap: Record<string, React.ReactNode> = {
  text: <Hash className="mr-2 h-4 w-4" />,
  audio: <Mic className="mr-2 h-4 w-4" />,
  video: <Video className="mr-2 h-4 w-4" />,
};

const roleIconMap: Record<string, React.ReactNode | null> = {
  guest: null,
  moderator: <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />,
  admin: <ShieldAlert className="h-4 w-4 mr-2 text-rose-500" />,
};

const SidebarSkeleton = () => {
  return (
    <div className="flex flex-col h-full text-primary w-full bg-background border-r">
      <ServerHeaderSkeleton />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearchSkeleton />
        </div>
        <Separator className="my-2" />
        <ul className="flex flex-col gap-5">
          {[...new Array(3)].fill(1).map((_, index) => (
            <div key={index}>
              <div className="flex justify-between items-center">
                <Skeleton className="h-2 rounded" />
              </div>
              <div className="flex flex-col gap-2">
                {[...new Array(2)].fill(1).map((_, index) => (
                  <div key={index}>
                    <Skeleton className="h-5 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-2 rounded" />
            </div>
            <div className="flex flex-col gap-4">
              {[...new Array(4)].fill(1).map((_, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Skeleton className="size-5  rounded-full" />
                  <Skeleton className="h-5 w-[80%]" />
                </div>
              ))}
            </div>
          </div>
        </ul>
      </ScrollArea>
    </div>
  );
};

const ServerSidebar = () => {
  const params = useParams<{
    serverId: string;
  }>();

  const { isLoading, isAuthenticated } = useConvexAuth();
  const profile = useQuery(
    api.profiles.getProfileByClerkId,
    isAuthenticated ? {} : "skip"
  );

  const server = useQuery(
    api.servers.getServerWithChannelsAndMembers,
    isAuthenticated
      ? {
          serverId: params.serverId,
        }
      : "skip"
  );

  if (isLoading || server === undefined || profile === undefined) {
    return <SidebarSkeleton />;
  }

  if (!server) return null;

  const textChannels = server.channels.filter((c) => c.type === "text");
  const audioChannels = server.channels.filter((c) => c.type === "audio");
  const videoChannels = server.channels.filter((c) => c.type === "video");

  //exclude logged-in user
  const members = server.membersWithProfiles.filter(
    (m) => m.profileId !== profile.id
  );
  //get logged-in user role
  const role = server.membersWithProfiles.find(
    (m) => m.profileId === profile.id
  )?.role;

  return (
    <div className="flex flex-col h-full text-primary w-full bg-background border-r">
      <ServerHeader
        serverMembersWithProfiles={server.membersWithProfiles}
        server={server.server}
        role={role}
      />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearch
            data={[
              {
                label: "Text Channels",
                type: "channel",
                data: textChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Audio Channels",
                type: "channel",
                data: audioChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Video Channels",
                type: "channel",
                data: videoChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Members",
                type: "member",
                data: members?.map((member) => ({
                  id: member.id,
                  name: member.profile?.name,
                  icon: roleIconMap[member.role],
                })),
              },
            ]}
          />
        </div>
        <Separator className="my-2" />
        {!!textChannels?.length && (
          <div className="mb-2">
            <ServerSection
              serverMembersWithProfiles={server.membersWithProfiles}
              sectionType="channels"
              channelType="text"
              role={role}
              label="Text Channels"
            />
            <div className="sapce-y-[2px]">
              {textChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  role={role}
                  channel={channel}
                  server={server.server}
                />
              ))}
            </div>
          </div>
        )}
        {!!audioChannels?.length && (
          <div className="mb-2">
            <ServerSection
              serverMembersWithProfiles={server.membersWithProfiles}
              sectionType="channels"
              channelType="audio"
              role={role}
              label="Audio Channels"
            />
            <div className="space-y-[2px]">
              {audioChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  role={role}
                  channel={channel}
                  server={server.server}
                />
              ))}
            </div>
          </div>
        )}
        {!!videoChannels?.length && (
          <div className="mb-2">
            <ServerSection
              serverMembersWithProfiles={server.membersWithProfiles}
              sectionType="channels"
              channelType="video"
              role={role}
              label="Video Channels"
            />
            <div className="space-y-[2px]">
              {videoChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  role={role}
                  channel={channel}
                  server={server.server}
                />
              ))}
            </div>
          </div>
        )}
        {!!members?.length && (
          <div className="mb-2">
            <ServerSection
              serverMembersWithProfiles={server.membersWithProfiles}
              sectionType="members"
              role={role}
              label="Members"
              server={server.server}
            />
            <div className="space-y-[2px]">
              {members.map((member) => (
                <ServerMember
                  key={member.id}
                  member={member}
                  server={server.server}
                />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ServerSidebar;
