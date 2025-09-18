"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { GameBoard } from "@/components/game-board"
import { GameLobby } from "@/components/game-lobby"
import { GameResults } from "@/components/game-results"
import { useGameLogic } from "@/hooks/use-game-logic"
import { useSocket } from "@/hooks/use-socket"
import type { GameRoom, Player } from "@/types/game"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Wifi, WifiOff } from "lucide-react"

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const roomCode = params.roomCode as string

  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")

  const { gameRoom, setGameRoom, executeAction, isGameOver, getWinner } = useGameLogic()
  const { socket, isConnected, joinRoom, leaveRoom } = useSocket()

  // Check if we're in production without socket server or socket URL
  if (process.env.NODE_ENV === "production" && (!socket || !process.env.NEXT_PUBLIC_SOCKET_URL)) {
    return (
      <div className="min-h-screen game-table flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
            <WifiOff className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Demo Mode</h2>
            <p className="text-gray-600 mb-4">
              Multiplayer features are not available in this demo. The full game requires a separate Socket.IO server.
            </p>
            <Button onClick={() => router.push("/")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (socket) {
      setConnectionStatus(isConnected ? "connected" : "disconnected")

      // Socket event listeners
      socket.on("game-state-updated", (updatedGameRoom: GameRoom) => {
        console.log("[v0] Game state updated:", updatedGameRoom)
        setGameRoom(updatedGameRoom)
      })

      socket.on("player-joined", (updatedGameRoom: GameRoom) => {
        console.log("[v0] Player joined:", updatedGameRoom)
        setGameRoom(updatedGameRoom)
      })

      socket.on("player-left", (updatedGameRoom: GameRoom) => {
        console.log("[v0] Player left:", updatedGameRoom)
        setGameRoom(updatedGameRoom)
      })

      socket.on("game-started", (updatedGameRoom: GameRoom) => {
        console.log("[v0] Game started:", updatedGameRoom)
        setGameRoom(updatedGameRoom)
      })

      socket.on("join-error", (error: string) => {
        console.error("[v0] Join error:", error)
        alert(`Failed to join game: ${error}`)
        router.push("/")
      })

      return () => {
        socket.off("game-state-updated")
        socket.off("player-joined")
        socket.off("player-left")
        socket.off("game-started")
        socket.off("join-error")
      }
    }
  }, [socket, isConnected, setGameRoom, router])

  const handleLeaveGame = () => {
    if (socket && currentPlayer) {
      leaveRoom()
    }
    router.push("/")
  }

  const renderGameContent = () => {
    if (!gameRoom || !currentPlayer) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground">Loading game...</p>
          </div>
        </div>
      )
    }

    if (gameRoom.gameState === "waiting") {
      return (
        <GameLobby
          gameRoom={gameRoom}
          currentPlayer={currentPlayer}
          onStartGame={() => {
            if (socket && currentPlayer.isHost) {
              socket.emit("start-game")
            }
          }}
        />
      )
    }

    if (gameRoom.gameState === "finished") {
      const winner = getWinner()
      return (
        <GameResults
          gameRoom={gameRoom}
          winner={winner}
          currentPlayer={currentPlayer}
          onPlayAgain={() => {
            // Handle play again logic
            router.push("/")
          }}
        />
      )
    }

    return (
      <GameBoard
        gameRoom={gameRoom}
        currentPlayer={currentPlayer}
        onGameAction={(action, data) => {
          try {
            const updatedRoom = executeAction(currentPlayer.id, action, data)
            if (socket && updatedRoom) {
              socket.emit("game-action", {
                roomCode: gameRoom.code,
                playerId: currentPlayer.id,
                action,
                data,
              })
            }
          } catch (error) {
            console.error("[v0] Game action failed:", error)
            alert("Invalid move. Please try again.")
          }
        }}
      />
    )
  }

  return (
    <div className="min-h-screen game-table">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleLeaveGame}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Leave Game
              </Button>
              <div className="text-lg font-semibold">Room: {roomCode}</div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                {connectionStatus === "connected" ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-green-500">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">
                      {connectionStatus === "connecting" ? "Connecting..." : "Disconnected"}
                    </span>
                  </>
                )}
              </div>

              {gameRoom && (
                <div className="text-sm text-muted-foreground">
                  Round {gameRoom.round} • {gameRoom.players.length}/{gameRoom.maxPlayers} players
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">{renderGameContent()}</div>
    </div>
  )
}
