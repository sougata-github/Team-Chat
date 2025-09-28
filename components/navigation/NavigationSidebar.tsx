"use client";

import { useRouter } from "next/navigation";

import NavigationAction from "./NavigationAction";
import NavigationItem from "./NavigationItem";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { ModeToggle } from "../ModeToggle";

import { SignOutButton } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { useConvexAuth, useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

const NavigationSkeleton = () => {
  return (
    <div className="space-y-4 flex flex-col items-center h-full text-primary w-full border-r py-3">
      <Skeleton className="size-7 rounded-full" />
      <Separator />
      <div className="flex flex-col gap-4">
        {[...new Array(5)].fill(1).map((_, index) => (
          <Skeleton className="size-7 rounded-[16px]" key={index} />
        ))}
      </div>
      <div className="mt-auto pb-3 flex flex-col gap-y-4 items-center">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="size-6 rounded-full" />
      </div>
    </div>
  );
};

const UserButton = ({
  displayName,
  imageUrl,
  email,
}: {
  displayName: string;
  imageUrl: string;
  email: string;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Open user menu"
          className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Avatar className="size-8">
            <AvatarImage src={imageUrl} alt={displayName} />
          </Avatar>
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-fit max-w-xs bg-background" align="end">
        <div className="p-4 flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage src={imageUrl} alt={displayName} />
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{displayName}</p>
            {email ? (
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            ) : null}
          </div>
        </div>
        <Separator />
        <div className="p-2">
          <SignOutButton redirectUrl="/sign-in">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </SignOutButton>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const NavigationSidebar = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const getOrCreateProfile = useMutation(api.profiles.getOrCreateProfile);

  const [profile, setProfile] = useState<Doc<"profiles"> | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      (async () => {
        const p = await getOrCreateProfile({});
        setProfile(p);
      })();
    }
  }, [isAuthenticated, isLoading, getOrCreateProfile, router]);

  const servers = useQuery(
    api.servers.getServersForProfile,
    isAuthenticated ? {} : "skip"
  );

  if (isLoading || !profile || servers === undefined) {
    return <NavigationSkeleton />;
  }

  return (
    <div className="space-y-4 flex flex-col items-center h-full text-primary w-full border-r py-3">
      <NavigationAction />
      <Separator />
      <ScrollArea className="flex-1 w-full">
        {servers.map((server) => (
          <div key={server!.id} className="mb-4">
            <NavigationItem
              id={server!.id}
              name={server!.name}
              imageUrl={server!.imageUrl}
            />
          </div>
        ))}
      </ScrollArea>
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <ModeToggle />
        <UserButton
          displayName={profile.name}
          imageUrl={profile.imageUrl}
          email={profile.email}
        />
      </div>
    </div>
  );
};

export default NavigationSidebar;
