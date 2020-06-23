const express = require("express");
const router = express.Router();
ObjectId = require("mongodb").ObjectID;

const {
  sendSectionSubSec,
  saveQuesOp,
  deleteSecSubSecQuesOp,
  getSectionData
} = require("../controllers/adminFunctions");


router.get("/addQues", sendSectionSubSec);
router.post("/addQues", saveQuesOp);

// this is for deleting section subsection....have to delete this later
router.get("/deleteSectionSubsection", deleteSecSubSecQuesOp);


module.exports = router;
