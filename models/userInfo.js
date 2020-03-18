const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    firstName : {
      type: String,
      required: true
    },
    lastName : {
      type: String,
      required: true
    },
    displayName : {
      type: String,
      required: true
    }
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  birthDate : {
    type: Date,
    required: true
  },
  phoneNumber : {
    type: Number,
    required: true
  },
  nidNumber : {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  updated: { 
    type: Date, 
    default: Date.now
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
