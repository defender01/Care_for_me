const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const util = require('util')
const {
  checkNotAuthenticated,
  checkAuthenticated,
  checkEmailVerified
} = require("../../controllers/auth_helper");

const {
  checkNotNull,
  calculateUnseenNotifications,
  preprocessData,
  findTimeDiff,
} = require("../../controllers/functionCollection");
const {
  parameterModel,
  followupModel,
  followupQuesModel,
  followupQuesAnsModel
}= require("../../models/followup")
const Doctor = require("../../models/doctor").doctorModel

const {
  patientNotification,
  doctorNotification,
} = require("../../models/notification");


router.get('/records', checkAuthenticated, checkEmailVerified, async (req, res) => {
  const LIMIT = 10;
  let navDisplayName = req.user.name.displayName
  let userRole = req.user.role
  try{
    let { dId, followupStatus, page } = req.query;
    // console.log({dId})
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
    
    page = parseInt(typeof page != "undefined" ? page : 1);
    followupStatus =
      typeof followupStatus != "undefined" ? followupStatus : [];
    followupStatus = Array.isArray(followupStatus)
      ? followupStatus
      : [followupStatus];

    let paginationUrl = req.originalUrl.toString();
    if (paginationUrl.includes(`page=`))
      paginationUrl = paginationUrl.replace(`page=${page}`, "page=");
    else {
      paginationUrl = paginationUrl.includes("?")
        ? `${paginationUrl}&page=`
        : `${paginationUrl}?page=`;
    }
    
    let queryForFollowupRecords = {
      doctorId: dId,
      patientId: req.user._id,
    };
    let currentDate = Date.now();
    if (followupStatus.length) {
      let followupStatusQuery = [];
      if (followupStatus.includes("Upcoming"))
        followupStatusQuery.push({
          recordStartDate: { $gt: currentDate },
        });
      if (followupStatus.includes("Ended"))
        followupStatusQuery.push({
          recordEndDate: { $lt: currentDate },
        });
      if (followupStatus.includes("Running"))
        followupStatusQuery.push({
          recordStartDate: { $lte: currentDate },
          recordEndDate: { $gte: currentDate },
        });
      queryForFollowupRecords["$or"] = followupStatusQuery;
    }

    let followupRecords = await followupModel
      .find(queryForFollowupRecords)
      .sort({ created: -1 })
      .limit(LIMIT)
      .skip(LIMIT * (page - 1));

    let formattedFollowupRecords = followupRecords.map((element, index) => {
      let instance = {
        _id: element._id,
        index: (LIMIT * (page - 1)) + index + 1,
        startDate: element.recordStartDate.toDateString(),
        endDate: element.recordEndDate.toDateString(),
        followupStatus: '',
        totalQuestions: element.questions.length
      }
      if(currentDate < element.recordStartDate) instance.followupStatus = 'Upcoming'
      else if(currentDate > element.recordEndDate) instance.followupStatus = 'Ended'
      else instance.followupStatus = 'Running'

      return instance
    }) 

    const totalItems = await followupModel.countDocuments(
      queryForFollowupRecords
    );

    let doctorInfo = await Doctor.findOne({
      _id: dId
    }, "_id name")

    // console.log(util.inspect( {followupRecords} , false, null, true /* enable colors */));
    res.render('patientDoctorRecords', {
      navDisplayName, 
      userRole, 
      totalUnseenNotifications, 
      doctorInfo, 
      formattedFollowupRecords,
      followupStatus,
      currentPage: page,
      hasNextPage: page * LIMIT < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / LIMIT),
      URL: paginationUrl
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
  try{
    let {dId, recordId, recordInd, followupStatus} = req.query
    // console.log({recordId, recordInd})
    
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
    
    followupStatus =
      typeof followupStatus != "undefined" ? followupStatus : [];
    followupStatus = Array.isArray(followupStatus)
      ? followupStatus
      : [followupStatus];

    let queryForFollowUpQuestions = {};
    let currentDate = Date.now();

    if (followupStatus.length) {
      let followupStatusQuery = [];
      if (followupStatus.includes("Upcoming"))
        followupStatusQuery.push({
          "duration.startDate": { $gt: currentDate },
        });
      if (followupStatus.includes("Ended"))
        followupStatusQuery.push({
          "duration.endDate": { $lt: currentDate },
        });
      if (followupStatus.includes("Running"))
        followupStatusQuery.push({
          "duration.startDate": { $lte: currentDate },
          "duration.endDate": { $gte: currentDate },
        });
      queryForFollowUpQuestions["$or"] = followupStatusQuery;
    }

    let followupRecord = await followupModel
    .findOne({
      _id: recordId,
    })
    .populate({
      path: "questions",
      match: queryForFollowUpQuestions,
      select: "_id name duration answers"
    })
    .exec();

    let followupQuestions = followupRecord.questions.map((element, index) => {
      let instance = {
        _id: element._id,
        index: index + 1,
        name: element.name,
        startDate: element.duration.startDate.toDateString(),
        endDate: element.duration.endDate.toDateString(),
        followupStatus: '',
        totalResponses: element.answers.length
      }
      if(currentDate < element.duration.startDate) instance.followupStatus = 'Upcoming'
      else if(currentDate > element.duration.endDate) instance.followupStatus = 'Ended'
      else instance.followupStatus = 'Running'

      return instance
    })

    let doctorInfo = await Doctor.findOne({
      _id: dId
    }, "_id name")

    // console.log(util.inspect( {followupRecord} , false, null, true /* enable colors */));
    
    res.render('patientDoctorRecordsQues', {
      navDisplayName,
      userRole, 
      totalUnseenNotifications, 
      doctorInfo,
      followupQuestions,
      recordInd,
      followupStatus,
    })
  }catch(err){
    return res.render("404", {
      navDisplayName,
      userRole,
      error: err.message,
    });
  }
})

router.get('/new', checkAuthenticated, checkEmailVerified, async (req, res)=>{
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role
  let {notificationId} = req.query

  let dateNow = new Date()

  try{    
    const totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
    let notification = await patientNotification.findOne({_id: notificationId})
    // console.log(util.inspect({ notification }, false, null, true /* enable colors */));

    let questionsPerDr = {}
    let timeDiff = {}

    for(let qInfo of notification.followupQues){
      let dId = qInfo.doctor
      let doctor = await Doctor.findOne({_id: dId},"name")
      let question = await followupQuesModel.findOne({
        _id: qInfo.qId
      })
      .lean()
      .populate({
        path: 'answers',
        match: {
          'questionCreated': { $gte: qInfo.timeRange.minTime, $lte: qInfo.timeRange.maxTime },
        }
      })

      for(let answer of question.answers){
        timeDiff[answer._id] = findTimeDiff(answer.questionCreated, dateNow)
      }


      if(!(dId in questionsPerDr)){
        questionsPerDr[dId] = {
          doctor,
          questions: [question]
        }
      }else{
        questionsPerDr[dId].questions.push(question)
      }

    }

    // console.log(util.inspect({ questionsPerDr }, false, null, true /* enable colors */));


    res.render('patientNewFollowupQues', {
      navDisplayName,
      userRole, 
      totalUnseenNotifications, 
      questionsPerDr,
      timeDiff,
    })
  }catch(err){
    return res.render("404", {
      navDisplayName,
      userRole,
      error: err.message,
    });
  }
})

router.post('/new', checkAuthenticated, checkEmailVerified, async (req, res) => {
  let user = req.user
  let data = req.body
  console.log(data)


  let questionIds = data['questionIds']
  let answerIds = data['answerIds']

  // console.log(data)

  try{
    for(let aId of answerIds){
      let answer = await followupQuesAnsModel.findOne({_id: aId})
      answer.value = data[aId]
      await answer.save()      
    }
    for(let qId of questionIds){
      // notifation for threshold cross
      let doctorId = data[qId]
      let notification = new doctorNotification({
        doctorId: doctorId,
        notificationType: "irregularity",
        patient: {
          _id: user._id,
          name: user.name.fullName,
          questionId: qId,
        },
        link: `/doctor/followupQues/questionAns?qId=${qId}`,
      })

      await notification.save()
    }
    
    res.send({successMsg: 'Answer saved successfully!!'})
  }catch(err){
    res.send({errorMsg: err.message})
  }


})


router.post("/update", checkAuthenticated, checkEmailVerified, async (req, res) => {

  let {answerId, value, inputType, thresholdCrossed, questionId, doctorId} = req.body
  let user = req.user

  // console.log(req.body)

  try{
    let answer = await followupQuesAnsModel.findOne({_id: answerId})
    answer.value = value
    await answer.save()

    if(inputType==='numberType'){
      if(thresholdCrossed==='true'){

        let notification = new doctorNotification({
          doctorId: doctorId,
          notificationType: "irregularity",
          patient: {
            _id: user._id,
            name: user.name.fullName,
            questionId: questionId,
          },
          link: `/doctor/followupQues/questionAns?qId=${questionId}`,
        })

        // console.log({notification})

        await notification.save()
      }
    }

    res.send({successMsg: 'Answer saved successfully!!'})
  }catch(err){
    res.send({errorMsg: err.message})
  }

})

router.get(
  "/questionAns",
  checkAuthenticated,
  checkEmailVerified,
  async (req, res) => {
    let navDisplayName = req.user.name.displayName;
    let userRole = req.user.role;
    let {dId, recordInd, qId} = req.query
    console.log({qId})
    try {
      const totalUnseenNotifications = await calculateUnseenNotifications(
        req.user._id,
        userRole
      );

      let question = await followupQuesModel.findOne({
        _id: qId
      }).populate({
        path: "answers",
        options: {sort:{"_id":-1}}
      })

      let doctorInfo = await Doctor.findOne({
        _id: dId
      }, "_id name")

      res.render("patientDoctorRecordsQuesAns", {
        navDisplayName,
        userRole,
        totalUnseenNotifications,
        recordInd,
        question,
        doctorInfo
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

module.exports = router;
