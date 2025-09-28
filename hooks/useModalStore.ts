import { serverWithMemeberProfiles } from "@/components/server/ServerHeader";
import { Doc } from "@/convex/_generated/dataModel";
import { create } from "zustand";


export type ModalType =
  | "createServer"
  | "invite"
  | "editServer"
  | "members"
  | "createChannel"
  | "leaveServer"
  | "deleteServer"
  | "deleteChannel"
  | "editChannel"
  | "messageFile";

interface ModalData {
  serverMembersWithProfiles?: serverWithMemeberProfiles[] | null;
  server?: Doc<"servers">;
  channel?: Doc<"channels">;
  channelType?: string;
  apiUrl?: string;
  query?: Record<string, any>;
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onClose: () => void;
  setData: (data: ModalData) => void;
  onOpen: (type: ModalType, data?: ModalData) => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onClose: () => set({ type: null, isOpen: false }),
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  setData: (data) => set((state) => ({ data: { ...state.data, ...data } })),
}));
