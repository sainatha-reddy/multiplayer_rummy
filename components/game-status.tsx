"use client"

import type { GameRoom, Player } from "@/types/game"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users } from "lucide-react"

interface GameStatusProps {
  gameRoom: GameRoom
  currentPlayer: Player
}

export function GameStatus({ gameRoom, currentPlayer }: GameStatusProps) {
  const currentTurnPlayer = gameRoom.players.find((p) => p.isCurrentTurn)
  const activePlayers = gameRoom.players.filter((p) => !p.hasDropped && !p.hasDeclared)

  return (
    <Card className="p-3 bg-card/90 backdrop-blur-sm">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="font-medium">{currentTurnPlayer?.name || "Unknown"}'s Turn</span>
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span>{activePlayers.length} active players</span>
        </div>

        <Badge variant="outline">Round {gameRoom.round}</Badge>

        {gameRoom.deck.length <= 10 && <Badge variant="destructive">Low Deck: {gameRoom.deck.length} cards</Badge>}
      </div>
    </Card>
  )
}
