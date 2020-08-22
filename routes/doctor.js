const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../controllers/auth_helper");


const { parameterModel } = require("../models/followup");

router.get('/followupQues',checkAuthenticated, async (req, res) => {
  let parameters = await parameterModel.find({})
  console.log(parameters)
  let navDisplayName = req.user.name.displayName;
    res.render('followupQues', {navDisplayName, parameters})
})

// this provides new id
router.get('/getNewId', (req, res) => {
  res.send({ id: new mongoose.Types.ObjectId() })
})


module.exports = router;
