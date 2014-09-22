var Chat = function (socket) {
  this.socket = socket;
};

Chat.prototype.sendMessage = function (message) {
  this.socket.emit('message_from_browser', message );
};
//
// module.exports = Chat;