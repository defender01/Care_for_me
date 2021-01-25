const mongoose = require("mongoose");

const doctorPatientSchema = new mongoose.Schema({
  doctor:{
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    phoneNumber: String,
    gender: String
  },
  patient:{
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    phoneNumber: String,
    gender: String
  },
  recordCount: Number
});

module.exports = {
  doctorPatientModel: mongoose.model("doctorPatient", doctorPatientSchema),
};
