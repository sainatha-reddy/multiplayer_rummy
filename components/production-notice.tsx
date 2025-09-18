"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export function ProductionNotice() {
  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50">
      <AlertDescription className="flex items-center gap-2">
        <Badge variant="outline" className="border-amber-300 text-amber-700">
          Demo Mode
        </Badge>
        <span className="text-amber-800">
          Multiplayer features are not available in this demo. The full game requires a separate Socket.IO server.
        </span>
      </AlertDescription>
    </Alert>
  )
}
