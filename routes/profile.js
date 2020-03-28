const express = require('express')
const router = express.Router()
const User = require('../models/userInfo')

const {
    checkAuthenticated,
    checkNotAuthenticated
  } = require('../controllers/auth_helper');
  

router.get("/profile", checkAuthenticated, async (req, res) => {

    res.render("profile")
    await dataModel.find({}, (err, data) => {
      if (err) throw err;
      else res.render('info_display', { data, displayName });
    });
  
  })

  module.exports = router;