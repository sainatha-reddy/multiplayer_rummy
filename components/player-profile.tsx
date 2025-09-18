"use client"

import { useState } from "react"
import type { PlayerProfile } from "@/types/player"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Target, TrendingUp, Award, BarChart3, History } from "lucide-react"
import { PlayerAuthManager } from "@/lib/player-auth"

interface PlayerProfileProps {
  profile: PlayerProfile
  onClose: () => void
}

export function PlayerProfile({ profile, onClose }: PlayerProfileProps) {
  const [gameHistory] = useState(() => PlayerAuthManager.getGameHistory(profile.id))

  const getSkillLevel = (winRate: number): { level: string; color: string } => {
    if (winRate >= 80) return { level: "Master", color: "text-purple-600" }
    if (winRate >= 60) return { level: "Expert", color: "text-blue-600" }
    if (winRate >= 40) return { level: "Advanced", color: "text-green-600" }
    if (winRate >= 20) return { level: "Intermediate", color: "text-yellow-600" }
    return { level: "Beginner", color: "text-gray-600" }
  }

  const skillLevel = getSkillLevel(profile.stats.winRate)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <div className="flex items-center gap-2">
                  <Badge className={skillLevel.color}>{skillLevel.level}</Badge>
                  <span className="text-sm text-muted-foreground">
                    Member since {profile.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="history">Game History</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{profile.stats.gamesPlayed}</div>
                  <div className="text-sm text-muted-foreground">Games Played</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{profile.stats.gamesWon}</div>
                  <div className="text-sm text-muted-foreground">Games Won</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{profile.stats.winRate.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{profile.stats.currentWinStreak}</div>
                  <div className="text-sm text-muted-foreground">Win Streak</div>
                </Card>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Metrics
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Win Rate</span>
                        <span>{profile.stats.winRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={profile.stats.winRate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Declaration Success</span>
                        <span>{profile.stats.declarationSuccessRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={profile.stats.declarationSuccessRate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Drop Rate</span>
                        <span>{profile.stats.dropRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={profile.stats.dropRate} className="h-2" />
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Scoring Stats
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Average Points:</span>
                      <span className="font-medium">{profile.stats.averagePoints.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Best Score:</span>
                      <span className="font-medium text-green-600">{profile.stats.bestScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Worst Score:</span>
                      <span className="font-medium text-red-600">{profile.stats.worstScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Points:</span>
                      <span className="font-medium">{profile.stats.totalPoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Longest Win Streak:</span>
                      <span className="font-medium text-blue-600">{profile.stats.longestWinStreak}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5" />
                <h3 className="font-semibold">Recent Games</h3>
              </div>

              {gameHistory.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="text-muted-foreground">No games played yet</div>
                </Card>
              ) : (
                <div className="space-y-2">
                  {gameHistory.slice(0, 10).map((game) => (
                    <Card key={game.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              game.winner === profile.id ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          <div>
                            <div className="font-medium">
                              Room {game.roomCode} • {game.players.length} players
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {game.completedAt.toLocaleDateString()} at {game.completedAt.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{game.playerScore} points</div>
                          <div className="text-sm text-muted-foreground">
                            {game.playerPosition === 1
                              ? "1st"
                              : game.playerPosition === 2
                                ? "2nd"
                                : game.playerPosition === 3
                                  ? "3rd"
                                  : `${game.playerPosition}th`}{" "}
                            place
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5" />
                <h3 className="font-semibold">Achievements</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Achievement cards */}
                <Card className={`p-4 ${profile.stats.gamesWon >= 1 ? "bg-green-50 border-green-200" : "opacity-50"}`}>
                  <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    <div>
                      <div className="font-medium">First Victory</div>
                      <div className="text-sm text-muted-foreground">Win your first game</div>
                    </div>
                  </div>
                </Card>

                <Card className={`p-4 ${profile.stats.gamesWon >= 10 ? "bg-green-50 border-green-200" : "opacity-50"}`}>
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-blue-500" />
                    <div>
                      <div className="font-medium">Veteran Player</div>
                      <div className="text-sm text-muted-foreground">Win 10 games</div>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-4 ${profile.stats.longestWinStreak >= 5 ? "bg-green-50 border-green-200" : "opacity-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                    <div>
                      <div className="font-medium">Hot Streak</div>
                      <div className="text-sm text-muted-foreground">Win 5 games in a row</div>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-4 ${profile.stats.bestScore <= 10 ? "bg-green-50 border-green-200" : "opacity-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <Target className="w-8 h-8 text-red-500" />
                    <div>
                      <div className="font-medium">Perfect Game</div>
                      <div className="text-sm text-muted-foreground">Win with 10 or fewer points</div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  )
}
