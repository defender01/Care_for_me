const mongoose = require("mongoose");

const homeSchema = new mongoose.Schema({
  aboutUs: String ,
  services: [{
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    details: String
  }],
  features: [{
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    details: String
  }],
  reviews: [{
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    details: String
  }],
});

module.exports = {
  homeModel: mongoose.model("home", homeSchema),
};
