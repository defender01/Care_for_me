const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const randomStringSchema = new Schema({
  userID: {
    type: Schema.Types.ObjectId,
  },
  userType: {
    type: String
  },
  randomString: {
    type: String
  }
});

module.exports = {
    randomStringModel: mongoose.model("urlRandomString", randomStringSchema)
};

