var currentRooms = {};

var createChat = function(server) {
  var guestnumber = 1;
  var nicknames = {};
  
  var io = require("socket.io")(server);

  io.on('connection', function(socket) {
    var guestName = "guest" + guestnumber;
    nicknames[socket.id] = guestName;
    guestnumber++;
    
    joinRoom(socket, "lobby");
    
    io.to(currentRooms[socket.id]).emit("message_from_server", guestName + " has joined");
    io.emit("user_list", {
      nicknames: nicknames,
      rooms: currentRooms
    });
    
    socket.emit("nicknameChangeResult", {
      success: true,
      message: guestName
    });
    
    socket.on("message_from_browser", function(data) {
      io.to(currentRooms[socket.id]).emit("message_from_server", nicknames[socket.id] + ": " + data);
    });
    
    socket.on("nicknameChangeRequest", function(data) {
      var nameTaken = false;
      
      Object.keys(nicknames).forEach( function(key) {
        if (nicknames[key] === data) {
          nameTaken = true;
        }
      });
      
      if (nameTaken) {
        socket.emit("nicknameChangeResult", {
          success: false,
          message: "Name Already Taken"
        });
      } else if (data.slice(0, 5) === "guest") {
        socket.emit("nicknameChangeResult", {
          success: false,
          message: "Names cannot begin with 'guest'"
        });
      } else {
        nicknames[socket.id] = data;
        socket.emit("nicknameChangeResult", {
          success: true,
          message: data
        });
        io.emit("user_list", {
          nicknames: nicknames,
          rooms: currentRooms
        });
      }
    });
    
    socket.on("roomChangeRequest", function(data) {
      handleRoomChangeRequests(socket, data);
      io.emit("user_list", {
        nicknames: nicknames,
        rooms: currentRooms
      });
    });
    
    socket.on("disconnect", function() {
      io.to(currentRooms[socket.id]).emit("message_from_server", nicknames[socket.id] + " has disconnected");
      delete nicknames[socket.id];
      io.emit("user_list", {
        nicknames: nicknames,
        rooms: currentRooms
      });
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

module.exports = createChat;