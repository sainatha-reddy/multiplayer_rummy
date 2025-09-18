"use client"

import type { PlayerProfile, PlayerStats, PlayerPreferences, GameHistory, PlayerSession } from "@/types/player"

export class PlayerAuthManager {
  private static readonly STORAGE_KEY = "rummy_player_profile"
  private static readonly SESSION_KEY = "rummy_player_session"
  private static readonly HISTORY_KEY = "rummy_game_history"

  // Create or load player profile
  static getOrCreateProfile(playerName: string): PlayerProfile {
    const existingProfile = this.getStoredProfile(playerName)

    if (existingProfile) {
      // Update last active time
      existingProfile.lastActive = new Date()
      this.saveProfile(existingProfile)
      return existingProfile
    }

    // Create new profile
    const newProfile: PlayerProfile = {
      id: this.generatePlayerId(),
      name: playerName,
      createdAt: new Date(),
      lastActive: new Date(),
      stats: this.createDefaultStats(),
      preferences: this.createDefaultPreferences(),
    }

    this.saveProfile(newProfile)
    return newProfile
  }

  // Get stored profile by name
  private static getStoredProfile(playerName: string): PlayerProfile | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null

      const profiles: PlayerProfile[] = JSON.parse(stored)
      const profile = profiles.find((p) => p.name === playerName)

      if (profile) {
        // Convert date strings back to Date objects
        profile.createdAt = new Date(profile.createdAt)
        profile.lastActive = new Date(profile.lastActive)
      }

      return profile || null
    } catch (error) {
      console.error("[v0] Error loading player profile:", error)
      return null
    }
  }

  // Save player profile
  static saveProfile(profile: PlayerProfile): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      let profiles: PlayerProfile[] = stored ? JSON.parse(stored) : []

      // Update existing or add new
      const existingIndex = profiles.findIndex((p) => p.id === profile.id)
      if (existingIndex >= 0) {
        profiles[existingIndex] = profile
      } else {
        profiles.push(profile)
      }

      // Keep only last 10 profiles per device
      profiles = profiles.slice(-10)

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles))
    } catch (error) {
      console.error("[v0] Error saving player profile:", error)
    }
  }

  // Update player statistics after game
  static updatePlayerStats(
    playerId: string,
    gameResult: {
      won: boolean
      points: number
      position: number
      totalPlayers: number
      wasDropped: boolean
      wasDeclared: boolean
      gameDuration: number
    },
  ): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return

      const profiles: PlayerProfile[] = JSON.parse(stored)
      const profileIndex = profiles.findIndex((p) => p.id === playerId)

      if (profileIndex === -1) return

      const profile = profiles[profileIndex]
      const stats = profile.stats

      // Update basic stats
      stats.gamesPlayed += 1
      if (gameResult.won) {
        stats.gamesWon += 1
        stats.currentWinStreak += 1
        stats.longestWinStreak = Math.max(stats.longestWinStreak, stats.currentWinStreak)
      } else {
        stats.gamesLost += 1
        stats.currentWinStreak = 0
      }

      // Update points
      stats.totalPoints += gameResult.points
      stats.averagePoints = stats.totalPoints / stats.gamesPlayed
      stats.bestScore = Math.min(stats.bestScore, gameResult.points)
      stats.worstScore = Math.max(stats.worstScore, gameResult.points)

      // Update rates
      stats.winRate = (stats.gamesWon / stats.gamesPlayed) * 100
      if (gameResult.wasDropped) {
        stats.dropRate = (stats.dropRate * (stats.gamesPlayed - 1) + 100) / stats.gamesPlayed
      }

      // Update declaration success rate
      if (gameResult.wasDeclared) {
        const previousDeclarations = stats.gamesPlayed - 1
        const previousSuccessful = (stats.declarationSuccessRate / 100) * previousDeclarations
        const newSuccessful = previousSuccessful + (gameResult.won ? 1 : 0)
        stats.declarationSuccessRate = (newSuccessful / stats.gamesPlayed) * 100
      }

      profile.lastActive = new Date()
      profiles[profileIndex] = profile

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles))
    } catch (error) {
      console.error("[v0] Error updating player stats:", error)
    }
  }

  // Save game to history
  static saveGameHistory(playerId: string, gameData: Omit<GameHistory, "id" | "completedAt">): void {
    try {
      const stored = localStorage.getItem(this.HISTORY_KEY)
      let history: GameHistory[] = stored ? JSON.parse(stored) : []

      const gameRecord: GameHistory = {
        ...gameData,
        id: this.generateGameId(),
        completedAt: new Date(),
      }

      history.unshift(gameRecord) // Add to beginning
      history = history.slice(0, 50) // Keep last 50 games

      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history))
    } catch (error) {
      console.error("[v0] Error saving game history:", error)
    }
  }

  // Get player game history
  static getGameHistory(playerId: string): GameHistory[] {
    try {
      const stored = localStorage.getItem(this.HISTORY_KEY)
      if (!stored) return []

      const history: GameHistory[] = JSON.parse(stored)
      return history
        .filter((game) => game.players.includes(playerId))
        .map((game) => ({
          ...game,
          completedAt: new Date(game.completedAt),
        }))
    } catch (error) {
      console.error("[v0] Error loading game history:", error)
      return []
    }
  }

  // Create player session
  static createSession(playerId: string, playerName: string): PlayerSession {
    const session: PlayerSession = {
      playerId,
      playerName,
      sessionId: this.generateSessionId(),
      ipAddress: "local", // For intranet play
      userAgent: navigator.userAgent,
      connectedAt: new Date(),
      lastActivity: new Date(),
      isActive: true,
    }

    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
    } catch (error) {
      console.error("[v0] Error saving session:", error)
    }

    return session
  }

  // Get current session
  static getCurrentSession(): PlayerSession | null {
    try {
      const stored = localStorage.getItem(this.SESSION_KEY)
      if (!stored) return null

      const session: PlayerSession = JSON.parse(stored)
      session.connectedAt = new Date(session.connectedAt)
      session.lastActivity = new Date(session.lastActivity)

      return session
    } catch (error) {
      console.error("[v0] Error loading session:", error)
      return null
    }
  }

  // Update session activity
  static updateSessionActivity(): void {
    try {
      const session = this.getCurrentSession()
      if (session) {
        session.lastActivity = new Date()
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
      }
    } catch (error) {
      console.error("[v0] Error updating session:", error)
    }
  }

  // Clear session
  static clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY)
    } catch (error) {
      console.error("[v0] Error clearing session:", error)
    }
  }

  // Get all stored profiles (for profile selection)
  static getAllProfiles(): PlayerProfile[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []

      const profiles: PlayerProfile[] = JSON.parse(stored)
      return profiles
        .map((profile) => ({
          ...profile,
          createdAt: new Date(profile.createdAt),
          lastActive: new Date(profile.lastActive),
        }))
        .sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime())
    } catch (error) {
      console.error("[v0] Error loading profiles:", error)
      return []
    }
  }

  // Helper methods
  private static generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private static generateGameId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private static createDefaultStats(): PlayerStats {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      totalPoints: 0,
      averagePoints: 0,
      bestScore: 999,
      worstScore: 0,
      winRate: 0,
      dropRate: 0,
      declarationSuccessRate: 0,
      favoriteGameMode: "13-card-rummy",
      longestWinStreak: 0,
      currentWinStreak: 0,
    }
  }

  private static createDefaultPreferences(): PlayerPreferences {
    return {
      autoSort: true,
      soundEnabled: true,
      animationsEnabled: true,
      showHints: true,
      cardTheme: "classic",
      tableTheme: "green",
    }
  }
}
