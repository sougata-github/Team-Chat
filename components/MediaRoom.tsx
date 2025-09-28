"use client";

import { useUser } from "@clerk/nextjs";

import { Loader2 } from "lucide-react";

import { useEffect, useState } from "react";

import { LiveKitRoom, VideoConference } from "@livekit/components-react";

import "@livekit/components-styles";

interface MediaRoomProps {
  chatId: string;
  video: boolean;
  audio: boolean;
}

const MediaRoom = ({ chatId, video, audio }: MediaRoomProps) => {
  const { user } = useUser();
  const [token, setToken] = useState();

  useEffect(() => {
    if (
      typeof user?.firstName == "undefined" ||
      typeof user?.lastName == "undefined"
    )
      return;

    function random4DigitNumber() {
      // Generate a random number between 1000 and 9999 (inclusive)
      return Math.floor(Math.random() * 9000) + 1000;
    }

    const name = `${user.firstName} ${user.lastName} - ${random4DigitNumber()}`;
    //the random4DigitNumber to prevent disconnected livekit if 2 person have same name.

    (async () => {
      try {
        const response = await fetch(
          `/api/livekit?room=${chatId}&username=${name}`
        );

        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [user?.firstName, user?.lastName, chatId]);

  if (token === "") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="size-7 text-muted-foreground animate-spin my-4" />
        <p className="text-xs text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      data-lk-theme="default"
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      video={video}
      audio={audio}
    >
      <VideoConference />
    </LiveKitRoom>
  );
};

export default MediaRoom;
