const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const mongoose = require("mongoose");
const User = require("../../models/userInfo");
const {
  sectionModel,
  vaccineModel,
  substanceModel,
  answerModel,
} = require("../../models/inputCollection");
const { getSectionData } = require("../../controllers/adminFunctions");

//import camelCase function
const camelCase = require("../../controllers/functionCollection").camelCase;

const {
  checkAuthenticated,
  checkNotAuthenticated,
  checkEmailVerified,
} = require("../../controllers/auth_helper");


let getQuestionsFromAllSections = async (user) => {
  let navDisplayName = user.name.displayName;
  let userRole = user.role

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
    console.error(err);
    res.render("404", {navDisplayName, userRole, error: err.message });
    return;
  }
  // console.log(util.inspect({ data }, false, null, true /* enable colors */));
  return data;
};

router.get("/", checkAuthenticated, checkEmailVerified, async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role
  let userDetails,
    wholeSectionCollection,
    medicalHistoryData,
    vaccineData,
    substanceData;
  try {
    userDetails = await User.findOne({ _id: req.user._id });
    wholeSectionCollection = await getQuestionsFromAllSections(req.user);
    vaccineData = await vaccineModel.find({});
    substanceData = await substanceModel.find({});
    medicalHistoryData = await answerModel.find({ userID: req.user._id });
    // console.log(medicalHistoryData.length)
    const {
      mapQuesToAnswer,
      mapSubSecToAdditionalIDs,
    } = processAnswerModelData(medicalHistoryData);

    res.render("patientProfile", {
      userDetails,
      navDisplayName, userRole,
      vaccineData,
      substanceData,
      wholeSectionCollection,
      mapQuesToAnswer,
      mapSubSecToAdditionalIDs,
    });
  } catch (err) {
    console.log(err);
    res.send({ msg: err.message });
  }
});

// let physicalDiseases = ["Asthma", "Aneurysm", "Diabetes", "Epilepsy Seizures", "Headaches or migraines", "Heart diseases", "High blood pressure", "Kidney disease", "Lung Disease", "Migraine", "Arthritis", "Elevated cholesterol", "Multiple Sclerosis", "Stroke", "Thyroid", "Tuberculosis", "Bleeding disorder"]
// let mentalDiseases = ["Neurocognitive disordero: dementia/ alzheimer’s disease", "Neurodevelopmental disorder", "Obsessive compulsive disorder", "Schizophrenia", "Depression", "Panic disorder", "Mood disorder", "Attention deficit hyperactivity disorder", "Convulsions", "Somatoform disorder", "Stress disorder", "Eating disorder", "Impulsive control disorder", "Substance abuse disorder"]

let checkNotNull = (val) => {
  return typeof val !== "undefined" && val !== "" && val !== null;
};

let processAnswerModelData = (medicalHistoryData) => {
  let mapQuesToAnswer = {},
    mapSubSecToAdditionalIDs = {};

  for (let i = 0, max = medicalHistoryData.length; i < max; i++) {
    let subSecID = checkNotNull(medicalHistoryData[i].subSectionID)
      ? medicalHistoryData[i].subSectionID.toString()
      : medicalHistoryData[i].subSectionID;
    let allAns = medicalHistoryData[i].allAnswers;

    for (let j = 0, max2 = allAns.length; j < max2; j++) {
      let singleAnswer = allAns[j];
      let qID = checkNotNull(singleAnswer.questionID)
        ? singleAnswer.questionID.toString()
        : singleAnswer.questionID;
      let addID = checkNotNull(singleAnswer.additionalID)
        ? singleAnswer.additionalID.toString()
        : singleAnswer.additionalID;
      let answers = singleAnswer.answers;
      let tempAns;
      let optionIDsforMCQ = singleAnswer.optionIDsforMCQAnswer;

      optionIDsforMCQ.forEach((ID) => {
        ID = ID.toString();
      });

      if (optionIDsforMCQ.length) tempAns = optionIDsforMCQ;
      // MCQ. So an option will be checked if option ID appears in this array
      else tempAns = answers; // Not Multiple choice questions. So answer will be inserted to the value attribute in the input element.

      if (checkNotNull(addID)) {
        mapQuesToAnswer[qID + "#####" + addID] = tempAns;

        if (mapSubSecToAdditionalIDs.hasOwnProperty(subSecID))
          mapSubSecToAdditionalIDs[subSecID].add(addID);
        else
          (mapSubSecToAdditionalIDs[subSecID] = new Set()),
            mapSubSecToAdditionalIDs[subSecID].add(addID);
      } else mapQuesToAnswer[qID] = tempAns;
    }
  }

  // Converting each set to Array in the mapSubSecToAdditionalIDs object
  for (let key of Object.keys(mapSubSecToAdditionalIDs)) {
    mapSubSecToAdditionalIDs[key] = Array.from(mapSubSecToAdditionalIDs[key]);
  }

  return { mapQuesToAnswer, mapSubSecToAdditionalIDs };
};

