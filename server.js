(async () => {
  const cons = require("coloured-logs");
  const express = require("express");
  const ejs = require('ejs');
  const xss = require('xss');
  const http = require('http');
  const path = require("path");
  const socketIo = require('socket.io');
  const port = 3000;

  const app = express();
  const server = http.createServer(app);
  const io = socketIo(server);

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.json());

  app.get("/", (req, res) => {
    res.render("index");
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    // Handle messages
    socket.on('messageSent', (data) => {
      var message = data;
      // Character MaxLength Check
      if (message.length > 800) {
        // Send data only to the client that sent the event
        socket.emit('messageUpdate', {
          "message": message,
          "origin": "own",
          "error": "Message exceeds maximum length (800 characters)"
        });

        return;
      }

      // XSS Sanitization
      var message = message.replace(/\n/g, '<br>');
      var message = xss(message, {
        whiteList: { br: [] }, // Allow <br> for line breaks
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script']
      });
    
      // Send data to all clients except the sender
      socket.broadcast.emit('messageUpdate', {
        "message": message,
        "origin": "other",
        "error": null
      });

      // Send data only to the client that sent the event
      socket.emit('messageUpdate', {
        "message": message,
        "origin": "own",
        "error": null
      });
    });
  });

  server.listen(port, () => {
    cons.server(`Server listening on port ${port}`);
  });
})();
