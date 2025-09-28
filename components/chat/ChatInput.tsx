"use client";

import { useForm } from "react-hook-form";
import { useModal } from "@/hooks/useModalStore";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Paperclip } from "lucide-react";

import EmojiPicker from "../EmojiPicker";

import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem } from "../ui/form";

interface ChatInputProps {
  memberName: string;
  memberIcon: string;
  memberId: string;
  channelId?: string;
  name: string;
  type: "conversation" | "channel";
  conversationId?: string;
}

const formSchema = z.object({
  content: z.string().min(1),
});

const ChatInput = ({
  memberName,
  memberIcon,
  memberId,
  channelId,
  name,
  type,
  conversationId,
}: ChatInputProps) => {
  const { onOpen } = useModal();
  const router = useRouter();

  const createMessage = useMutation(api.messages.create);
  const createDirectMessage = useMutation(api.directMessages.create);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (type === "channel" && channelId) {
        await createMessage({
          channelId: channelId,
          content: values.content,
          memberId,
          memberName,
          memberIcon,
        });
      } else if (type === "conversation" && conversationId) {
        await createDirectMessage({
          memberId,
          memberName,
          memberIcon,
          conversationId,
          content: values.content,
        });
      }
      form.reset();
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative p-4 pb-6">
                  <Button
                    type="button"
                    onClick={() =>
                      onOpen("messageFile", {
                        query: {
                          type,
                          memberId,
                          memberName,
                          memberIcon,
                          channelId,
                          conversationId,
                        },
                      })
                    }
                    className="absolute top-7 left-8 size-6.5 transition rounded-full p-1 bg-transparent hover:bg-muted-foreground/20 text-muted-foreground"
                  >
                    <Paperclip />
                  </Button>
                  <Input
                    disabled={isLoading}
                    className="px-14 py-6 bg-muted-foreground/15 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder={`Message ${
                      type === "conversation" ? name : "#" + name
                    }`}
                    {...field}
                    autoComplete="off"
                  />
                  <div className="absolute top-7 right-8">
                    <EmojiPicker
                      onChange={(emoji: string) =>
                        field.onChange(`${field.value} ${emoji}`)
                      }
                    />
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default ChatInput;
