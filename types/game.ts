export type Suit = "hearts" | "diamonds" | "clubs" | "spades"
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K"

export interface Card {
  id: string
  suit: Suit
  rank: Rank
  isJoker?: boolean
  isSelected?: boolean
}

export interface Player {
  id: string
  name: string
  socketId: string
  hand: Card[]
  isHost: boolean
  isCurrentTurn: boolean
  points: number
  hasDropped: boolean
  hasDeclared: boolean
}

export interface GameRoom {
  code: string
  players: Player[]
  gameState: "waiting" | "playing" | "finished"
  maxPlayers: number
  createdAt: Date
  currentPlayerIndex: number
  deck: Card[]
  discardPile: Card[]
  wildJoker?: Card
  round: number
}

export interface Sequence {
  cards: Card[]
  type: "pure" | "impure"
  isValid: boolean
}

export interface Set {
  cards: Card[]
  isValid: boolean
}

export interface Declaration {
  sequences: Sequence[]
  sets: Set[]
  isValid: boolean
  points: number
}

export type GameAction = "draw_from_deck" | "draw_from_discard" | "discard" | "declare" | "drop" | "sort_hand"
