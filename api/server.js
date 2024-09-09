const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

let messages = [];

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.emit('load_messages', messages);

  socket.on('new_message', (message) => {
    messages.push(message);
    io.emit('receive_message', message);
  });

  socket.on('like_message', (index) => {
    if (messages[index]) {
      messages[index].liked = !messages[index].liked;
      io.emit('update_message', { index, liked: messages[index].liked });
    }
  });

  socket.on('clear_chat', () => {
    messages = [];
    io.emit('chat_cleared');
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

module.exports = (req, res) => {
  server.listen(4000, () => {
    console.log('Server is running on port 4000');
  });
};
