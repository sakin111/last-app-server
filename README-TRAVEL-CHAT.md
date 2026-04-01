# Real-Time Travel Chat Feature (Socket.IO)

## Features Implemented

1. **Socket.IO Integration**: Added Socket.IO server to enable real-time communication.
2. **Chat Room Logic**: Users join chat rooms based on travel plan IDs, ensuring messages are scoped to relevant travel groups.
3. **Message Events**: Users can send and receive messages in real time. All users in the same travel room get updates instantly.
4. **Chat History**: Users can fetch previous messages for a travel plan (currently in-memory; can be extended to DB).
5. **Validation**: All chat messages are validated for required fields.

## Files Changed/Added

- `src/server.ts`: Integrated Socket.IO server initialization.
- `src/app/Socket/index.ts`: New. Initializes Socket.IO and sets up connection handlers.
- `src/app/Socket/travelChatHandler.ts`: New. Handles chat events (join, send, receive, history) for travel plans.
- `src/app/utils/validateChat.ts`: Used for validating chat messages.

## How It Works

- When a user connects, they join a travel room using the travel plan ID.
- Messages sent to a room are broadcast to all users in that room.
- Chat history is available per travel plan (in-memory for now).
- All events are real-time, enabling instant communication between users.

## Next Steps
- (Optional) Persist chat messages in the database for durability.
- Add authentication/authorization to chat events if needed.
- Implement a frontend to connect to the Socket.IO server and use these events.
