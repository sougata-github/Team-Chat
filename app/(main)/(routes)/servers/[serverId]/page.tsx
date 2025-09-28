"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache/hooks";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const Page = () => {
  const params = useParams();
  const serverId = Array.isArray(params?.serverId)
    ? params?.serverId[0]
    : params?.serverId;

  const router = useRouter();

  const profile = useQuery(api.profiles.getProfileByClerkId);

  const generalChannel = useQuery(
    api.servers.getInitialChannel,
    profile
      ? {
          serverId: serverId as string,
        }
      : "skip"
  );

  useEffect(() => {
    if (generalChannel) {
      router.replace(`/servers/${serverId}/channels/${generalChannel.id}`);
    }
  }, [router, generalChannel, serverId]);

  if (generalChannel === null)
    return (
      <div className="sticky top-[50%] flex items-center justify-center">
        You are not a member of this server
      </div>
    );

  if (generalChannel === undefined || profile === undefined) {
    <div className="sticky top-[50%] flex items-center justify-center">
      Redirecting to General Channel
    </div>;
  }

  return null;
};

export default Page;
