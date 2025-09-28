"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import UserAvatar from "../UserAvatar";
import ActionTooltip from "../ActionTooltip";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem } from "../ui/form";

import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from "lucide-react";

import Image from "next/image";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface ChatItemProps {
  id: Id<"messages"> | Id<"directMessages">;
  type: "channel" | "conversation";
  content: string;
  member: (Doc<"members"> & { profile?: Doc<"profiles"> | null }) | null;
  memberName: string;
  memberIcon: string;
  timestamp: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  deleted: boolean;
  currentMember: Doc<"members">;
  isUpdated: boolean;
}

const roleIconMap: Record<string, React.ReactNode | null> = {
  guest: null,
  moderator: <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />,
  admin: <ShieldAlert className="h-4 w-4 mr-2 text-rose-500" />,
};

const formSchema = z.object({
  content: z.string().min(1),
});

const ChatItem = ({
  id,
  type,
  content,
  member,
  memberName,
  memberIcon,
  timestamp,
  fileUrl,
  fileName,
  fileType,
  deleted,
  currentMember,
  isUpdated,
}: ChatItemProps) => {
  const router = useRouter();
  const params = useParams();

  console.log();

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "Escape" || event.keyCode === 27) {
        setIsEditing(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [isEditing, setIsEditing] = useState(false);

  const updateMessage = useMutation(api.messages.update);
  const deleteMessage = useMutation(api.messages.remove);

  const updateDirectMessage = useMutation(api.directMessages.update);
  const deleteDirectMessage = useMutation(api.directMessages.remove);

  const isAuthor = currentMember._id === member?._id;

  const canDeleteMessage =
    type === "channel"
      ? (isAuthor && !deleted) || (!deleted && isAuthor)
      : !deleted && isAuthor;

  const canEditMessage = !deleted && isAuthor && !fileUrl;

  const isPDF = fileType === "application/pdf";
  const isImage = !isPDF && fileUrl;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: content,
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (values.content.trim().length === 0) return;

    try {
      if (type === "channel") {
        await updateMessage({
          id: id as Id<"messages">,
          content: values.content.trim(),
        });
      } else {
        await updateDirectMessage({
          id: id as Id<"directMessages">,
          content: values.content.trim(),
        });
      }
    } catch (error) {
      console.log(error);
    }

    form.reset();
    setIsEditing(false);
  };

  const onDelete = async () => {
    try {
      if (type === "channel") {
        await deleteMessage({
          id: id as Id<"messages">,
        });
      } else {
        await deleteDirectMessage({
          id: id as Id<"directMessages">,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    form.reset({
      content: content,
    });
  }, [content, form]);

  const onMemberClick = () => {
    if (member?.id === currentMember.id) {
      return;
    }
    router.push(`/servers/${params?.serverId}/conversations/${member?.id}`);
  };

  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-x-2 items-start w-full">
        <div
          className="cursor-pointer hover:drop-shadow-md transition"
          onClick={onMemberClick}
        >
          <UserAvatar src={memberIcon} />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p
                className="font-semibold text-sm hover:underline cursor-pointer mr-1.5"
                onClick={onMemberClick}
              >
                {memberName}
              </p>
              <ActionTooltip label={member?.role}>
                {member && roleIconMap[member.role]}
              </ActionTooltip>
            </div>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>
          {isImage && !deleted && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48"
            >
              <Image
                src={fileUrl}
                alt={`${fileName}`}
                fill
                className="object-cover"
              />
            </a>
          )}
          {isPDF && !deleted && (
            <div className="relative flex items-center p-2 mt-2 rounded-md">
              <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
              <a
                href={fileUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
              >
                {fileName}
              </a>
            </div>
          )}
          {deleted && (
            <p className="italic text-zinc-500 dark:text-zinc-400 text-xs mt-1">
              This message has been deleted
            </p>
          )}
          {!fileUrl && !isEditing && !deleted && (
            <p className={cn("text-sm")}>
              {content}
              {isUpdated && !deleted && (
                <span className="text-[10px] mx-2 text-muted-foreground">
                  (edited)
                </span>
              )}
            </p>
          )}
          {!fileUrl && isEditing && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex items-center w-full gap-x-2 pt-2"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            disabled={isLoading}
                            className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-muted-foreground"
                            placeholder="Edited message"
                            {...field}
                            autoComplete="off"
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  disabled={isLoading}
                  size="sm"
                  variant="primary"
                  className="mr-2"
                >
                  Save
                </Button>
              </form>
              <span className="text-[10px] mt-1 text-muted-foreground">
                Press escape to cancel, enter to save
              </span>
            </Form>
          )}
        </div>
      </div>
      {canDeleteMessage && (
        <div className="hidden group-hover:flex items-center gap-x-2 p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
          {canEditMessage && (
            <ActionTooltip label="Edit">
              <Edit
                className="cursor-pointer ml-auto w-4 h-4 text-muted-foreground transition"
                onClick={() => setIsEditing(true)}
              />
            </ActionTooltip>
          )}
          <ActionTooltip label="Delete">
            <Trash
              className="cursor-pointer ml-auto w-4 h-4 text-muted-foreground"
              onClick={onDelete}
            />
          </ActionTooltip>
        </div>
      )}
    </div>
  );
};

export default ChatItem;
