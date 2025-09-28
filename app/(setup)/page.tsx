"use client";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useConvexAuth, useMutation } from "convex/react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InitialModal from "@/components/modals/InitialModal";
import { useQuery } from "convex-helpers/react/cache/hooks";

export default function SetupPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const getOrCreateProfile = useMutation(api.profiles.getOrCreateProfile);

  const [profile, setProfile] = useState<Doc<"profiles"> | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }

    if (!profile) {
      (async () => {
        try {
          const newProfile = await getOrCreateProfile({});
          setProfile(newProfile);
        } catch (err) {
          console.error("Error creating profile:", err);
        }
      })();
    }
  }, [isAuthenticated, isLoading, router, getOrCreateProfile, profile]);

  const server = useQuery(
    api.servers.getServerForProfile,
    profile ? {} : "skip"
  );

  useEffect(() => {
    if (server) {
      router.push(`/servers/${server.id}`);
    }
  }, [server, router]);

  if (isLoading || server === undefined || !profile)
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        Redirecting to Server
      </div>
    );

  if (server === null) {
    return <InitialModal />;
  }

  return null;
}
