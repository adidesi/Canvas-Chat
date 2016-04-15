//FILE UPLOAD
$('#openFileUpload').click(function(){
  if($('#imageUploadPopUp').is(":visible"))
    $('#imageUploadPopUp').hide();
  $('#fileUploadPopUp').slideToggle();
});

$('#close-file-btn').click(function(){
  if($('#fileUploadPopUp').is(":visible")){
    $('#fileUploadPopUp').slideToggle();
    $('#file-progress-bar').text('0%');
    $('#file-progress-bar').width('0%');
  }
});

$('#upload-file-btn').on('click', function (){
    $('#upload-file-input').click();
    $('#file-progress-bar').text('0%');
    $('#file-progress-bar').width('0%');
});

$('#upload-file-input').on('change', function(){

  socket.emit('preFileUpload',{roomid:roomid});

  var files = $(this).get(0).files;

  if (files.length > 0){
    // create a FormData object which will be sent as the data payload in the
    // AJAX request
    var formData = new FormData();

    // loop through all the selected files and add them to the formData object
    for (var i = 0; i < files.length; i++) {
      var file = files[i];

      // add the files to formData object for the data payload
      formData.append('uploads[]', file, file.name);
    }

    $.ajax({
      url: '/uploadfile',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(data){
          //console.log('file upload successful!\n' + data);
      },
      xhr: function() {
        // create an XMLHttpRequest
        var xhr = new XMLHttpRequest();

        // listen to the 'progress' event
        xhr.upload.addEventListener('progress', function(evt) {

          if (evt.lengthComputable) {
            // calculate the percentage of upload completed
            var percentComplete = evt.loaded / evt.total;
            percentComplete = parseInt(percentComplete * 100);

            // update the Bootstrap progress bar with the new percentage
            $('#file-progress-text').text('File upload : ' + percentComplete + '%');
            $('#file-progress-bar').width(percentComplete + '%');
            
            // once the upload reaches 100%, set the progress bar text to done
            if (percentComplete === 100) {
              $('#file-progress-text').text('File upload : Done');
            }
          }
        }, false);
        return xhr;
      }
    });
  }
});




//IMAGE UPLOAD
$('#openImageUpload').click(function(){
  if($('#fileUploadPopUp').is(":visible")){
    $('#fileUploadPopUp').hide();
  }
  $('#imageUploadPopUp').slideToggle();
});


$('#upload-image-btn').click(function(){
    $('#upload-image-input').click();
    $('#image-progress-text').text('0%');
    $('#image-progress-bar').width('0%');
});

$('#close-image-btn').click(function(){
    if($('#imageUploadPopUp').is(":visible")){
      $('#imageUploadPopUp').slideToggle();
      $('#image-progress-text').text('0%');
      $('#image-progress-bar').width('0%');
    }
});

$('#upload-image-input').on('change', function(){

  socket.emit('preImageUpload',{roomid:roomid});

  var files = $(this).get(0).files;

  if(files.length > 0){
    if(files.length <= 1){
      console.log(files[0]);
      var formData = new FormData();
      formData.append('uploads', files[0], files[0].name);
      $.ajax({
      url: '/uploadimage',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(data){
          //console.log('image upload successful!\n' + data);
      },
      xhr: function() {
        // create an XMLHttpRequest
        var xhr = new XMLHttpRequest();

        // listen to the 'progress' event
        xhr.upload.addEventListener('progress', function(evt) {

          if (evt.lengthComputable) {
            // calculate the percentage of upload completed
            var percentComplete = evt.loaded / evt.total;
            percentComplete = parseInt(percentComplete * 100);

            // update the Bootstrap progress bar with the new percentage
            $('#image-progress-text').text('Image upload : ' + percentComplete + '%');
            $('#image-progress-bar').width(percentComplete + '%');
            
            // once the upload reaches 100%, set the progress bar text to done
            if (percentComplete === 100) {
              $('#image-progress-text').text('Image upload : Done');
              socket.emit('imageSent',{filename: files[0].name, roomid:roomid});
            }
          }
        }, false);
        return xhr;
      }
    });
    }else{
      alert('Upload Single Image File');
      return;
    }   
  }
});