var Chat = function (socket) {
  this.socket = socket;
  this.room = socket.id;
};

Chat.prototype.sendMessage = function (message) {
  if (message.charAt(0) === "/") {
    this.processCommand(message);
  } else {
    this.socket.emit('message_from_browser', "[" + this.room + "]: " + message );
  }
};

Chat.prototype.processCommand = function(message) {
  if (message.slice(1, 5) === "nick") {
    this.socket.emit('nicknameChangeRequest', message.slice(6));
  } else if (message.slice(1, 5) === "join") {
    this.socket.emit("roomChangeRequest", message.slice(6));
  } else {
    this.showMessage("Unrecognized command");
  }
};
//
// module.exports = Chat;