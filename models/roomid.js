var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roomid = new Schema({
  room: Number,
  roomcount:  Number
});