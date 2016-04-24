
var socket = io.connect();
var username,roomid;
$(document).ready(function(){
	$('.slider').slider({height:600});

	$('#joinRoombtn').click(function(){
		username=prompt("Enter User Name");
		if(username!=null&&username!=""){
			roomid = prompt("Enter Room id");
			if(roomid!=null&&roomid!=""){
				socket.emit('joinRoom',{
					roomid : roomid ,
					username: username
				});

			}
		}
	});
	$('#createRoombtn').click(function(){
		username = prompt("Enter User Name");
		if(username!=null&&username!=""){
			socket.emit('createRoom');
		}
	});
	$('#createProtectedRoombtn').click(function(){
		socket.emit('createProtectedRoom');
	});

	socket.on('roomCreated',function(data){
		roomid = data.roomid;
		console.log('heere');
		window.open("room#"+roomid+"#"+username, "_self");
	});

	socket.on('roomJoined',function(data){
		window.open("room#"+data.roomid+"#"+data.username, "_self");
	});
});