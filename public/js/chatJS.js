$(document).ready(function(){
    $('.myPopUp').hide();
    $('#chat-screen').hide();

    $('#chat-head').click(function(){
        $('#chat-screen').slideToggle();
    });

    $('#chat-send-btn').click(function(){
        if($('#chat-input').val()!=""){
            var chatbody = document.getElementById('chat-body');
            var newMessageElement = "<div class= \"msgOUT\"><div class = \"msgHEAD\">"
             + "ME" + "</div> <div class = \"msgBODY\">"+ $('#chat-input').val() + "</div></div>";
            chatbody.innerHTML += newMessageElement;
            socket.emit('clientMessage',
                {
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

socket.on('login', function() {
    var loginObjectJson = sessionStorage.getItem('loginname');
    var username = JSON.parse(loginObjectJson);
    while(username===null || username==="")
    {
        username = prompt('What username would you like to use?');
    }
    socket.emit('login', username);
});

