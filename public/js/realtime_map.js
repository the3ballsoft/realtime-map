
var socket = io();
var map;
var markers = [];

$('#loginForm').submit(login);

function login(e){
  e.preventDefault;

  var data = {
    username : $("#username").val() 
  };

  var html = new EJS({url: '/static/templates/chat.ejs'}).render(data);

  $("#main").html(html);
  $('#chatForm').submit(sendMessage);

  navigator.geolocation.getCurrentPosition(function(position){
    var lat = position.coords.latitude
    var lng = position.coords.longitude

    initialize(new google.maps.LatLng(lat, lng));

    var new_user = {
      "username" : data.username,
      "lat" : lat, 
      "lng" : lng 
    };

    socket.emit('new user', new_user);

    var watchID = navigator.geolocation.watchPosition(function(position) {
      var lat = position.coords.latitude
      var lng = position.coords.longitude
      var user = {
        "username" : data.username,
        "lat" : lat, 
        "lng" : lng 
      };

      socket.emit('user move', user);
    });
  });

  return false;
}

function sendMessage(e){
  e.preventDefault();

  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  return false;
}

socket.on('chat message', function(msg){
  $('#messages').append($('<li>').text(msg));
});

socket.on('users', function(users){
  addMarkers(users);
});

function addMarkers(users){
  clearMarkers();
  for (var i = 0, len = users.length; i < len; i++) {
    var location = new google.maps.LatLng(users[i].lat, users[i].lng);
    var marker = new google.maps.Marker({
      position: location,
      map: map
    });

    var infowindow = new google.maps.InfoWindow({
      content: '<div><strong>'+ users[i].username +'</strong></div>'
    });

    markers.push(marker);
    infowindow.open(map, marker);
  }
}

function clearMarkers(){
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
    markers = [];
  }
} 

function initialize(coords) {
  var mapOptions = {
    zoom: 19,
    center: coords ,
    mapTypeId: google.maps.MapTypeId.TERRAIN
  };

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}
