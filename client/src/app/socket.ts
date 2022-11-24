import { io } from 'socket.io-client';

export const socketConnect = (id: number) => {
  const URL = 'https://localhost:3000';
  const socket = io(URL);

  // socket.onAny((event: any, ...args: any[]) => {
  //   console.log(event, args);
  // });

  socket.on('connect_error', (err) => {
    console.log('Error while creating a socket connection');
  });

  socket.auth = { id };
  socket.connect();

  return socket;
};
