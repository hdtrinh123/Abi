const socket = io();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const PLAYER_SIZE = 32;
const PLAYER_COLOR = '#4caf50';
const OTHER_COLOR = '#2196f3';

let players = {};
let myId = null;

// Handle keyboard input
const keys = {};
document.addEventListener('keydown', (e) => { keys[e.key] = true; });
document.addEventListener('keyup', (e) => { keys[e.key] = false; });

function sendMovement() {
  let dx = 0, dy = 0;
  if (keys['ArrowUp'] || keys['w']) dy -= 5;
  if (keys['ArrowDown'] || keys['s']) dy += 5;
  if (keys['ArrowLeft'] || keys['a']) dx -= 5;
  if (keys['ArrowRight'] || keys['d']) dx += 5;
  if (dx !== 0 || dy !== 0) {
    socket.emit('move', { x: dx, y: dy });
  }
}

function drawPlayers() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  Object.values(players).forEach((player) => {
    ctx.fillStyle = player.id === myId ? PLAYER_COLOR : OTHER_COLOR;
    ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
  });
}

function gameLoop() {
  sendMovement();
  drawPlayers();
  requestAnimationFrame(gameLoop);
}

// Socket.io events
socket.on('currentPlayers', (serverPlayers) => {
  players = serverPlayers;
  myId = socket.id;
});

socket.on('newPlayer', (player) => {
  players[player.id] = player;
});

socket.on('playerMoved', (player) => {
  if (players[player.id]) {
    players[player.id].x = player.x;
    players[player.id].y = player.y;
  }
});

socket.on('playerDisconnected', (id) => {
  delete players[id];
});

gameLoop(); 