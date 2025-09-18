"use client"

import { useState, useCallback } from "react"
import type { Card, GameRoom, Player, GameAction, Declaration } from "@/types/game"
import { RummyLogic } from "@/lib/rummy-logic"
import { GameStateManager } from "@/lib/game-state"

export function useGameLogic() {
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null)

  // Card selection logic
  const toggleCardSelection = useCallback((cardId: string) => {
    setSelectedCards((prev) => (prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedCards([])
  }, [])

  // Game action handlers
  const executeAction = useCallback(
    (playerId: string, action: GameAction, data?: any) => {
      if (!gameRoom) return

      try {
        const newGameRoom = GameStateManager.processAction(gameRoom, playerId, action, data)
        setGameRoom(newGameRoom)

        // Clear selection after action
        if (action === "discard" || action === "declare") {
          clearSelection()
        }

        return newGameRoom
      } catch (error) {
        console.error("[v0] Game action error:", error)
        throw error
      }
    },
    [gameRoom, clearSelection],
  )

  // Validation helpers
  const validateDeclaration = useCallback((hand: Card[], wildJoker?: Card): Declaration => {
    return RummyLogic.validateDeclaration(hand, wildJoker)
  }, [])

  const canDrawFromDeck = useCallback(
    (playerId: string): boolean => {
      if (!gameRoom) return false

      const player = gameRoom.players.find((p) => p.id === playerId)
      return player?.isCurrentTurn && player.hand.length === 13 && gameRoom.deck.length > 0
    },
    [gameRoom],
  )

  const canDrawFromDiscard = useCallback(
    (playerId: string): boolean => {
      if (!gameRoom) return false

      const player = gameRoom.players.find((p) => p.id === playerId)
      return player?.isCurrentTurn && player.hand.length === 13 && gameRoom.discardPile.length > 0
    },
    [gameRoom],
  )

  const canDiscard = useCallback(
    (playerId: string): boolean => {
      if (!gameRoom) return false

      const player = gameRoom.players.find((p) => p.id === playerId)
      return player?.isCurrentTurn && player.hand.length === 14
    },
    [gameRoom],
  )

  const canDeclare = useCallback(
    (playerId: string): boolean => {
      if (!gameRoom) return false

      const player = gameRoom.players.find((p) => p.id === playerId)
      return player?.isCurrentTurn && player.hand.length === 13
    },
    [gameRoom],
  )

  // Game state helpers
  const getCurrentPlayer = useCallback((): Player | null => {
    if (!gameRoom) return null
    return gameRoom.players[gameRoom.currentPlayerIndex] || null
  }, [gameRoom])

  const getPlayerById = useCallback(
    (playerId: string): Player | null => {
      if (!gameRoom) return null
      return gameRoom.players.find((p) => p.id === playerId) || null
    },
    [gameRoom],
  )

  const isGameOver = useCallback((): boolean => {
    if (!gameRoom) return false
    return GameStateManager.isGameOver(gameRoom)
  }, [gameRoom])

  const getWinner = useCallback((): Player | null => {
    if (!gameRoom) return null
    return GameStateManager.getWinner(gameRoom)
  }, [gameRoom])

  // Calculate hand strength for AI hints
  const getHandStrength = useCallback((hand: Card[], wildJoker?: Card): number => {
    const declaration = RummyLogic.validateDeclaration(hand, wildJoker)

    if (declaration.isValid) return 100

    // Calculate based on sequences and sets formed
    let strength = 0

    // Bonus for pure sequences
    declaration.sequences.forEach((seq) => {
      if (seq.type === "pure" && seq.isValid) strength += 30
      else if (seq.isValid) strength += 20
    })

    // Bonus for valid sets
    declaration.sets.forEach((set) => {
      if (set.isValid) strength += 15
    })

    // Penalty for high-value unmatched cards
    const unmatchedPoints = declaration.points
    strength -= Math.min(unmatchedPoints, 50)

    return Math.max(0, Math.min(100, strength))
  }, [])

  return {
    // State
    selectedCards,
    gameRoom,

    // Actions
    setGameRoom,
    toggleCardSelection,
    clearSelection,
    executeAction,

    // Validation
    validateDeclaration,
    canDrawFromDeck,
    canDrawFromDiscard,
    canDiscard,
    canDeclare,

    // Helpers
    getCurrentPlayer,
    getPlayerById,
    isGameOver,
    getWinner,
    getHandStrength,
  }
}
