"use client"

import { useState, useEffect } from "react"
import type { PlayerProfile } from "@/types/player"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, User, Clock } from "lucide-react"
import { PlayerAuthManager } from "@/lib/player-auth"
import { PlayerProfile as PlayerProfileComponent } from "./player-profile"

interface PlayerSelectorProps {
  onPlayerSelect: (profile: PlayerProfile) => void
}

export function PlayerSelector({ onPlayerSelect }: PlayerSelectorProps) {
  const [profiles, setProfiles] = useState<PlayerProfile[]>([])
  const [newPlayerName, setNewPlayerName] = useState("")
  const [showNewPlayer, setShowNewPlayer] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<PlayerProfile | null>(null)

  useEffect(() => {
    const loadedProfiles = PlayerAuthManager.getAllProfiles()
    setProfiles(loadedProfiles)
    setShowNewPlayer(loadedProfiles.length === 0)
  }, [])

  const handleCreateNewPlayer = () => {
    if (!newPlayerName.trim()) return

    const profile = PlayerAuthManager.getOrCreateProfile(newPlayerName.trim())
    onPlayerSelect(profile)
  }

  const handleSelectExistingPlayer = (profile: PlayerProfile) => {
    // Update last active time
    const updatedProfile = PlayerAuthManager.getOrCreateProfile(profile.name)
    onPlayerSelect(updatedProfile)
  }

  const getSkillBadge = (winRate: number) => {
    if (winRate >= 60) return <Badge className="badge-skill badge-expert">Expert</Badge>
    if (winRate >= 40) return <Badge className="badge-skill badge-advanced">Advanced</Badge>
    if (winRate >= 20) return <Badge className="badge-skill badge-intermediate">Intermediate</Badge>
    return <Badge className="badge-skill badge-beginner">Beginner</Badge>
  }

  if (selectedProfile) {
    return <PlayerProfileComponent profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3 gradient-text">Select Player</h2>
        <p className="text-lg text-gray-600">Choose an existing player or create a new one</p>
      </div>

      {/* Existing Players */}
      {profiles.length > 0 && (
        <div className="space-y-6">
          <h3 className="font-semibold flex items-center gap-3 text-xl text-gray-900">
            <User className="w-6 h-6 text-orange-500" />
            Recent Players
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profiles.map((profile) => (
              <Card
                key={profile.id}
                className="p-6 cursor-pointer card-hover transition-all duration-200 bg-white"
                onClick={() => handleSelectExistingPlayer(profile)}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-xl">
                      {profile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-lg text-gray-900">{profile.name}</span>
                      {getSkillBadge(profile.stats.winRate)}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-4 mb-2">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        {profile.stats.gamesPlayed} games
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {profile.stats.winRate.toFixed(0)}% win rate
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      Last played {profile.lastActive.toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedProfile(profile)
                    }}
                    className="hover:bg-orange-500 hover:text-white border-orange-500 text-orange-500"
                  >
                    View Stats
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* New Player Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-3 text-xl text-gray-900">
            <Plus className="w-6 h-6 text-orange-500" />
            New Player
          </h3>
          {profiles.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setShowNewPlayer(!showNewPlayer)} className="hover:bg-orange-500 hover:text-white border-orange-500 text-orange-500">
              {showNewPlayer ? "Hide" : "Show"}
            </Button>
          )}
        </div>

        {showNewPlayer && (
          <Card className="p-6 card-hover bg-white">
            <div className="space-y-4">
              <Input
                placeholder="Enter your name"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className="input-enhanced h-12 text-lg"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && newPlayerName.trim()) {
                    handleCreateNewPlayer()
                  }
                }}
              />
              <Button 
                onClick={handleCreateNewPlayer} 
                disabled={!newPlayerName.trim()} 
                className="w-full h-12 text-lg font-semibold btn-primary"
              >
                Create Player Profile
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
