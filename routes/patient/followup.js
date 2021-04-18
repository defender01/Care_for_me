const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const util = require('util')
const {
  checkNotAuthenticated,
  checkAuthenticated,
  checkEmailVerified
} = require("../../controllers/auth_helper");

const {checkNotNull, calculateUnseenNotifications, preprocessData} = require("../../controllers/functionCollection")
const { parameterModel } = require("../../models/followup");

router.get('/',(req, res)=>{
    res.send({'success':'test success'})
})
router.get('/records/dId', checkAuthenticated, checkEmailVerified, async (req, res) => {
  let navDisplayName = req.user.name.displayName
  let userRole = req.user.role
  try{
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
    res.render('patientDoctorRecords', {navDisplayName, userRole, totalUnseenNotifications})
  }catch(err){
    return res.render("404", {
      navDisplayName,
      userRole,
      error: err.message,
    });
  }
})

router.get('/questions', checkAuthenticated, checkEmailVerified,async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role
  try{
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
    res.render('patientDoctorRecordsQues', {navDisplayName, userRole, totalUnseenNotifications})
  }catch(err){
    return res.render("404", {
      navDisplayName,
      userRole,
      error: err.message,
    });
  }
})

// router.get('/questionAns/qId', checkAuthenticated, checkEmailVerified,async (req, res) => {
//   let navDisplayName = req.user.name.displayName;
//   let userRole = req.user.role
//   try{
//     const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
//     res.render('doctorPatientRecordsQuesAns', {navDisplayName, userRole, totalUnseenNotifications})
//   }catch(err){
//     return res.render("404", {
//       navDisplayName,
//       userRole,
//       error: err.message,
//     });
//   }
// })

module.exports = router;