router.get("/medHistory", checkAuthenticated, checkEmailVerified, async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role
  let substanceData, vaccineData, medicalHistoryData;

  try {
    vaccineData = await vaccineModel.find({});
    substanceData = await substanceModel.find({});
    medicalHistoryData = await answerModel.find({ userID: req.user._id });
  } catch (err) {
    console.error(err);
    res.render("404", { navDisplayName, userRole,error: err.message });
    return;
  }

  // console.log(vaccineData)
  // console.log(substanceData)
  // console.log(medicalHistoryData)

  const {
    mapQuesToAnswer,
    mapSubSecToAdditionalIDs,
  } = medicalHistoryData.length
    ? processAnswerModelData(medicalHistoryData)
    : { mapQuesToAnswer: {}, mapSubSecToAdditionalIDs: {} };
  //console.log(mapQuesToAnswer, mapSubSecToAdditionalIDs)
  res.render("medHistory", {
    navDisplayName, userRole,
    substanceData,
    vaccineData,
    mapQuesToAnswer,
    mapSubSecToAdditionalIDs,
  });
});

router.post("/medHistory", checkAuthenticated, checkEmailVerified, async (req, res) => {
  let data = req.body;
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role
  let secID,
    subSecID,
    qID,
    extraID,
    answers = [],
    opIDs = [];
  let mapSubSecToAnswers = {};
  let sections;

  try {
    sections = await sectionModel.find({});
    //console.log(sections)
  } catch (err) {
    console.error(err);
    res.render("404", {navDisplayName, userRole, error: err.message });
    return;
  }

  for (let i = 0, max = sections.length; i < max; i += 1) {
    let subSectionIDs = sections[i].subSections;
    for (let j = 0, max2 = subSectionIDs.length; j < max2; j += 1) {
      mapSubSecToAnswers[subSectionIDs[j].toString()] = [];
    }
  }

  for (let key of Object.keys(data)) {
    (secID = null),
      (subSecID = null),
      (qID = null),
      (extraID = null),
      (answers = []),
      (opIDs = []);

    // retrieving sectionID, subSectionID, questionID, additionalID from key
    let result = key.split("#####");
    (secID = result[0]),
      (subSecID = result[1]),
      (qID = result[2]),
      (extraID = result.length <= 3 ? null : result[3]);

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
      questionID: checkNotNull(qID) ? mongoose.Types.ObjectId(qID) : null,
      additionalID: checkNotNull(extraID)
        ? mongoose.Types.ObjectId(extraID)
        : null,
      answers: answers,
      optionIDsforMCQAnswer: opIDs,
    };

    mapSubSecToAnswers[subSecID].push(singleAnswer);
  }

  try {
    let existingDocs = await answerModel.find({ userID: req.user._id });

    if (existingDocs.length) {
      console.log("a bunch of documents exist");

      for (let i = 0, max = sections.length; i < max; i += 1) {
        let subSectionIDs = sections[i].subSections;
        for (let j = 0, max2 = subSectionIDs.length; j < max2; j += 1) {
          let sectionID = sections[i]._id.toString();
          let subSectionID = subSectionIDs[j].toString();
          let allAnswers = mapSubSecToAnswers[subSectionID];

          let idx = existingDocs.findIndex((x) => {
            // mongoose.Types.ObjectId() must be converted to String before comparison as mongoose.Types.ObjectId() is an Object in js
            // Object actually store reference to the memory location
            // So inspite of having same values, we may have a false result from the equality comparison between two objects

            // We can't call toString() to a null value, that's why null check is required
            let xSecID = checkNotNull(x.sectionID)
              ? x.sectionID.toString()
              : x.sectionID;
            let xSubSecID = checkNotNull(x.subSectionID)
              ? x.subSectionID.toString()
              : x.subSectionID;

            return xSecID === sectionID && xSubSecID === subSectionID;
          });

          if (idx == -1) {
            // console.log(`Answers for section ${sectionID} and subsection ${subSectionID} doesn't exist and so a document is created - ${i}`)

            let subSectionAllAnswers = new answerModel({
              userID: req.user._id,
              sectionID: mongoose.Types.ObjectId(sectionID),
              subSectionID: mongoose.Types.ObjectId(subSectionID),
              allAnswers: allAnswers,
            });

            await subSectionAllAnswers.save();
          } else {
            // console.log(`Answers for section ${sectionID} and subsection ${subSectionID} exist and thus need to be updated - ${i}`)
            existingDocs[idx].allAnswers = allAnswers;

            await existingDocs[idx].save();
          }
        }
      }
    } else {
      console.log("new documents are created");

      for (let i = 0, max = sections.length; i < max; i += 1) {
        let subSectionIDs = sections[i].subSections;
        for (let j = 0, max2 = subSectionIDs.length; j < max2; j += 1) {
          let sectionID = sections[i]._id.toString();
          let subSectionID = subSectionIDs[j].toString();
          let allAnswers = mapSubSecToAnswers[subSectionID];

          let subSectionAllAnswers = new answerModel({
            userID: req.user._id,
            sectionID: mongoose.Types.ObjectId(sectionID),
            subSectionID: mongoose.Types.ObjectId(subSectionID),
            allAnswers: allAnswers,
          });

          await subSectionAllAnswers.save();
        }
      }
    }
  } catch (err) {
    console.error(err);
    res.send({ error: err.message });
  }

  res.redirect("/profile");
});

