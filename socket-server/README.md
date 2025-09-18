# Rummy Socket.IO Server

This is the Socket.IO server for the 13 Card Indian Rummy multiplayer game.

## Features

- Real-time multiplayer game state synchronization
- Room creation and joining
- Player management
- Game action handling (draw, discard, declare)
- Automatic cleanup of empty rooms

## Deployment

This server is designed to be deployed on Railway.

### Environment Variables

- `PORT`: Server port (Railway will set this automatically)
- `NODE_ENV`: Environment (development/production)

### CORS Configuration

The server is configured to allow connections from:
- `http://localhost:3000` (local development)
- `https://multiplayer-rummy-rcil.vercel.app` (Vercel deployment)
- `https://*.vercel.app` (any Vercel subdomain)

## Local Development

```bash
npm install
npm start
```

The server will run on port 3001 by default (or the PORT environment variable).

## Railway Deployment

1. Connect your GitHub repository to Railway
2. Select this `socket-server` directory as the root
3. Railway will automatically detect the Node.js app and deploy it
4. The server will be available at the Railway-provided URL

## API Events

### Client to Server
- `create-room`: Create a new game room
- `join-room`: Join an existing room
- `leave-room`: Leave current room
- `start-game`: Start the game (host only)
- `game-action`: Perform a game action (draw, discard, declare)

### Server to Client
- `room-created`: Room created successfully
- `room-joined`: Successfully joined a room
- `player-joined`: Another player joined the room
- `player-left`: A player left the room
- `game-started`: Game has started
- `game-state-updated`: Game state has been updated
- `error`: Error occurred
- `join-error`: Error joining room
