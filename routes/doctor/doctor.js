const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const {
  forgotpassHandler,
  postResetPass,
  postResetPassDoctor,
  emailVerificationLinkGenerator,
  checkEmailVerified,
  checkEmailNotVerified,
  emailVerificationHandler,
  checkNotAuthenticated,
  checkAuthenticated,
  checkAuthenticatedDoctor,
  checkAuthenticatedDoctorForAjax,
  checkEmailVerifiedForAjax,
} = require("../../controllers/auth_helper");
const {checkNotNull, calculateUnseenNotifications, preprocessData}= require("../../controllers/functionCollection")
// Load Patient model
const Patient = require("../../models/patient");
const Doctor = require("../../models/doctor").doctorModel;
const DoctorPatient = require("../../models/doctorPatient").doctorPatientModel;
const {
  sectionModel,
  vaccineModel,
  substanceModel,
  answerModel,
} = require("../../models/inputCollection");
const {
  doctorNotification,
  patientNotification,
} = require("../../models/notification");
const {
  followupModel,
  followupQuesModel,
  followupQuesAnsModel
}= require("../../models/followup")

router.get("/resetpassword", checkAuthenticatedDoctor, async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role;
  let role = req.user.role;
  try{
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
    res.render("resetPass", { navDisplayName, userRole, role, totalUnseenNotifications});
  }catch(err){
    return res.render("404", {
      navDisplayName,
      userRole,
      error: err.message,
    });
  }
});

router.post("/resetpassword", checkAuthenticatedDoctor, postResetPassDoctor);

router.get(
  "/accountVerification",
  checkAuthenticatedDoctor,
  checkEmailNotVerified,
  async (req, res) => {
    let navDisplayName = req.user.name.displayName;
    let fullName = req.user.name.firstName + " " + req.user.name.lastName;
    let userEmail = req.user.email;
    let userRole = req.user.role;
    let role = req.user.role;
    res.render("accountVerification", {
      navDisplayName,
      fullName,
      userEmail,
      userRole,
      role,
    });
  }
);

router.post(
  "/accountVerification",
  checkAuthenticatedDoctor,
  emailVerificationLinkGenerator
);

let calculatePatientRecordCount = async (doctorPatients, dortorId) => {
  try{
    // console.log(doctorPatients)
    let patientIds = doctorPatients.map((element) => {
      return element.patient._id;
    })
  
    let patientRecords = await followupModel.find({
      doctorId: dortorId,
      patientId: {$in: patientIds}
    }, "patientId");
  
    let recordCount = {}
    patientRecords.forEach((element) => {
      recordCount[element.patientId.toString()] = (recordCount[element.patientId.toString()] || 0) + 1
    })
  
    return recordCount
  }catch(err){
    console.log('err = ',{err})
    throw new Error(err.message)
  }
}