router.get("/update/:sectionID", checkAuthenticated, checkEmailVerified, async (req, res) => {
  let sectionID = req.params.sectionID;
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role

  console.log(sectionID)
  if (sectionID === "personalInfo") {
    let userDetails;

    try {
      userDetails = await User.findOne({ _id: req.user._id });
    } catch (err) {
      console.error(err);
      res.render("404", {navDisplayName, userRole, error: err.message });
      return;
    }

    res.render("updatePatientPersonalInfo", { navDisplayName, userRole, userDetails });
    return;
  }

  let section;
  try {
    section = await sectionModel.findById(sectionID);
  } catch (err) {
    console.error(err);
    res.render("404", {navDisplayName, userRole, error: err.message });
    return;
  }

  if (section.name === "Birth and Developmental History") {
    let vaccineData, medicalHistoryData;

    try {
      vaccineData = await vaccineModel.find({});
      medicalHistoryData = await answerModel.find({
        userID: req.user._id,
        sectionID: sectionID,
      });
    } catch (err) {
      console.error(err);
      res.render("404", {navDisplayName, userRole, error: err.message });
      return;
    }

    const {
      mapQuesToAnswer,
      mapSubSecToAdditionalIDs,
    } = medicalHistoryData.length
      ? processAnswerModelData(medicalHistoryData)
      : { mapQuesToAnswer: {}, mapSubSecToAdditionalIDs: {} };
    res.render("updateMedHistoryStep1", {
      navDisplayName, userRole,
      sectionID,
      vaccineData,
      mapQuesToAnswer,
      mapSubSecToAdditionalIDs,
    });
    return;
  } else if (section.name === "Family Information") {
    let medicalHistoryData;

    try {
      medicalHistoryData = await answerModel.find({
        userID: req.user._id,
        sectionID: sectionID,
      });
    } catch (err) {
      console.error(err);
      res.render("404", {navDisplayName, userRole, error: err.message });
      return;
    }

    const {
      mapQuesToAnswer,
      mapSubSecToAdditionalIDs,
    } = medicalHistoryData.length
      ? processAnswerModelData(medicalHistoryData)
      : { mapQuesToAnswer: {}, mapSubSecToAdditionalIDs: {} };
    res.render("updateMedHistoryStep2", {
      navDisplayName, userRole,
      sectionID,
      mapQuesToAnswer,
      mapSubSecToAdditionalIDs,
    });
    return;
  } else if (section.name === "Lifestyle") {
    let substanceData, medicalHistoryData;

    try {
      substanceData = await substanceModel.find({});
      medicalHistoryData = await answerModel.find({
        userID: req.user._id,
        sectionID: sectionID,
      });
    } catch (err) {
      console.error(err);
      res.render("404", {navDisplayName, userRole, error: err.message });
      return;
    }

    const {
      mapQuesToAnswer,
      mapSubSecToAdditionalIDs,
    } = medicalHistoryData.length
      ? processAnswerModelData(medicalHistoryData)
      : { mapQuesToAnswer: {}, mapSubSecToAdditionalIDs: {} };
    res.render("updateMedHistoryStep3", {
      navDisplayName, userRole,
      sectionID,
      substanceData,
      mapQuesToAnswer,
      mapSubSecToAdditionalIDs,
    });
    return;
  } else if (section.name === "Education and Occupation Details") {
    let medicalHistoryData;

    try {
      medicalHistoryData = await answerModel.find({
        userID: req.user._id,
        sectionID: sectionID,
      });
    } catch (err) {
      console.error(err);
      res.render("404", {navDisplayName, userRole, error: err.message });
      return;
    }

    const {
      mapQuesToAnswer,
      mapSubSecToAdditionalIDs,
    } = medicalHistoryData.length
      ? processAnswerModelData(medicalHistoryData)
      : { mapQuesToAnswer: {}, mapSubSecToAdditionalIDs: {} };
    res.render("updateMedHistoryStep4", {
      navDisplayName, userRole,
      sectionID,
      mapQuesToAnswer,
      mapSubSecToAdditionalIDs,
    });
    return;
  } else if (section.name === "Previous Diseases and Disorders") {
    let medicalHistoryData;

    try {
      medicalHistoryData = await answerModel.find({
        userID: req.user._id,
        sectionID: sectionID,
      });
    } catch (err) {
      console.error(err);
      res.render("404", {navDisplayName, userRole, error: err.message });
      return;
    }

    const {
      mapQuesToAnswer,
      mapSubSecToAdditionalIDs,
    } = medicalHistoryData.length
      ? processAnswerModelData(medicalHistoryData)
      : { mapQuesToAnswer: {}, mapSubSecToAdditionalIDs: {} };
    res.render("updateMedHistoryStep5", {
      navDisplayName, userRole,
      sectionID,
      mapQuesToAnswer,
      mapSubSecToAdditionalIDs,
    });
    return;
  }

  res.render("404", {navDisplayName, userRole, error: "404 Page Not Found" });
});

