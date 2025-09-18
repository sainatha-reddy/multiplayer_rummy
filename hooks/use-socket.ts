"use client"

import { useEffect, useState, useCallback } from "react"
import SocketManager from "@/lib/socket"
import type { Socket } from "socket.io-client"

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socketManager = SocketManager.getInstance()
    const socketInstance = socketManager.connect()

    setSocket(socketInstance)

    const handleConnect = () => {
      console.log("[v0] Socket connected")
      setIsConnected(true)
    }

    const handleDisconnect = () => {
      console.log("[v0] Socket disconnected")
      setIsConnected(false)
    }

    socketInstance.on("connect", handleConnect)
    socketInstance.on("disconnect", handleDisconnect)

    return () => {
      socketInstance.off("connect", handleConnect)
      socketInstance.off("disconnect", handleDisconnect)
    }
  }, [])

  const joinRoom = useCallback(
    (roomCode: string, playerData: any) => {
      if (socket) {
        socket.emit("join-room", { roomCode, playerData })
      }
    },
    [socket],
  )

  const createRoom = useCallback(
    (playerData: any) => {
      if (socket) {
        socket.emit("create-room", playerData)
      }
    },
    [socket],
  )

  const leaveRoom = useCallback(() => {
    if (socket) {
      socket.emit("leave-room")
    }
  }, [socket])

  return {
    socket,
    isConnected,
    joinRoom,
    createRoom,
    leaveRoom,
  }
}
