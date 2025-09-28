"use client";

import { Smile } from "lucide-react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { EmojiStyle, Theme } from "emoji-picker-react";

interface EmojiPickerProps {
  onChange: (value: string) => void;
}

// Dynamic import to prevent SSR issues
const Picker = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.default),
  {
    ssr: false,
  }
);

const EmojiPicker = ({ onChange }: EmojiPickerProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger>
        <Smile className="text-muted-foreground transition" />
      </PopoverTrigger>
      <PopoverContent
        side="right"
        sideOffset={40}
        className="bg-transparent border-none shadow-none drop-shadow-none mb-16"
      >
        <Picker
          theme={resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT}
          onEmojiClick={(emojiData: any) => onChange(emojiData.emoji)}
          width={350}
          height={450}
          emojiStyle={EmojiStyle.APPLE}
        />
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
