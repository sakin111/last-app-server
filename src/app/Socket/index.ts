import { Server as IOServer } from 'socket.io';
import { server } from '../../server';
import { travelChatHandler } from './travelChatHandler';


export let io: IOServer;

export const initSocket = () => {
  io = new IOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    travelChatHandler(socket, io);
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
