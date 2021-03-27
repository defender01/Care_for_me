const mongoose = require("mongoose");

const homeSchema = new mongoose.Schema({
  coverImagePath: String,
  aboutUs: String,
  aboutUsImagePath: String,
  services: [{
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    details: String
  }],
  features: [{
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    details: String,
    imagePath: String
  }],
  reviews: [{
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    details: String,
    imagePath: String
  }],
});

module.exports = {
  homeModel: mongoose.model("home", homeSchema),
};
