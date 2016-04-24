
var express= require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var mongoose = require('mongoose');
var fs = require('fs');
var formidable = require('formidable');
var shortid = require('shortid');
var util = require('util');

var port = process.env.PORT || 20203;

server.listen(port, function(){
  console.log('listening on *: '+port);
});

//Static folder client
app.use('/public', express.static(path.join(__dirname,'./public')));
app.use('/css', express.static(path.join(__dirname,'./public','/css')));
app.use('/fonts', express.static(path.join(__dirname,'./public','/fonts')));
app.use('/font', express.static(path.join(__dirname,'./public','/fonts')));
app.use('/font-awesome', express.static(path.join(__dirname,'./public','/font-awesome')));
app.use('/js', express.static(path.join(__dirname,'./public','/js')));
app.use('/img', express.static(path.join(__dirname,'./public','/img')));
app.use('/downloads', express.static(path.join(__dirname,'./public','/uploads')));
app.use('/picts', express.static(path.join(__dirname,'./public','/picts')));

//mongoose Models
var RoomList = mongoose.model('roomlist', {_id: String, roomcount:  Number});
var MapList = mongoose.model('maplist', {_id :String, room : String});
var DocList = mongoose.model('doclist', {_id :String, docs : [{_id: String}]});

// Initialize appication with routes / <-(that means root of the application)
app.get('/', function(req, res){
	res.sendFile('home-page.html',{root:path.join(__dirname,'./public')});
});
app.get('/room', function(req, res){
	res.sendFile('room.html',{root:path.join(__dirname,'./public')});
});
app.post('/uploadfile', function(req, res){
	// create an incoming form object
	var form = new formidable.IncomingForm();
	// specify that we want to allow the user to upload multiple files in a single request
	form.multiples = true;
	// store all uploads in the /uploads directory
	form.uploadDir = path.join(__dirname, './public', '/uploads');
	// every time a file has been uploaded successfully,
	// rename it to it's orignal name
	form.on('file', function(field, file) {
		fs.rename(file.path, path.join(form.uploadDir, file.name));
	});
	// log any errors that occur
	form.on('error', function(err) {
		console.log('An error has occured: \n' + err);
	});
	// once all the files have been uploaded, send a response to the client
	form.on('end', function() {
		res.end('success');
	});
	// parse the incoming request containing the form data
	form.parse(req);
});
app.post('/uploadimage', function(req, res){
	// create an incoming form object
	var form = new formidable.IncomingForm();
	// specify that we want to allow the user to upload multiple files in a single request
	form.multiples = true;
	// store all uploads in the /uploads directory
	form.uploadDir = path.join(__dirname, './public', '/uploads', '/canvasimages');
	// every time a file has been uploaded successfully,
	// rename it to it's orignal name
	form.on('file', function(field, file) {
		fs.rename(file.path, path.join(form.uploadDir, file.name));
	});
	// log any errors that occur
	form.on('error', function(err) {
		console.log('An error has occured: \n' + err);
	});
	// once all the files have been uploaded, send a response to the client
	form.on('end', function() {
		res.end('success');
	});
	// parse the incoming request containing the form data
	form.parse(req);
});

