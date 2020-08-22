const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const parameterSchema = new Schema({
  name: String,
  questions: [
    { 
      name: String,
      inputType: String 
    }
  ],
});

const recordSchema = new Schema({
  doctorId: String,
  patientId: String,
  questions: [
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
    },
  ],
});

module.exports = {
  parameterModel: mongoose.model("parameterModel", parameterSchema),
  recordModel: mongoose.model("record", recordSchema),
};
