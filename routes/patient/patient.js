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
const { session } = require("passport");
const {doctorNotification, patientNotification} = require("../../models/notification");
const {checkNotNull, calculateUnseenNotifications, preprocessData} = require("../../controllers/functionCollection")

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
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)

    const page = parseInt(
        typeof req.query.page != "undefined" ? req.query.page : 1
    );
    
    const notifications = await patientNotification.find({patientId : req.user._id})
    .limit(LIMIT)
    .skip(LIMIT * (page - 1))

    const totalNotifications = await patientNotification.countDocuments({patientId : req.user._id})

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
          name: doctorDetails.fullName,
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

router.get('/doctors', checkAuthenticated, checkEmailVerified, async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role
  res.render('patientDoctors', {navDisplayName, userRole})
})

// this provides new id
router.get("/getNewId", (req, res) => {
  res.send({ id: new mongoose.Types.ObjectId() });
});

router.use("/profile", require("./profile.js"));
router.use("/followupQues", require("./followup.js"));

module.exports = router;
