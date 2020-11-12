const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");


const { forgotpassHandler, postResetPass, postResetPassDoctor, emailVerificationLinkGenerator, checkEmailNotVerified, emailVerificationHandler, checkNotAuthenticated, checkAuthenticated, checkAuthenticatedDoctor } = require("../controllers/auth_helper");
// Load User model
const User = require("../models/userInfo");
const { session } = require("passport");
const Doctor = require("../models/doctor").doctorModel;

let checkNotNull = (val) => {
  return typeof val !== "undefined" && val !== "" && val !== null;
};


// Register Page
router.get("/register/:role", checkNotAuthenticated, (req, res) =>{
  let role = req.params.role
  console.log('came in reg')
  if(role === 'doctor'){
    res.render('doctorRegistration')
  }
  else{
    res.render("registration")
  }
});

// Doctor Register
router.post("/register/doctor", async (req, res) => {
  // console.log(req.body)
  let reqBody = req.body;
  let requiresCastingToArray = ['degree',
    'institute',
    'passingYear',
    'subject',
    'trainingName',
    'trainingYear',
    'trainingDetails',
    'workPlace',
    'workFromYear',
    'workToYear',
    'awardName',
    'awardYear',
    'awardDetails'
  ]

  requiresCastingToArray.forEach((value) => {
    //console.log(value + " " + Object.prototype.hasOwnProperty.call(reqBody, value))
    if(Object.prototype.hasOwnProperty.call(reqBody, value)){
      reqBody[value] = Array.isArray(reqBody[value]) ? reqBody[value] : [reqBody[value]]
    }
    else reqBody[value] = []
  })

  // trimming each value in req.body
  for(let key of Object.keys(reqBody)) {
    if(Array.isArray(reqBody[key])){
      for(let i = 0, max = reqBody[key].length; i < max; i++){
        if(checkNotNull(reqBody[key][i])) reqBody[key][i] = reqBody[key][i].trim()
      }
    }
    else{
      if(checkNotNull(reqBody[key])) reqBody[key] = reqBody[key].trim()
    }
  }

  console.log(reqBody)

  const {
    firstName,
    lastName,
    displayName,
    email,
    password,
    password2,
    birthDate,
    phoneNumber,
    licenseOrReg,
    gender,
    country,
    state,
    city,
    additionalAddress,
    about,
    designation,
    affiliation,
    researchArea,
    expertiseArea,
    degree,
    institute,
    passingYear,
    subject,
    trainingName,
    trainingYear,
    trainingDetails,
    workPlace,
    workFromYear,
    workToYear,
    awardName,
    awardYear,
    awardDetails,
    termAgree
  } = reqBody;

  let education = [], training = [], workAndExperience = [], awardAndHonour = [];
  for(let i = 0, max = degree.length; i<max; i++){
    let instance = {
      degree: degree[i],
      institute: institute[i],    
      passingYear: passingYear[i],
      subject: subject[i]
    }
    education.push(instance)
  }
  for(let i = 0, max = trainingName.length; i<max; i++){
    let instance = {
      name: trainingName[i],
      year: trainingYear[i],
      details: trainingDetails[i],
    }
    training.push(instance)
  }
  for(let i = 0, max = workPlace.length; i<max; i++){
    let instance = {
      workPlace: workPlace[i],
      workFromYear: workFromYear[i],
      workToYear: workToYear[i],
    }
    workAndExperience.push(instance)
  }
  for(let i = 0, max = awardName.length; i<max; i++){
    let instance = {
      name: awardName[i],
      year: awardYear[i],
      details: awardDetails[i]
    }
    awardAndHonour.push(instance)
  }
  // console.log(degree)
  // console.log(degree.length)
  // console.log(trainingName)
  // console.log(trainingName.length)
  // console.log(awardName)
  // console.log(awardName.length)

  let doctorInfo = {
    name: {
      firstName:firstName,
      lastName:lastName,
      displayName:displayName,
    },
    email:email,
    password: password,
    birthDate:birthDate,
    phoneNumber:phoneNumber,
    licenseOrReg: licenseOrReg,
    gender: gender,
    location: {
      country:country,
      state:state,
      city:city,
      additionalAddress: additionalAddress,
    },
    about: about,
    designation: designation,
    affiliation: affiliation,
    researchArea: researchArea,
    expertiseArea: expertiseArea,
    education: education,
    training: training,
    workAndExperience: workAndExperience,
    awardAndHonour: awardAndHonour,
    termAgree: termAgree,
  }

  console.log(doctorInfo)

  let errors = [];

  if (
    !firstName ||
    !lastName ||
    !displayName ||
    !email ||
    !password ||
    !password2 ||
    !phoneNumber ||
    !licenseOrReg  ||
    !designation ||
    (degree.length && (degree.includes('') || degree.includes(undefined))) ||
    (trainingName.length && (trainingName.includes('') || trainingName.includes(undefined))) ||
    (workPlace.length && (workPlace.includes('') || workPlace.includes(undefined))) ||
    (awardName.length && (awardName.includes('') || awardName.includes(undefined))) ||
    !termAgree
  ){
    errors.push({ msg: "Please enter all required fields" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (phoneNumber.length < 11) {
    errors.push({ msg: "Phone number must be atleast 11 digits" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("doctorRegistration", {
      errors,
      doctorInfo
    });
  }
  else {
    try{
      let doctors = await Doctor.find({ $or: [ { email: email }, { phoneNumber: phoneNumber }, {licenseOrReg: licenseOrReg}  ]})
      if (doctors.length) {
        console.log(doctors)
        doctors.forEach(doctor => {  
          console.log(doctor)
          if(doctor.email==email)
            errors.push({ msg: "Email already exists" });
          if(doctor.phoneNumber==phoneNumber)
            errors.push({ msg: "Phone no already exists" });
          if(doctor.licenseOrReg==licenseOrReg)
            errors.push({ msg: "License or registration number already exists" });
        })
        res.render("doctorRegistration", {
          errors,
          doctorInfo
        });
      } else {
        const newDoctor = new Doctor(doctorInfo);
        console.log({newDoctor})
        
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newDoctor.password, salt, async (err, hash) => {
            if (err) res.render("404", { error: err.message });
            newDoctor.password = hash;
            console.log({newDoctor})
            await newDoctor.save()
            req.flash(
              "success_msg",
              "You are now registered and can log in"
            );
            res.redirect("/auth/login");
          });
        });
      }
    }catch(err){
      console.error(err);
      res.render("404", { error: err.message });
      return;
    }
  }
});

// Register
router.post("/register/patient", async (req, res) => {
  console.log(req.body)

  // trimming each value in req.body
  for(let key of Object.keys(req.body)) {
    if(Array.isArray(req.body[key])){
      for(let i = 0, max = req.body[key].length; i < max; i++){
        if(checkNotNull(req.body[key][i])) req.body[key][i] = req.body[key][i].trim()
      }
    }
    else{
      if(checkNotNull(req.body[key])) req.body[key] = req.body[key].trim()
    }
  }

  const {
    firstName,
    lastName,
    displayName,
    email,
    password,
    password2,
    birthDate,
    phoneNumber,
    idNumber,
    gender,
    idChoice,
    occupation,
    organization,
    country,
    state,
    city,
    additionalAddress,
    termAgree
  } = req.body;
  let errors = [];

  if (
    !firstName ||
    !lastName ||
    !displayName ||
    !email ||
    !password ||
    !password2 ||
    !birthDate ||
    !phoneNumber ||
    !idNumber  ||
    !gender||
    !idChoice||
    !termAgree
  ) {
    errors.push({ msg: "Please enter all required fields" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (phoneNumber.length < 11) {
    errors.push({ msg: "Phone number must be atleast 11 digits" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("registration", {
      errors,
      firstName,
      lastName,
      displayName,
      email,
      birthDate,
      phoneNumber,
      idNumber,
      gender,
      idChoice,
      occupation,
      organization,
      country,
      state,
      city,
      additionalAddress,
      termAgree
    });
  }
  else {
    try{
      let users = await User.find({ $or: [ { email: email }, { phoneNumber: phoneNumber }, {idNumber: idNumber}  ]})
      if (users.length) {
        console.log(users)
        users.forEach(user => {  
          console.log(user)
          if(user.email==email)
            errors.push({ msg: "Email already exists" });
          if(user.phoneNumber==phoneNumber)
            errors.push({ msg: "Phone no already exists" });
          if(user.idNumber==idNumber)
            errors.push({ msg: "ID number(NID/ Passport/ Birth Certificate no) already exists" });
        })
        res.render("registration", {
          errors,
          firstName,
          lastName,
          displayName,
          email,
          birthDate,
          phoneNumber,
          idNumber,
          gender,
          idChoice,
          occupation,
          organization,
          country,
          state,
          city,
          additionalAddress,
        });
      }else {
        const newUser = new User({
          name: {
            firstName: firstName,
            lastName: lastName,
            displayName: displayName,
          },
          email: email,
          password: password,
          birthDate: birthDate,
          phoneNumber: phoneNumber,
          idNumber: idNumber,
          gender: gender,
          idChoice: idChoice,
          occupation: occupation,
          organization: organization,
          location:{
            country: country,
            state: state,
            city: city,
            additionalAddress: additionalAddress,
          },          
          termAgree: termAgree
        });
        
        console.log({newUser})
        
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, async (err, hash) => {
            if (err) res.render("404", { error: err.message });
            newUser.password = hash;
            console.log({newUser})
            await newUser.save()
            req.flash(
              "success_msg",
              "You are now registered and can log in"
            );
            res.redirect("/auth/login");
          });
        });
      }
    }catch(err){
      console.error(err);
      res.render("404", { error: err.message });
      return;
    }
  }
});

// Login
router.get("/login", checkNotAuthenticated, (req, res) => res.render("login"));

router.post("/login", async (req, res, next) => {
  // stored URL in the session
  let sessionURL = req.session.returnTo;
  // console.log("sessionURL : " + sessionURL)
  delete req.session.returnTo;
  
  const{role, emailOrPhone}=req.body
  console.log(req.body)
  let successRedirectUrl
  if (role == 'patient') {
    let user = await User.findOne({$or: [ { email: emailOrPhone }, { phoneNumber: emailOrPhone } ] })
    console.log('checking user')
    console.log(user)
    // if user is signing in using otp we should reset the otp to null
    if(user){
      if(typeof user.otp == 'undefined' || user.otp==''){
        successRedirectUrl = (user.emailVerified) ? (sessionURL || "/home") : '/auth/accountVerification/patient'
      }
      else{
        successRedirectUrl = "/auth/resetpassword/patient"
      }
    }
    else successRedirectUrl = "/home"

    passport.authenticate("patientStrategy", {
      successRedirect: successRedirectUrl,
      failureRedirect: "/auth/login",
      failureFlash: true,
    })(req, res, next);
  }
  else{
    
    let user = await Doctor.findOne({$or: [ { email: emailOrPhone }, { phoneNumber: emailOrPhone } ] })
    console.log('checking user')
    // if user is signing in using otp we should reset the otp to null
    if(user){
      if(typeof user.otp == 'undefined' || user.otp==''){
        successRedirectUrl = (user.emailVerified) ? (sessionURL || "/home") : '/auth/accountVerification/doctor'
      }
      else{
        successRedirectUrl = "/auth/resetpassword/doctor"
      }
    }
    else successRedirectUrl = "/home"

    passport.authenticate("doctorStrategy", {
      successRedirect: successRedirectUrl,
      failureRedirect: "/auth/login",
      failureFlash: true,
    })(req, res, next);
  }
});

// Logout
router.get("/logout", (req, res) => {
  if (req.user) {
    delete req.session.currentLoggedIn;
    req.logout();
    req.flash("success_msg", "You are logged out");
  } else {
    req.flash("error_msg", "You are not logged in");
  }
  res.redirect("/auth/login");
});

// forgot pass handling
router.post("/forgotpass", forgotpassHandler)

// resetpassword
router.get("/resetpassword/patient", checkAuthenticated, (req, res)=>{
  let navDisplayName = req.user.name.displayName;
  res.render('resetPass', {navDisplayName, role:'patient'})
})
router.post("/resetpassword/patient",checkAuthenticated, postResetPass)

router.get("/resetpassword/doctor", checkAuthenticatedDoctor, (req, res)=>{
  let navDisplayName = req.user.name.displayName;
  res.render('resetPass', {navDisplayName, role:'doctor'})
})
router.post("/resetpassword/doctor",checkAuthenticatedDoctor, postResetPassDoctor)

router.get("/accountVerification/patient", checkAuthenticated, checkEmailNotVerified, async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  let fullName = req.user.name.firstName + " " + req.user.name.lastName
  let userEmail = req.user.email
  let role = "patient"
  res.render("accountVerification", {navDisplayName, fullName, userEmail, role})
})

router.get("/accountVerification/doctor", checkAuthenticatedDoctor, checkEmailNotVerified, async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  let fullName = req.user.name.firstName + " " + req.user.name.lastName
  let userEmail = req.user.email
  let role = "doctor"
  res.render("accountVerification", {navDisplayName, fullName, userEmail, role})
})

router.post("/accountVerification/patient", checkAuthenticated, emailVerificationLinkGenerator)
router.post("/accountVerification/doctor", checkAuthenticatedDoctor, emailVerificationLinkGenerator)

router.get("/verify_email/:hash", emailVerificationHandler)

module.exports = router;
