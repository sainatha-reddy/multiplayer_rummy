import type { GameRoom, Player, GameAction } from "@/types/game"
import { DeckManager } from "./deck"
import { RummyLogic } from "./rummy-logic"

export class GameStateManager {
  // Initialize a new game
  static initializeGame(players: Player[]): GameRoom {
    const deck = DeckManager.shuffleDeck(DeckManager.createStandardDeck())
    const { playerHands, remainingDeck } = DeckManager.dealCards(deck, players.length)
    const { wildJoker, updatedDeck } = DeckManager.selectWildJoker(remainingDeck)

    // Initialize discard pile with first card
    const discardPile = [updatedDeck.pop()!]
    const finalDeck = updatedDeck

    // Update players with their hands
    const updatedPlayers = players.map((player, index) => ({
      ...player,
      hand: DeckManager.sortHand(playerHands[index]),
      isCurrentTurn: index === 0,
      points: 0,
      hasDropped: false,
      hasDeclared: false,
    }))

    return {
      code: "", // Will be set by caller
      players: updatedPlayers,
      gameState: "playing",
      maxPlayers: 4,
      createdAt: new Date(),
      currentPlayerIndex: 0,
      deck: finalDeck,
      discardPile,
      wildJoker,
      round: 1,
    }
  }

  // Process a game action
  static processAction(gameRoom: GameRoom, playerId: string, action: GameAction, data?: any): GameRoom {
    const playerIndex = gameRoom.players.findIndex((p) => p.id === playerId)
    if (playerIndex === -1 || playerIndex !== gameRoom.currentPlayerIndex) {
      throw new Error("Invalid player or not player's turn")
    }

    const newGameRoom = { ...gameRoom }
    const currentPlayer = { ...newGameRoom.players[playerIndex] }

    switch (action) {
      case "draw_from_deck":
        return this.handleDrawFromDeck(newGameRoom, playerIndex)

      case "draw_from_discard":
        return this.handleDrawFromDiscard(newGameRoom, playerIndex)

      case "discard":
        return this.handleDiscard(newGameRoom, playerIndex, data.cardId)

      case "declare":
        return this.handleDeclare(newGameRoom, playerIndex)

      case "drop":
        return this.handleDrop(newGameRoom, playerIndex)

      case "sort_hand":
        return this.handleSortHand(newGameRoom, playerIndex)

      default:
        throw new Error("Invalid action")
    }
  }

  // Handle drawing from deck
  private static handleDrawFromDeck(gameRoom: GameRoom, playerIndex: number): GameRoom {
    if (gameRoom.deck.length === 0) {
      throw new Error("Deck is empty")
    }

    const newGameRoom = { ...gameRoom }
    const drawnCard = newGameRoom.deck.pop()!

    newGameRoom.players[playerIndex] = {
      ...newGameRoom.players[playerIndex],
      hand: [...newGameRoom.players[playerIndex].hand, drawnCard],
    }

    return newGameRoom
  }

  // Handle drawing from discard pile
  private static handleDrawFromDiscard(gameRoom: GameRoom, playerIndex: number): GameRoom {
    if (gameRoom.discardPile.length === 0) {
      throw new Error("Discard pile is empty")
    }

    const newGameRoom = { ...gameRoom }
    const drawnCard = newGameRoom.discardPile.pop()!

    newGameRoom.players[playerIndex] = {
      ...newGameRoom.players[playerIndex],
      hand: [...newGameRoom.players[playerIndex].hand, drawnCard],
    }

    return newGameRoom
  }

  // Handle discarding a card
  private static handleDiscard(gameRoom: GameRoom, playerIndex: number, cardId: string): GameRoom {
    const player = gameRoom.players[playerIndex]
    const cardIndex = player.hand.findIndex((card) => card.id === cardId)

    if (cardIndex === -1) {
      throw new Error("Card not found in player's hand")
    }

    const newGameRoom = { ...gameRoom }
    const discardedCard = player.hand[cardIndex]

    // Remove card from player's hand
    newGameRoom.players[playerIndex] = {
      ...player,
      hand: player.hand.filter((card) => card.id !== cardId),
    }

    // Add card to discard pile
    newGameRoom.discardPile.push(discardedCard)

    // Move to next player's turn
    newGameRoom.currentPlayerIndex = this.getNextPlayerIndex(newGameRoom, playerIndex)

    // Update turn indicators
    newGameRoom.players.forEach((p, index) => {
      p.isCurrentTurn = index === newGameRoom.currentPlayerIndex
    })

    return newGameRoom
  }

