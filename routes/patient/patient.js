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
} = require("../../controllers/auth_helper");
// Load Patient model
const Patient = require("../../models/patient");
const Doctor = require("../../models/doctor").doctorModel
const DoctorPatient = require("../../models/doctorPatient").doctorPatientModel
const {doctorNotification, patientNotification} = require("../../models/notification");
const {checkNotNull, calculateUnseenNotifications, preprocessData} = require("../../controllers/functionCollection")
const {
  followupModel,
  followupQuesModel,
  followupQuesAnsModel
}= require("../../models/followup")


// resetpassword
router.get("/resetpassword", checkAuthenticated, async (req, res) => {
    let navDisplayName = req.user.name.displayName;
    let userRole = req.user.role
    let role = req.user.role
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

router.post("/resetpassword", checkAuthenticated, postResetPass);

router.get('/records', checkAuthenticated, checkEmailVerified, async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role
  try{
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
    res.render('patientRecords', {navDisplayName, userRole, totalUnseenNotifications})
  }catch(err){
    return res.render("404", {
      navDisplayName,
      userRole,
      error: err.message,
    });
  }
})

router.get(
  "/accountVerification",
  checkAuthenticated,
  checkEmailNotVerified,
  async (req, res) => {
    let navDisplayName = req.user.name.displayName;
    let userRole = req.user.role
    let fullName = req.user.name.firstName + " " + req.user.name.lastName;
    let userEmail = req.user.email;
    let role = req.user.role;
    res.render("accountVerification", {
        navDisplayName,
        userRole,
        fullName,
        userEmail,
        role,
    });
  }
);

router.post(
  "/accountVerification",
  checkAuthenticated,
  emailVerificationLinkGenerator
);

router.get(
  "/notifications",
  checkAuthenticated,
  checkEmailVerified,
  async (req, res) => {
    const LIMIT = 10;
    const navDisplayName = req.user.name.displayName;
    const userRole = req.user.role;

    const page = parseInt(
        typeof req.query.page != "undefined" ? req.query.page : 1
    );
    
    try{
      const notifications = await patientNotification
      .find({patientId : req.user._id})
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

      const totalNotifications = await patientNotification.countDocuments({patientId : req.user._id})

      const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)

      let paginationUrl = req.originalUrl.toString();
      if (paginationUrl.includes(`page=`))
        paginationUrl = paginationUrl.replace(`page=${page}`, "page=");
      else {
        paginationUrl = paginationUrl.includes("?")
          ? `${paginationUrl}&page=`
          : `${paginationUrl}?page=`;
      }

      res.render("patientNotifications", { 
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
          URL: paginationUrl
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
  "/acceptDoctorRequest",
  checkAuthenticated,
  checkEmailVerified,
  async (req, res) => {
    preprocessData(req.body)
    const {notificationId, doctorId} = req.body
    try{
      let doctorDetails = await Doctor.findById(mongoose.Types.ObjectId(doctorId), "name.fullName email phoneNumber gender")
      let doctorPatientInstance = new DoctorPatient({
        doctor:{
          _id: doctorDetails._id,
          name: doctorDetails.name.fullName,
          email: doctorDetails.email,
          phoneNumber: doctorDetails.phoneNumber,
          gender: doctorDetails.gender
        },
        patient:{
          _id: req.user._id,
          name: req.user.name.fullName,
          email: req.user.email,
          phoneNumber: req.user.phoneNumber,
          gender: req.user.gender
        }
      })
      await doctorPatientInstance.save()

      let notification = new doctorNotification({
        doctorId: mongoose.Types.ObjectId(doctorId),
        notificationType: "requestAccepted",
        patient: {
          _id: req.user._id,
          name: req.user.name.fullName,
        },
      });
      await notification.save();

      await patientNotification.deleteOne({ _id: mongoose.Types.ObjectId(notificationId)})
      return res.send({status: true})

    }catch(err){
        console.log(err.message)
        return res.send({status: false})
    }
  }
);

router.post(
  "/deleteDoctorRequest",
  checkAuthenticated,
  checkEmailVerified,
  async (req, res) => {
    preprocessData(req.body)
    const { notificationId} = req.body 
    try{
      await patientNotification.deleteOne({
        _id: mongoose.Types.ObjectId(notificationId) 
      })
      return res.send({status: true})

    }catch(err){
        console.log(err.message)
        return res.send({status: false})
    }
  }
);

let calculatePatientRecordCount = async (patientDoctors, patientId) => {
  try{
    // console.log(patientDoctors)
    let doctorIds = patientDoctors.map((element) => {
      return element.doctor._id;
    })
  
    let patientRecords = await followupModel.find({
      patientId: patientId,
      doctorId: {$in: doctorIds}
    }, "doctorId");
  
    let recordCount = {}
    patientRecords.forEach((element) => {
      recordCount[element.doctorId.toString()] = (recordCount[element.doctorId.toString()] || 0) + 1
    })
  
    return recordCount
  }catch(err){
    console.log('err = ',{err})
    throw new Error(err.message)
  }
}

router.get('/doctors', checkAuthenticated, checkEmailVerified, async (req, res) => {
  const LIMIT = 10;
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role;
  try{
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)

    let {genderFilter, page} = req.query
    page = parseInt( typeof page != "undefined" ? page : 1);
    genderFilter = (typeof genderFilter != "undefined") ? genderFilter : [];
    genderFilter = Array.isArray(genderFilter) ? genderFilter : [genderFilter];

    let queryForPatientDoctors = {"patient._id": req.user._id};
    if (genderFilter.length)
      queryForPatientDoctors["doctor.gender"] = {$in: genderFilter};

    const patientDoctors = await DoctorPatient
      .find(queryForPatientDoctors, "doctor")
      .sort({ created: -1})
      .limit(LIMIT)
      .skip(LIMIT * (page - 1));

    const totalItems = await DoctorPatient.countDocuments(queryForPatientDoctors);
    const recordCount = await calculatePatientRecordCount(patientDoctors, req.user._id)
    // console.log(patientDoctors)
    let doctorDesk = [];

    patientDoctors.forEach((element) => {
      let instance = {
        _id: element.doctor._id,
        name: element.doctor.name,
        email: element.doctor.email,
        phoneNumber: element.doctor.phoneNumber,
        gender: element.doctor.gender,
        recordCount: `${recordCount[element.doctor._id.toString()] || 0} Records`,
        exists: true,
      };
      doctorDesk.push(instance);
    });
    // console.log(doctorDesk)

    let paginationUrl = req.originalUrl.toString();
    if (paginationUrl.includes(`page=`))
      paginationUrl = paginationUrl.replace(`page=${page}`, "page=");
    else {
      paginationUrl = paginationUrl.includes("?")
        ? `${paginationUrl}&page=`
        : `${paginationUrl}?page=`;
    }

    return res.render("patientDoctors", {
      navDisplayName,
      userRole,
      totalUnseenNotifications,
      doctorDesk,
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
)

router.get(
  "/doctors/searchResults",
  checkAuthenticated,
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

    let {searchKey, searchOption, page, genderFilter } = req.query;

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

      return res.render("patientDoctors", {
        navDisplayName,
        userRole,
        totalUnseenNotifications,
        searchKey,
        searchOption,
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

    genderFilter = (typeof genderFilter != "undefined") ? genderFilter : [];
    genderFilter = Array.isArray(genderFilter) ? genderFilter : [genderFilter];

    let queryForPatientDoctors = {"patient._id": req.user._id};
    if (genderFilter.length)
      queryForPatientDoctors["doctor.gender"] = {$in: genderFilter};
    if (searchOption == "name")
      queryForPatientDoctors["doctor.name"] = {
        $regex: `${searchKey}`,
        $options: "i",
      };
    else queryForPatientDoctors[`doctor.${searchOption}`] = searchKey;
    console.log(queryForPatientDoctors)

    try {
      const patientDoctors = await DoctorPatient.find(
        queryForPatientDoctors,
        "doctor"
      ).limit(LIMIT)
      .skip(LIMIT * (page - 1));

      const totalItems = await DoctorPatient.countDocuments(
        queryForPatientDoctors
      );

      const recordCount = await calculatePatientRecordCount(patientDoctors, req.user._id)
      console.log(patientDoctors)
      
      let searchResults = [];

      patientDoctors.forEach((element) => {
        let instance = {
          _id: element.doctor._id,
          name: element.doctor.name,
          email: element.doctor.email,
          phoneNumber: element.doctor.phoneNumber,
          gender: element.doctor.gender,
          recordCount: `${recordCount[element.doctor._id.toString()] || 0} Records`,
          exists: true,
        };
        searchResults.push(instance);
      });
      // console.log(searchResults)

      return res.render("patientDoctors", {
        navDisplayName,
        userRole,
        totalUnseenNotifications,
        searchKey,
        searchOption,
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
    } catch (err) {
      return res.render("404", {
        navDisplayName,
        userRole,
        error: err.message,
      });
    }
  }
);

router.get(
  "/doctors/:dId/profile",
  checkAuthenticated,
  checkEmailVerified,
  async (req, res) => {
    let doctorId = req.params.dId;
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
      const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
      
      doctorInfo = await Doctor.findOne({ _id: doctorId });
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

      res.render("doctorProfileFromPatient", {
        doctorProfileData,
        navDisplayName, userRole,
        totalUnseenNotifications
      });
    } catch (err) {
      console.error(err);
      res.render("404", { navDisplayName, userRole, error: err.message });
      return;
    }
  })


// this provides new id
router.get("/getNewId", (req, res) => {
  res.send({ id: new mongoose.Types.ObjectId() });
});

router.use("/profile", require("./profile.js"));
router.use("/followupQues", require("./followup.js"));
router.use("/diary", require("./diary.js"));

module.exports = router;
