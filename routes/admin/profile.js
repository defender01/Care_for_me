const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const mongoose = require("mongoose");

const {checkAuthenticatedAdmin } = require("../../controllers/auth_helper");

const {
  sendSectionSubSec,
  saveQuesOp,
  getSectionData,
  editProfileQues,
  saveProfileQues,
} = require("../../controllers/adminFunctions");
const {checkNotNull, preprocessData}= require("../../controllers/functionCollection")


router.get("/addQues", checkAuthenticatedAdmin, sendSectionSubSec);
router.post("/addQues", checkAuthenticatedAdmin, saveQuesOp);

router.get("/edit", checkAuthenticatedAdmin, (req, res) =>{
  let navDisplayName = req.user.name.displayName
  res.render('adminProfileQuesCollection', {navDisplayName})
})
// get profile ques for edit
router.get("/edit/:qId", checkAuthenticatedAdmin, editProfileQues)
// save profile ques
router.post("/edit", checkAuthenticatedAdmin, saveProfileQues)



router.get("/getSectionData/:section", checkAuthenticatedAdmin, getSectionData);

module.exports = router;
