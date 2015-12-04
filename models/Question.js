var mongoose = require('mongoose'),
    moment = require('moment'),
    Schema = mongoose.Schema;

var schema = new Schema({
  type: {type: String, required: true, trim: true},
  survey_id: {type: Schema.Types.ObjectId, required: true, trim: true},
  content: {type: String, required: true, trim: true}
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

var Question = mongoose.model('Question', schema);

module.exports = Question;
