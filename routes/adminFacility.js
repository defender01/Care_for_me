const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const util = require('util')

const {
  sendSectionSubSec,
  saveQuesOp,
  deleteSecSubSecQuesOp,
  getSectionData,
  editProfileQues,
  saveProfileQues,
  getAddQuesDoctor,
  saveDoctorQues
} = require("../controllers/adminFunctions");

const {
  uploadVaccineAndSubstanceToDB,
  clearWholeAnswerCollection
} = require("../controllers/database_controller");

const { questionModel, optionModel } = require("../models/inputCollection");

const { parameterModel } = require("../models/followup");

router.get('/', (req, res)=> {
  res.render('admin')
})

router.get("/addQues/profile", sendSectionSubSec);
router.post("/addQues/profile", saveQuesOp);

router.get("/addQues/doctor", getAddQuesDoctor);
router.post("/addQues/doctor", saveDoctorQues);

router.get("/profile/edit", (req, res) =>{
  res.render('adminProfileQuesCollection')
})
// get profile ques for edit
router.get("/profile/edit/:qId", editProfileQues)
// save profile ques
router.post("/profile/edit", saveProfileQues)

// this is for deleting section subsection....have to delete this later
router.get("/deleteSectionSubsection", deleteSecSubSecQuesOp);

// this is for clearing whole vaccine collection, substance collection and uploading again all vaccines and subtances to the database
router.get("/uploadVaccineAndSubstanceToDB", uploadVaccineAndSubstanceToDB);

// This is for clearing whole answer collection
router.get("/clearWholeAnswerCollection", clearWholeAnswerCollection)

// this provides new id
router.get('/getNewId', async (req, res) => {
  res.send({ id: new mongoose.Types.ObjectId() })
})

module.exports = router;
