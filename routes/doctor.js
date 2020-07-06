const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const {
    followupQuesModel 
  } = require("../models/followup");

router.get('/followupQues', (req, res) => {
    res.render('followupQues')
})
  
module.exports = router;
