const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
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
    type: String,
    required: true
  },  
  licenseOrReg: String,
  gender: {
    type: String,
    required: true
  },
  location:{
    country: String,
    state: String,
    city: String,
    additionalAddress: String,
  },
  about: String,
  designation: String,
  affiliation: String,
  researchArea: String,
  expertiseArea: String, 
  education:[{
    degree: String,
    institute: String,    
    passingYear: Number,
    subject: String
  }],
  training:[{
    trainingName: String,
    trainingYear: String,
    trainingDetails: String,
  }],
  workAndExperiance: [{
    workPlace: String,
    workFromYear: Number,
    workToYear: Number,
  }],
  awardAndHonour:[{
    awardName: String,
    awardYear: Number,
    awardDetails: String
  }],
  termAgree: {
    type: String,
    default: 'No'
  },
  created: { 
    type: Date, 
    default: Date.now
  },

});

module.exports = {
  doctorModel: mongoose.model("doctor", doctorSchema),
};
