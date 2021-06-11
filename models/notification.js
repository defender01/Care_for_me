const mongoose = require("mongoose");

const doctorNotificationSchema = new mongoose.Schema({
  doctorId: mongoose.Schema.Types.ObjectId,
  notificationType: String,
  seen: {
    type: Boolean,
    default: false
  },
  followupCnt:{
    type: Number,
    default: 0
  },
  patient: {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    questionId: mongoose.Schema.Types.ObjectId,
  },
  link: String,
  created: { 
    type: Date, 
    default: Date.now
  }
});

const patientNotificationSchema = new mongoose.Schema({
  patientId: mongoose.Schema.Types.ObjectId,
  notificationType: String,
  seen: {
    type: Boolean,
    default: false
  },
  doctor: {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
  },
  followupQues:[{
    doctor: mongoose.Schema.Types.ObjectId,
    qId: mongoose.Schema.Types.ObjectId,
    timeRange:{
      minTime: Date,
      maxTime: Date,
    }
  }],
  followupQuesCnt: Number, 
  created: { 
    type: Date, 
    default: Date.now
  }
});


// patientNotificationSchema.virtual('wholeNotification').get(function() {
//   let notificationStr = "";
//   if(this.notificationType == 'request'){
//     notificationStr = 'Dr. ' + this.doctor.name + ' wants to add you as Patient'
//   }
//   return notificationStr
// });

module.exports = {
  patientNotification: mongoose.model("patientNotification", patientNotificationSchema),
  doctorNotification: mongoose.model("doctorNotification", doctorNotificationSchema),
};

