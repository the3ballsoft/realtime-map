var express = require('express'); 
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/static', express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

var users = [];

io.on('connection', function(socket){
    console.log('Usuario conectado');
    
    socket.on('chat message', function(msg){
      io.emit('chat message', msg);
      console.log('message: ' + msg);
    });

    socket.on('new user', function(user){
      socket.nick = user.username;
      users.push(user);

      io.emit('users', users);
    });
    
    socket.on('user move', function(user){
      console.log("SE moviio un usuario *", user.username);
      for (var i = 0, len = users.length; i < len; i++) {
        if(users[i].username === user.username){
          user[i] = user;        
          break;
        } 
      }

      io.emit('users', users);
    });

    socket.on('disconnect', function(){

      if (!socket.nick) {
        return;
      }

      for (var i = 0; i < users.length; i++) {
        if (users[i].username === socket.nick) {
          console.log('- Se ha desconectado: '+users[i].username);
          users.splice(i, 1);
          io.emit('users', users);
          break;
        }
      }
    });
});

http.listen(3000, function(){
  console.log('Escuchando en  *:3000');
});
