"use client"

import { useState } from "react"
import type { Card as CardType, Declaration } from "@/types/game"
import { RummyLogic } from "@/lib/rummy-logic"
import { PlayingCard } from "./playing-card"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface DeclarationModalProps {
  hand: CardType[]
  wildJoker?: CardType
  onConfirm: () => void
  onCancel: () => void
}

export function DeclarationModal({ hand, wildJoker, onConfirm, onCancel }: DeclarationModalProps) {
  const [declaration] = useState<Declaration>(() => RummyLogic.validateDeclaration(hand, wildJoker))

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {declaration.isValid ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                Valid Declaration
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                Invalid Declaration
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Declaration Status */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant={declaration.isValid ? "default" : "destructive"}>
                  {declaration.isValid ? "VALID" : "INVALID"}
                </Badge>
                <div className="text-sm text-muted-foreground">Points: {declaration.points}</div>
              </div>

              {!declaration.isValid && (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">You will receive {Math.min(80, declaration.points)} penalty points</span>
                </div>
              )}
            </div>
          </Card>

          {/* Sequences */}
          {declaration.sequences.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Sequences</h3>
              {declaration.sequences.map((sequence, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={sequence.isValid ? "default" : "destructive"}>
                      {sequence.type === "pure" ? "Pure Sequence" : "Impure Sequence"}
                    </Badge>
                    {sequence.isValid ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex gap-1">
                    {sequence.cards.map((card) => (
                      <PlayingCard key={card.id} card={card} size="sm" isDisabled />
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Sets */}
          {declaration.sets.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Sets</h3>
              {declaration.sets.map((set, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={set.isValid ? "default" : "destructive"}>Set</Badge>
                    {set.isValid ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex gap-1">
                    {set.cards.map((card) => (
                      <PlayingCard key={card.id} card={card} size="sm" isDisabled />
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Requirements Check */}
          <Card className="p-4 bg-muted/50">
            <h4 className="font-medium mb-2">Declaration Requirements</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                {declaration.sequences.some((s) => s.type === "pure" && s.isValid) ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span>At least 1 pure sequence</span>
              </div>
              <div className="flex items-center gap-2">
                {declaration.sequences.length >= 2 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span>At least 2 sequences total</span>
              </div>
              <div className="flex items-center gap-2">
                {hand.length === 13 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span>Exactly 13 cards</span>
              </div>
            </div>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm} variant={declaration.isValid ? "default" : "destructive"}>
            {declaration.isValid ? "Declare & Win" : "Declare Anyway"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
