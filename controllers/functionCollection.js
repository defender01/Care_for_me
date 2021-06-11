const util = require("util");

const {
  doctorNotification,
  patientNotification,
} = require("../models/notification");

const {
  parameterModel,
  followupModel,
  followupQuesModel,
  followupQuesAnsModel,
} =  require("../models/followup")

const {doctorPatientModel} = require("../models/doctorPatient")

let camelCase = function (str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
    return index == 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

let checkNotNull = (val) => {
  return typeof val != "undefined" && val != "" && val != null;
};

let calculateUnseenNotifications = async (userID, userRole) => {
  let totalUnseenNotifications = 0
  if(!checkNotNull(userID) || !checkNotNull(userRole)) return totalUnseenNotifications

  if (userRole == 'patient'){
    totalUnseenNotifications = await patientNotification.countDocuments({
      patientId: userID,
      seen: false,
    });
    totalUnseenNotifications += await createNotificationForFollowupQues(userID)
  }
  else if(userRole == 'doctor'){
    totalUnseenNotifications = await doctorNotification.countDocuments({
      doctorId: userID,
      seen: false,
    });
  }

  return totalUnseenNotifications
}

let createNotificationForFollowupQues = async(userID) => {
  let newQuesCnt = 0  
  let dateNow = new Date()
  let quesInfo = {}

  // find doctor ids for this patient
  let doctorPatientData = await doctorPatientModel.find({
    "patient._id": userID
  }, "doctor")

  let doctorIds = doctorPatientData.map(({doctor}) => doctor._id)

  let records = await followupModel.find({
    patientId: userID,
    doctorId: {$in: doctorIds},
    recordStartDate: {$lte: dateNow},
    recordEndDate: {$gte: dateNow}
  }).populate({
    path: "questions",
    match: {
      'duration.startDate': {$lte: dateNow},
      'duration.endDate': {$gte: dateNow},
    }
  })

  for(let record of records){
    let questions = record.questions
    for(let ques of questions){
      // console.log(util.inspect({ ques }, false, null, true /* enable colors */));
      
      // ques.frequency is in hour, so I neet to transform it in millisecond
      let frequency = ques.frequency * 60 * 60 * 1000
      // all time in milliseconds
      
      lastCreatedTime = checkNotNull(ques.lastCreated)? ques.lastCreated.getTime() :  ques.duration.startDate.getTime() - frequency
      expectedCreateTime = Math.floor((dateNow.getTime() - ques.duration.startDate.getTime())/frequency) * frequency + ques.duration.startDate.getTime()
      
      dd = new Date(expectedCreateTime)

      while(lastCreatedTime+frequency <= expectedCreateTime){

        lastCreatedTime += frequency

        
        // Only calculating  notifications for the last two days.
        // Ques before two days will not be shown.
        if(lastCreatedTime> dateNow.getTime()-2*24*60*60*1000){

          if(!(ques._id in quesInfo)){
            quesInfo[ques._id]={
              'doctor': record.doctorId,
              'qId': ques._id,
              'timeRange':{
                'minTime': lastCreatedTime,
                'maxTime': expectedCreateTime,
              }
            }
          }

          newQuesCnt+=1     

          let answer = new followupQuesAnsModel({
            questionCreated : lastCreatedTime,
          })     
          await answer.save()
          ques.answers.push(answer._id)  
        }                    
        
      }

      ques.lastCreated = expectedCreateTime

      await ques.save()      
    }
  }

  // console.log({newQuesCnt})

  if(newQuesCnt){
    let notification = new patientNotification({
      patientId: userID,
      notificationType: 'followup',
      seen: false,
      followupQues: [],
      followupQuesCnt: newQuesCnt
    })

    for(key in quesInfo){
      notification.followupQues.push(quesInfo[key])
    }

    console.log(util.inspect({ notification }, false, null, true /* enable colors */));

    await notification.save()
  }
  
  return newQuesCnt>0? 1: 0
}

function preprocessData(obj){
  for (let key of Object.keys(obj)) {
    if (Array.isArray(obj[key])) {
      for (let i = 0, max = obj[key].length; i < max; i++) {
        if (checkNotNull(obj[key][i]))
          obj[key][i] = obj[key][i].trim();
      }
    } else {
      if (checkNotNull(obj[key])) obj[key] = obj[key].trim();
    }
  }
}

const findTimeDiff = (oldDate, newDate) => {
  let diffTime = newDate.getTime() - oldDate.getTime()
  
  let minutes = Math.floor(diffTime/(60*1000))
  let hours =  Math.floor(diffTime/(60*60*1000))
  let days =  Math.floor(diffTime/(24*60*60*1000))
  let diffStr = days>30? oldDate.toDateString() : ( days>=1? `${days} days before`: ( hours>=1? `${hours} hours before` : `${minutes} minutes before` ))
  
  return diffStr
}

module.exports = 
{
  camelCase,
  checkNotNull,
  calculateUnseenNotifications,
  preprocessData,
  createNotificationForFollowupQues, 
  findTimeDiff 
}