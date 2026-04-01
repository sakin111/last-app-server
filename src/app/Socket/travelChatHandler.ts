
import { validateChat } from '../utils/validateChat';
import { redisClient } from '../shared/redis';


interface JoinTravelRoomPayload {
  travelId: string;
  userId: string;
}

interface SendTravelMessagePayload {
  travelId: string;
  userId: string;
  message: string;
}

type ChatCallback = (response: any) => void;

export const travelChatHandler = (socket: any, io: any) => {
  socket.on('joinTravelRoom', (payload: JoinTravelRoomPayload) => {
    const { travelId, userId } = payload;
    if (!travelId || !userId) return;
    socket.join(travelId);
    socket.emit('joinedRoom', { travelId });
  });

  socket.on('sendTravelMessage', async (data: SendTravelMessagePayload, callback: ChatCallback) => {
    const { validated, message } = validateChat(data);
    if (!validated) {
      if (callback) callback({ success: false, message });
      return;
    }
    const { travelId, userId, message: msg } = data;
    const chatMsg = { userId, message: msg, timestamp: Date.now() };
    await redisClient.rPush(`travelChat:${travelId}`, JSON.stringify(chatMsg));
    io.to(travelId).emit('receiveTravelMessage', chatMsg);
    if (callback) callback({ success: true });
  });

  socket.on('getTravelChatHistory', async (payload: { travelId: string }, callback: ChatCallback) => {
    const { travelId } = payload;
    if (!travelId) {
      if (callback) callback([]);
      return;
    }
    const messages = await redisClient.lRange(`travelChat:${travelId}`, 0, -1);
    const chatHistory = messages.map((msg) => {
      try { return JSON.parse(msg); } catch { return null; }
    }).filter(Boolean);
    if (callback) callback(chatHistory);
  });
};
