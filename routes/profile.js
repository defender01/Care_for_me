const express = require('express')
const router = express.Router()
const User = require('../models/userInfo')

const {
    checkAuthenticated,
    checkNotAuthenticated
  } = require('../controllers/auth_helper');
  

router.get("/", checkAuthenticated, async (req, res) => {
    var displayName = req.user.name.displayName
    await User.find({email : req.user.email}, (err, data) => {
        console.log(data)
        if (err) throw err
        else res.render('profile', { data, displayName })
    });
  
  })
  

  module.exports = router;