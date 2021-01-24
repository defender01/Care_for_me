const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: {
    firstName: {
      type: String,
      default: 'admin',
      required: true
    },
    lastName: {
      type: String,
      default: 'admin',
      required: true
    },
    displayName: {
      type: String,
      default: 'admin',
      required: true
    }
  },
  role: {
    type: String,
    default: 'admin'
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
   created: {
    type: Date,
    default: Date.now
  },

});

module.exports = {
  adminModel: mongoose.model("admin", adminSchema),
};
