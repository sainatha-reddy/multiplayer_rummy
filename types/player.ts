export interface PlayerProfile {
  id: string
  name: string
  avatar?: string
  createdAt: Date
  lastActive: Date
  stats: PlayerStats
  preferences: PlayerPreferences
}

export interface PlayerStats {
  gamesPlayed: number
  gamesWon: number
  gamesLost: number
  totalPoints: number
  averagePoints: number
  bestScore: number
  worstScore: number
  winRate: number
  dropRate: number
  declarationSuccessRate: number
  favoriteGameMode: string
  longestWinStreak: number
  currentWinStreak: number
}

export interface PlayerPreferences {
  autoSort: boolean
  soundEnabled: boolean
  animationsEnabled: boolean
  showHints: boolean
  cardTheme: "classic" | "modern" | "traditional"
  tableTheme: "green" | "blue" | "red" | "custom"
}

export interface GameHistory {
  id: string
  roomCode: string
  players: string[]
  winner: string
  playerScore: number
  playerPosition: number
  gameMode: string
  duration: number
  completedAt: Date
  wasDropped: boolean
  wasDeclared: boolean
}

export interface PlayerSession {
  playerId: string
  playerName: string
  sessionId: string
  ipAddress: string
  userAgent: string
  connectedAt: Date
  lastActivity: Date
  isActive: boolean
}
