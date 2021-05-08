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

  let records = await followupModel.find({
    patientId: userID,
    recordStartDate: {$lte: dateNow},
    recordEndDate: {$gte: dateNow}
  }).populate({
    path: "questions",
    match: {
      'duration.startDate': {$lte: dateNow},
      'duration.endDate': {$gte: dateNow},
    }
  })
  
  records.forEach(record => {
    let questions = record.questions
    questions.forEach(ques => {
      console.log(util.inspect({ ques }, false, null, true /* enable colors */));
      
      // ques.frequency is in hour, so I neet to transform it in millisecond
      let frequency = ques.frequency * 60 * 60 * 1000
      // all time in milliseconds

      // console.log('dateNow in ms= ', dateNow.getTime())
      // console.log('ques.duration.startDate in ms= ', ques.duration.startDate.getTime())
      // console.log('frequency in ms= ', frequency)

      // console.log('startDate type= ', typeof ques.duration.startDate)
      // console.log(typeof Date.now())
      // console.log(typeof (new Date()))

      // let expectedCreateTime = Math.floor((dateNow - ques.duration.startDate)/frequency) * frequency + ques.duration.startDate
      // console.log({expectedCreateTime})
      // console.log(typeof expectedCreateTime)
      // let dd = new Date(expectedCreateTime)
      // console.log('expectedCreateTime = ',dd.toDateString(), ' dateNow= ', dateNow)

      expectedCreateTime = Math.floor((dateNow.getTime() - ques.duration.startDate.getTime())/frequency) * frequency + ques.duration.startDate.getTime()
      // console.log(Math.floor((dateNow.getTime() - ques.duration.startDate.getTime())/frequency) * frequency/3600000 )
      // console.log({expectedCreateTime})
      // console.log(typeof expectedCreateTime)
      // dd = new Date(expectedCreateTime)
      // console.log(ques.duration.startDate.toString())
      // console.log((dd.getTime()-ques.duration.startDate.getTime())/3600000)
      // console.log(dd.getHours())
      // console.log('expectedCreateTime = ',dd.toString(), ' dateNow= ',dateNow.toString(),'  hours=',dateNow.getHours())

      if(ques.lastCreated == null || expectedCreateTime>ques.lastCreated.getTime()){
        newQuesCnt+=1
      }
    })
  });

  console.log({newQuesCnt})

  if(newQuesCnt){
    let notification = new patientNotification({
      patientId: userID,
      seen: false,
      followupQuesCnt: newQuesCnt
    })
    // await notification.save()
  }
  
  return newQuesCnt  
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

module.exports = 
{
  camelCase: camelCase,
  checkNotNull: checkNotNull,
  calculateUnseenNotifications: calculateUnseenNotifications,
  preprocessData: preprocessData
}