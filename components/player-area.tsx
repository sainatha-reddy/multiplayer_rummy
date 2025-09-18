"use client"

import type { Player, Card as CardType } from "@/types/game"
import { CardHand } from "./card-hand"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlayerAreaProps {
  player: Player
  position: "top" | "right" | "bottom" | "left"
  isCurrentPlayer: boolean
  selectedCards: string[]
  onCardSelect?: (cardId: string) => void
  onCardDiscard?: (cardId: string) => void
  onSortHand?: () => void
  wildJoker?: CardType
}

export function PlayerArea({
  player,
  position,
  isCurrentPlayer,
  selectedCards,
  onCardSelect,
  onCardDiscard,
  onSortHand,
  wildJoker,
}: PlayerAreaProps) {
  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "absolute top-4 left-1/2 transform -translate-x-1/2"
      case "right":
        return "absolute right-4 top-1/2 transform -translate-y-1/2"
      case "bottom":
        return "absolute bottom-20 left-1/2 transform -translate-x-1/2"
      case "left":
        return "absolute left-4 top-1/2 transform -translate-y-1/2"
      default:
        return ""
    }
  }

  const getHandOrientation = () => {
    if (position === "left" || position === "right") {
      return "vertical"
    }
    return "horizontal"
  }

  return (
    <div className={cn("z-20", getPositionClasses())}>
      <div className="space-y-3">
        {/* Player Info */}
        <Card
          className={cn(
            "p-3 bg-card/90 backdrop-blur-sm",
            player.isCurrentTurn && "ring-2 ring-primary player-turn-indicator",
          )}
        >
          <div className="flex items-center gap-2">
            {player.isHost && <Crown className="w-4 h-4 text-yellow-500" />}
            {player.isCurrentTurn && <Clock className="w-4 h-4 text-primary animate-pulse" />}

            <div className="flex-1">
              <div className="font-medium text-sm">{player.name}</div>
              <div className="text-xs text-muted-foreground">
                {player.hand.length} cards • {player.points} pts
              </div>
            </div>

            <div className="flex gap-1">
              {player.hasDropped && (
                <Badge variant="destructive" className="text-xs">
                  Dropped
                </Badge>
              )}
              {player.hasDeclared && (
                <Badge variant="secondary" className="text-xs">
                  Declared
                </Badge>
              )}
              {player.isCurrentTurn && (
                <Badge variant="default" className="text-xs">
                  Turn
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Player Hand */}
        {isCurrentPlayer ? (
          <CardHand
            cards={player.hand}
            selectedCards={selectedCards}
            onCardSelect={onCardSelect!}
            onCardDoubleClick={onCardDiscard}
            onSortHand={onSortHand}
            isCurrentTurn={player.isCurrentTurn}
            className={cn(
              position === "top" && "transform rotate-180",
              position === "left" && "transform -rotate-90",
              position === "right" && "transform rotate-90",
            )}
          />
        ) : (
          // Show card backs for other players
          <div
            className={cn(
              "flex gap-1 justify-center",
              getHandOrientation() === "vertical" && "flex-col",
              position === "top" && "transform rotate-180",
            )}
          >
            {Array.from({ length: player.hand.length }).map((_, index) => (
              <Card
                key={index}
                className="w-12 h-16 bg-primary/20 border-2 border-primary/30 flex items-center justify-center"
                style={{
                  zIndex: player.hand.length - index,
                  marginLeft: getHandOrientation() === "horizontal" && index > 0 ? "-6px" : "0",
                  marginTop: getHandOrientation() === "vertical" && index > 0 ? "-8px" : "0",
                }}
              >
                <div className="w-8 h-10 bg-primary/40 rounded-sm" />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
