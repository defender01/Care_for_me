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
const {
  parameterModel,
  followupModel,
  followupQuesModel,
  followupQuesAnsModel
}= require("../../models/followup")
const Doctor = require("../../models/doctor").doctorModel


router.get('/records', checkAuthenticated, checkEmailVerified, async (req, res) => {
  let dId = req.query.dId
  // console.log({dId})
  let navDisplayName = req.user.name.displayName
  let userRole = req.user.role
  try{
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
    let followupRecords = await followupModel.find({
      doctorId: dId,
      patientId: req.user._id,
    })
    let doctorInfo = await Doctor.findOne({
      _id: dId
    }, "_id name")
    console.log(util.inspect( {followupRecords} , false, null, true /* enable colors */));
    res.render('patientDoctorRecords', {
      navDisplayName, 
      userRole, 
      totalUnseenNotifications, 
      doctorInfo, 
      followupRecords
    })
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
  let {dId, recordId, recordInd} = req.query
  console.log({recordId, recordInd})
  try{
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
    let followupRecord = await followupModel.findOne({
      _id : recordId,
    }).populate({
      path:"questions",
    }).exec();

    let doctorInfo = await Doctor.findOne({
      _id: dId
    }, "_id name")
    console.log(util.inspect( {followupRecord} , false, null, true /* enable colors */));
    res.render('patientDoctorRecordsQues', {
      navDisplayName,
      userRole, 
      totalUnseenNotifications, 
      followupRecord, 
      recordInd, 
      doctorInfo,
    })
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
