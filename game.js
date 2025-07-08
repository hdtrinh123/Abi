const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Serve static files from the public directory
app.use(express.static('public'));

// Store player states
let players = {};

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);
  // Initialize player position
  players[socket.id] = { x: 100, y: 100, id: socket.id };

  // Send current players to the new player
  socket.emit('currentPlayers', players);
  // Notify others of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);

  // Handle player movement
  socket.on('move', (movement) => {
    if (players[socket.id]) {
      players[socket.id].x += movement.x;
      players[socket.id].y += movement.y;
      // Broadcast updated position
      io.emit('playerMoved', players[socket.id]);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});