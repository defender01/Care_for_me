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

const {checkNotNull, calculateUnseenNotifications} = require("../../controllers/functionCollection")
const { parameterModel } = require("../../models/followup");

router.get('/',checkAuthenticatedDoctor, checkEmailVerified, async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role
  try{
    let parameters = await parameterModel.find({})
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
    res.render('followupQues', {navDisplayName,userRole, parameters, totalUnseenNotifications})
  }catch(err){
    return res.render("404", {
      navDisplayName,
      userRole,
      error: err.message,
    });
  }
})

router.get('/continue', checkAuthenticatedDoctor, checkEmailVerified, async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role
  try{
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
    res.render('followupQuesContinue', { navDisplayName, userRole, totalUnseenNotifications})
  }catch(err){
    return res.render("404", {
      navDisplayName,
      userRole,
      error: err.message,
    });
  }
})
router.post('/continue', checkAuthenticatedDoctor, checkEmailVerified, async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role
  let data = req.body
  // let qIds = data.questionId
  // let questions = []
  // if(typeof qIds!== 'undefined'){
  //   if(Array.isArray(qIds)){
  //     for(let i=0; i< qIds.length; i++){
  //       let qId = qIds[i]
  //       let question = {
  //         id : qId,
  //         inputType : data['inputType'+qId],
  //         name : data['name'+qId],
  //         startDate : data['startDate'+qId],
  //         endDate : data['endDate'+qId],
  //         frequency : data['frequency'+qId],
  //         maxVal : data['maxVal'+qId],
  //         minVal : data['minVal'+qId],
  //       }
  //       questions.push(question)
  //     }    
  //   }
  //   else{
  //     let qId = qIds
  //     let question = {
  //       id : qId,
  //       inputType : data['inputType'+qId],
  //       name : data['name'+qId],
  //       startDate : data['startDate'+qId],
  //       endDate : data['endDate'+qId],
  //       frequency : data['frequency'+qId],
  //       maxVal : data['maxVal'+qId],
  //       minVal : data['minVal'+qId],
  //     }
  //     questions.push(question)
  //   }
  // }
  
  console.log({data})
  res.send({data})
})

router.get('/records', checkAuthenticatedDoctor, checkEmailVerified,async (req, res) => {
  let navDisplayName = req.user.name.displayName
  let userRole = req.user.role
  try{
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
    res.render('doctorPatientRecords', {navDisplayName, userRole, totalUnseenNotifications})
  }catch(err){
    return res.render("404", {
      navDisplayName,
      userRole,
      error: err.message,
    });
  }
})

router.get('/id', checkAuthenticatedDoctor, checkEmailVerified,async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role
  try{
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
    res.render('doctorPatientRecordsQues', {navDisplayName, userRole, totalUnseenNotifications})
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