  // Handle player declaration
  private static handleDeclare(gameRoom: GameRoom, playerIndex: number): GameRoom {
    const player = gameRoom.players[playerIndex]
    const declaration = RummyLogic.validateDeclaration(player.hand, gameRoom.wildJoker)

    const newGameRoom = { ...gameRoom }
    newGameRoom.players[playerIndex] = {
      ...player,
      hasDeclared: true,
      points: declaration.points,
    }

    if (declaration.isValid) {
      // Player wins - calculate points for other players
      newGameRoom.gameState = "finished"

      newGameRoom.players.forEach((p, index) => {
        if (index !== playerIndex) {
          const playerDeclaration = RummyLogic.validateDeclaration(p.hand, gameRoom.wildJoker)
          p.points = RummyLogic.calculatePlayerPoints(p.hand, playerDeclaration, gameRoom.wildJoker)
        }
      })
    } else {
      // Invalid declaration - player gets penalty points
      newGameRoom.players[playerIndex].points = Math.min(80, declaration.points)

      // Continue game with next player
      newGameRoom.currentPlayerIndex = this.getNextPlayerIndex(newGameRoom, playerIndex)
      newGameRoom.players.forEach((p, index) => {
        p.isCurrentTurn = index === newGameRoom.currentPlayerIndex
      })
    }

    return newGameRoom
  }

  // Handle player dropping from game
  private static handleDrop(gameRoom: GameRoom, playerIndex: number): GameRoom {
    const newGameRoom = { ...gameRoom }
    const player = newGameRoom.players[playerIndex]

    // Calculate drop points based on game state
    const dropPoints = this.calculateDropPoints(gameRoom, playerIndex)

    newGameRoom.players[playerIndex] = {
      ...player,
      hasDropped: true,
      points: dropPoints,
      isCurrentTurn: false,
    }

    // Move to next active player
    newGameRoom.currentPlayerIndex = this.getNextActivePlayerIndex(newGameRoom, playerIndex)

    // Update turn indicators
    newGameRoom.players.forEach((p, index) => {
      p.isCurrentTurn = index === newGameRoom.currentPlayerIndex && !p.hasDropped && !p.hasDeclared
    })

    // Check if game should end (only one active player left)
    const activePlayers = newGameRoom.players.filter((p) => !p.hasDropped && !p.hasDeclared)
    if (activePlayers.length <= 1) {
      newGameRoom.gameState = "finished"
    }

    return newGameRoom
  }

  // Handle sorting player's hand
  private static handleSortHand(gameRoom: GameRoom, playerIndex: number): GameRoom {
    const newGameRoom = { ...gameRoom }
    const player = newGameRoom.players[playerIndex]

    newGameRoom.players[playerIndex] = {
      ...player,
      hand: DeckManager.sortHand(player.hand),
    }

    return newGameRoom
  }

  // Get next player index (skipping dropped/declared players)
  private static getNextPlayerIndex(gameRoom: GameRoom, currentIndex: number): number {
    let nextIndex = (currentIndex + 1) % gameRoom.players.length

    // Skip players who have dropped or declared
    while (gameRoom.players[nextIndex].hasDropped || gameRoom.players[nextIndex].hasDeclared) {
      nextIndex = (nextIndex + 1) % gameRoom.players.length

      // Prevent infinite loop
      if (nextIndex === currentIndex) break
    }

    return nextIndex
  }

  // Get next active player index
  private static getNextActivePlayerIndex(gameRoom: GameRoom, currentIndex: number): number {
    const activePlayers = gameRoom.players
      .map((player, index) => ({ player, index }))
      .filter(({ player }) => !player.hasDropped && !player.hasDeclared)

    if (activePlayers.length === 0) return currentIndex

    const currentActiveIndex = activePlayers.findIndex(({ index }) => index === currentIndex)
    const nextActiveIndex = (currentActiveIndex + 1) % activePlayers.length

    return activePlayers[nextActiveIndex].index
  }

  // Calculate drop points
  private static calculateDropPoints(gameRoom: GameRoom, playerIndex: number): number {
    const player = gameRoom.players[playerIndex]

    // First drop: 20 points
    // Middle drop: 40 points
    // These are standard Indian Rummy rules

    // Check if player has drawn any cards (simple heuristic)
    const hasDrawnCards = player.hand.length > 13

    return hasDrawnCards ? 40 : 20
  }

  // Check if game is over
  static isGameOver(gameRoom: GameRoom): boolean {
    return (
      gameRoom.gameState === "finished" ||
      gameRoom.players.some((p) => p.hasDeclared && p.points === 0) ||
      gameRoom.players.filter((p) => !p.hasDropped && !p.hasDeclared).length <= 1
    )
  }

  // Get game winner
  static getWinner(gameRoom: GameRoom): Player | null {
    if (!this.isGameOver(gameRoom)) return null

    const validDeclaration = gameRoom.players.find((p) => p.hasDeclared && p.points === 0)
    if (validDeclaration) return validDeclaration

    // If no valid declaration, player with lowest points wins
    const activePlayers = gameRoom.players.filter((p) => !p.hasDropped)
    if (activePlayers.length === 0) return null

    return activePlayers.reduce((winner, player) => (player.points < winner.points ? player : winner))
  }
}
