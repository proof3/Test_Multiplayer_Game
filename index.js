import express from 'express';
import http from 'http'
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import uuid from 'uuid-random';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gameStates = {};
//create an array that represents all position in the game
const gameMap = new Array(50).fill().map(() => Array(50).fill(0));


app.get('/', (req, res) => {
  console.log(__dirname + '/index.html');
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  const gameId = uuid();
  gameStates[gameId] = {x: 0, y: 0};
  gameMap[0][0] = 1;
  console.log(gameMap);
  socket.emit("gameId", gameId);
  socket.emit("updateGameState", gameStates);

  socket.on('move', (msg) => {
    console.log('message: ' + JSON.stringify(msg));
    movePlayer(gameId, msg);
    console.log(gameStates);
    io.emit("updateGameState", gameStates);
  });

  socket.on("disconnect", () => {
    console.log("disconnected");
    delete gameStates[gameId];
    socket.emit("updateGameState", gameStates);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});


//make above code more compact
function movePlayer(playerId, move) {
  
  const position = positionOnMove(move);
  if ((gameStates[playerId].x + position.x > -1 && gameStates[playerId].x + position.x < 50) &&
      (gameStates[playerId].y + position.y >= 0 && gameStates[playerId].y + position.y <= 49) &&
    gameMap[gameStates[playerId].x + position.x][gameStates[playerId].y + position.y] === 0) {

    gameMap[gameStates[playerId].x][gameStates[playerId].y] = 0;
    gameStates[playerId].x += position.x;
    gameStates[playerId].y += position.y;
    gameMap[gameStates[playerId].x][gameStates[playerId].y] = 1;
  }
}

function positionOnMove(move) {
  if (move === 'left') {
    return {x: -1, y: 0};
  }
  else if (move === 'right') {
    return {x: 1, y: 0};
  }
  else if (move === 'up') {
    return {x: 0, y: -1};
  }
  else if (move === 'down') {
    return {x: 0, y: 1};
  }
}

