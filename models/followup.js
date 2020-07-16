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

module.exports = {
    followupQuesModel: mongoose.model("followupQuesModel", questionSchema)
};
