"use client"

import { useState } from "react"
import type { GameRoom, Player } from "@/types/game"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Crown, Users, Play, Copy, Check, UserPlus, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface GameLobbyProps {
  gameRoom: GameRoom
  currentPlayer: Player
  onStartGame: () => void
}

export function GameLobby({ gameRoom, currentPlayer, onStartGame }: GameLobbyProps) {
  const [copied, setCopied] = useState(false)
  const [inviteLink, setInviteLink] = useState("")

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(gameRoom.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("[v0] Failed to copy room code:", error)
    }
  }

  const copyInviteLink = async () => {
    const link = `${window.location.origin}/game/${gameRoom.code}`
    try {
      await navigator.clipboard.writeText(link)
      setInviteLink(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("[v0] Failed to copy invite link:", error)
    }
  }

  const canStartGame = currentPlayer.isHost && gameRoom.players.length >= 2

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Room Header */}
      <Card className="p-6 text-center card-shadow">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Game Lobby</h1>
            <p className="text-muted-foreground">Waiting for players to join...</p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Room Code:</span>
              <Badge variant="outline" className="text-lg font-mono px-3 py-1">
                {gameRoom.code}
              </Badge>
              <Button variant="ghost" size="sm" onClick={copyRoomCode}>
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={copyInviteLink}>
              <UserPlus className="w-4 h-4 mr-2" />
              Copy Invite Link
            </Button>
          </div>
        </div>
      </Card>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Players */}
        {gameRoom.players.map((player, index) => (
          <Card
            key={player.id}
            className={cn("p-4 card-shadow", player.id === currentPlayer.id && "ring-2 ring-primary")}
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                  {player.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{player.name}</span>
                  {player.isHost && <Crown className="w-4 h-4 text-yellow-500" />}
                  {player.id === currentPlayer.id && (
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Player {index + 1}</div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" title="Online" />
                {player.isHost && (
                  <Badge variant="outline" className="text-xs">
                    Host
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}

        {/* Empty Slots */}
        {Array.from({ length: gameRoom.maxPlayers - gameRoom.players.length }).map((_, index) => (
          <Card key={`empty-${index}`} className="p-4 border-dashed border-muted-foreground/50">
            <div className="flex items-center gap-3 opacity-50">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-muted">
                  <Users className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium text-muted-foreground">Waiting for player...</div>
                <div className="text-sm text-muted-foreground">Player {gameRoom.players.length + index + 1}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Game Settings */}
      <Card className="p-4 card-shadow">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Game Settings</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Max Players:</span>
            <div className="font-medium">{gameRoom.maxPlayers}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Game Type:</span>
            <div className="font-medium">13 Card Rummy</div>
          </div>
          <div>
            <span className="text-muted-foreground">Network:</span>
            <div className="font-medium">Intranet Only</div>
          </div>
          <div>
            <span className="text-muted-foreground">Created:</span>
            <div className="font-medium">{new Date(gameRoom.createdAt).toLocaleTimeString()}</div>
          </div>
        </div>
      </Card>

      {/* Game Rules */}
      <Card className="p-4 card-shadow">
        <h3 className="font-semibold mb-3">Quick Rules Reminder</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-primary">Objective</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Form valid sequences and sets</li>
              <li>• Need at least 1 pure sequence</li>
              <li>• Declare when you have valid combinations</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-primary">Scoring</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Face cards: 10 points each</li>
              <li>• Ace: 10 points</li>
              <li>• Number cards: Face value</li>
              <li>• Jokers: 0 points</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Start Game Button */}
      <div className="text-center">
        {currentPlayer.isHost ? (
          <div className="space-y-3">
            <Button
              size="lg"
              onClick={onStartGame}
              disabled={!canStartGame}
              className="px-8 py-3 text-lg font-semibold"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Game
            </Button>
            {!canStartGame && (
              <p className="text-sm text-muted-foreground">Need at least 2 players to start the game</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-muted-foreground">Waiting for host to start the game...</p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            </div>
          </div>
        )}
      </div>

      {/* Player Count Status */}
      <div className="text-center">
        <Badge variant="outline" className="px-4 py-2">
          <Users className="w-4 h-4 mr-2" />
          {gameRoom.players.length} / {gameRoom.maxPlayers} Players
        </Badge>
      </div>
    </div>
  )
}
