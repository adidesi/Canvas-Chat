$(document).ready(function(){
    $('.myPopUp').hide();
    $('#chat-screen').hide();
    $('#file-screen').hide();

    $('#chat-head').click(function(){
        $('#chat-screen').slideToggle();
    });
    $('#file-head').click(function(){
        $('#file-screen').slideToggle();
    });

    $('#chat-send-btn').click(function(){
        if($('#chat-input').val()!=""){
            var chatbody = document.getElementById('chat-body');
            var newMessageElement = "<div class= \"msgOUT\"><div class = \"msgHEAD\">"
             + "ME" + "</div> <div class = \"msgBODY\">"+ $('#chat-input').val() + "</div></div>";
            chatbody.innerHTML += newMessageElement;
            socket.emit('clientMessage',
                {
                    roomid : roomid,
                    msg:$('#chat-input').val(),
                    user:'HE'
                });
            $('#chat-input').val("");
        }
    });
});

socket.on('serverMessage', function(data) {
    var chatbody = document.getElementById('chat-body');
    var newMessageElement = "<div class= \"msgIN\"><div class = \"msgHEAD\">" 
    + data.user + "</div> <div class = \"msgBODY\">" + data.msg +"</div>";
    chatbody.innerHTML += newMessageElement;
});


