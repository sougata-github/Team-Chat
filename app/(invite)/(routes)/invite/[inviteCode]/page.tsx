"use client";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useConvexAuth, useMutation } from "convex/react";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RedirectToSignIn } from "@clerk/nextjs";

export default function InvitePage() {
  const params = useParams();
  const inviteCode = Array.isArray(params?.inviteCode)
    ? params?.inviteCode[0]
    : params?.inviteCode;

  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();

  const joinByInvite = useMutation(api.servers.joinByInvite);
  const getOrCreateProfile = useMutation(api.profiles.getOrCreateProfile);

  const [loading, setLoading] = useState(true);
  const [server, setServer] = useState<Doc<"servers"> | null>(null);
  const [profile, setProfile] = useState<Doc<"profiles"> | null>(null);

  useEffect(() => {
    if (!profile && isAuthenticated) {
      (async () => {
        try {
          const newProfile = await getOrCreateProfile({});
          setProfile(newProfile);
        } catch (err) {
          console.error("Error creating profile:", err);
        }
      })();
    }
  }, [isLoading, isAuthenticated, profile, getOrCreateProfile, router]);

  useEffect(() => {
    if (isLoading || !profile || !isAuthenticated) return;

    if (!inviteCode) {
      router.push("/");
      return;
    }

    (async () => {
      try {
        const server = await joinByInvite({ inviteCode: inviteCode as string });
        setServer(server);
        if (server) {
          router.push(`/servers/${server.id}`);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to join server", err);
        setLoading(false);
      }
    })();
  }, [isLoading, profile, inviteCode, joinByInvite, router]);

  if (!isLoading && !isAuthenticated) {
    return <RedirectToSignIn />;
  }

  if (isLoading || loading || !profile) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        Redirecting to Server
      </div>
    );
  }

  if (!isLoading && !loading && profile && server === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        Invalid Server Code
      </div>
    );
  }

  return null;
}
