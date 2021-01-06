const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const mongoose = require("mongoose");
const User = require("../../models/userInfo");
const {
  sectionModel,
  vaccineModel,
  substanceModel,
  answerModel,
} = require("../../models/inputCollection");
const { getSectionData } = require("../../controllers/adminFunctions");

//import camelCase function
const camelCase = require("../../controllers/functionCollection").camelCase;

const {
  checkAuthenticated,
  checkNotAuthenticated,
  checkEmailVerified,
} = require("../../controllers/auth_helper");

module.exports = router;
