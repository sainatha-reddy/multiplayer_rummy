"use client"

import { io, type Socket } from "socket.io-client"

class SocketManager {
  private socket: Socket | null = null
  private static instance: SocketManager

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager()
    }
    return SocketManager.instance
  }

  connect(): Socket {
    if (!this.socket) {
      // Connect to Socket.IO server on port 3001
      this.socket = io(
        process.env.NODE_ENV === "development" ? "http://localhost:3001" : `http://${window.location.hostname}:3001`,
        {
          transports: ["websocket", "polling"],
          timeout: 5000,
          forceNew: true,
        },
      )

      this.socket.on("connect", () => {
        console.log("[v0] Connected to game server")
      })

      this.socket.on("disconnect", () => {
        console.log("[v0] Disconnected from game server")
      })

      this.socket.on("connect_error", (error) => {
        console.log("[v0] Connection error:", error)
      })
    }
    return this.socket
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }
}

export default SocketManager
