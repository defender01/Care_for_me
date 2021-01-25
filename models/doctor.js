const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    fullName : {
      type: String,
      default: function() {
        return this.name.firstName + " " + this.name.lastName
      }
    },
    displayName: {
      type: String,
      required: true
    }
  },
  role: {
    type: String,
    default: 'doctor'
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  birthDate: {
    type: String
  },
  phoneNumber: {
    type: String,
    required: true
  },
  licenseOrReg: {
    type: String,
    required: true
  },
  gender: {
    type: String
  },
  location: {
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
  education: [{
    _id: mongoose.Schema.Types.ObjectId,
    degree: String,
    institute: String,
    passingYear: Number,
    subject: String
  }],
  training: [{
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    year: String,
    details: String,
  }],
  workAndExperience: [{
    _id: mongoose.Schema.Types.ObjectId,
    workPlace: String,
    workFromYear: Number,
    workToYear: Number,
  }],
  awardAndHonour: [{
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    year: Number,
    details: String
  }],
  otp: {
    type: String
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
  },

});

doctorSchema
  .pre('save', function(next){
   this.name.fullName = this.name.firstName + " " + this.name.lastName
   this.updated = Date.now()
   next();
});

module.exports = {
  doctorModel: mongoose.model("doctor", doctorSchema),
};
