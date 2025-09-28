"use client";

import { Search } from "lucide-react";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Skeleton } from "../ui/skeleton";

interface ServerSearchProps {
  data: {
    label: string;
    type: string;
    data:
      | {
          icon: React.ReactNode;
          name?: string;
          id: string;
        }[]
      | undefined;
  }[];
}

export const ServerSearchSkeleton = () => {
  return (
    <div className="group px-2 py-2 rounded-md flex items-center gap-x-2 w-full">
      <Skeleton className="size-4 rounded-full" />
      <Skeleton className="h-4 w-16 rounded" />
    </div>
  );
};

const ServerSearch = ({ data }: ServerSearchProps) => {
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);

    return () => document.removeEventListener("keydown", down);
  }, []);

  const onClick = ({ id, type }: { id: string; type: string }) => {
    setOpen(false);

    if (type === "member") {
      return router.push(`/servers/${params?.serverId}/conversations/${id}`);
    }

    if (type === "channel") {
      return router.push(`/servers/${params?.serverId}/channels/${id}`);
    }
  };

  return (
    <>
      <button
        className="group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-muted-foreground/10"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <p className="font-semibold text-sm">Search</p>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search all channels and members" />
        <CommandList className="custom-scrollbar">
          <CommandEmpty>No results found</CommandEmpty>
          {data.map(({ label, type, data }) => {
            if (!data?.length) return null;
            return (
              <CommandGroup key={label} heading={label}>
                {data.map(({ id, icon, name }) => {
                  return (
                    <CommandItem
                      key={id}
                      className="cursor-pointer text-muted-foreground"
                      onSelect={() => onClick({ id, type })}
                    >
                      {icon}
                      <span>{name}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default ServerSearch;
