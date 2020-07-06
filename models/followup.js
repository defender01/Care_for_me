const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  name: String,
  inputType: String,
  options: [String],

  minVal: Number,
  maxVal: Number,
  isImportant: Boolean,
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = {
    followupQuesModel: mongoose.model("followupQuesModel", questionSchema),
};
