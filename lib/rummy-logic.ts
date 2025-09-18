import type { Card, Sequence, Set, Declaration, Rank } from "@/types/game"
import { DeckManager } from "./deck"

export class RummyLogic {
  // Validate if cards form a pure sequence (no jokers)
  static isPureSequence(cards: Card[]): boolean {
    if (cards.length < 3) return false

    // No jokers allowed in pure sequence
    if (cards.some((card) => card.isJoker)) return false

    // All cards must be of same suit
    const suit = cards[0].suit
    if (!cards.every((card) => card.suit === suit)) return false

    // Sort cards by rank value
    const sortedCards = [...cards].sort((a, b) => {
      const aValue = this.getRankValue(a.rank)
      const bValue = this.getRankValue(b.rank)
      return aValue - bValue
    })

    // Check if cards are consecutive
    for (let i = 1; i < sortedCards.length; i++) {
      const prevValue = this.getRankValue(sortedCards[i - 1].rank)
      const currValue = this.getRankValue(sortedCards[i].rank)

      if (currValue !== prevValue + 1) {
        // Handle Ace-King-Queen wrap around
        if (!(prevValue === 13 && currValue === 1)) {
          return false
        }
      }
    }

    return true
  }

  // Validate if cards form an impure sequence (with jokers allowed)
  static isImpureSequence(cards: Card[], wildJoker?: Card): boolean {
    if (cards.length < 3) return false

    // All non-joker cards must be of same suit
    const nonJokerCards = cards.filter((card) => !this.isJokerCard(card, wildJoker))
    if (nonJokerCards.length === 0) return false

    const suit = nonJokerCards[0].suit
    if (!nonJokerCards.every((card) => card.suit === suit)) return false

    // Try to form a valid sequence using jokers as substitutes
    return this.canFormSequenceWithJokers(cards, wildJoker)
  }

  // Validate if cards form a valid set (3 or 4 cards of same rank)
  static isValidSet(cards: Card[], wildJoker?: Card): boolean {
    if (cards.length < 3 || cards.length > 4) return false

    const nonJokerCards = cards.filter((card) => !this.isJokerCard(card, wildJoker))
    if (nonJokerCards.length === 0) return false

    // All non-joker cards must have same rank
    const rank = nonJokerCards[0].rank
    if (!nonJokerCards.every((card) => card.rank === rank)) return false

    // All non-joker cards must have different suits
    const suits = nonJokerCards.map((card) => card.suit)
    const uniqueSuits = new Set(suits)
    if (uniqueSuits.size !== nonJokerCards.length) return false

    return true
  }

  // Validate a complete declaration
  static validateDeclaration(hand: Card[], wildJoker?: Card): Declaration {
    if (hand.length !== 13) {
      return {
        sequences: [],
        sets: [],
        isValid: false,
        points: this.calculateHandPoints(hand, wildJoker),
      }
    }

    const bestCombination = this.findBestCombination(hand, wildJoker)
    const hasPureSequence = bestCombination.sequences.some((seq) => seq.type === "pure")
    const hasMinimumSequences = bestCombination.sequences.length >= 2

    const isValid = hasPureSequence && hasMinimumSequences && this.isCompleteDeclaration(bestCombination, hand)

    return {
      ...bestCombination,
      isValid,
      points: isValid ? 0 : this.calculateHandPoints(hand, wildJoker),
    }
  }

  // Calculate points for unmatched cards
  static calculateHandPoints(hand: Card[], wildJoker?: Card): number {
    return hand.reduce((total, card) => {
      if (this.isJokerCard(card, wildJoker)) return total
      return total + DeckManager.getCardPoints(card)
    }, 0)
  }

  // Calculate points for a losing player
  static calculatePlayerPoints(hand: Card[], declaration: Declaration, wildJoker?: Card): number {
    if (declaration.isValid) return 0

    // If player has no pure sequence, full hand points (max 80)
    const hasPureSequence = declaration.sequences.some((seq) => seq.type === "pure")
    if (!hasPureSequence) {
      return Math.min(80, this.calculateHandPoints(hand, wildJoker))
    }

    // Calculate points for unmatched cards only
    const matchedCards = new Set<string>()

    // Add cards from valid sequences and sets
    declaration.sequences.forEach((seq) => {
      if (seq.isValid) {
        seq.cards.forEach((card) => matchedCards.add(card.id))
      }
    })

    declaration.sets.forEach((set) => {
      if (set.isValid) {
        set.cards.forEach((card) => matchedCards.add(card.id))
      }
    })

    // Calculate points for unmatched cards
    const unmatchedCards = hand.filter((card) => !matchedCards.has(card.id))
    return Math.min(80, this.calculateHandPoints(unmatchedCards, wildJoker))
  }