//Connection to mongoDB
mongoose.connect('mongodb://127.0.0.1/canvaschatlist', function(err, db) {
    // connection code goes inside
    if(err) throw err;
    console.log("Connected to mongoDB successfully!");
    io.on('connection', function(socket){

    	console.log("User connected with socketid: " + socket.id);

    	socket.on('mousemove', function (data) {
    		// This line sends the event (broadcasts it) to everyone except the originating client.
    		socket.broadcast.to(data.roomid).emit('moving', data);
		});

    	socket.on('canvasClear', function (data) {
    		// This line sends the event (broadcasts it) to everyone including the originating client.
    		io.in(data.roomid).emit('clearCanvas', data);
		});

    	socket.on('joinRoom',function(data){
    		RoomList.find({_id : data.roomid},function(err,tempRoom){
    			if(tempRoom.length>0){
	    		RoomList.update({_id : data.roomid},{$inc : {roomcount : 1}},function(err){});

	    		var newMap = new MapList({
	    			_id : socket.id,
	    			room : data.roomid
	    		});
	    		newMap.save(function(err,newRoom){
	    			if(err) return console.log(err);
	    		});

	    		console.log('joinRoom data : ' + data.roomid);
	    		socket.emit('roomJoined', data);
	    		socket.join(data.roomid);
    			}else{
    				socket.emit('errorMessage',{message : 'Roomid '+data.roomid+' is invalid!'});
    			}
    		});
    	});

    	socket.on('createRoom',function(){
    		var roomid = shortid.generate();
    		console.log('Room Created : ' + roomid);
	      	//Increment room and roomcount from roomid
	      	var newRoom = new RoomList({
		      	_id : roomid,
		      	roomcount : 0
	      	});
	      	newRoom.save(function(err,newRoom){
		      	if(err) return console.log(err);
	      	});
      		//log and send the current roomid to the user
      		socket.emit('roomCreated', {roomid : roomid});
  		});

    	socket.on('imageSent', function (data) {
    		console.log("recieved an image : "+data.filename);
    		fs.stat(path.join(__dirname, './public', '/uploads', '/canvasimages', data.filename), function(err,stats){
    			if(err){
    				console.log(err);
    				return;
    			}
    			if(stats.isFile()){
    				console.log('image present');
    				fs.readFile(path.join(__dirname, './public', '/uploads', '/canvasimages', data.filename), function(err, buf){
            			// it's possible to embed binary data within arbitrarily-complex objects
			            var tempString =  buf.toString('base64');
			            io.in(data.roomid).emit('imageChange', { image: true,buffer:tempString});
			            console.log('image file is initialized');
			        });
    			}
    		});
    	});

	    socket.on('clientMessage',function(data){
	      	socket.broadcast.to(data.roomid).emit('serverMessage', data);
	    });
	    
	    socket.on('fileSent',function(data){
	      	var serverfiles = new Array();
	      	DocList.find({_id :data.roomid},function(err, tempDoc){
		        if(tempDoc.length > 0){//it exits
		          	for(var i = 0 ; i <data.filenames.length ; i++){
			            tempDoc[0].docs.push({_id : data.filenames[i].filename});
			            serverfiles.push(data.filenames[i].filename+"");
		          	}
		          	tempDoc[0].save(function(err){
		            	if(err) return console.log(err);
		          	});
		        }else{//create one
		          	var doclist = new DocList({
		            	_id : data.roomid,
		            	docs : []
		          	});
		          	for(var i = 0 ; i < data.filenames.length ; i++){
		            	doclist.docs.push({_id : data.filenames[i].filename});
		            	serverfiles.push(data.filenames[i].filename+"");
		          	}
		          	doclist.save(function (err){
		            	if(err)return console.log(err);
		          	});
		        }
		        io.in(data.roomid).emit('fileRecieved', { filenames :serverfiles});
		  	});
	    });

	    socket.on('disconnect',function(err){
	      	MapList.find({_id : socket.id},function(err,tempMap){
		        if(tempMap.length > 0){
		          	RoomList.update({_id : tempMap[0].room},{$inc : {roomcount : -1}},function(err){});
		          	RoomList.find({_id : tempMap[0].room},function(err,tempRoom){
			            if(tempRoom.length > 0 && tempRoom[0].roomcount == 0){
			              	DocList.find({_id : tempMap[0].room},function(err,tempDoc){
				                if(tempDoc.length>0){
				                  	tempDoc[0].remove();
				                }
			              	});
			              	tempRoom[0].remove();
			            }
		          	});
		          	tempMap[0].remove();
		        }
	      	});
	     	console.log('User is disconnected : '+socket.id);
	    });

	    socket.on('mistrial',function(){
	      	console.log('mishere');
	    });
	});
});