"use client"

import type { GameRoom, Player } from "@/types/game"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, XCircle, Eye } from "lucide-react"

interface GameControlsProps {
  currentPlayer: Player
  gameRoom: GameRoom
  selectedCards: string[]
  onDeclare: () => void
  onDrop: () => void
  canDeclare: boolean
  canDiscard: boolean
}

export function GameControls({
  currentPlayer,
  gameRoom,
  selectedCards,
  onDeclare,
  onDrop,
  canDeclare,
  canDiscard,
}: GameControlsProps) {
  if (!currentPlayer.isCurrentTurn) {
    return (
      <Card className="p-4 bg-card/90 backdrop-blur-sm">
        <div className="text-center text-muted-foreground">Waiting for your turn...</div>
      </Card>
    )
  }

  return (
    <Card className="p-4 bg-card/90 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {/* Discard Instructions */}
        {canDiscard && selectedCards.length === 0 && (
          <div className="text-sm text-muted-foreground">Select a card to discard</div>
        )}

        {canDiscard && selectedCards.length === 1 && (
          <div className="text-sm text-primary">Double-click selected card to discard</div>
        )}

        {canDiscard && selectedCards.length > 1 && (
          <div className="text-sm text-destructive">Select only one card to discard</div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={onDeclare}
            disabled={!canDeclare}
            className="flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Declare
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Show declaration preview
              onDeclare()
            }}
            disabled={!canDeclare}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>

          <Button variant="destructive" size="sm" onClick={onDrop} className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Drop
          </Button>
        </div>

        {/* Hand Status */}
        <div className="text-sm text-muted-foreground">{currentPlayer.hand.length} cards</div>
      </div>
    </Card>
  )
}
