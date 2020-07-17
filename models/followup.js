const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  name: String,
  inputType: String,
  minVal: Number,
  maxVal: Number,
  duration: {
    startDate: Date,
    endDate: Date
  },
  frequency: Number
})

const parameterSchema =  new Schema({
  name: String,
})

module.exports = {
    followupQuesModel: mongoose.model("followupQuesModel", questionSchema),
    parameterModel: mongoose.model("parameterModel", parameterSchema),
};
