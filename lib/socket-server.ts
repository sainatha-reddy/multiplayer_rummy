import { Server as NetServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import { GameStateManager } from "@/lib/game-state"

// Global variable to store the socket server instance
let io: SocketIOServer | undefined

export function initializeSocketServer(httpServer: NetServer) {
  if (!io) {
    console.log("[v0] Initializing Socket.IO server for Indian Rummy")

    io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*", // Allow all origins for intranet use
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
    })

    // Game state management
    const gameRooms = new Map()
    const playerSockets = new Map()

    io.on("connection", (socket) => {
      console.log("[v0] Player connected:", socket.id)

      // Create new game room
      socket.on("create-room", (playerData) => {
        try {
          const roomCode = generateRoomCode()
          const gameRoom = {
            code: roomCode,
            players: [{ ...playerData, socketId: socket.id, isHost: true }],
            gameState: "waiting",
            maxPlayers: 4,
            createdAt: new Date(),
            currentPlayerIndex: 0,
            deck: [],
            discardPile: [],
            round: 1,
          }

          gameRooms.set(roomCode, gameRoom)
          playerSockets.set(socket.id, { roomCode, playerId: playerData.id })
          socket.join(roomCode)

          socket.emit("room-created", { roomCode, gameRoom })
          console.log("[v0] Room created:", roomCode)
        } catch (error) {
          console.error("[v0] Error creating room:", error)
          socket.emit("create-error", "Failed to create room")
        }
      })

      // Join existing game room
      socket.on("join-room", (data) => {
        try {
          const { roomCode, playerData } = data
          const gameRoom = gameRooms.get(roomCode)

          if (!gameRoom) {
            socket.emit("join-error", "Room not found")
            return
          }

          if (gameRoom.players.length >= gameRoom.maxPlayers) {
            socket.emit("join-error", "Room is full")
            return
          }

          if (gameRoom.gameState !== "waiting") {
            socket.emit("join-error", "Game already in progress")
            return
          }

          // Check if player name already exists
          if (gameRoom.players.some((p: any) => p.name === playerData.name)) {
            socket.emit("join-error", "Player name already taken")
            return
          }

          gameRoom.players.push({ ...playerData, socketId: socket.id, isHost: false })
          playerSockets.set(socket.id, { roomCode, playerId: playerData.id })
          socket.join(roomCode)

          // Notify all players in the room
          io?.to(roomCode).emit("player-joined", gameRoom)
          socket.emit("room-joined", gameRoom)

          console.log("[v0] Player joined room:", roomCode, "Player:", playerData.name)
        } catch (error) {
          console.error("[v0] Error joining room:", error)
          socket.emit("join-error", "Failed to join room")
        }
      })

      // Start game
      socket.on("start-game", () => {
        try {
          const playerInfo = playerSockets.get(socket.id)
          if (!playerInfo) return

          const gameRoom = gameRooms.get(playerInfo.roomCode)
          if (!gameRoom) return

          // Check if player is host
          const player = gameRoom.players.find((p: any) => p.id === playerInfo.playerId)
          if (!player || !player.isHost) {
            socket.emit("error", "Only host can start the game")
            return
          }

          if (gameRoom.players.length < 2) {
            socket.emit("error", "Need at least 2 players to start")
            return
          }

          // Initialize game state
          const initializedGame = GameStateManager.initializeGame(gameRoom.players)
          const updatedGameRoom = { ...gameRoom, ...initializedGame, gameState: "playing" }

          gameRooms.set(playerInfo.roomCode, updatedGameRoom)

          io?.to(playerInfo.roomCode).emit("game-started", updatedGameRoom)
          console.log("[v0] Game started in room:", playerInfo.roomCode)
        } catch (error) {
          console.error("[v0] Error starting game:", error)
          socket.emit("error", "Failed to start game")
        }
      })

      // Handle game actions
      socket.on("game-action", (data) => {
        try {
          const { roomCode, playerId, action, actionData } = data
          const gameRoom = gameRooms.get(roomCode)

          if (!gameRoom) {
            socket.emit("error", "Game room not found")
            return
          }

          // Process the game action
          const updatedGameRoom = GameStateManager.processAction(gameRoom, playerId, action, actionData)
          gameRooms.set(roomCode, updatedGameRoom)

          // Broadcast updated game state to all players
          io?.to(roomCode).emit("game-state-updated", updatedGameRoom)

          console.log("[v0] Game action processed:", action, "in room:", roomCode)
        } catch (error) {
          console.error("[v0] Error processing game action:", error)
          socket.emit("error", (error as Error).message || "Invalid game action")
        }
      })

      // Handle player leaving
      socket.on("leave-room", () => {
        handlePlayerDisconnect(socket.id)
      })

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("[v0] Player disconnected:", socket.id)
        handlePlayerDisconnect(socket.id)
      })

      // Helper function to handle player disconnect
      function handlePlayerDisconnect(socketId: string) {
        const playerInfo = playerSockets.get(socketId)
        if (!playerInfo) return

        const gameRoom = gameRooms.get(playerInfo.roomCode)
        if (!gameRoom) return

        // Remove player from room
        gameRoom.players = gameRoom.players.filter((p: any) => p.socketId !== socketId)

        if (gameRoom.players.length === 0) {
          // Delete empty room
          gameRooms.delete(playerInfo.roomCode)
          console.log("[v0] Room deleted:", playerInfo.roomCode)
        } else {
          // Assign new host if needed
          if (!gameRoom.players.some((p: any) => p.isHost)) {
            gameRoom.players[0].isHost = true
          }

          // Update current player index if needed
          if (gameRoom.gameState === "playing") {
            const disconnectedPlayerIndex = gameRoom.players.findIndex((p: any) => p.id === playerInfo.playerId)
            if (disconnectedPlayerIndex !== -1 && gameRoom.currentPlayerIndex >= disconnectedPlayerIndex) {
              gameRoom.currentPlayerIndex = Math.max(0, gameRoom.currentPlayerIndex - 1)
            }
          }

          // Notify remaining players
          io?.to(playerInfo.roomCode).emit("player-left", gameRoom)
        }

        playerSockets.delete(socketId)
      }
    })

    console.log("[v0] Socket.IO server initialized")
  }
  return io
}

export function getSocketServer() {
  return io
}

function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
