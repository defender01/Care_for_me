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
  role: {
    type: String,
    default: 'patient'
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
    type: String,
    required: true
  },
  phoneNumber : {
    type: String,
    required: true
  },
  idChoice: String,
  idNumber : {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  occupation: String,
  organization: String,
  location:{
    country: String,
    state: String,
    city: String,
    additionalAddress: String,
  },
  otp: {
    type:String
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  termAgree: {
    type: String,
    default: 'No'
  },
  updated: { 
    type: Date, 
    default: Date.now
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
