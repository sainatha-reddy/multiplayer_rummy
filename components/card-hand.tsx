"use client"

import { Card as CardType } from "@/types/game"
import { PlayingCard } from "./playing-card"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from 'lucide-react'
import { cn } from "@/lib/utils"

interface CardHandProps {
  cards: CardType[]
  selectedCards: string[]
  onCardSelect: (cardId: string) => void
  onCardDoubleClick?: (cardId: string) => void
  onSortHand?: () => void
  isCurrentTurn?: boolean
  className?: string
}

export function CardHand({
  cards,
  selectedCards,
  onCardSelect,
  onCardDoubleClick,
  onSortHand,
  isCurrentTurn = false,
  className,
}: CardHandProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {/* Sort button */}
      {onSortHand && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onSortHand}
            className="text-xs bg-transparent"
          >
            <ArrowUpDown className="w-3 h-3 mr-1" />
            Sort
          </Button>
        </div>
      )}

      {/* Cards display */}
      <div className="flex flex-wrap gap-1 justify-center">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="relative"
            style={{
              zIndex: cards.length - index,
              marginLeft: index > 0 ? "-8px" : "0",
            }}
          >
            <PlayingCard
              card={card}
              isSelected={selectedCards.includes(card.id)}
              isDisabled={!isCurrentTurn}
              onClick={() => onCardSelect(card.id)}
              onDoubleClick={() => onCardDoubleClick?.(card.id)}
              size="md"
            />
          </div>
        ))}
      </div>

      {/* Hand info */}
      <div className="text-center text-sm text-muted-foreground">
        {cards.length} cards
        {selectedCards.length > 0 && (
          <span className="ml-2 text-primary">
            ({selectedCards.length} selected)
          </span>
        )}
      </div>
    </div>
  )
}
