const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Doctor = require("../../models/doctor").doctorModel;
const { getSectionData } = require("../../controllers/adminFunctions");

//import camelCase function
const camelCase = require("../../controllers/functionCollection").camelCase;

const {
  checkAuthenticatedDoctor,
  checkEmailVerified,
} = require("../../controllers/auth_helper");


router.get("/", checkAuthenticatedDoctor, checkEmailVerified, async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role

  let sectionNames = ['Personal Information', 'Educational Degrees and Certificates', 'Training Sessions', 'Work and Experiences', 'Awards and Honours']
  let sectionIds = ['personalInfo', 'education', 'training', 'workAndExperience', 'awardAndHonour']
  let doctorProfileData = []
  let doctorInfo
  let sectionQuestions = [
    ['First Name', 'Last Name', 'Display Name', 'Date of Birth', 'Gender', 'Designation', 'Affiliation', 'Research Area', 'Expertise Area', 'Email', 'Phone Number', 'License or Registration Number', 'Country', 'State', 'City', 'Additional Address Information', 'About'],
    ['Degree', 'Institute', 'Passing Year', 'Subject'],
    ['Training Name', 'Year', 'Training Details'],
    ['Work Place', 'Work From(year)', 'Work To(year)'],
    ['Award Name', 'Year', 'Award Details']
  ]

  let sectionQuestionIds = [
    ['firstName', 'lastName', 'displayName', 'birthDate', 'gender', 'designation', 'affiliation', 'researchArea', 'expertiseArea', 'email', 'phoneNumber', 'licenseOrReg', 'country', 'state', 'city', 'additionalAddress', 'about',],
    ['degree', 'institute', 'passingYear', 'subject'],
    ['name', 'year', 'details'],
    ['workPlace', 'workFromYear', 'workToYear'],
    ['name', 'year', 'details']
  ]

  try {
    doctorInfo = await Doctor.findOne({ _id: req.user._id });

    for (let i = 0, max = sectionNames.length; i < max; i++) {
      let sectionData = {}

      if (!i) {
        // for personal Info section
        sectionQuestionIds[0].forEach((value) => {
          if (['firstName', 'lastName', 'displayName'].includes(value)) sectionData[value] = doctorInfo['name'][value]
          else if (['country', 'state', 'city', 'additionalAddress'].includes(value)) sectionData[value] = doctorInfo['location'][value]
          else sectionData[value] = doctorInfo[value]
        })
      }
      else sectionData = doctorInfo[sectionIds[i]]

      let singleSection = {
        sectionId: sectionIds[i],
        sectionName: sectionNames[i],
        sectionQuesIds: sectionQuestionIds[i],
        sectionQues: sectionQuestions[i],
        sectionData: sectionData
      }
      doctorProfileData.push(singleSection)
    }

    // console.log(doctorProfileData)

    res.render("doctorProfile", {
      doctorProfileData,
      navDisplayName, userRole
    });
  } catch (err) {
    console.log(err);
    res.send({ msg: err.message });
  }
});

let checkNotNull = (val) => {
  return typeof val !== "undefined" && val !== "" && val !== null;
};

router.get("/update/:sectionID", checkAuthenticatedDoctor, checkEmailVerified, async (req, res) => {
  let sectionID = req.params.sectionID;
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role

  // console.log(sectionID)

  let doctorInfo;

  try {
    doctorInfo = await Doctor.findOne({ _id: req.user._id });
  } catch (err) {
    console.error(err);
    res.render("404", { navDisplayName, userRole, error: err.message });
    return;
  }

  res.render("updateDoctorProfile", { navDisplayName, userRole, doctorInfo, sectionID });
  return;
})

