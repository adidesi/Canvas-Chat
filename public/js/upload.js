$('#file-upload-btn').on('click', function(){


  socket.emit('preFileUpload',{roomid:roomid});

  var files = $('#upload-file-input').get(0).files;

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
              socket.emit('fileSent',{filename: files[0].name, roomid:roomid});
            }
          }
        }, false);
        return xhr;
      }
    });
  }
});




//IMAGE UPLOAD
$('#image-upload-btn').on('click', function(){

  socket.emit('preImageUpload',{roomid:roomid});

  var files = $('#upload-image-input').get(0).files;

  if(files.length > 0){
    if(files.length <= 1 && files[0].type.match('image.*')){
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