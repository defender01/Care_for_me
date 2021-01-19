const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema({
  name: {
    firstName : {
      type: String,
      required: true
    },
    lastName : {
      type: String,
      required: true
    },
    fullName : {
      type: String,
      default: function() {
        return this.name.firstName + " " + this.name.lastName
      }
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

PatientSchema
  .pre('save', function(next){
   this.name.fullName = this.name.firstName + " " + this.name.lastName
   this.updated = Date.now()
   next();   
});

const Patient = mongoose.model("Patient", PatientSchema);

module.exports = Patient;
