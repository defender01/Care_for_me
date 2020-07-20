const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/userInfo");
const {
  sectionModel,
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
const { compareSync } = require("bcryptjs");

let getQuestionsFromAllSections = async () => {
  let data;
  try {
    data = await sectionModel
      .find({})
      .populate({
        path: "subSections",
        populate: {
          path: "questions",
          populate: {
            path: "options",
            populate: {
              path: "questions",
              populate: {
                path: "options",
                populate: {
                  path: "questions",
                  populate: {
                    path: "options",
                  },
                },
              },
            },
          },
        },
      })
      .exec();
  } catch (err) {
    console.error(err)
    res.render('404', { error: err.message });
    return
  }
  // console.log(util.inspect({ data }, false, null, true /* enable colors */));
  return data;
}

router.get("/", checkAuthenticated, async (req, res) => {
  let displayName = req.user.name.displayName;
  let userDetails, wholeSectionCollection, medicalHistoryData, vaccineData, substanceData;
  try {
    userDetails = await User.findOne({ _id: req.user._id });
    wholeSectionCollection = await getQuestionsFromAllSections();
    vaccineData = await vaccineModel.find({});
    substanceData = await substanceModel.find({});
    medicalHistoryData = await answerModel.find({ userID: req.user._id })
    const { mapQuesToAnswer, mapSubSecToAdditionalIDs } = processAnswerModelData(medicalHistoryData);

    res.render("profile", { userDetails, displayName, vaccineData, substanceData, wholeSectionCollection, mapQuesToAnswer, mapSubSecToAdditionalIDs });
  } catch (err) {
    console.log(err);
    res.send({ msg: err.message })
  }
});

// let physicalDiseases = ["Asthma", "Aneurysm", "Diabetes", "Epilepsy Seizures", "Headaches or migraines", "Heart diseases", "High blood pressure", "Kidney disease", "Lung Disease", "Migraine", "Arthritis", "Elevated cholesterol", "Multiple Sclerosis", "Stroke", "Thyroid", "Tuberculosis", "Bleeding disorder"]
// let mentalDiseases = ["Neurocognitive disordero: dementia/ alzheimer’s disease", "Neurodevelopmental disorder", "Obsessive compulsive disorder", "Schizophrenia", "Depression", "Panic disorder", "Mood disorder", "Attention deficit hyperactivity disorder", "Convulsions", "Somatoform disorder", "Stress disorder", "Eating disorder", "Impulsive control disorder", "Substance abuse disorder"]

let checkNotNull = (val) => {
  return (typeof val !== 'undefined') && (val !== '') && (val !== null)
}

let processAnswerModelData = (medicalHistoryData) => {

  let mapQuesToAnswer = {}, mapSubSecToAdditionalIDs = {}

  for (let i = 0, max = medicalHistoryData.length; i < max; i++) {
    let subSecID = checkNotNull(medicalHistoryData[i].subSectionID) ? medicalHistoryData[i].subSectionID.toString() : medicalHistoryData[i].subSectionID;
    let allAns = medicalHistoryData[i].allAnswers;

    for (let j = 0, max2 = allAns.length; j < max2; j++) {
      let singleAnswer = allAns[j]
      let qID = checkNotNull(singleAnswer.questionID) ? singleAnswer.questionID.toString() : singleAnswer.questionID
      let addID = checkNotNull(singleAnswer.additionalID) ? singleAnswer.additionalID.toString() : singleAnswer.additionalID
      let answers = singleAnswer.answers
      let tempAns;
      let optionIDsforMCQ = singleAnswer.optionIDsforMCQAnswer

      optionIDsforMCQ.forEach((ID) => {
        ID = ID.toString()
      })

      if (optionIDsforMCQ.length) tempAns = optionIDsforMCQ; // MCQ. So an option will be checked if option ID appears in this array
      else tempAns = answers; // Not Multiple choice questions. So answer will be inserted to the value attribute in the input element.

      if (checkNotNull(addID)) {
        mapQuesToAnswer[qID + '#####' + addID] = tempAns;

        if (mapSubSecToAdditionalIDs.hasOwnProperty(subSecID)) mapSubSecToAdditionalIDs[subSecID].add(addID)
        else mapSubSecToAdditionalIDs[subSecID] = new Set(), mapSubSecToAdditionalIDs[subSecID].add(addID)
      }
      else mapQuesToAnswer[qID] = tempAns
    }
  }

  // Converting each set to Array in the mapSubSecToAdditionalIDs object
  for (let key of Object.keys(mapSubSecToAdditionalIDs)) {
    mapSubSecToAdditionalIDs[key] = Array.from(mapSubSecToAdditionalIDs[key])
  }

  return { mapQuesToAnswer, mapSubSecToAdditionalIDs }
}

router.get("/edit", checkAuthenticated, async (req, res) => {
  let displayName = req.user.name.displayName;
  let substanceData, vaccineData, medicalHistoryData;

  try {
    vaccineData = await vaccineModel.find({});
    substanceData = await substanceModel.find({});
    medicalHistoryData = await answerModel.find({ userID: req.user._id })
  } catch (err) {
    console.error(err)
    res.render('404', { error: err.message });
    return
  }

  // console.log(vaccineData)
  // console.log(substanceData)
  // console.log(medicalHistoryData)

  const { mapQuesToAnswer, mapSubSecToAdditionalIDs } = (medicalHistoryData.length) ? processAnswerModelData(medicalHistoryData) : { mapQuesToAnswer: {}, mapSubSecToAdditionalIDs: {} }
  //console.log(mapQuesToAnswer, mapSubSecToAdditionalIDs)
  res.render("medHistory", { displayName, substanceData, vaccineData, mapQuesToAnswer, mapSubSecToAdditionalIDs });
});

router.post("/edit", checkAuthenticated, async (req, res) => {

  let data = req.body;
  let secID, subSecID, qID, extraID, answers = [], opIDs = [];
  let mapSubSecToAnswers = {};
  let sections;

  try {
    sections = await sectionModel.find({});
    //console.log(sections)
  } catch (err) {
    console.error(err)
    res.render('404', { error: err.message });
    return
  }

  for (let i = 0, max = sections.length; i < max; i += 1) {
    let subSectionIDs = sections[i].subSections;
    for (let j = 0, max2 = subSectionIDs.length; j < max2; j += 1) {
      mapSubSecToAnswers[subSectionIDs[j].toString()] = []
    }
  }

  for (let key of Object.keys(data)) {
    (secID = null), (subSecID = null), (qID = null), (extraID = null), (answers = []), (opIDs = []);

    // retrieving sectionID, subSectionID, questionID, additionalID from key
    let result = key.split("#####");
    secID = result[0], subSecID = result[1], qID = result[2], extraID = (result.length <= 3) ? null : result[3]

    let values = data[key];
    values = Array.isArray(values) ? values : [values];

    values.forEach((value) => {
      if (value.includes("#####")) {
        let res = value.split("#####");
        opIDs.push(mongoose.Types.ObjectId(res[0]));
        answers.push(res[1]);
      } else {
        if (checkNotNull(value)) answers.push(value);
      }
    });

    let singleAnswer = {
      questionID: (checkNotNull(qID)) ? mongoose.Types.ObjectId(qID) : null,
      additionalID: (checkNotNull(extraID)) ? mongoose.Types.ObjectId(extraID) : null,
      answers: answers,
      optionIDsforMCQAnswer: opIDs
    }

    mapSubSecToAnswers[subSecID].push(singleAnswer);
  }

  try {
    let existingDocs = await answerModel.find({ userID: req.user._id })

    if (existingDocs.length) {
      console.log("a bunch of documents exist")

      for (let i = 0, max = sections.length; i < max; i += 1) {
        let subSectionIDs = sections[i].subSections;
        for (let j = 0, max2 = subSectionIDs.length; j < max2; j += 1) {

          let sectionID = sections[i]._id.toString()
          let subSectionID = subSectionIDs[j].toString()
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

          if (idx == -1) {
            // console.log(`Answers for section ${sectionID} and subsection ${subSectionID} doesn't exist and so a document is created - ${i}`)

            let subSectionAllAnswers = new answerModel({
              userID: req.user._id,
              sectionID: mongoose.Types.ObjectId(sectionID),
              subSectionID: mongoose.Types.ObjectId(subSectionID),
              allAnswers: allAnswers
            })

            await subSectionAllAnswers.save()
          }
          else {
            // console.log(`Answers for section ${sectionID} and subsection ${subSectionID} exist and thus need to be updated - ${i}`)
            existingDocs[idx].allAnswers = allAnswers

            await existingDocs[idx].save()
          }

        }
      }
    }
    else {
      console.log("new documents are created")

      for (let i = 0, max = sections.length; i < max; i += 1) {
        let subSectionIDs = sections[i].subSections;
        for (let j = 0, max2 = subSectionIDs.length; j < max2; j += 1) {

          let sectionID = sections[i]._id.toString()
          let subSectionID = subSectionIDs[j].toString()
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
  } catch (err) {
    console.error(err)
    res.send({ 'error': err.message })
  }

  res.redirect("/profile");
});

router.get("/update/:sectionID", checkAuthenticated, async (req, res) => {
  let sectionID = req.params.sectionID;
  let displayName = req.user.name.displayName;

  if (sectionID === "personalInfo") {
    let userDetails;

    try {
      userDetails = await User.findOne({ _id: req.user._id });
    } catch (err) {
      console.error(err)
      res.render('404', { error: err.message });
      return
    }

    res.render('updatePersonalInfo', { displayName, userDetails })
    return
  }

  let section;
  try {
    section = await sectionModel.findById(sectionID)
  } catch (err) {
    console.error(err)
    res.render('404', { error: err.message });
    return
  }

  if (section.name === "Birth and Developmental History") {
    let vaccineData, medicalHistoryData;

    try {
      vaccineData = await vaccineModel.find({});
      medicalHistoryData = await answerModel.find({ userID: req.user._id, sectionID: sectionID })
    } catch (err) {
      console.error(err)
      res.render('404', { error: err.message });
      return
    }

    const { mapQuesToAnswer, mapSubSecToAdditionalIDs } = (medicalHistoryData.length) ? processAnswerModelData(medicalHistoryData) : { mapQuesToAnswer: {}, mapSubSecToAdditionalIDs: {} }
    res.render('updateStep1', { displayName, sectionID, vaccineData, mapQuesToAnswer, mapSubSecToAdditionalIDs });
    return
  }
  else if (section.name === "Family Information") {
    let medicalHistoryData;

    try {
      medicalHistoryData = await answerModel.find({ userID: req.user._id, sectionID: sectionID })
    } catch (err) {
      console.error(err)
      res.render('404', { error: err.message });
      return
    }

    const { mapQuesToAnswer, mapSubSecToAdditionalIDs } = (medicalHistoryData.length) ? processAnswerModelData(medicalHistoryData) : { mapQuesToAnswer: {}, mapSubSecToAdditionalIDs: {} }
    res.render('updateStep2', { displayName, sectionID, mapQuesToAnswer, mapSubSecToAdditionalIDs });
    return
  }
  else if (section.name === "Lifestyle") {
    let substanceData, medicalHistoryData;

    try {
      substanceData = await substanceModel.find({});
      medicalHistoryData = await answerModel.find({ userID: req.user._id, sectionID: sectionID })
    } catch (err) {
      console.error(err)
      res.render('404', { error: err.message });
      return
    }

    const { mapQuesToAnswer, mapSubSecToAdditionalIDs } = (medicalHistoryData.length) ? processAnswerModelData(medicalHistoryData) : { mapQuesToAnswer: {}, mapSubSecToAdditionalIDs: {} }
    res.render('updateStep3', { displayName, sectionID, substanceData, mapQuesToAnswer, mapSubSecToAdditionalIDs });
    return
  }
  else if (section.name === "Education and Occupation Details") {
    let medicalHistoryData;

    try {
      medicalHistoryData = await answerModel.find({ userID: req.user._id, sectionID: sectionID })
    } catch (err) {
      console.error(err)
      res.render('404', { error: err.message });
      return
    }

    const { mapQuesToAnswer, mapSubSecToAdditionalIDs } = (medicalHistoryData.length) ? processAnswerModelData(medicalHistoryData) : { mapQuesToAnswer: {}, mapSubSecToAdditionalIDs: {} }
    res.render("updateStep4", { displayName, sectionID, mapQuesToAnswer, mapSubSecToAdditionalIDs });
    return
  }
  else if (section.name === "Previous Diseases and Disorders") {
    let medicalHistoryData;

    try {
      medicalHistoryData = await answerModel.find({ userID: req.user._id, sectionID: sectionID })
    } catch (err) {
      console.error(err)
      res.render('404', { error: err.message });
      return
    }

    const { mapQuesToAnswer, mapSubSecToAdditionalIDs } = (medicalHistoryData.length) ? processAnswerModelData(medicalHistoryData) : { mapQuesToAnswer: {}, mapSubSecToAdditionalIDs: {} }
    res.render("updateStep5", { displayName, sectionID, mapQuesToAnswer, mapSubSecToAdditionalIDs });
    return
  }

  res.render('404', { error: '404 Page Not Found' });
})

router.post("/update-personalInfo", checkAuthenticated, async (req, res) => {
  res.send(req.body);
})

router.post("/update/:sectionID", checkAuthenticated, async (req, res) => {

  let paramSectoinID = req.params.sectionID;

  let data = req.body;
  let secID, subSecID, qID, extraID, answers = [], opIDs = [];
  let mapSubSecToAnswers = {};
  let paramSection;

  try {
    paramSection = await sectionModel.findById(paramSectoinID);
    // console.log(paramSection)
  } catch (err) {
    console.error(err)
    res.render('404', { error: err.message });
    return
  }

  for (let j = 0, max2 = paramSection.subSections.length; j < max2; j += 1) {
    mapSubSecToAnswers[paramSection.subSections[j].toString()] = []
  }

  for (let key of Object.keys(data)) {
    (secID = null), (subSecID = null), (qID = null), (extraID = null), (answers = []), (opIDs = []);

    // retrieving sectionID, subSectionID, questionID, additionalID from key
    let result = key.split("#####");
    secID = result[0], subSecID = result[1], qID = result[2], extraID = (result.length <= 3) ? null : result[3]

    let values = data[key];
    values = Array.isArray(values) ? values : [values];

    values.forEach((value) => {
      if (value.includes("#####")) {
        let res = value.split("#####");
        opIDs.push(mongoose.Types.ObjectId(res[0]));
        answers.push(res[1]);
      } else {
        if (checkNotNull(value)) answers.push(value);
      }
    });

    let singleAnswer = {
      questionID: (checkNotNull(qID)) ? mongoose.Types.ObjectId(qID) : null,
      additionalID: (checkNotNull(extraID)) ? mongoose.Types.ObjectId(extraID) : null,
      answers: answers,
      optionIDsforMCQAnswer: opIDs
    }

    mapSubSecToAnswers[subSecID].push(singleAnswer);
  }

  try {
    let existingDocs = await answerModel.find({ userID: req.user._id, sectionID: paramSectoinID })

    if (existingDocs.length) {
      console.log("a bunch of documents exist")

      for (let i = 0, max = paramSection.subSections.length; i < max; i++) {

        let subSectionID = paramSection.subSections[i].toString()
        let allAnswers = mapSubSecToAnswers[subSectionID]

        let idx = existingDocs.findIndex(x => {
          // mongoose.Types.ObjectId() must be converted to String before comparison as mongoose.Types.ObjectId() is an Object in js
          // Object actually store reference to the memory location
          // So inspite of having same values, we may have a false result from the equality comparison between two objects 

          // We can't call toString() to a null value, that's why null check is required
          let xSubSecID = (checkNotNull(x.subSectionID)) ? x.subSectionID.toString() : x.subSectionID
          return xSubSecID === subSectionID
        })

        if (idx == -1) {
          // console.log(`Answers for section ${sectionID} and subsection ${subSectionID} doesn't exist and so a document is created - ${i}`)

          let subSectionAllAnswers = new answerModel({
            userID: req.user._id,
            sectionID: mongoose.Types.ObjectId(paramSectoinID),
            subSectionID: mongoose.Types.ObjectId(subSectionID),
            allAnswers: allAnswers
          })

          await subSectionAllAnswers.save()
        }
        else {
          // console.log(`Answers for section ${sectionID} and subsection ${subSectionID} exist and thus need to be updated - ${i}`)
          existingDocs[idx].allAnswers = allAnswers

          await existingDocs[idx].save()
        }

      }
    }
    else {
      console.log("new documents are created")

      for (let i = 0, max = paramSection.subSections.length; i < max; i++) {

        let subSectionID = paramSection.subSections[i].toString()
        let allAnswers = mapSubSecToAnswers[subSectionID]


        let subSectionAllAnswers = new answerModel({
          userID: req.user._id,
          sectionID: mongoose.Types.ObjectId(paramSectoinID),
          subSectionID: mongoose.Types.ObjectId(subSectionID),
          allAnswers: allAnswers
        })

        await subSectionAllAnswers.save()
      }
    }
  } catch (err) {
    console.error(err)
    res.render('404', { error: err.message });
    return
  }

  res.redirect("/profile");
})

router.get("/getSectionData/:section", getSectionData);

// this provides new id
router.get("/edit/getNewId", async (req, res) => {
  res.send({ id: new mongoose.Types.ObjectId() });
});

module.exports = router;
