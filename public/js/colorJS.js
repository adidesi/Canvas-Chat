
$(document).ready(function(){
    $('#btnColor').css('backgroundColor', _color);
});

$(function(){
	var pixelColor;

    // create canvas and context objects
    var canvas = document.getElementById('picker');
    var ctx = canvas.getContext('2d');

    // drawing active image
    var image = new Image();
    image.onload = function () {
        ctx.drawImage(image, 0, 0, image.width, image.height); // draw the image on the canvas
    }
	
	image.src="picts/colorwheel4.png";

	$('#picker').mousemove(function(e) { // mouse move handler
            // get coordinates of current position
            var canvasOffset = $(canvas).offset();
            var canvasX = Math.floor(e.pageX - canvasOffset.left);
            var canvasY = Math.floor(e.pageY - canvasOffset.top);

            // get current pixel
            var imageData = ctx.getImageData(canvasX, canvasY, 1, 1);
            var pixel = imageData.data;

            // update preview color
            pixelColor = "rgb("+pixel[0]+", "+pixel[1]+", "+pixel[2]+")";
            $('#btnColor').css('backgroundColor', pixelColor);
    });
    
	$('#picker').mouseleave(function(e) { // click event handler
		$('#btnColor').css('backgroundColor',_color);
    });
    $('#picker').click(function(e) { // click event handler
        _color = pixelColor; 
    });
});