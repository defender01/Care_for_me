const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const mongoose = require("mongoose");
var sizeof = require('object-sizeof');

const {
  forgotpassHandler,
  postResetPass,
  postResetPassDoctor,
  emailVerificationLinkGenerator,
  checkEmailNotVerified,
  emailVerificationHandler,
  checkNotAuthenticated,
  checkAuthenticated,
  checkAuthenticatedDoctor,
} = require("../controllers/auth_helper");
const {checkNotNull}= require("../controllers/functionCollection")
// Load Patient model
const Patient = require("../models/patient");
const { session } = require("passport");
const Doctor = require("../models/doctor").doctorModel;
const Admin = require("../models/admin").adminModel;


// Register Page
router.get("/:role/register", checkNotAuthenticated, (req, res) => {
  let role = req.params.role;
  console.log("came in reg");
  if (role === "doctor") {
    res.render("doctorRegistration");
  } else {
    res.render("registration");
  }
});

// Register
router.post("/patient/register", async (req, res) => {
  console.log(req.body);

  // trimming each value in req.body
  for (let key of Object.keys(req.body)) {
    if (Array.isArray(req.body[key])) {
      for (let i = 0, max = req.body[key].length; i < max; i++) {
        if (checkNotNull(req.body[key][i]))
          req.body[key][i] = req.body[key][i].trim();
      }
    } else {
      if (checkNotNull(req.body[key])) req.body[key] = req.body[key].trim();
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
    termAgree,
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
    !idNumber ||
    !gender ||
    !idChoice ||
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
      termAgree,
    });
  } else {
    try {
      let patients = await Patient.find({
        $or: [
          { email: email },
          { phoneNumber: phoneNumber },
          { idNumber: idNumber },
        ],
      });
      if (patients.length) {
        // console.log(patients);
        patients.forEach((patient) => {
          // console.log(patient);
          if (patient.email == email) errors.push({ msg: "Email already exists" });
          if (patient.phoneNumber == phoneNumber)
            errors.push({ msg: "Phone no already exists" });
          if (patient.idNumber == idNumber)
            errors.push({
              msg:
                "ID number(NID/ Passport/ Birth Certificate no) already exists",
            });
        });
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
      } else {
        const newPatient = new Patient({
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
          location: {
            country: country,
            state: state,
            city: city,
            additionalAddress: additionalAddress,
          },
          termAgree: termAgree,
        });

        console.log({ newPatient });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newPatient.password, salt, async (err, hash) => {
            if (err) res.render("404", { error: err.message });
            newPatient.password = hash;
            console.log({ newPatient });
            await newPatient.save();
            req.flash("success_msg", "You are now registered and can log in");
            res.redirect("/auth/login");
          });
        });
      }
    } catch (err) {
      console.error(err);
      res.render("404", { error: err.message });
      return;
    }
  }
});

