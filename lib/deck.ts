import type { Card, Suit, Rank } from "@/types/game"

// Standard deck creation and management for Indian Rummy
export class DeckManager {
  private static readonly SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"]
  private static readonly RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

  static createStandardDeck(): Card[] {
    const deck: Card[] = []

    // Create two standard decks (104 cards total) for Indian Rummy
    for (let deckNum = 0; deckNum < 2; deckNum++) {
      for (const suit of this.SUITS) {
        for (const rank of this.RANKS) {
          deck.push({
            id: `${suit}-${rank}-${deckNum}`,
            suit,
            rank,
            isJoker: false,
            isSelected: false,
          })
        }
      }
    }

    // Add 2 printed jokers
    deck.push(
      {
        id: "joker-1",
        suit: "hearts", // Arbitrary suit for printed jokers
        rank: "A", // Arbitrary rank for printed jokers
        isJoker: true,
        isSelected: false,
      },
      {
        id: "joker-2",
        suit: "spades", // Arbitrary suit for printed jokers
        rank: "A", // Arbitrary rank for printed jokers
        isJoker: true,
        isSelected: false,
      },
    )

    return deck
  }

  static shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck]

    // Fisher-Yates shuffle algorithm for secure randomization
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    return shuffled
  }

  static dealCards(deck: Card[], numPlayers: number): { playerHands: Card[][]; remainingDeck: Card[] } {
    const playerHands: Card[][] = Array(numPlayers)
      .fill(null)
      .map(() => [])
    const deckCopy = [...deck]

    // Deal 13 cards to each player
    for (let cardNum = 0; cardNum < 13; cardNum++) {
      for (let playerIndex = 0; playerIndex < numPlayers; playerIndex++) {
        const card = deckCopy.pop()
        if (card) {
          playerHands[playerIndex].push(card)
        }
      }
    }

    return {
      playerHands,
      remainingDeck: deckCopy,
    }
  }

  static selectWildJoker(deck: Card[]): { wildJoker: Card; updatedDeck: Card[] } {
    if (deck.length === 0) {
      throw new Error("Cannot select wild joker from empty deck")
    }

    const wildJoker = deck[0]
    const updatedDeck = deck.slice(1)

    return { wildJoker, updatedDeck }
  }

  static getCardValue(card: Card): number {
    if (card.isJoker) return 0

    switch (card.rank) {
      case "A":
        return 1
      case "J":
      case "Q":
      case "K":
        return 10
      default:
        return Number.parseInt(card.rank)
    }
  }

  static getCardPoints(card: Card): number {
    if (card.isJoker) return 0

    switch (card.rank) {
      case "A":
        return 10
      case "J":
      case "Q":
      case "K":
        return 10
      default:
        return Number.parseInt(card.rank)
    }
  }

  static sortHand(hand: Card[]): Card[] {
    return [...hand].sort((a, b) => {
      // Sort by suit first, then by rank
      if (a.suit !== b.suit) {
        return this.SUITS.indexOf(a.suit) - this.SUITS.indexOf(b.suit)
      }

      // Handle jokers - they go to the end
      if (a.isJoker && !b.isJoker) return 1
      if (!a.isJoker && b.isJoker) return -1
      if (a.isJoker && b.isJoker) return 0

      return this.RANKS.indexOf(a.rank) - this.RANKS.indexOf(b.rank)
    })
  }

  static isWildJoker(card: Card, wildJoker?: Card): boolean {
    if (!wildJoker || card.isJoker) return card.isJoker || false
    return card.rank === wildJoker.rank && !card.isJoker
  }

  static getNextRank(rank: Rank): Rank {
    const currentIndex = this.RANKS.indexOf(rank)
    return this.RANKS[(currentIndex + 1) % this.RANKS.length]
  }

  static getPreviousRank(rank: Rank): Rank {
    const currentIndex = this.RANKS.indexOf(rank)
    return this.RANKS[(currentIndex - 1 + this.RANKS.length) % this.RANKS.length]
  }
}
