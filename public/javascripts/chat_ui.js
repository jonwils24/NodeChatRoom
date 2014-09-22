// var io = require("socket.io");
// var Chat = require("./chat_ui");

var getMessage = function() {
  return $("#msg").val();
};

// Chat.prototype.sendMessage = function(message) {
//   this.sendMessage(message);
// };

var showMessage = function(message) {
  var li = $("<li>");
  li.text(message);
  $("ul").prepend(li);
};

$(function() {
  var socket = io();
  var chat = new Chat(socket);
  
  socket.on("message_from_server", function(data) {
    showMessage(data);
  });
  
  $("form").on("submit", function(event) {
    event.preventDefault();
    
    var msg = getMessage();
    chat.sendMessage(msg);
  });
});