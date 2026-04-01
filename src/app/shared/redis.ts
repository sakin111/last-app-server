import { createClient } from 'redis';
import { envVar } from '../config/envVar';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const client = createClient({
    username: 'default',
    password: envVar.REDIS_PASSWORD,
    socket: {
        host: envVar.REDIS_URL,
        port: parseInt(envVar.REDIS_PORT)
    }
});

export const redisClient = client;

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Connected to Redis');
  }
};