router.post("/update", checkAuthenticatedDoctor, checkEmailVerified, async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role

  // console.log(req.body)
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
    awardDetails
  } = reqBody;

  let education = [],
    training = [],
    workAndExperience = [],
    awardAndHonour = [];
  for (let i = 0, max = degree.length; i < max; i++) {
    let instance = {
      _id: (typeof educationId[i] == 'undefined' || educationId[i] == '' || !educationId[i].match(/^[0-9a-fA-F]{24}$/)) ? new mongoose.Types.ObjectId() : mongoose.Types.ObjectId(educationId[i]),
      degree: degree[i],
      institute: institute[i],
      passingYear: passingYear[i],
      subject: subject[i],
    };
    education.push(instance);
  }
  for (let i = 0, max = trainingName.length; i < max; i++) {
    let instance = {
      _id: (typeof trainingId[i] == 'undefined' || trainingId[i] == '' || !trainingId[i].match(/^[0-9a-fA-F]{24}$/)) ? new mongoose.Types.ObjectId() : mongoose.Types.ObjectId(trainingId[i]),
      name: trainingName[i],
      year: trainingYear[i],
      details: trainingDetails[i],
    };
    training.push(instance);
  }
  for (let i = 0, max = workPlace.length; i < max; i++) {
    let instance = {
      _id: (typeof workId[i] == 'undefined' || workId[i] == '' || !workId[i].match(/^[0-9a-fA-F]{24}$/)) ? new mongoose.Types.ObjectId() : mongoose.Types.ObjectId(workId[i]),
      workPlace: workPlace[i],
      workFromYear: workFromYear[i],
      workToYear: workToYear[i],
    };
    workAndExperience.push(instance);
  }
  for (let i = 0, max = awardName.length; i < max; i++) {
    let instance = {
      _id: (typeof awardId[i] == 'undefined' || awardId[i] == '' || !awardId[i].match(/^[0-9a-fA-F]{24}$/)) ? new mongoose.Types.ObjectId() : mongoose.Types.ObjectId(awardId[i]),
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
    awardAndHonour: awardAndHonour
  };

  // console.log(doctorInfo);

  let errors = [];

  if (
    !firstName ||
    !lastName ||
    !displayName ||
    !email ||
    (typeof password !== "undefined" && !password) ||
    (typeof password2 !== "undefined" && !password2) ||
    !phoneNumber ||
    !licenseOrReg ||
    !designation ||
    (degree.length && (degree.includes("") || degree.includes(undefined))) ||
    (trainingName.length &&
      (trainingName.includes("") || trainingName.includes(undefined))) ||
    (workPlace.length &&
      (workPlace.includes("") || workPlace.includes(undefined))) ||
    (awardName.length &&
      (awardName.includes("") || awardName.includes(undefined)))
  ) {
    errors.push({ msg: "Please enter all required fields" });
  }

  if (typeof password != "undefined" && typeof password2 != "undefined" && password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (phoneNumber.length < 11) {
    errors.push({ msg: "Phone number must be atleast 11 digits" });
  }

  if (typeof password != "undefined" && password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("updateDoctorProfile", {
      navDisplayName, userRole,
      errors,
      doctorInfo,
    })
  } else {
    try {
      let doctors = await Doctor.find({
        $and: [
          { _id: { $ne: req.user._id } },
          {
            $or: [
              { email: email },
              { phoneNumber: phoneNumber },
              { licenseOrReg: licenseOrReg },
            ],
          },
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
        res.render("updateDoctorProfile", {
          navDisplayName, userRole,
          errors,
          doctorInfo,
        })
      } else {
        let doctor = await Doctor.findOne({ _id: req.user._id });
        doctor.name = doctorInfo.name
        doctor.email = doctorInfo.email
        if (typeof password !== "undefined") doctor.password = password;
        doctor.birthDate = doctorInfo.birthDate
        doctor.phoneNumber = doctorInfo.phoneNumber
        doctor.licenseOrReg = doctorInfo.licenseOrReg
        doctor.gender = doctorInfo.gender
        doctor.location = doctorInfo.location
        doctor.about = doctorInfo.about
        doctor.designation = doctorInfo.designation
        doctor.affiliation = doctorInfo.affiliation
        doctor.researchArea = doctorInfo.researchArea
        doctor.expertiseArea = doctorInfo.expertiseArea
        doctor.education = doctorInfo.education
        doctor.training = doctorInfo.training
        doctor.workAndExperience = doctorInfo.workAndExperience
        doctor.awardAndHonour = doctorInfo.awardAndHonour

        if (typeof password !== "undefined") {
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(doctor.password, salt, async (err, hash) => {
              if (err) res.render("404", {navDisplayName, userRole, error: err.message });
              doctor.password = hash;
              console.log('password change')
              // console.log({ doctor });
              await doctor.save();
              req.flash("success_msg", "Your data has successfully updated. Please login again");
              req.logout();
              res.redirect("/auth/login");
            });
          });
        }else {
          // console.log({doctor})
          await doctor.save()
          res.redirect("/");
        }
      }
    } catch (err) {
      console.error(err);
      res.render("404", { navDisplayName, userRole, error: err.message });
      return;
    }
  }
})

module.exports = router;