// patient list page
router.get(
  "/patients",
  checkAuthenticatedDoctor,
  checkEmailVerified,
  async (req, res) => {
    const LIMIT = 10;
    let navDisplayName = req.user.name.displayName;
    let userRole = req.user.role;
    try{
      const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)

      let {genderFilter, page} = req.query
      page = parseInt( typeof page != "undefined" ? page : 1);
      genderFilter = (typeof genderFilter != "undefined") ? genderFilter : [];
      genderFilter = Array.isArray(genderFilter) ? genderFilter : [genderFilter];

      let queryForDoctorPatients = {"doctor._id": req.user._id};
      if (genderFilter.length)
        queryForDoctorPatients["patient.gender"] = {$in: genderFilter};
  
      const doctorPatients = await DoctorPatient
        .find(queryForDoctorPatients, "patient")
        .sort({ created: -1})
        .limit(LIMIT)
        .skip(LIMIT * (page - 1));

      // console.log(doctorPatients)
      const totalItems = await DoctorPatient.countDocuments(queryForDoctorPatients);
      const recordCount = await calculatePatientRecordCount(doctorPatients, req.user._id)
  
      let patientDesk = [];
  
      doctorPatients.forEach((element) => {
        let instance = {
          _id: element.patient._id,
          name: element.patient.name,
          email: element.patient.email,
          phoneNumber: element.patient.phoneNumber,
          gender: element.patient.gender,
          recordCount: `${recordCount[element.patient._id.toString()] || 0} Records`,
          exists: true,
        };
        patientDesk.push(instance);
      });
      // console.log(patientDesk)
  
      let paginationUrl = req.originalUrl.toString();
      if (paginationUrl.includes(`page=`))
        paginationUrl = paginationUrl.replace(`page=${page}`, "page=");
      else {
        paginationUrl = paginationUrl.includes("?")
          ? `${paginationUrl}&page=`
          : `${paginationUrl}?page=`;
      }
  
      return res.render("doctorPatients", {
        navDisplayName,
        userRole,
        totalUnseenNotifications,
        patientDesk,
        genderFilter,
        currentPage: page,
        hasNextPage: page * LIMIT < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / LIMIT),
        URL: paginationUrl,
      });
    }catch(err){
      return res.render("404", {
        navDisplayName,
        userRole,
        error: err.message,
      });
    }
  }
);

// router.get(
//   "/patients/records",
//   checkAuthenticatedDoctor,
//   checkEmailVerified,
//   async (req, res) => {
//     let navDisplayName = req.user.name.displayName;
//     let userRole = req.user.role;
//     try{
//       const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
//       return res.render("doctorPatientRecords", { navDisplayName, userRole, totalUnseenNotifications });
//     }catch(err){
//       return res.render("404", {
//         navDisplayName,
//         userRole,
//         error: err.message,
//       });
//     }
//   }
// );

