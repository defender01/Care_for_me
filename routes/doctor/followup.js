const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const util = require('util')
const {
  checkAuthenticated,
  checkNotAuthenticated,
  checkAuthenticatedDoctor,
  checkEmailVerified
} = require("../../controllers/auth_helper");

const {
  parameterModel,
  followupModel,
  followupQuesModel,
  followupQuesAnsModel
}= require("../../models/followup")
const Patient = require("../../models/patient")

const {checkNotNull, calculateUnseenNotifications, preprocessData} = require("../../controllers/functionCollection")

router.get('/assign',checkAuthenticatedDoctor, checkEmailVerified, async (req, res) => {
  let pId = req.query.pId
  // console.log({pId})
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role
  try{
    let parameters = await parameterModel.find({})
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
    res.render('followupQues', {navDisplayName,userRole, parameters, totalUnseenNotifications,pId})
  }catch(err){
    return res.render("404", {
      navDisplayName,
      userRole,
      error: err.message,
    });
  }
})

router.get('/assign/continue', checkAuthenticatedDoctor, checkEmailVerified, async (req, res) => {
  let pId = req.query.pId
  // console.log({pId})
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role
  try{
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
    res.render('followupQuesContinue', { navDisplayName, userRole, totalUnseenNotifications,pId})
  }catch(err){
    return res.render("404", {
      navDisplayName,
      userRole,
      error: err.message,
    });
  }
})
router.post('/assign/continue', checkAuthenticatedDoctor, checkEmailVerified, async (req, res) => {
  let pId = req.query.pId
  // console.log({pId})
  preprocessData(req.body)
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role
  let data = req.body
  let qIds = data.questionId
  let questionIds = []
  let recordStartDate , recordEndDate
  // console.log({data})
  try{
    if(checkNotNull(qIds)){
      qIds = Array.isArray(qIds)? qIds : [qIds]
      for(let i=0; i< qIds.length; i++){
        let qId = qIds[i]
        // console.log(typeof data['startDate'+qId])
        if( i==0){
          recordStartDate = new Date(data['startDate'+qId])
          recordEndDate = new Date(data['endDate'+qId])
        }
        else{
          recordStartDate = Math.min(recordStartDate, new Date(data['startDate'+qId]))
          recordEndDate = Math.max(recordEndDate, new Date(data['endDate'+qId]))
        }
        let question = new followupQuesModel({
          id : qId,
          inputType : data['inputType'+qId],
          name : data['name'+qId],
          maxVal : data['maxVal'+qId],
          minVal : data['minVal'+qId],
          duration:{
            startDate : data['startDate'+qId],
            endDate : data['endDate'+qId]
          },
          frequency : data['frequency'+qId],          
        })
        await question.save()
        questionIds.push(question.id)
      }
      let followupRecord = new followupModel({
        doctorId: req.user._id,
        patientId: pId,
        questions: questionIds,
        recordStartDate: recordStartDate,
        recordEndDate: recordEndDate,
      })
      await followupRecord.save()
      // console.log(util.inspect( {followupRecord} , false, null, true /* enable colors */));
    }
    // console.log(util.inspect( {questions} , false, null, true /* enable colors */));
    res.redirect(`/doctor/followupQues/records?pId=${pId}`)
  }catch(err){
    return res.render("404", {
      navDisplayName,
      userRole,
      error: err.message,
    });
  }   
})

router.get('/records', checkAuthenticatedDoctor, checkEmailVerified,async (req, res) => {
  let pId = req.query.pId
  // console.log({pId})
  let navDisplayName = req.user.name.displayName
  let userRole = req.user.role
  try{
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
    let followupRecords = await followupModel.find({
      doctorId: req.user._id,
      patientId: pId,
    })
    let patientInfo = await Patient.findOne({
      _id: pId
    }, "_id name")
    // console.log(util.inspect( {followupRecords} , false, null, true /* enable colors */));
    res.render('doctorPatientRecords', {navDisplayName, userRole, totalUnseenNotifications, patientInfo, followupRecords})
  }catch(err){
    return res.render("404", {
      navDisplayName,
      userRole,
      error: err.message,
    });
  }
})

router.get('/questions', checkAuthenticatedDoctor, checkEmailVerified, async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role
  let {pId, recordId, recordInd} = req.query
  console.log({recordId, recordInd})
  try{
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
    let followupRecord = await followupModel.findOne({
      _id : recordId,
    }).populate({
      path:"questions",
    }).exec();

    let patientInfo = await Patient.findOne({
      _id: pId
    }, "_id name")

    console.log(util.inspect( {followupRecord} , false, null, true /* enable colors */));
    res.render('doctorPatientRecordsQues', {
      navDisplayName, 
      userRole, 
      totalUnseenNotifications, 
      followupRecord, 
      recordInd, 
      patientInfo
    })
  }catch(err){
    return res.render("404", {
      navDisplayName,
      userRole,
      error: err.message,
    });
  }
})

router.get('/questionAns/qId', checkAuthenticatedDoctor, checkEmailVerified,async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role
  try{
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
    res.render('doctorPatientRecordsQuesAns', {navDisplayName, userRole, totalUnseenNotifications})
  }catch(err){
    return res.render("404", {
      navDisplayName,
      userRole,
      error: err.message,
    });
  }
})

module.exports = router;
