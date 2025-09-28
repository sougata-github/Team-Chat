"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import UserAvatar from "../UserAvatar";
import { ScrollArea } from "../ui/scroll-area";

import { useState } from "react";
import { useModal } from "@/hooks/useModalStore";

import {
  Check,
  Gavel,
  Loader2,
  MoreVertical,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache/hooks";

const roleIconMap: Record<string, React.ReactNode | null> = {
  guest: null,
  moderator: <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />,
  admin: <ShieldAlert className="h-4 w-4 mr-2 text-rose-500" />,
};

const MembersModal = () => {
  const { isOpen, onClose, type, data, setData } = useModal();

  const [loadingId, setLoadingId] = useState("");

  const { isAuthenticated } = useConvexAuth();
  const profile = useQuery(
    api.profiles.getProfileByClerkId,
    isAuthenticated ? {} : "skip"
  );

  const kickMember = useMutation(api.members.deleteMember);
  const updateMemberRole = useMutation(api.members.updateMemberRole);

  const { serverMembersWithProfiles, server } = data;

  const isModalOpen = isOpen && type === "members";

  const onKick = async (memberId: string) => {
    try {
      setLoadingId(memberId);
      if (serverMembersWithProfiles && server) {
        const updatedServerMembersWithProfiles = await kickMember({
          serverId: server.id,
          memberId,
        });

        setData({
          serverMembersWithProfiles: updatedServerMembersWithProfiles,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingId("");
    }
  };

  const onRoleChange = async (memberId: string, role: string) => {
    try {
      setLoadingId(memberId);
      if (serverMembersWithProfiles && server) {
        const updatedServerMembersWithProfiles = await updateMemberRole({
          serverId: server.id,
          memberId,
          role,
        });
        setData({
          serverMembersWithProfiles: updatedServerMembersWithProfiles,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingId("");
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black overflow-hidden">
        <DialogHeader className="pt-4 px-6">
          <DialogTitle className="text-2xl font-bold text-center">
            Manage Members
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            {serverMembersWithProfiles?.length === 1
              ? `${serverMembersWithProfiles?.length} Member`
              : `${serverMembersWithProfiles?.length} Members`}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-4 max-h-[420px] pr-6">
          {serverMembersWithProfiles?.map((member) => (
            <div key={member.id} className="flex items-center gap-x-2 mb-4">
              <UserAvatar src={member?.profile?.imageUrl} />
              <div className="flex flex-col gap-y-1">
                <div className="text-sm font-medium flex items-center gap-x-1">
                  {member?.profile?.name}
                  {roleIconMap[member.role]}
                </div>
                <p className="text-xs text-muted-foreground">
                  {member?.profile?.email}
                </p>
              </div>
              {profile &&
                profile.id !== member.profileId &&
                loadingId !== member.id && (
                  <div className="ml-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="left">
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="flex items-center">
                            <ShieldQuestion className="w-4 h-4 mr-2" />
                            <span>Role</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem
                                onClick={() => onRoleChange(member.id, "guest")}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Guest
                                {member.role === "guest" && (
                                  <Check className="h-4 w-4 ml-auto" />
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  onRoleChange(member.id, "moderator")
                                }
                              >
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Moderator
                                {member.role === "moderator" && (
                                  <Check className="h-4 w-4 ml-2" />
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onKick(member.id)}>
                          <Gavel className="h-4 w-4 mr-2" />
                          Kick
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              {loadingId === member.id && (
                <Loader2 className="animate-spin text-zinc-500 ml-auto w-4 h-4 " />
              )}
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MembersModal;
