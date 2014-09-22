var createChat = require("./chat_server.js");

var http = require("http"),
    static = require('node-static'),
    socketio = require('socket.io');
    
var file = new static.Server('./public');

var server = http.createServer(function (req, res) {
  req.addListener('end', function () {
    file.serve(req, res);
  }).resume();
});

createChat(server);

server.listen(8000);