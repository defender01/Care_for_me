const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sectionSchema = new Schema({
  name: String,
  subSections: [{ type: Schema.Types.ObjectId, ref: 'subSection' }],
});

const subSectionSchema = new Schema({
  name: String,
  questions: [{ type: Schema.Types.ObjectId, ref: 'question' }]
});

const questionSchema = new Schema({
  name: String,
  inputType: String,
  options: [{ type: Schema.Types.ObjectId, ref: 'option' }],
  qLabel: String
});

const optionSchema = new Schema({
  name: String,
  hasRelatedQuestions: {
    type: Boolean,
    default: false,
  },
  questions: [{ type: Schema.Types.ObjectId, ref: 'question' }],
});

const answerSchema = new Schema({
   userid : {
     type : Schema.Types.ObjectId 
   },
   question : {
     type: Schema.Types.ObjectId,
     ref: 'question'
   },
   additionalId:{
     type : String
   },
   answer : [String]
})

exports.sectionModel = mongoose.model('section', sectionSchema);
exports.subSectionModel = mongoose.model('subSection', subSectionSchema);
exports.questionModel = mongoose.model('question', questionSchema);
exports.optionModel = mongoose.model('option', optionSchema);
exports.answerModel = mongoose.model('answer', answerSchema);