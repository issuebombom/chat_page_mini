const express = require('express');
const path = require('path');
const { Server } = require('http');
const socketIo = require('socket.io');

const HOST = '127.0.0.1';
const PORT = 3000;
const app = express();

// ejs 세팅
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.urlencoded({ extended: true }));

// socket.io
const http = Server(app);
const io = socketIo(http, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

let socketList = []; // 채팅에 접속한 모든 유저의 소켓을 보관

io.on('connection', (socket) => {
  socketList.push(socket);
  console.log(`${socket.id}유저가 접속했습니다. (현재 접속자: ${socketList.length}명)`);

  // 누군가 메시지를 등록하면 작성자를 제외한 유저에게 emit합니다.
  socket.on('SEND', (data) => {
    const { msg, user } = data;
    socketList.forEach((item) => {
      if (item !== socket) {
        item.emit('SEND', { msg, user });
      }
    });
  });

  socket.on('disconnect', function () {
    socketList.splice(socketList.indexOf(socket), 1);
    console.log(`${socket.id}유저가 퇴장했습니다. (현재 접속자: ${socketList.length}명)`);
  });
});

app.get('/', (req, res) => {
  res.render('index');
});

http.listen(PORT, HOST, () => {
  console.log('Server is listening...', PORT);
});