// Doctor Register
router.post("/doctor/register", async (req, res) => {
  console.log(req.body)
  let reqBody = req.body;
  let requiresCastingToArray = [
    "educationId",
    "degree",
    "institute",
    "passingYear",
    "subject",
    "trainingId",
    "trainingName",
    "trainingYear",
    "trainingDetails",
    "workId",
    "workPlace",
    "workFromYear",
    "workToYear",
    "awardId",
    "awardName",
    "awardYear",
    "awardDetails",
  ];

  requiresCastingToArray.forEach((value) => {
    //console.log(value + " " + Object.prototype.hasOwnProperty.call(reqBody, value))
    if (Object.prototype.hasOwnProperty.call(reqBody, value)) {
      reqBody[value] = Array.isArray(reqBody[value])
        ? reqBody[value]
        : [reqBody[value]];
    } else reqBody[value] = [];
  });

  // trimming each value in req.body
  for (let key of Object.keys(reqBody)) {
    if (Array.isArray(reqBody[key])) {
      for (let i = 0, max = reqBody[key].length; i < max; i++) {
        if (checkNotNull(reqBody[key][i]))
          reqBody[key][i] = reqBody[key][i].trim();
      }
    } else {
      if (checkNotNull(reqBody[key])) reqBody[key] = reqBody[key].trim();
    }
  }

  console.log(reqBody);

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
    educationId,
    degree,
    institute,
    passingYear,
    subject,
    trainingId,
    trainingName,
    trainingYear,
    trainingDetails,
    workId,
    workPlace,
    workFromYear,
    workToYear,
    awardId,
    awardName,
    awardYear,
    awardDetails,
    termAgree,
  } = reqBody;

  let education = [],
    training = [],
    workAndExperience = [],
    awardAndHonour = [];
  for (let i = 0, max = degree.length; i < max; i++) {
    let instance = {
      _id: (typeof educationId[i] == 'undefined' || educationId[i] == '' || !educationId[i].match(/^[0-9a-fA-F]{24}$/)) ? new mongoose.Types.ObjectId(): mongoose.Types.ObjectId(educationId[i]),
      degree: degree[i],
      institute: institute[i],
      passingYear: passingYear[i],
      subject: subject[i],
    };
    education.push(instance);
  }
  for (let i = 0, max = trainingName.length; i < max; i++) {
    let instance = {
      _id: (typeof trainingId[i] == 'undefined' || trainingId[i] == '' || !educationId[i].match(/^[0-9a-fA-F]{24}$/)) ? new mongoose.Types.ObjectId(): mongoose.Types.ObjectId(trainingId[i]),
      name: trainingName[i],
      year: trainingYear[i],
      details: trainingDetails[i],
    };
    training.push(instance);
  }
  for (let i = 0, max = workPlace.length; i < max; i++) {
    let instance = {
      _id: (typeof workId[i] == 'undefined' || workId[i] == '' || !educationId[i].match(/^[0-9a-fA-F]{24}$/)) ? new mongoose.Types.ObjectId(): mongoose.Types.ObjectId(workId[i]),
      workPlace: workPlace[i],
      workFromYear: workFromYear[i],
      workToYear: workToYear[i],
    };
    workAndExperience.push(instance);
  }
  for (let i = 0, max = awardName.length; i < max; i++) {
    let instance = {
      _id: (typeof awardId[i] == 'undefined' || awardId[i] == '' || !educationId[i].match(/^[0-9a-fA-F]{24}$/)) ? new mongoose.Types.ObjectId(): mongoose.Types.ObjectId(awardId[i]),
      name: awardName[i],
      year: awardYear[i],
      details: awardDetails[i],
    };
    awardAndHonour.push(instance);
  }

  let doctorInfo = {
    name: {
      firstName: firstName,
      lastName: lastName,
      displayName: displayName,
    },
    email: email,
    password: password,
    birthDate: birthDate,
    phoneNumber: phoneNumber,
    licenseOrReg: licenseOrReg,
    gender: gender,
    location: {
      country: country,
      state: state,
      city: city,
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
  };

  console.log(doctorInfo);

  let errors = [];

  if (
    !firstName ||
    !lastName ||
    !displayName ||
    !email ||
    !password ||
    !password2 ||
    !phoneNumber ||
    !licenseOrReg ||
    !designation ||
    (degree.length && (degree.includes("") || degree.includes(undefined))) ||
    (trainingName.length &&
      (trainingName.includes("") || trainingName.includes(undefined))) ||
    (workPlace.length &&
      (workPlace.includes("") || workPlace.includes(undefined))) ||
    (awardName.length &&
      (awardName.includes("") || awardName.includes(undefined))) ||
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
    res.render("doctorRegistration", {
      errors,
      doctorInfo,
    });
  } else {
    try {
      let doctors = await Doctor.find({
        $or: [
          { email: email },
          { phoneNumber: phoneNumber },
          { licenseOrReg: licenseOrReg },
        ],
      });
      if (doctors.length) {
        // console.log(doctors);
        doctors.forEach((doctor) => {
          // console.log(doctor);
          if (doctor.email == email)
            errors.push({ msg: "Email already exists" });
          if (doctor.phoneNumber == phoneNumber)
            errors.push({ msg: "Phone no already exists" });
          if (doctor.licenseOrReg == licenseOrReg)
            errors.push({
              msg: "License or registration number already exists",
            });
        });
        res.render("doctorRegistration", {
          errors,
          doctorInfo,
        });
      } else {
        const newDoctor = new Doctor(doctorInfo);
        // console.log({ newDoctor });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newDoctor.password, salt, async (err, hash) => {
            if (err) res.render("404", { error: err.message });
            newDoctor.password = hash;
            // console.log({ newDoctor });
            await newDoctor.save();
            req.flash("success_msg", "You are now registered and can log in");
            res.redirect("/auth/login");
          });
        });
      }
    } catch (err) {
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

  const { role, emailOrPhone } = req.body;
  console.log(req.body);
  let successRedirectUrl;
  if (role == "patient") {
    let patient = await Patient.findOne({
      $or: [{ email: emailOrPhone }, { phoneNumber: emailOrPhone }],
    });
    console.log("checking patient");
    console.log(patient);
    // if patient is signing in using otp we should reset the otp to null
    if (patient) {
      if (typeof patient.otp == "undefined" || patient.otp == "") {
        successRedirectUrl = patient.emailVerified
          ? sessionURL || "/"
          : "/patient/accountVerification";
      } else {
        successRedirectUrl = "/patient/resetpassword";
      }
    } else successRedirectUrl = "/";

    passport.authenticate("patientStrategy", {
      successRedirect: successRedirectUrl,
      failureRedirect: "/auth/login",
      failureFlash: true,
    })(req, res, next);
  } else {
    let doctor = await Doctor.findOne({
      $or: [{ email: emailOrPhone }, { phoneNumber: emailOrPhone }],
    });
    console.log("checking doctor");
    // if doctor is signing in using otp we should reset the otp to null
    if (doctor) {
      if (typeof doctor.otp == "undefined" || doctor.otp == "") {
        successRedirectUrl = doctor.emailVerified
          ? sessionURL || "/"
          : "/doctor/accountVerification";
      } else {
        successRedirectUrl = "/doctor/resetpassword";
      }
    } else successRedirectUrl = "/";

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
router.post("/forgotpass", forgotpassHandler);

router.get("/verify_email/:hash", emailVerificationHandler);


// login for admin
router.get("/login/admin",checkNotAuthenticated, (req, res) => res.render("adminLogin"));
router.post("/login/admin", async (req, res, next) => {

  delete req.session.returnTo;

  console.log(req.body);

  console.log("checking admin");

  passport.authenticate("adminStrategy", {
    successRedirect: "/admin",
    failureRedirect: "/auth/login/admin",
    failureFlash: true,
  })(req, res, next);
});

// router.get("/adminSave", async (req, res) =>{
//   let email= 'amarshastho@monerdaktar.health'
//   let password= 'skyground5458'
//   {
//     const newUser = new Admin({
//       email: email,
//       password: password,
//     });

//     console.log({ newUser });

//     bcrypt.genSalt(10, (err, salt) => {
//       bcrypt.hash(newUser.password, salt, async (err, hash) => {
//         console.log({err})
//         newUser.password = hash;
//         console.log({ newUser });
//         await newUser.save();
//         req.flash("success_msg", "You are now registered and can log in");
//         res.redirect("/auth/login/admin");
//       });
//     });
//   }
// })
module.exports = router;