router.post("/update-personalInfo", checkAuthenticated, checkEmailVerified, async (req, res) => {
  let data = req.user;
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role
  console.log({ data });
  console.log(req.body)
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
  } = req.body;

  const userDetails = {
    name: {
      firstName:firstName,
      lastName:lastName,
      displayName:displayName,
    },
    email:email,
    birthDate:birthDate,
    phoneNumber:phoneNumber,
    idNumber:idNumber,
    gender:gender,
    idChoice:idChoice,
    occupation:occupation,
    organization:organization,
    location: {
      country:country,
      state:state,
      city:city,
      additionalAddress:additionalAddress,
    },
  };

  let errors = [];

  if (
    !firstName ||
    !lastName ||
    !displayName ||
    !email ||
    !birthDate ||
    !phoneNumber ||
    !idNumber ||
    !gender ||
    !idChoice ||
    (typeof password !== "undefined" && !password) ||
    (typeof password2 !== "undefined" && !password2)
  ) {
    errors.push({ msg: "Please enter all required fields" });
  }

  if (typeof password !== "undefined" && password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (phoneNumber.length < 11) {
    errors.push({ msg: "Phone number must be atleast 11 digits" });
  }

  if (typeof password !== "undefined" && password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    console.log({errors})
    res.render("updatePatientPersonalInfo", {
      navDisplayName, userRole,
      errors,
      userDetails
    });
  } else {
    try {
      let users = await User.find({
        $and: [
          { _id: { $ne: req.user._id } },
          {
            $or: [
              { email: email },
              { phoneNumber: phoneNumber },
              { idNumber: idNumber },
            ],
          },
        ],
      });
      console.log("came in users");
      console.log(users);
      if (users.length) {
        users.forEach((user) => {
          if (user.email == email) errors.push({ msg: "Email already exists" });
          if (user.phoneNumber == phoneNumber)
            errors.push({ msg: "Phone no already exists" });
          if (user.idNumber == idNumber)
            errors.push({
              msg:
                "ID number(NID/ Passport/ Birth Certificate no) already exists",
            });
        });
        res.render("updatePatientPersonalInfo", {
          navDisplayName, userRole,
          errors,
          userDetails
        });
      } 
      else {
        let user = await User.findOne({ _id: req.user._id });
        user.name.firstName = firstName;
        user.name.lastName = lastName;
        user.name.displayName = displayName;
        user.email = email;
        if (typeof password !== "undefined") user.password = password;
        user.birthDate = birthDate;
        user.phoneNumber = phoneNumber;
        user.idNumber = idNumber;
        user.gender = gender;
        user.idChoice = idChoice;
        user.occupation = occupation;
        user.organization = organization;
        user.location.country = country;
        user.location.state = state;
        user.location.city = city;
        user.location.additionalAddress = additionalAddress;

        if (typeof password !== "undefined") {
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, async (err, hash) => {
              if (err) res.render("404", {navDisplayName, userRole, error: err.message });
              user.password = hash;              
              console.log('password change')
              console.log({user})
              await user.save();
              req.logout();
              req.flash("success_msg", "Your data has successfully updated. Please login again");
              res.redirect("/auth/login");
            });
          });         
         
        } else {
          console.log({user})
          await user.save()
          res.redirect("/");
        }
      }
    } catch (err) {
      console.error(err);
      res.render("404", { navDisplayName, userRole, error: err.message });
    }
  }
});

