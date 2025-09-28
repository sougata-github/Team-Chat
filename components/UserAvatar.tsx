import { cn } from "@/lib/utils";

import { Avatar, AvatarImage } from "./ui/avatar";


interface UserAvatarProps {
  src?: string;
  className?: string;
}

const UserAvatar = ({ src, className }: UserAvatarProps) => {
  return (
    <Avatar className={cn("size-7 md:size-9", className)}>
      <AvatarImage src={src} />
    </Avatar>
  );
};

export default UserAvatar;
