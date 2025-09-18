"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wifi, Play, UserPlus, AlertCircle, User } from "lucide-react"
import { useSocket } from "@/hooks/use-socket"
import { PlayerSelector } from "@/components/player-selector"
import { ProductionNotice } from "@/components/production-notice"
import { PlayerAuthManager } from "@/lib/player-auth"
import type { GameRoom } from "@/types/game"
import type { PlayerProfile } from "@/types/player"

export default function RummyHomePage() {
  const router = useRouter()
  const [currentPlayer, setCurrentPlayer] = useState<PlayerProfile | null>(null)
  const [roomCode, setRoomCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPlayerSelector, setShowPlayerSelector] = useState(true)

  const { socket, isConnected, createRoom, joinRoom } = useSocket()

  useEffect(() => {
    // Check for existing session
    const session = PlayerAuthManager.getCurrentSession()
    if (session) {
      const profile = PlayerAuthManager.getOrCreateProfile(session.playerName)
      setCurrentPlayer(profile)
      setShowPlayerSelector(false)
    }
  }, [])

  useEffect(() => {
    if (socket && currentPlayer) {
      socket.on("room-created", (data: { roomCode: string; gameRoom: GameRoom }) => {
        console.log("[v0] Room created:", data.roomCode)
        setIsLoading(false)

        // Create session and save game start
        PlayerAuthManager.createSession(currentPlayer.id, currentPlayer.name)

        router.push(`/game/${data.roomCode}?player=${encodeURIComponent(currentPlayer.name)}`)
      })

      socket.on("room-joined", (gameRoom: GameRoom) => {
        console.log("[v0] Room joined:", gameRoom.code)
        setIsLoading(false)

        // Create session
        PlayerAuthManager.createSession(currentPlayer.id, currentPlayer.name)

        router.push(`/game/${gameRoom.code}?player=${encodeURIComponent(currentPlayer.name)}`)
      })

      socket.on("join-error", (errorMessage: string) => {
        console.error("[v0] Join error:", errorMessage)
        setError(errorMessage)
        setIsLoading(false)
      })

      socket.on("create-error", (errorMessage: string) => {
        console.error("[v0] Create error:", errorMessage)
        setError(errorMessage)
        setIsLoading(false)
      })

      return () => {
        socket.off("room-created")
        socket.off("room-joined")
        socket.off("join-error")
        socket.off("create-error")
      }
    }
  }, [socket, router, currentPlayer])

  const handlePlayerSelect = (profile: PlayerProfile) => {
    setCurrentPlayer(profile)
    setShowPlayerSelector(false)
    PlayerAuthManager.createSession(profile.id, profile.name)
  }

  const handleCreateGame = () => {
    if (!currentPlayer) return

    if (!isConnected) {
      setError("Not connected to server. Please wait and try again.")
      return
    }

    setError("")
    setIsLoading(true)

    const playerData = {
      id: currentPlayer.id,
      name: currentPlayer.name,
    }

    createRoom(playerData)
  }

  const handleJoinGame = () => {
    if (!currentPlayer) return

    if (!roomCode.trim()) {
      setError("Please enter a room code")
      return
    }

    if (!isConnected) {
      setError("Not connected to server. Please wait and try again.")
      return
    }

    setError("")
    setIsLoading(true)

    const playerData = {
      id: currentPlayer.id,
      name: currentPlayer.name,
    }

    joinRoom(roomCode.trim().toUpperCase(), playerData)
  }

  if (showPlayerSelector) {
    return (
      <div className="min-h-screen game-table flex items-center justify-center p-4">
        <div className="w-full max-w-4xl animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold gradient-text mb-4">13 Card Indian Rummy</h1>
            <p className="text-xl text-muted-foreground">Choose your player to begin</p>
          </div>
          <Card className="p-8 card-shadow card-hover">
            <PlayerSelector onPlayerSelect={handlePlayerSelect} />
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen game-table flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8 animate-slide-in-up">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold gradient-text">13 Card Indian Rummy</h1>
          <p className="text-xl text-gray-600">Local Network Multiplayer Game</p>
          <Badge className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-100 text-blue-800">
            <Wifi className="w-4 h-4" />
            Intranet Only
          </Badge>
        </div>

        {/* Production Notice */}
        {process.env.NODE_ENV === "production" && <ProductionNotice />}

        {/* Current Player */}
        {currentPlayer && (
          <Card className="p-6 card-shadow card-hover bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="font-bold text-white text-xl">{currentPlayer.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <div className="font-semibold text-lg text-gray-900">{currentPlayer.name}</div>
                  <div className="text-sm text-gray-600">
                    {currentPlayer.stats.gamesPlayed} games • {currentPlayer.stats.winRate.toFixed(0)}% win rate
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowPlayerSelector(true)} className="hover:bg-orange-500 hover:text-white border-orange-500 text-orange-500">
                <User className="w-4 h-4 mr-2" />
                Switch
              </Button>
            </div>
          </Card>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Menu Card */}
        <Card className="p-8 card-shadow card-hover space-y-6 bg-white">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <Button
                className="w-full h-14 text-lg font-semibold btn-primary"
                disabled={!currentPlayer || isLoading || !isConnected}
                onClick={handleCreateGame}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Game...
                  </div>
                ) : (
                  <>
                    <Play className="w-6 h-6 mr-3" />
                    Create New Game
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or join existing</span>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Enter room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full text-center text-xl font-mono input-enhanced h-12"
                  maxLength={6}
                  disabled={isLoading}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && currentPlayer && roomCode.trim()) {
                      handleJoinGame()
                    }
                  }}
                />
                <Button
                  variant="secondary"
                  className="w-full h-14 text-lg font-semibold btn-secondary"
                  disabled={!currentPlayer || !roomCode.trim() || isLoading || !isConnected}
                  onClick={handleJoinGame}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Joining Game...
                    </div>
                  ) : (
                    <>
                      <UserPlus className="w-6 h-6 mr-3" />
                      Join Game
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Game Rules Summary */}
        <Card className="p-6 card-shadow card-hover bg-white">
          <h3 className="font-semibold mb-4 text-orange-600 text-lg">Quick Rules</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
              Form sequences and sets with 13 cards
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
              Need at least 1 pure sequence to declare
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
              2-4 players supported
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
              Points calculated based on unmatched cards
            </li>
          </ul>
        </Card>

        {/* Connection Status */}
        <div className="text-center">
          <Badge 
            variant={isConnected ? "default" : "destructive"}
            className={`px-4 py-2 text-sm ${isConnected ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}
          >
            {isConnected ? "🟢 Connected to Server" : "🔴 Connecting to Server..."}
          </Badge>
        </div>
      </div>
    </div>
  )
}
