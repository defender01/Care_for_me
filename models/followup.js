const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const parameterSchema = new Schema({
  name: String,
  questions: [
    { 
      _id: Schema.Types.ObjectId,
      name: String,
      inputType: String 
    }
  ],
});

const followupAnswerSchema = new Schema({
  answer: String,
  questionCreated: Date,
  responseTime: Date,
});

const followupQuesSchema = new Schema(
  {
    inputType: String,
    name: String,
    minVal: Number,
    maxVal: Number,
    duration: {
      startDate: Date,
      endDate: Date,
    },
    frequency: Number,
    lastCreated: Date,
    answers: [{ type: Schema.Types.ObjectId, ref: "followupQuesAns" }],
  }
)

const followupRecordSchema = new Schema({
  doctorId: String,
  patientId: String,
  questions: [{ type: Schema.Types.ObjectId, ref: "followupQues" }],
  recordStartDate: Date,
  recordEndDate: Date
});



module.exports = {
  parameterModel: mongoose.model("parameterModel", parameterSchema),
  followupModel: mongoose.model("followupRecord", followupRecordSchema),
  followupQuesModel: mongoose.model("followupQues", followupQuesSchema),
  followupQuesAnsModel: mongoose.model("followuQuesAns", followupAnswerSchema),
};
