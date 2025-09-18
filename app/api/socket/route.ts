import type { NextRequest } from "next/server"
import { getSocketServer } from "@/lib/socket-server"

export async function GET(req: NextRequest) {
  const io = getSocketServer()
  
  if (io) {
    return new Response("Socket.IO server is running", { status: 200 })
  } else {
    return new Response("Socket.IO server not initialized", { status: 500 })
  }
}
