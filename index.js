var express= require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var mongoose = require('mongoose');
var fs = require('fs');
var formidable = require('formidable');
var shortid = require('shortid');

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

//mongoose Models
mongoose.model('roomid', {room: Number, roomcount:  Number});
mongoose.model('grouplist', {content: String});


// Initialize appication with routes / <-(that means root of the application)
app.get('/', function(req, res){
	res.sendFile('home-page.html',{root:path.join(__dirname,'./public')});
});
app.get('/room', function(req, res){
	res.sendFile('custom-room.html',{root:path.join(__dirname,'./public')});
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
app.get('/roomid',function(req,res){
  mongoose.model('roomid').find(function(err,results){
    res.send(results);
  });
});
app.get('/grouplist',function(req,res){
  mongoose.model('grouplist').find(function(err,results){
    res.send(results);
  });
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
      console.log('joinRoom data : ' + data.roomid);
      socket.emit('roomJoined', data);
      socket.join(data.roomid);
    });

    socket.on('createRoom',function(){
      var roomid = shortid.generate();
      console.log('Room Created : ' + roomid);
      //Increment room and roomcount from roomid
      //TODO MONGOO

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
            // it's possible to embed binary data
            // within arbitrarily-complex objects
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

    socket.on('disconnect',function(){
      console.log('User is disconnected : '+socket.id);
      // console.log(io.sockets.manager.roomClients[socket.id]);
    });

    socket.on('mistrial',function(){
      console.log('mishere');
    });

	});
});