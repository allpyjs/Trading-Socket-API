// server.js
import express from 'express';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import { io as socketIoClient } from 'socket.io-client';

const app = express();
const server = http.createServer(app);
const ioServer = new SocketIO(server, {
  cors: {
    origin: '*', // allow all origins for simplicity, restrict in production
  }
});

const REMOTE_WS_URL = 'https://tradingpoin.com:2053';

// Connect to the remote WebSocket API
const remoteSocket = socketIoClient(REMOTE_WS_URL, {
  transports: ['websocket'],
  upgrade: false,
});

// When connected to remote API
remoteSocket.on('connect', () => {
  console.log('Connected to remote WebSocket API');
});

// Relay data from remote API to your clients
remoteSocket.on('new_price', (data) => {
  ioServer.emit('new_price', data);
});

remoteSocket.on('disconnect', () => {
  ioServer.emit('disconnect');
});

remoteSocket.on('connect_failed', () => {
  ioServer.emit('connect_failed');
});

remoteSocket.on('error', () => {
  ioServer.emit('error');
});


// Handle incoming connections from your Vue app
ioServer.on('connection', (socket) => {
  console.log('Frontend client connected');

  // Optionally handle events from Vue client
  socket.on('disconnect', () => {
    console.log('Frontend client disconnected');
  });

  socket.on('payload', (payload) => {
    console.log(payload);
    remoteSocket.emit('join', payload);
  });
});

// Start server
const PORT = 7011; // or any port you prefer
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});