var Chat = function (socket) {
  this.socket = socket;
};

Chat.prototype.sendMessage = function (message) {
  if (message.charAt(0) === "/") {
    this.processCommand(message);
  } else {
    this.socket.emit('message_from_browser', message );
  }
};

Chat.prototype.processCommand = function(message) {
  if (message.slice(1, 5) === "nick") {
    this.socket.emit('nicknameChangeRequest', message.slice(6));
  } else {
    this.showMessage("Unrecognized command");
  }
};
//
// module.exports = Chat;