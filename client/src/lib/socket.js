import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

let socket = null;

export const connectSocket = () => {
  const token = useAuthStore.getState().token;

  if (!token) return null;

  socket = io(import.meta.env.VITE_API_URL, {
    auth: { token },
    autoConnect: true,
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};