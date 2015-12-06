var mongoose = require('mongoose'),
    moment = require('moment'),
    Schema = mongoose.Schema;

var schema = new Schema({
  type: {type: String, required: true, trim: true},
  seq: {type: Number, default: 0},
  survey_id: {type: Schema.Types.ObjectId, required: true, trim: true},
  content: {type: String, trim: true},
  selection: [{
    selection1: {type: String},
    selection2: {type: String},
    selection3: {type: String},
    selection4: {type: String}
  }]
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

var Question = mongoose.model('Question', schema);

module.exports = Question;
