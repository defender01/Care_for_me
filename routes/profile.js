const express = require("express");
const router = express.Router();
const User = require("../models/userInfo");
const {
  vaccineModel,
  substanceModel,
  answerModel,
} = require("../models/inputCollection");
const { getSectionData } = require("../controllers/adminFunctions");

//import camelCase function
const camelCase = require("../controllers/functionCollection").camelCase;

const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../controllers/auth_helper");

router.get("/", checkAuthenticated, async (req, res) => {
  var displayName = req.user.name.displayName;
  await User.find({ email: req.user.email }, (err, data) => {
    console.log(data);
    if (err) throw err;
    else res.render("profile", { data, displayName });
  });
});

// let physicalDiseases = ["Asthma", "Aneurysm", "Diabetes", "Epilepsy Seizures", "Headaches or migraines", "Heart diseases", "High blood pressure", "Kidney disease", "Lung Disease", "Migraine", "Arthritis", "Elevated cholesterol", "Multiple Sclerosis", "Stroke", "Thyroid", "Tuberculosis", "Bleeding disorder"]
// let mentalDiseases = ["Neurocognitive disordero: dementia/ alzheimer’s disease", "Neurodevelopmental disorder", "Obsessive compulsive disorder", "Schizophrenia", "Depression", "Panic disorder", "Mood disorder", "Attention deficit hyperactivity disorder", "Convulsions", "Somatoform disorder", "Stress disorder", "Eating disorder", "Impulsive control disorder", "Substance abuse disorder"]
// let physicalDiseasesJson = []
// let mentalDiseasesJson = []

// for(var i=0; i<physicalDiseases.length; i++) {
//   physicalDiseasesJson.push({
//     name: physicalDiseases[i],
//     id: camelCase(physicalDiseases[i])})
// }
// for(var i=0; i<mentalDiseases.length; i++) {
//   mentalDiseasesJson.push({
//     name: mentalDiseases[i],
//     id: camelCase(mentalDiseases[i])})
// }

router.get("/edit", checkAuthenticated, async (req, res) => {
  let displayName = req.user.name.displayName;
  let substanceData, vaccineData;
  
  await vaccineModel.find({}, (err, data) => {
    console.log(data);
    if (err) throw err;
    else vaccineData = data;
  });

  await substanceModel.find({}, (err, data) => {
    console.log(data);
    if (err) throw err;
    else substanceData = data;
  });

  res.render("medHistory", {displayName, substanceData, vaccineData });
});

router.post("/edit", async (req, res) => {
  console.log(req.body);

  // for (var key of Object.keys(req.body)) {

  // }

  res.redirect("/profile/edit");
});

router.get("/getSectionData/:section", getSectionData);

module.exports = router;
