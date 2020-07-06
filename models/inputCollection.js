const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sectionSchema = new Schema({
  name: String,
  subSections: [{ type: Schema.Types.ObjectId, ref: "subSection" }],
});

const subSectionSchema = new Schema({
  name: String,
  questions: [{ type: Schema.Types.ObjectId, ref: "question" }],
});

const questionSchema = new Schema({
  name: String,
  inputType: String,
  options: [{ type: Schema.Types.ObjectId, ref: "option" }],
  qLabel: String,
});

const optionSchema = new Schema({
  name: String,
  hasRelatedQuestions: {
    type: Boolean,
    default: false,
  },
  questions: [{ type: Schema.Types.ObjectId, ref: "question" }],
});

const answerSchema = new Schema({
  userID: {
    type: Schema.Types.ObjectId,
  },
  sectionID: {
    type: Schema.Types.ObjectId,
  },
  subSectionID: {
    type: Schema.Types.ObjectId,
  },
  allAnswers: [
    {
      questionID: {
        type: Schema.Types.ObjectId,
      },
      additionalID: {
        type: Schema.Types.ObjectId,
      },
      answers: [String],
      optionIDsforMCQAnswer : [{
        type: Schema.Types.ObjectId,
      }],
    },
  ],
});

const vaccineSchema = new Schema({
  name: String,
  diseases: [String]
})

const substanceSchema = new Schema({
  name: String,
  category: String
})

exports.sectionModel = mongoose.model("section", sectionSchema);
exports.subSectionModel = mongoose.model("subSection", subSectionSchema);
exports.questionModel = mongoose.model("question", questionSchema);
exports.optionModel = mongoose.model("option", optionSchema);
exports.answerModel = mongoose.model("answer", answerSchema);
exports.vaccineModel = mongoose.model("vaccine", vaccineSchema);
exports.substanceModel = mongoose.model("substance", substanceSchema);