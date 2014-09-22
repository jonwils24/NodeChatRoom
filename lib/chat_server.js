var currentRooms = {};

var createChat = function(server) {
  var io = require("socket.io")(server);
  var nicknames = new NicknameManager(io);
  
  
  io.on('connection', function(socket) {
    joinRoom(socket, "lobby");
    var guestName = nicknames.setInitialNickName(socket);
    
    io.to(currentRooms[socket.id]).emit("message_from_server", guestName + " has joined");
    
    socket.on("message_from_browser", function(data) {
      io.to(currentRooms[socket.id]).emit("message_from_server", nicknames.getNickname(socket) + ": " + data);
    });
    
    socket.on("nicknameChangeRequest", function(data) {
      nicknames.requestNickname(socket, data);
    });
    
    socket.on("roomChangeRequest", function(data) {
      handleRoomChangeRequests(socket, data);
      io.emit("user_list", {
        nicknames: nicknames.nicknames,
        rooms: currentRooms
      });
    });
    
    socket.on("disconnect", function() {
      io.to(currentRooms[socket.id]).emit("message_from_server", nicknames.getNickname(socket) + " has disconnected");
      nicknames.deleteUser(socket);
    });
  });
};

var joinRoom = function(socket, room) {
  currentRooms[socket.id] = room;
  socket.join(room);
  socket.emit("roomChange", room);
};

var handleRoomChangeRequests = function(socket, room) {
  socket.leave(currentRooms[socket.id]);
  joinRoom(socket, room);
};

var NicknameManager = function(io) {
  this.nicknames = {};
  this.io = io;
  this.guestnumber = 1;
};

NicknameManager.prototype.getNickname = function(socket) {
  return this.nicknames[socket.id];
};

NicknameManager.prototype.setInitialNickName = function (socket) {
  var guestName = "guest" + this.guestnumber;
  this.setNickname(socket, guestName);
  this.guestnumber++;
  return guestName;
};

NicknameManager.prototype.setNickname = function(socket, newName) {
  this.nicknames[socket.id] = newName;
  socket.emit("nicknameChangeResult", {
    success: true,
    message: newName
  });
  this.io.emit("user_list", {
    nicknames: this.nicknames,
    rooms: currentRooms
  });
};

NicknameManager.prototype.requestNickname = function(socket, newName) {
  var nameTaken = false;
  var that = this;
  
  console.log(this.nicknames);
  
  Object.keys(this.nicknames).forEach( function(key) {
    if (that.nicknames[key] === newName) {
      nameTaken = true;
    }
  });
  
  if (nameTaken) {
    socket.emit("nicknameChangeResult", {
      success: false,
      message: "Name Already Taken"
    });
  } else if (newName.slice(0, 5) === "guest") {
    socket.emit("nicknameChangeResult", {
      success: false,
      message: "Names cannot begin with 'guest'"
    });
  } else {
    this.setNickname(socket, newName);
  }
};

NicknameManager.prototype.deleteUser = function(socket) {
  delete this.nicknames[socket.id];
  this.io.emit("user_list", {
    nicknames: this.nicknames,
    rooms: currentRooms
  });
};

module.exports = createChat;