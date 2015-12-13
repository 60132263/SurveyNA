var mongoose = require('mongoose'),
    moment = require('moment'),
    Schema = mongoose.Schema;

var schema = new Schema({
  survey_id: {type: Schema.Types.ObjectId, required: true, trim: true},
  question_id: {type: Schema.Types.ObjectId, required: true, trim: true},
  answer: {type: String, trim: true},
  email: {type: String, trim: true},
  selection: [{
    selection1: {type: Number, default: 0},
    selection2: {type: Number, default: 0},
    selection3: {type: Number, default: 0},
    selection4: {type: Number, default: 0}
  }]
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

var Answer = mongoose.model('Answer', schema);

module.exports = Answer;
