const mongoose = require("mongoose");

const diarySchema = new mongoose.Schema({
  title: String,
  description: String,
  patientId: mongoose.Schema.Types.ObjectId,
  images: [{
    _id: mongoose.Schema.Types.ObjectId,
    imagePath: String
  }],
  created:{
    type: Date,
    default: Date.now
  },
});

module.exports = {
  diaryModel: mongoose.model("diary", diarySchema),
};
