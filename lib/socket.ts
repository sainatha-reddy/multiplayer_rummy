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

  connect(): Socket | null {
    if (!this.socket) {
      // Determine socket URL based on environment
      let socketUrl: string
      
      if (process.env.NODE_ENV === "development") {
        socketUrl = "http://localhost:3001"
      } else {
        // In production, use the environment variable
        socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || ""
        
        if (!socketUrl) {
          console.log("[v0] Socket.IO server not available in production - no NEXT_PUBLIC_SOCKET_URL set")
          return null
        }
      }
      
      console.log("[v0] Connecting to Socket.IO server:", socketUrl)
      
      this.socket = io(socketUrl, {
        transports: ["websocket", "polling"],
        timeout: 5000,
        forceNew: true,
      })

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
