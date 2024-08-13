import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";

import { NextApiResponseServerIo } from "@/types";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
    });
    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;

/*
 Sets up a SocketIO server in a Next.js Api route
  
 It checks if the io instance is already attached to the server socket.

 If not, it creates a new Socket.IO server instance and attaches it to the server socket.

 Sets up the Socket.IO server to listen on a specific path (/api/socket/io).
 
 Finally, it ends the API response.
*/
