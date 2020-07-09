const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../controllers/auth_helper");

const {
    followupQuesModel 
  } = require("../models/followup");

router.get('/followupQues',checkAuthenticated, (req, res) => {
let displayName = req.user.name.displayName;
    res.render('followupQues', {displayName})
})
  
module.exports = router;
