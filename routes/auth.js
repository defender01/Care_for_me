const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')
// Load User model
const User = require('../models/userInfo')
const { checkNotAuthenticated } = require('../controllers/auth_helper')


// Login Page
router.get('/login', checkNotAuthenticated, (req, res) => res.render('login'))

// Register Page
router.get('/register', checkNotAuthenticated, (req, res) => res.render('registration'))

// Register
router.post('/register', (req, res) => {
  const {firstName, lastName, displayName, email, password, password2, birthDate, phoneNumber, nidNumber, birthCertificateNumber, passportNumber, gender } = req.body
  let errors = []

  if (!firstName || !lastName || !displayName || !email || !password || !password2 || !birthDate || !phoneNumber || !(nidNumber || birthCertificateNumber || passportNumber) || !gender ) {
    errors.push({ msg: 'Please enter all required fields' })
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' })
  }

  
  if (phoneNumber.length < 11) {
    errors.push({ msg: 'Phone number must be atleast 11 digits' })
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' })
  }

  if (errors.length > 0) {
    res.render('registration', {
      errors,
      firstName,
      lastName,
      displayName,
      email,
      birthDate,
      phoneNumber,
      nidNumber,
      gender 
    })
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' })
        res.render('registration', {
          errors,
          firstName,
          lastName,
          displayName,
          email,
          birthDate,
          phoneNumber,
          nidNumber,
          gender 
        })
      } 
      else {
        const newUser = new User({
          name: {
            firstName : firstName,
            lastName : lastName,
            displayName : displayName
          },
          email: email,
          password: password,
          birthDate : birthDate,
          phoneNumber : phoneNumber,
          nidNumber : nidNumber,
          gender: gender
        })

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err
            newUser.password = hash
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                )
                res.redirect('/auth/login')
              })
              .catch(err => console.log(err))
          })
        })
      }
    })
  }
})

// Login
router.post('/login', async (req, res, next) => {
  console.log(req.body)
  passport.authenticate('local', {
    successRedirect: '/data/collection',
    failureRedirect: '/auth/login',
    failureFlash: true
  })(req, res, next)
})

// Logout
router.get('/logout', (req, res) => {
  if(req.user){
    req.logout()
    req.flash('success_msg', 'You are logged out')  
  }
  else{
    req.flash('error_msg', 'You are not logged in')
  }
  res.redirect('/auth/login')
})

module.exports = router