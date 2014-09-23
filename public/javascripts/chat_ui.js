// var io = require("socket.io");
// var Chat = require("./chat_ui");

Chat.prototype.getMessage = function() {
  return $("#msg").val();
};

// Chat.prototype.sendMessage = function(message) {
//   this.sendMessage(message);
// };

Chat.prototype.showMessage = function(message) {
  var li = $("<li class='list-group-item'>");
  li.text(message);
  $(".message").prepend(li);
};

Chat.prototype.showUsers = function(data) {
  var nicknames = data.nicknames;
  var rooms = data.rooms;
  $(".members").empty();
  Object.keys(nicknames).forEach( function(key) {
    var li = $("<li class='list-group-item'>");
    li.text(nicknames[key] + ": " + rooms[key]);
    $(".members").prepend(li);
  });
};

$(function() {
  var socket = io();
  var chat = new Chat(socket);
  
  socket.on("message_from_server", function(data) {
    chat.showMessage(data);
  });
  
  socket.on("user_list", function(data) {
    chat.showUsers(data);
  });
  
  socket.on("roomChange", function(data) {
    chat.room = data;
    chat.showMessage("joined " + chat.room)
  });
  
  socket.on("nicknameChangeResult", function(data) {
    if (data.success) {
      chat.showMessage("Nickname changed to " + data.message);
    } else {
      chat.showMessage(data.message);
    }
  });
  
  $("form").on("submit", function(event) {
    event.preventDefault();
    
    var msg = chat.getMessage();
    chat.sendMessage(msg);
    $("#msg").val("");
  });
});

