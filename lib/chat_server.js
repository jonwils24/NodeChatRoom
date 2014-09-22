var createChat = function(server) {
  var io = require("socket.io")(server);

  io.on('connection', function(socket) {
    socket.on("message_from_browser", function(data) {
      io.emit("message_from_server", data);
    });
  });
};

module.exports = createChat;