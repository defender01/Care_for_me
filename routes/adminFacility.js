const express = require("express");
const router = express.Router();
ObjectId = require("mongodb").ObjectID;

const {
  sendSectionSubSec,
  saveQuesOp,
  deleteSecSubSecQuesOp,
  getSectionData
} = require("../controllers/adminFunctions");

const {
  uploadVaccineAndSubstanceToDB
} = require("../controllers/database_controller");

const { questionModel } = require("../models/inputCollection");


router.get("/addQues", sendSectionSubSec);
router.post("/addQues", saveQuesOp);
router.get("/profile/edit", (req, res) =>{
  res.render('adminProfileQuesCollection')
})
router.get("/profile/edit/:qId", async (req, res) =>{
  let qId= req.params.qId
  let question = await questionModel
    .findOne({
      _id: qId,
    })
    .populate({
      path:"options",
      populate: {
        path: "questions",
        populate: {
          path: "options",
          populate: {
            path: "questions",
            populate: {
              path: "options",
            },
          },
        },
      },
    })
    .exec();
  console.log(util.inspect({ question }, false, null, true /* enable colors */));
  res.render('adminEditProfileQues', {question})
})

// this is for deleting section subsection....have to delete this later
router.get("/deleteSectionSubsection", deleteSecSubSecQuesOp);

// this is for clearing whole vaccine collection, substance collection and uploading again all vaccines and subtances to the database
router.get("/uploadVaccineAndSubstanceToDB", uploadVaccineAndSubstanceToDB);

module.exports = router;
