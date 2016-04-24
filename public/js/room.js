var username,
	lastEmit,
	ctx,
	_isEraser = false,
	_color = '#4caf50',
	_radius = 10,
	_erasradius = 10,
	defaultColor = '#4caf50',
	defaultRadius = 10,
	minRad = 0.5,
	maxRad = 50,
	radInterval = 5,
	roomid,
    username;

var socket = io.connect();


socket.on('moving', function (data) {
	if(data.drawing){
		plotPoint(data.event, data.radius, data.color);
	}else{
		ctx.beginPath();
	}
});
socket.on('clearCanvas', function (data) {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
});		
socket.on('imageChange', function(data) {
	if (data.image) {
		var img = new Image();
		img.src = 'data:image/jpeg;base64,' + data.buffer;
		ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
	}
});
socket.on('fileRecieved',function(data){
    for(var i = 0 ; i<data.filenames.length; i++){
        $('#slide-out').append(
            "<li class=\"fixed black-text\"><a href=\"downloads/"+
            data.filenames[i]+"\" target=\"_blank\">"+data.filenames[i]
            +"</a></li>")
    } 
    console.log(data.filenames);
});


$( document ).ready(function(){
    $(".button-collapse").sideNav();
	$(".dropdown-button").dropdown({ belowOrigin: true,hover: true });
    $('.modal-trigger').leanModal();

    roomid = window.location.href.split("#")[1];
	username = window.location.href.split("#")[2];
	
	socket.emit('joinRoom',{roomid : roomid, username : username});

    ctx = $('#paper')[0].getContext('2d');

    $('#btnEraser').click(function(){
    	_isEraser = true;
    });
    $('#btnRadius').click(function(){
    	_isEraser = false;
    });
    $('#btnClear').click(function(){
    	socket.emit('canvasClear',{roomid:roomid});
    });


    $('#btnSave').click(function(){
        var dataURL = ctx.canvas.toDataURL('image/png');
        $('#btnSave').get(0).href = dataURL;
        $('#btnSave').get(0).target = "_blank"
    });

    $('#incrRadius').click(function(){
        if(_radius==0.5)
            _radius=0;
        setRadius(_radius + radInterval, false);
    });

    $('#decrRadius').click(function(){
        setRadius(_radius - radInterval, false);
    });

    $('#incrEraser').click(function(){
        if(_erasradius==0.5)
            _erasradius=0;
        setRadius(_erasradius + radInterval, true);
    });

    $('#decrEraser').click(function(){
        setRadius(_erasradius - radInterval, true);
    });


    var swatches = document.getElementsByClassName('color-swatch');
    for(var i = 0, n = swatches.length; i<n ;i++){
    	swatches[i].addEventListener('click', function(event){
	    	setColor(event.target.style.backgroundColor);
    	});
    }


    initCanvas();
});

function initCanvas(){
    var drawing = false

    lastEmit = $.now();

    setRadius(defaultRadius);
    setColor(defaultColor);

    ctx.canvas.addEventListener('mousemove', function(event){
		sendData(event,drawing);
        if(drawing){
        	if(_isEraser)
				plotPoint(event, _erasradius, 'white');
			else	
	        	plotPoint(event, _radius, _color);
        }
    });
    ctx.canvas.addEventListener('mousedown', function(event){
    	drawing = true;
    	sendData(event,drawing);
    	if(_isEraser)
			plotPoint(event, _erasradius, 'white');
		else	
        	plotPoint(event, _radius, _color);
    });
    ctx.canvas.addEventListener('mouseup', function(event){
    	drawing = false;
    	ctx.beginPath();
    	sendData(event,drawing);
    });
    ctx.canvas.addEventListener('mouseleave', function(event){
    	drawing = false;
    	ctx.beginPath();
    	sendData(event,drawing);
    });
}

function plotPoint(event,radius,color){
	ctx.strokeStyle = color;
	ctx.fillStyle = color;

	ctx.lineWidth = radius*2;
    
    ctx.lineTo(event.clientX - ctx.canvas.offsetLeft, event.clientY - ctx.canvas.offsetTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(event.clientX - ctx.canvas.offsetLeft, event.clientY - ctx.canvas.offsetTop, radius,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(event.clientX - ctx.canvas.offsetLeft, event.clientY - ctx.canvas.offsetTop);
}

function setRadius(newRad,isEraserRadius){
	if(newRad<minRad)
		newRad = minRad;
	else if(newRad>maxRad)
		newRad = maxRad;
    if(isEraserRadius){
        _erasradius = newRad;
        erasSpan.innerHTML = _erasradius;
    }
    else{
        _radius = newRad;
        radSpan.innerHTML = _radius;
    }
}

function setColor(color){
	_color = color;
}

function sendData(event,drawing){
	var tempColor, tempRadius;
	if(_isEraser){
		tempColor = 'white';
		tempRadius = _erasradius;
	}
	else{
		tempColor = _color;
		tempRadius = _radius;
	}
	if($.now() - lastEmit > 30){
		socket.emit('mousemove',{
			'roomid': roomid,
			'event':{	
			'clientX': event.pageX,
			'clientY': event.pageY
			},
			'drawing': drawing,
			'radius': tempRadius,
			'color': tempColor
		});
		lastEmit = $.now();
	}
}