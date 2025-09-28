import { Hash } from "lucide-react";


interface ChatWelcomeProps {
  name: string;
  type: "channel" | "conversation";
}

const ChatWelcome = ({ name, type }: ChatWelcomeProps) => {
  return (
    <div className="space-y-2 px-4 mb-4">
      {type === "channel" && (
        <div className="h-[75px] w-[75px] rounded-full bg-muted-foreground/15 flex items-center justify-center">
          <Hash className="size-12 text-muted-foreground" />
        </div>
      )}
      <p className="text-xl md:text-3xl font-bold">
        {type === "channel" ? "Welcome to #" : ""} {name}
      </p>
      <p className=" text-muted-foreground text-sm">
        {type === "channel"
          ? `This is the start of the #${name}`
          : `This is the start of your conversation with ${name}.`}
      </p>
    </div>
  );
};

export default ChatWelcome;
