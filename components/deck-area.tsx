"use client"

import type { Card as CardType } from "@/types/game"
import { PlayingCard } from "./playing-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface DeckAreaProps {
  deckCount: number
  discardPile: CardType[]
  wildJoker?: CardType
  onDrawFromDeck: () => void
  onDrawFromDiscard: () => void
  canDrawFromDeck: boolean
  canDrawFromDiscard: boolean
}

export function DeckArea({
  deckCount,
  discardPile,
  wildJoker,
  onDrawFromDeck,
  onDrawFromDiscard,
  canDrawFromDeck,
  canDrawFromDiscard,
}: DeckAreaProps) {
  const topDiscardCard = discardPile[discardPile.length - 1]

  return (
    <div className="flex items-center justify-center gap-6">
      {/* Deck */}
      <div className="text-center space-y-2">
        <Card
          className="w-16 h-22 bg-primary/20 border-2 border-dashed border-primary cursor-pointer hover:bg-primary/30 transition-colors flex items-center justify-center"
          onClick={canDrawFromDeck ? onDrawFromDeck : undefined}
        >
          <div className="text-center">
            <RefreshCw className="w-6 h-6 mx-auto mb-1 text-primary" />
            <div className="text-xs font-medium text-primary">{deckCount}</div>
          </div>
        </Card>
        <Button
          variant="outline"
          size="sm"
          disabled={!canDrawFromDeck}
          onClick={onDrawFromDeck}
          className="text-xs bg-transparent"
        >
          Draw Deck
        </Button>
      </div>

      {/* Wild Joker Display */}
      {wildJoker && (
        <div className="text-center space-y-2">
          <PlayingCard card={wildJoker} size="md" isDisabled />
          <div className="text-xs font-medium text-primary">Wild Joker</div>
        </div>
      )}

      {/* Discard Pile */}
      <div className="text-center space-y-2">
        {topDiscardCard ? (
          <PlayingCard
            card={topDiscardCard}
            size="md"
            onClick={canDrawFromDiscard ? onDrawFromDiscard : undefined}
            isDisabled={!canDrawFromDiscard}
            className={canDrawFromDiscard ? "cursor-pointer" : ""}
          />
        ) : (
          <Card className="w-16 h-22 bg-muted border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
            <div className="text-xs text-muted-foreground">Empty</div>
          </Card>
        )}
        <Button
          variant="outline"
          size="sm"
          disabled={!canDrawFromDiscard || !topDiscardCard}
          onClick={onDrawFromDiscard}
          className="text-xs bg-transparent"
        >
          Draw Discard
        </Button>
      </div>
    </div>
  )
}