  // Helper method to check if a card is a joker
  private static isJokerCard(card: Card, wildJoker?: Card): boolean {
    if (card.isJoker) return true
    if (!wildJoker) return false
    return card.rank === wildJoker.rank && card.suit !== wildJoker.suit
  }

  // Get numeric value for rank (for sequence validation)
  private static getRankValue(rank: Rank): number {
    switch (rank) {
      case "A":
        return 1
      case "2":
        return 2
      case "3":
        return 3
      case "4":
        return 4
      case "5":
        return 5
      case "6":
        return 6
      case "7":
        return 7
      case "8":
        return 8
      case "9":
        return 9
      case "10":
        return 10
      case "J":
        return 11
      case "Q":
        return 12
      case "K":
        return 13
      default:
        return 0
    }
  }

  // Check if cards can form a sequence using jokers
  private static canFormSequenceWithJokers(cards: Card[], wildJoker?: Card): boolean {
    const nonJokerCards = cards.filter((card) => !this.isJokerCard(card, wildJoker))
    const jokerCount = cards.length - nonJokerCards.length

    if (nonJokerCards.length === 0) return false

    // Sort non-joker cards by rank
    const sortedCards = nonJokerCards.sort((a, b) => this.getRankValue(a.rank) - this.getRankValue(b.rank))

    // Calculate gaps between consecutive cards
    let gapsNeeded = 0
    for (let i = 1; i < sortedCards.length; i++) {
      const prevValue = this.getRankValue(sortedCards[i - 1].rank)
      const currValue = this.getRankValue(sortedCards[i].rank)
      const gap = currValue - prevValue - 1

      if (gap < 0) return false // Duplicate ranks
      gapsNeeded += gap
    }

    // Check if we have enough jokers to fill gaps
    return jokerCount >= gapsNeeded
  }

  // Find the best combination of sequences and sets
  private static findBestCombination(hand: Card[], wildJoker?: Card): { sequences: Sequence[]; sets: Set[] } {
    // This is a simplified implementation
    // In a full implementation, you'd use dynamic programming or backtracking
    // to find the optimal combination

    const sequences: Sequence[] = []
    const sets: Set[] = []
    const usedCards = new Set<string>()

    // Try to find pure sequences first
    const pureSequence = this.findPureSequence(hand, usedCards)
    if (pureSequence) {
      sequences.push(pureSequence)
      pureSequence.cards.forEach((card) => usedCards.add(card.id))
    }

    // Try to find more sequences and sets with remaining cards
    const remainingCards = hand.filter((card) => !usedCards.has(card.id))

    // This is a simplified approach - a full implementation would be more sophisticated
    return { sequences, sets }
  }

  // Find a pure sequence in the hand
  private static findPureSequence(hand: Card[], usedCards: Set<string>): Sequence | null {
    const availableCards = hand.filter((card) => !usedCards.has(card.id) && !card.isJoker)

    // Group cards by suit
    const cardsBySuit: { [suit: string]: Card[] } = {}
    availableCards.forEach((card) => {
      if (!cardsBySuit[card.suit]) {
        cardsBySuit[card.suit] = []
      }
      cardsBySuit[card.suit].push(card)
    })

    // Try to find a sequence in each suit
    for (const suit in cardsBySuit) {
      const suitCards = cardsBySuit[suit].sort((a, b) => this.getRankValue(a.rank) - this.getRankValue(b.rank))

      // Look for consecutive cards
      for (let i = 0; i <= suitCards.length - 3; i++) {
        const sequence = [suitCards[i]]

        for (let j = i + 1; j < suitCards.length; j++) {
          const lastCard = sequence[sequence.length - 1]
          const currentCard = suitCards[j]

          if (this.getRankValue(currentCard.rank) === this.getRankValue(lastCard.rank) + 1) {
            sequence.push(currentCard)
          } else {
            break
          }
        }

        if (sequence.length >= 3) {
          return {
            cards: sequence,
            type: "pure",
            isValid: true,
          }
        }
      }
    }

    return null
  }

  // Check if the combination covers all cards
  private static isCompleteDeclaration(combination: { sequences: Sequence[]; sets: Set[] }, hand: Card[]): boolean {
    const coveredCards = new Set<string>()

    combination.sequences.forEach((seq) => {
      seq.cards.forEach((card) => coveredCards.add(card.id))
    })

    combination.sets.forEach((set) => {
      set.cards.forEach((card) => coveredCards.add(card.id))
    })

    return hand.every((card) => coveredCards.has(card.id))
  }
}