router.get(
  "/patients/searchResults",
  checkAuthenticatedDoctor,
  checkEmailVerified,
  async (req, res) => {
    // console.log(req.query)
    const LIMIT = 10;
    let navDisplayName = req.user.name.displayName;
    let userRole = req.user.role;
    let totalUnseenNotifications = 0
    try{
      totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
    }catch(err){
      return res.render("404", {
        navDisplayName,
        userRole,
        error: err.message
      });
    }

    let {searchKey, searchOption, searchFilter, page, genderFilter } = req.query;

    page = parseInt(typeof page != "undefined" ? page : 1);
    searchKey =
      typeof searchKey != "undefined" ? searchKey.toString().trim() : searchKey;

    let paginationUrl = req.originalUrl.toString();
    if (paginationUrl.includes(`page=`))
      paginationUrl = paginationUrl.replace(`page=${page}`, "page=");
    else {
      paginationUrl = paginationUrl.includes("?")
        ? `${paginationUrl}&page=`
        : `${paginationUrl}?page=`;
    }

    if (!checkNotNull(searchKey) || typeof searchOption == "undefined") {
      let searchResults = [];

      return res.render("doctorPatients", {
        navDisplayName,
        userRole,
        totalUnseenNotifications,
        searchKey,
        searchOption,
        searchFilter,
        genderFilter,
        searchResults,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
        nextPage: 1,
        previousPage: 1,
        lastPage: 1,
        URL: paginationUrl,
      });
    }

    searchFilter = (typeof searchFilter != "undefined") ? searchFilter : [];
    searchFilter = Array.isArray(searchFilter) ? searchFilter : [searchFilter];

    genderFilter = (typeof genderFilter != "undefined") ? genderFilter : [];
    genderFilter = Array.isArray(genderFilter) ? genderFilter : [genderFilter];

    let queryForDoctorPatients = {"doctor._id": req.user._id};
    if (genderFilter.length)
      queryForDoctorPatients["patient.gender"] = {$in: genderFilter};
    if (searchOption == "name")
      queryForDoctorPatients["patient.name"] = {
        $regex: `${searchKey}`,
        $options: "i",
      };
    else queryForDoctorPatients[`patient.${searchOption}`] = searchKey;
    // console.log(queryForDoctorPatients)

    try {
      if (searchFilter.includes("followupRunning")) {
        const doctorPatients = await DoctorPatient.find(
          queryForDoctorPatients,
          "patient"
        ).limit(LIMIT)
        .skip(LIMIT * (page - 1));

        const totalItems = await DoctorPatient.countDocuments(
          queryForDoctorPatients
        );

        const recordCount = await calculatePatientRecordCount(doctorPatients, req.user._id)
        // console.log(doctorPatients)
        
        let searchResults = [];

        doctorPatients.forEach((element) => {
          let instance = {
            _id: element.patient._id,
            name: element.patient.name,
            email: element.patient.email,
            phoneNumber: element.patient.phoneNumber,
            gender: element.patient.gender,
            recordCount: `${recordCount[element.patient._id.toString()] || 0} Records`,
            exists: true,
          };
          searchResults.push(instance);
        });
        // console.log(searchResults)

        return res.render("doctorPatients", {
          navDisplayName,
          userRole,
          totalUnseenNotifications,
          searchKey,
          searchOption,
          searchFilter,
          genderFilter,
          searchResults,
          currentPage: page,
          hasNextPage: page * LIMIT < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / LIMIT),
          URL: paginationUrl,
        });
      } else {
        let queryForPatients = {};
        if (genderFilter.length)
          queryForPatients["gender"] = { $in: genderFilter };
        if (searchOption == "name")
          queryForPatients["name.fullName"] = {
            $regex: `${searchKey}`,
            $options: "i",
          };
        else queryForPatients[`${searchOption}`] = searchKey;
        // console.log(queryForPatients)

        let doctorPatients = await DoctorPatient.find(
          queryForDoctorPatients,
          "patient._id"
        );

        const recordCount = await calculatePatientRecordCount(doctorPatients, req.user._id)
        // console.log(doctorPatients)

        let searchedPatients = await Patient.find(
          queryForPatients,
          "name.fullName email phoneNumber gender"
        )
          .limit(LIMIT)
          .skip(LIMIT * (page - 1));

        const totalItems = await Patient.countDocuments(queryForPatients);

        let searchResults = [];

        searchedPatients.forEach((element) => {
          let idx = doctorPatients.findIndex((x) => {
            return x.patient._id.toString() == element._id.toString();
          });

          let instance = {
            _id: element._id,
            name: element.name.fullName,
            email: element.email,
            phoneNumber: element.phoneNumber,
            gender: element.gender,
            recordCount:
              (idx != -1) ? `${recordCount[element._id.toString()] || 0} Records` : "-",
            exists: (idx != -1) ? true : false,
          };
          searchResults.push(instance);
        });
        // console.log(searchResults)

        return res.render("doctorPatients", {
          navDisplayName,
          userRole,
          totalUnseenNotifications,
          searchKey,
          searchOption,
          searchFilter,
          genderFilter,
          searchResults,
          currentPage: page,
          hasNextPage: page * LIMIT < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / LIMIT),
          URL: paginationUrl,
        });
      }
    } catch (err) {
      return res.render("404", {
        navDisplayName,
        userRole,
        error: err.message,
      });
    }
  }
);

let getQuestionsFromAllSections = async () => {
  let data

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
    throw new Error(err.message)
  }
  // console.log(util.inspect({ data }, false, null, true /* enable colors */));
  return data;
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

