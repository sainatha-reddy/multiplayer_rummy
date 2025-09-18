"use client"

import type { Card as CardType } from "@/types/game"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PlayingCardProps {
  card: CardType
  isSelected?: boolean
  isDisabled?: boolean
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  onDoubleClick?: () => void
  className?: string
}

export function PlayingCard({
  card,
  isSelected = false,
  isDisabled = false,
  size = "md",
  onClick,
  onDoubleClick,
  className,
}: PlayingCardProps) {
  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case "hearts":
        return "♥"
      case "diamonds":
        return "♦"
      case "clubs":
        return "♣"
      case "spades":
        return "♠"
      default:
        return ""
    }
  }

  const getSuitColor = (suit: string) => {
    return suit === "hearts" || suit === "diamonds" ? "text-red-600" : "text-gray-900"
  }

  const sizeClasses = {
    sm: "w-12 h-16 text-xs",
    md: "w-16 h-22 text-sm",
    lg: "w-20 h-28 text-base",
  }

  if (card.isJoker && !card.suit) {
    // Printed joker
    return (
      <Card
        className={cn(
          "relative cursor-pointer select-none card-shadow card-hover",
          "bg-gradient-to-br from-purple-500 to-pink-500 text-white",
          "flex items-center justify-center font-bold",
          sizeClasses[size],
          isSelected && "ring-2 ring-primary ring-offset-2 transform -translate-y-2",
          isDisabled && "opacity-50 cursor-not-allowed",
          className,
        )}
        onClick={!isDisabled ? onClick : undefined}
        onDoubleClick={!isDisabled ? onDoubleClick : undefined}
      >
        <div className="text-center">
          <div className="text-lg">🃏</div>
          <div className="text-xs">JOKER</div>
        </div>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "relative cursor-pointer select-none card-shadow card-hover",
        "bg-card border-2 border-border",
        "flex flex-col justify-between p-1",
        sizeClasses[size],
        isSelected && "ring-2 ring-primary ring-offset-2 transform -translate-y-2",
        isDisabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      onClick={!isDisabled ? onClick : undefined}
      onDoubleClick={!isDisabled ? onDoubleClick : undefined}
    >
      {/* Top left corner */}
      <div className={cn("flex flex-col items-center", getSuitColor(card.suit))}>
        <div className="font-bold leading-none">{card.rank}</div>
        <div className="text-lg leading-none">{getSuitSymbol(card.suit)}</div>
      </div>

      {/* Center symbol */}
      <div className={cn("absolute inset-0 flex items-center justify-center text-2xl", getSuitColor(card.suit))}>
        {getSuitSymbol(card.suit)}
      </div>

      {/* Bottom right corner (rotated) */}
      <div className={cn("flex flex-col items-center transform rotate-180", getSuitColor(card.suit))}>
        <div className="font-bold leading-none">{card.rank}</div>
        <div className="text-lg leading-none">{getSuitSymbol(card.suit)}</div>
      </div>

      {/* Wild joker indicator */}
      {card.rank && <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full opacity-0" />}
    </Card>
  )
}
