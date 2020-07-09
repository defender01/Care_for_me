const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
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
const { exists } = require("../models/userInfo");

router.get("/", checkAuthenticated, async (req, res) => {
  let displayName = req.user.name.displayName;
  let data;
  let errors = [];

  try {
    data = await User.find({ email: req.user.email });
  } catch (err) {
    errors.push({ msg: "Internal Server Error" });
    console.log(err);
  }
  res.render("profile", { errors, data, displayName });
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


let checkNotNull = (val) => {
  return (typeof val !== 'undefined') && (val !== '') && (val !== null)  
}

let processAnswerModelData = (medicalHistoryData) => {

  let mapQuesToAnswer = {}, mapSubSecToAdditionalIDs = {} 

  for(let i = 0, max = medicalHistoryData.length; i<max; i++){
    let subSecID = checkNotNull(medicalHistoryData[i].subSectionID) ? medicalHistoryData[i].subSectionID.toString() : medicalHistoryData[i].subSectionID;
    let allAns = medicalHistoryData[i].allAnswers;

    for(let j = 0, max2 = allAns.length; j<max2; j++){
      let singleAnswer =  allAns[j]
      let qID = checkNotNull(singleAnswer.questionID) ? singleAnswer.questionID.toString() : singleAnswer.questionID
      let addID = checkNotNull(singleAnswer.additionalID) ? singleAnswer.additionalID.toString() : singleAnswer.additionalID
      let answers = singleAnswer.answers
      let tempAns;
      let optionIDsforMCQ = singleAnswer.optionIDsforMCQAnswer
      
      optionIDsforMCQ.forEach((ID)=>{
        ID = ID.toString()
      })

      if(optionIDsforMCQ.length) tempAns = optionIDsforMCQ; // MCQ. So an option will be checked if option ID appears in this array
      else tempAns = answers; // Not Multiple choice questions. So answer will be inserted to the value attribute in the input element.

      if(checkNotNull(addID)){
        mapQuesToAnswer[qID + '#####' + addID] = tempAns;

        if(mapSubSecToAdditionalIDs.hasOwnProperty(subSecID)) mapSubSecToAdditionalIDs[subSecID].add(addID)
      else mapSubSecToAdditionalIDs[subSecID] = new Set(), mapSubSecToAdditionalIDs[subSecID].add(addID)
      }
      else mapQuesToAnswer[qID] = tempAns
    }
  }

  // Converting each set to Array in the mapSubSecToAdditionalIDs object
  for(let key of Object.keys(mapSubSecToAdditionalIDs)){
    mapSubSecToAdditionalIDs[key] = Array.from(mapSubSecToAdditionalIDs[key])
  }

  return {mapQuesToAnswer, mapSubSecToAdditionalIDs}
}

router.get("/edit", checkAuthenticated, async (req, res) => {
  let displayName = req.user.name.displayName;
  let substanceData, vaccineData, medicalHistoryData;
  let errors = [];

  try {
    vaccineData = await vaccineModel.find({});
    substanceData = await substanceModel.find({});
    medicalHistoryData = await answerModel.find({userID: req.user._id})
  } catch (err) {
    errors.push({ msg: "Internal Server Error" });
    console.log(err);
  }

  // console.log(vaccineData)
  // console.log(substanceData)
  // console.log(medicalHistoryData)

  if(medicalHistoryData.length) {
    const {mapQuesToAnswer, mapSubSecToAdditionalIDs} = processAnswerModelData(medicalHistoryData);
    res.render("medHistory", { errors, displayName, substanceData, vaccineData, mapQuesToAnswer, mapSubSecToAdditionalIDs });
  }
  else  
  {
    let mapQuesToAnswer = {}, mapSubSecToAdditionalIDs = {}
    res.render("medHistory", { errors, displayName, substanceData, vaccineData, mapQuesToAnswer, mapSubSecToAdditionalIDs });
  }
});

router.post("/edit", checkAuthenticated, async (req, res) => {

  let data = req.body;
  let secID, subSecID, qID, extraID, answers = [], opIDs = [];
  let mapSecToSubSec = {}, mapSubSecToAnswers = {};

  for (let key of Object.keys(data)) {
    (secID = null), (subSecID = null), (qID = null), (extraID = null), (answers = []), (opIDs = []);

    // retrieving sectionID, subSectionID, questionID, additionalID from key
    let result = key.split("#####");

    if (result.length <= 3) {
      secID = result[0], subSecID = result[1], qID = result[2]

      if(mapSecToSubSec.hasOwnProperty(secID)) mapSecToSubSec[secID].add(subSecID)
      else mapSecToSubSec[secID] = new Set(), mapSecToSubSec[secID].add(subSecID)

      if(!mapSubSecToAnswers.hasOwnProperty(subSecID)) mapSubSecToAnswers[subSecID] = []

    } else {
      secID = result[0], subSecID = result[1], qID = result[2], extraID = result[3]

      if(mapSecToSubSec.hasOwnProperty(secID)) mapSecToSubSec[secID].add(subSecID)
      else mapSecToSubSec[secID] = new Set(), mapSecToSubSec[secID].add(subSecID)

      if(!mapSubSecToAnswers.hasOwnProperty(subSecID)) mapSubSecToAnswers[subSecID] = []
    }

    let values = data[key];
    values = Array.isArray(values) ? values : [values];

    values.forEach((value) => {
      if (value.includes("#####")) {
        let res = value.split("#####");
        opIDs.push(mongoose.Types.ObjectId(res[0]));
        answers.push(res[1]);
      } else {
        if(checkNotNull(value)) answers.push(value);
      }
    });

    let singleAnswer = {
      questionID: (checkNotNull(qID)) ? mongoose.Types.ObjectId(qID) : null,
      additionalID: (checkNotNull(extraID)) ? mongoose.Types.ObjectId(extraID) : null,
      answers: answers,
      optionIDsforMCQAnswer : opIDs
    }

    mapSubSecToAnswers[subSecID].push(singleAnswer);
  }

  // Converting each set to Array in the mapSectoSubSec object
  for(let key of Object.keys(mapSecToSubSec)){
     mapSecToSubSec[key] = Array.from(mapSecToSubSec[key])
  }

  try{
    let existingDocs = await answerModel.find({userID: req.user._id})
    
    if(existingDocs.length){
      console.log("a bunch of documents exist")

      for(let key of Object.keys(mapSecToSubSec)){
        for(let i=0, max = mapSecToSubSec[key].length; i<max; i++){
          
          let sectionID = (checkNotNull(key)) ? key : null
          let subSectionID = (checkNotNull(mapSecToSubSec[sectionID][i])) ? mapSecToSubSec[sectionID][i] : null
          let allAnswers = mapSubSecToAnswers[subSectionID]
   
          let idx = existingDocs.findIndex(x => {
            // mongoose.Types.ObjectId() must be converted to String before comparison as mongoose.Types.ObjectId() is an Object in js
            // Object actually store reference to the memory location
            // So inspite of having same values, we may have a false result from the equality comparison between two objects 
            
            // We can't call toString() to a null value, that's why null check is required
            let xSecID = (checkNotNull(x.sectionID)) ? x.sectionID.toString() : x.sectionID 
            let xSubSecID = (checkNotNull(x.subSectionID)) ? x.subSectionID.toString() : x.subSectionID

            return xSecID === sectionID && xSubSecID === subSectionID
          })
  
          if(idx == -1){
            // console.log(`Answers for section ${sectionID} and subsection ${subSectionID} doesn't exist and so a document is created - ${i}`)

            let subSectionAllAnswers = new answerModel({
              userID: req.user._id,
              sectionID: mongoose.Types.ObjectId(sectionID),
              subSectionID: mongoose.Types.ObjectId(subSectionID),
              allAnswers: allAnswers
            })
            
            await subSectionAllAnswers.save()
          }
          else{
            // console.log(`Answers for section ${sectionID} and subsection ${subSectionID} exist and thus need to be updated - ${i}`)
            existingDocs[idx].allAnswers = allAnswers

            await existingDocs[idx].save()
          }

        }
      }
    }
    else{
      console.log("new documents are created")

      for(let key of Object.keys(mapSecToSubSec)){
        for(let i=0, max = mapSecToSubSec[key].length; i<max; i++){
          
          let sectionID = (checkNotNull(key)) ? key : null
          let subSectionID = (checkNotNull(mapSecToSubSec[sectionID][i])) ? mapSecToSubSec[sectionID][i] : null
          let allAnswers = mapSubSecToAnswers[subSectionID]

          let subSectionAllAnswers = new answerModel({
            userID: req.user._id,
            sectionID: mongoose.Types.ObjectId(sectionID),
            subSectionID: mongoose.Types.ObjectId(subSectionID),
            allAnswers: allAnswers
          })
          
          await subSectionAllAnswers.save()   
        }
      }
    }
  }catch(err){
    console.error(err)
  }

  res.redirect("/profile/edit");
});

router.get("/getSectionData/:section", getSectionData);

// this provides new id
router.get("/edit/getNewId", async (req, res) => {
  res.send({ id: new mongoose.Types.ObjectId() });
});

module.exports = router;
