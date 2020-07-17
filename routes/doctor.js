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

  const { parameterModel } = require("../models/followup");

router.get('/followupQues',checkAuthenticated, async (req, res) => {
  let parameters = await parameterModel.find({})
  let displayName = req.user.name.displayName;
    res.render('followupQues', {displayName, parameters})
})
  
module.exports = router;
