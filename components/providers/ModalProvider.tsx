"use client";

import { useEffect, useState } from "react";

import {
  CreateServerModal,
  InviteModal,
  EditServerModal,
  MembersModal,
  CreateChannelModal,
  LeaveServerModal,
  DeleteServerModal,
  DeleteChannelModal,
  EditChannelModal,
  MessageFileModal,
} from "@/components/modals/index";

const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <CreateServerModal />
      <InviteModal />
      <EditServerModal />
      <MembersModal />
      <CreateChannelModal />
      <LeaveServerModal />
      <DeleteServerModal />
      <DeleteChannelModal />
      <EditChannelModal />
      <MessageFileModal />
    </>
  );
};

export default ModalProvider;
