const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const {
  checkAuthenticated,
  checkNotAuthenticated,
  checkAuthenticatedDoctor,
  checkEmailVerified
} = require("../controllers/auth_helper");


const { parameterModel } = require("../models/followup");

router.get('/followupQues',checkAuthenticatedDoctor, checkEmailVerified, async (req, res) => {
  let parameters = await parameterModel.find({})
  let navDisplayName = req.user.name.displayName;
    res.render('followupQues', {navDisplayName, parameters})
})

// this provides new id
router.get('/getNewId', (req, res) => {
  res.send({ id: new mongoose.Types.ObjectId() })
})


module.exports = router;
