const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  notificationType: String,
  userId: mongoose.Schema.Types.ObjectId,
  userRole: String,
  followupCnt: Number,
  patient: {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    questionId: mongoose.Schema.Types.ObjectId,
  },
  doctor: {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
  },
});

module.exports = {
  notification: mongoose.model("notification", notificationSchema),
};
