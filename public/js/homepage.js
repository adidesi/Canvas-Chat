
var socket = io.connect();

window.addEventListener('load', function(event) {

	document.getElementById('joinRoombtn').addEventListener('click', function(){
		var roomid="23",username="2";
		
		//Get roomid and username from User
		

		sessionStorage.setItem('roomid', roomid);
		sessionStorage.setItem('username', username);
		window.open("room", "_self");
	});
	document.getElementById('createRoombtn').addEventListener('click', function(){
		socket.emit('createRoom');
	});
	document.getElementById('createProtectedRoombtn').addEventListener('click', function(){
		socket.emit('createProtectedRoom');
	});

	socket.on('roomCreated',function(data){
		var roomid = 5;//data.roomid;
		var username = prompt("Enter User Name");
		sessionStorage.setItem('roomid', roomid);
		sessionStorage.setItem('username', username);
		window.open("room", "_self");
	});
});