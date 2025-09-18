"use client"

import { useEffect } from "react"
import type { GameRoom, Player } from "@/types/game"
import { Trophy, Medal, Award } from "lucide-react"
import { PlayerAuthManager } from "@/lib/player-auth"

interface GameResultsProps {
  gameRoom: GameRoom
  winner: Player | null
  currentPlayer: Player
  onPlayAgain: () => void
}

export function GameResults({ gameRoom, winner, currentPlayer, onPlayAgain }: GameResultsProps) {
  // Sort players by points (ascending - lower is better)
  const sortedPlayers = [...gameRoom.players].sort((a, b) => {
    // Winner always first
    if (winner && a.id === winner.id) return -1
    if (winner && b.id === winner.id) return 1

    // Then by points
    return a.points - b.points
  })

  // <CHANGE> Update player statistics when game ends
  useEffect(() => {
    const currentPlayerData = sortedPlayers.find(p => p.id === currentPlayer.id)
    if (currentPlayerData) {
      const playerPosition = sortedPlayers.findIndex(p => p.id === currentPlayer.id) + 1
      
      PlayerAuthManager.updatePlayerStats(currentPlayer.id, {
        won: winner?.id === currentPlayer.id,
        points: currentPlayerData.points,
        position: playerPosition,
        totalPlayers: gameRoom.players.length,
        wasDropped: currentPlayerData.hasDropped,
        wasDeclared: currentPlayerData.hasDeclared,
        gameDuration: Math.floor((Date.now() - gameRoom.createdAt.getTime()) / 1000 / 60), // minutes
      })

      // Save game to history
      PlayerAuthManager.saveGameHistory(currentPlayer.id, {
        roomCode: gameRoom.code,
        players: gameRoom.players.map(p => p.id),
        winner: winner?.id || '',
        playerScore: currentPlayerData.points,
        playerPosition,
        gameMode: '13-card-rummy',
        duration: Math.floor((Date.now() - gameRoom.createdAt.getTime()) / 1000 / 60),
        wasDropped: currentPlayerData.hasDropped,
        wasDeclared: currentPlayerData.hasDeclared,
      })
    }
  }, [gameRoom, winner, currentPlayer, sortedPlayers])

  const getPositionIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return (
          <div className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">{index + 1}</div>
        )
    }
  }

  return (
    <div className="min-h-screen game-table flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">Game Results</h1>
          {winner && (
            <div className="text-xl text-gray-600">
              🎉 <span className="font-semibold text-orange-600">{winner.name}</span> wins!
            </div>
          )}
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-center">Final Standings</h2>
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  index === 0 ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  {getPositionIcon(index)}
                  <div>
                    <div className="font-semibold text-lg">{player.name}</div>
                    <div className="text-sm text-gray-600">
                      {player.hasDeclared ? 'Declared' : player.hasDropped ? 'Dropped' : 'Active'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">{player.points}</div>
                  <div className="text-sm text-gray-500">points</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Play Again Button */}
        <div className="text-center">
          <button
            onClick={onPlayAgain}
            className="btn-primary px-8 py-3 text-lg font-semibold rounded-lg"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  )
}
