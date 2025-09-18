"use client"

import { useState } from "react"
import type { GameRoom, Player, GameAction } from "@/types/game"
import { PlayerArea } from "./player-area"
import { DeckArea } from "./deck-area"
import { GameControls } from "./game-controls"
import { GameStatus } from "./game-status"
import { DeclarationModal } from "./declaration-modal"
import { useGameLogic } from "@/hooks/use-game-logic"

interface GameBoardProps {
  gameRoom: GameRoom
  currentPlayer: Player
  onGameAction: (action: GameAction, data?: any) => void
}

export function GameBoard({ gameRoom, currentPlayer, onGameAction }: GameBoardProps) {
  const [showDeclarationModal, setShowDeclarationModal] = useState(false)
  const {
    selectedCards,
    toggleCardSelection,
    clearSelection,
    validateDeclaration,
    canDrawFromDeck,
    canDrawFromDiscard,
    canDiscard,
    canDeclare,
  } = useGameLogic()

  const handleDrawFromDeck = () => {
    if (canDrawFromDeck(currentPlayer.id)) {
      onGameAction("draw_from_deck")
    }
  }

  const handleDrawFromDiscard = () => {
    if (canDrawFromDiscard(currentPlayer.id)) {
      onGameAction("draw_from_discard")
    }
  }

  const handleDiscard = (cardId: string) => {
    if (canDiscard(currentPlayer.id)) {
      onGameAction("discard", { cardId })
      clearSelection()
    }
  }

  const handleDeclare = () => {
    if (canDeclare(currentPlayer.id)) {
      const declaration = validateDeclaration(currentPlayer.hand, gameRoom.wildJoker)
      if (declaration.isValid) {
        onGameAction("declare")
        setShowDeclarationModal(false)
      } else {
        // Show declaration preview
        setShowDeclarationModal(true)
      }
    }
  }

  const handleDrop = () => {
    if (confirm("Are you sure you want to drop from this game? You will receive penalty points.")) {
      onGameAction("drop")
    }
  }

  const handleSortHand = () => {
    onGameAction("sort_hand")
  }

  // Arrange players around the table
  const arrangePlayersAroundTable = () => {
    const players = gameRoom.players
    const currentPlayerIndex = players.findIndex((p) => p.id === currentPlayer.id)

    // Arrange players: current player at bottom, others clockwise
    const arrangedPlayers = []

    // Bottom (current player)
    arrangedPlayers.push({ player: players[currentPlayerIndex], position: "bottom" })

    // Arrange other players
    const otherPlayers = players.filter((_, index) => index !== currentPlayerIndex)
    const positions = ["right", "top", "left"]

    otherPlayers.forEach((player, index) => {
      if (index < positions.length) {
        arrangedPlayers.push({ player, position: positions[index] })
      }
    })

    return arrangedPlayers
  }

  const arrangedPlayers = arrangePlayersAroundTable()

  return (
    <div className="relative w-full h-[calc(100vh-120px)] overflow-hidden">
      {/* Game Status */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <GameStatus gameRoom={gameRoom} currentPlayer={currentPlayer} />
      </div>

      {/* Center Table Area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Deck and Discard Area */}
          <DeckArea
            deckCount={gameRoom.deck.length}
            discardPile={gameRoom.discardPile}
            wildJoker={gameRoom.wildJoker}
            onDrawFromDeck={handleDrawFromDeck}
            onDrawFromDiscard={handleDrawFromDiscard}
            canDrawFromDeck={canDrawFromDeck(currentPlayer.id)}
            canDrawFromDiscard={canDrawFromDiscard(currentPlayer.id)}
          />
        </div>
      </div>

      {/* Player Areas */}
      {arrangedPlayers.map(({ player, position }) => (
        <PlayerArea
          key={player.id}
          player={player}
          position={position as "top" | "right" | "bottom" | "left"}
          isCurrentPlayer={player.id === currentPlayer.id}
          selectedCards={player.id === currentPlayer.id ? selectedCards : []}
          onCardSelect={player.id === currentPlayer.id ? toggleCardSelection : undefined}
          onCardDiscard={player.id === currentPlayer.id ? handleDiscard : undefined}
          onSortHand={player.id === currentPlayer.id ? handleSortHand : undefined}
          wildJoker={gameRoom.wildJoker}
        />
      ))}

      {/* Game Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <GameControls
          currentPlayer={currentPlayer}
          gameRoom={gameRoom}
          selectedCards={selectedCards}
          onDeclare={handleDeclare}
          onDrop={handleDrop}
          canDeclare={canDeclare(currentPlayer.id)}
          canDiscard={canDiscard(currentPlayer.id)}
        />
      </div>

      {/* Declaration Modal */}
      {showDeclarationModal && (
        <DeclarationModal
          hand={currentPlayer.hand}
          wildJoker={gameRoom.wildJoker}
          onConfirm={() => {
            onGameAction("declare")
            setShowDeclarationModal(false)
          }}
          onCancel={() => setShowDeclarationModal(false)}
        />
      )}
    </div>
  )
}
