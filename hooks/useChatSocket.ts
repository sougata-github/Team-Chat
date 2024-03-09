import { useSocket } from "@/components/providers/SocketProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { Member, Message, Profile } from "@prisma/client";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
};

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey,
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData;
        }

        const newData = oldData.pages.map((page: any) => {
          return {
            ...page,
            items: page.items.map((item: MessageWithMemberWithProfile) => {
              if (item.id === message.id) {
                return message;
              }
              return item;
            }),
          };
        });
        return { ...oldData, pages: newData };
      });
    });

    socket.on(addKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [
              {
                items: [message],
              },
            ],
          };
        }

        const newData = [...oldData.pages];

        newData[0] = {
          ...newData[0],
          items: [message, ...newData[0].items],
        };

        return {
          ...oldData,
          pages: newData,
        };
      });
    });

    return () => {
      socket.off(addKey);
      socket.off(updateKey);
    };
  }, [queryClient, addKey, queryKey, socket, updateKey]);
};

/*The WebSocket instance receives messages from the server, 
and when specific messages are received (identified by the addKey and updateKey), the useChatSocket hook uses React Query's setQueryData function to update the query data stored in the client-side cache.

When a message is received with the addKey, it means a new message should be added to the list of messages. The hook then updates the query data accordingly by adding the new message to the existing list of messages.

Similarly, when a message is received with the updateKey, it means an existing message has been updated. In this case, the hook finds the corresponding message in the list and replaces it with the updated message.

By updating the query data in this manner, React Query automatically triggers re-renders of components that are subscribed to this data, ensuring that the UI stays up-to-date with the latest information received from the WebSocket server.*/