router.get(
  "/patients/:pId/profile",
  checkAuthenticatedDoctor,
  checkEmailVerified,
  async (req, res) => {
    let patientId = req.params.pId;
    let navDisplayName = req.user.name.displayName;
    let userRole = req.user.role
    
    let patientDetails,
      wholeSectionCollection,
      medicalHistoryData,
      vaccineData,
      substanceData,
      totalUnseenNotifications = 0
      
    try {
      patientDetails = await Patient.findOne({ _id: patientId });
      // console.log(patientDetails)
      // patientDetailsLean = await Patient.findOne({ _id: patientId }).lean()
      // console.log(patientDetailsLean)
      wholeSectionCollection = await getQuestionsFromAllSections();
      vaccineData = await vaccineModel.find({});
      substanceData = await substanceModel.find({});
      medicalHistoryData = await answerModel.find({ userID: patientId });
      // console.log(medicalHistoryData.length)
      totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
      
      const {
        mapQuesToAnswer,
        mapSubSecToAdditionalIDs,
      } = processAnswerModelData(medicalHistoryData);

      res.render("patientProfileFromDoctor", {
        patientDetails,
        navDisplayName, userRole,
        totalUnseenNotifications,
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
  }
)

router.get(
  "/notifications",
  checkAuthenticatedDoctor,
  checkEmailVerified,
  async (req, res) => {
    const LIMIT = 10;
    let navDisplayName = req.user.name.displayName;
    let userRole = req.user.role;
    const page = parseInt(
      typeof req.query.page != "undefined" ? req.query.page : 1
    );

    try{
      const notifications = await doctorNotification
        .find({ doctorId: req.user._id })
        .sort({ created: -1})
        .limit(LIMIT)
        .skip(LIMIT * (page - 1))

      for(let notification of notifications){
        if(notification.seen == false){
          notification.seen = true
          await notification.save()
          notification.seen = false // It's for highlighting new unseen notifications on the page on loading for the first time. 
        }
      }

      const totalNotifications = await doctorNotification.countDocuments({
        doctorId: req.user._id,
      });
      
      const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)

      let paginationUrl = req.originalUrl.toString();
      if (paginationUrl.includes(`page=`))
        paginationUrl = paginationUrl.replace(`page=${page}`, "page=");
      else {
        paginationUrl = paginationUrl.includes("?")
          ? `${paginationUrl}&page=`
          : `${paginationUrl}?page=`;
      }

      res.render("doctorNotifications", {
        navDisplayName,
        userRole,
        notifications,
        totalUnseenNotifications,
        currentPage: page,
        hasNextPage: page * LIMIT < totalNotifications,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalNotifications / LIMIT),
        URL: paginationUrl,
      });
    }catch(err){
      return res.render("404", {
        navDisplayName,
        userRole,
        error: err.message,
      });
    }
  }
);

router.post(
  "/sendNotificationToPatient",
  checkAuthenticatedDoctor,
  checkEmailVerified,
  async (req, res) => {
    preprocessData(req.body)
    const { patientId, notificationType } = req.body;
    // console.log(typeof patientId)
    if (notificationType == "doctorRequest") {
      try {

        let notification = await patientNotification.findOne({
          patientId: mongoose.Types.ObjectId(patientId),
          notificationType: notificationType,
          "doctor._id": req.user._id,
        });

        if(checkNotNull(notification)){
          notification.created = Date.now()
          notification.seen = false
        }
        else{
          notification = new patientNotification({
            patientId: mongoose.Types.ObjectId(patientId),
            notificationType: notificationType,
            doctor: {
              _id: req.user._id,
              name: req.user.name.fullName,
            },
          });
        }

        await notification.save();
        return res.send({ status: true });

      } catch (err) {
        console.log(err.message);
        return res.send({ status: false });
      }
    }
  }
);

router.post(
  "/removePatientFromPatientDesk",
  checkAuthenticatedDoctor,
  checkEmailVerified,
  async (req, res) => {
    preprocessData(req.body)
    const { patientId} = req.body;
    // console.log(typeof patientId)
    try {
      await DoctorPatient.deleteOne({
        "patient._id": mongoose.Types.ObjectId(patientId),
        "doctor._id": req.user._id,
      });
      return res.send({ status: true });

    } catch (err) {
      console.log(err.message);
      return res.send({ status: false });
    }
  }
);


// this provides new id
router.get("/getNewId", (req, res) => {
  res.send({ id: new mongoose.Types.ObjectId() });
});

router.use("/profile", require("./profile.js"));
router.use("/followupQues", require("./followup.js"));

module.exports = router;