router.post("/update/:sectionID", checkAuthenticated, checkEmailVerified, async (req, res) => {
  let paramSectoinID = req.params.sectionID;
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role

  let data = req.body;
  let secID,
    subSecID,
    qID,
    extraID,
    answers = [],
    opIDs = [];
  let mapSubSecToAnswers = {};
  let paramSection;

  try {
    paramSection = await sectionModel.findById(paramSectoinID);
    // console.log(paramSection)
  } catch (err) {
    console.error(err);
    res.render("404", {navDisplayName, userRole, error: err.message });
    return;
  }

  for (let j = 0, max2 = paramSection.subSections.length; j < max2; j += 1) {
    mapSubSecToAnswers[paramSection.subSections[j].toString()] = [];
  }

  for (let key of Object.keys(data)) {
    (secID = null),
      (subSecID = null),
      (qID = null),
      (extraID = null),
      (answers = []),
      (opIDs = []);

    // retrieving sectionID, subSectionID, questionID, additionalID from key
    let result = key.split("#####");
    (secID = result[0]),
      (subSecID = result[1]),
      (qID = result[2]),
      (extraID = result.length <= 3 ? null : result[3]);

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
      questionID: checkNotNull(qID) ? mongoose.Types.ObjectId(qID) : null,
      additionalID: checkNotNull(extraID)
        ? mongoose.Types.ObjectId(extraID)
        : null,
      answers: answers,
      optionIDsforMCQAnswer: opIDs,
    };

    mapSubSecToAnswers[subSecID].push(singleAnswer);
  }

  try {
    let existingDocs = await answerModel.find({
      userID: req.user._id,
      sectionID: paramSectoinID,
    });

    if (existingDocs.length) {
      console.log("a bunch of documents exist");

      for (let i = 0, max = paramSection.subSections.length; i < max; i++) {
        let subSectionID = paramSection.subSections[i].toString();
        let allAnswers = mapSubSecToAnswers[subSectionID];

        let idx = existingDocs.findIndex((x) => {
          // mongoose.Types.ObjectId() must be converted to String before comparison as mongoose.Types.ObjectId() is an Object in js
          // Object actually store reference to the memory location
          // So inspite of having same values, we may have a false result from the equality comparison between two objects

          // We can't call toString() to a null value, that's why null check is required
          let xSubSecID = checkNotNull(x.subSectionID)
            ? x.subSectionID.toString()
            : x.subSectionID;
          return xSubSecID === subSectionID;
        });

        if (idx == -1) {
          // console.log(`Answers for section ${sectionID} and subsection ${subSectionID} doesn't exist and so a document is created - ${i}`)

          let subSectionAllAnswers = new answerModel({
            userID: req.user._id,
            sectionID: mongoose.Types.ObjectId(paramSectoinID),
            subSectionID: mongoose.Types.ObjectId(subSectionID),
            allAnswers: allAnswers,
          });

          await subSectionAllAnswers.save();
        } else {
          // console.log(`Answers for section ${sectionID} and subsection ${subSectionID} exist and thus need to be updated - ${i}`)
          existingDocs[idx].allAnswers = allAnswers;

          await existingDocs[idx].save();
        }
      }
    } else {
      console.log("new documents are created");

      for (let i = 0, max = paramSection.subSections.length; i < max; i++) {
        let subSectionID = paramSection.subSections[i].toString();
        let allAnswers = mapSubSecToAnswers[subSectionID];

        let subSectionAllAnswers = new answerModel({
          userID: req.user._id,
          sectionID: mongoose.Types.ObjectId(paramSectoinID),
          subSectionID: mongoose.Types.ObjectId(subSectionID),
          allAnswers: allAnswers,
        });

        await subSectionAllAnswers.save();
      }
    }
  } catch (err) {
    console.error(err);
    res.render("404", {navDisplayName, userRole, error: err.message });
    return;
  }

  res.redirect("/patient/profile");
});

router.get("/getSectionData/:section", getSectionData);

module.exports = router;
