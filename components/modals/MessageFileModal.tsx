"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import FileUpload from "../FileUpload";
import { Form, FormField, FormItem } from "../ui/form";

import { useModal } from "@/hooks/useModalStore";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FileFormSchema } from "@/schemas";

const MessageFileModal = () => {
  const { isOpen, onClose, type, data } = useModal();

  const { query } = data;

  const isModalOpen = isOpen && type === "messageFile";

  const form = useForm({
    resolver: zodResolver(FileFormSchema),
    defaultValues: {
      file: {
        fileName: "",
        fileKey: "",
        fileUrl: "",
        fileType: "",
      },
    },
  });

  const createMessage = useMutation(api.messages.create);
  const createDirectMessage = useMutation(api.directMessages.create);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof FileFormSchema>) => {
    try {
      if (query?.type === "channel") {
        await createMessage({
          channelId: query?.channelId,
          memberId: query?.memberId,
          fileUrl: values.file.fileUrl,
          fileName: values.file.fileName,
          fileKey: values.file.fileKey,
          fileType: values.file.fileType,
          content: "",
          memberIcon: query.memberIcon,
          memberName: query.memberName,
        });
      } else {
        await createDirectMessage({
          conversationId: query?.conversationId,
          memberId: query?.memberId,
          fileUrl: values.file.fileUrl,
          fileName: values.file.fileName,
          fileKey: values.file.fileKey,
          fileType: values.file.fileType,
          content: "",
          memberIcon: query?.memberIcon,
          memberName: query?.memberName,
        });
      }
      form.reset();
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl font-bold text-center">
            Add an attachment
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500 px-2">
            Send file as a message.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FileUpload
                        endpoint="messageFile"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button disabled={isLoading} variant="primary">
                Send
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MessageFileModal;
