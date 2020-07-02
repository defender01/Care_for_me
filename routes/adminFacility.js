const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const util = require('util')

const {
  sendSectionSubSec,
  saveQuesOp,
  deleteSecSubSecQuesOp,
  getSectionData
} = require("../controllers/adminFunctions");

const {
  uploadVaccineAndSubstanceToDB
} = require("../controllers/database_controller");

const { questionModel, optionModel } = require("../models/inputCollection");


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
router.post("/profile/edit", async (req, res) =>{
  // console.log(util.inspect( req.body , false, null, true /* enable colors */));
  let data = req.body

  // for questions
  data.questionId = Array.isArray(data.questionId)? data.questionId : [data.questionId]
  for(let i=0; i<data.questionId.length; i++){
    let questions = await questionModel.find({_id: data.questionId[i]})
    if(questions.length>0){
      let question = questions[0]
      question.name = data['qName'+data.questionId[i]]
      question.inputType = data['type'+data.questionId[i]]
      question.qLabel = data['qLabel'+data.questionId[i]]
      question.options = []
      if(question.inputType=='multiChoiceSingleAns' || question.inputType=='multiChoiceMultiAns'){
        question.options = (typeof data['options'+data.questionId[i]] === 'undefined' ? [] : data['options'+data.questionId[i]] )
      }
      // console.log(util.inspect( {question} , false, null, true /* enable colors */));
      await question.save()
    }
    else{
      let question = new questionModel({
        _id: data.questionId[i],
        name: data['qName'+data.questionId[i]],
        inputType: data['type'+data.questionId[i]],
        options: (typeof data['options'+data.questionId[i]] === 'undefined' ? [] : data['options'+data.questionId[i]] ),
        qLabel: data['qLabel'+data.questionId[i]]        
      })
      // console.log(util.inspect( {question} , false, null, true /* enable colors */));
      await question.save()
    }
    
  }

  // for options
  data.optionId = Array.isArray(data.optionId)? data.optionId : [data.optionId]
  for(let i=0; i<data.optionId.length; i++){
    let options = await optionModel.find({_id: data.optionId[i]})
    if(options.length>0){
      let option = options[0]
      option.name = data['opName'+data.optionId[i]]
      option.questions = (typeof data['questions'+data.optionId[i]] === 'undefined' ? [] : data['questions'+data.optionId[i]] )      
      option.hasRelatedQuestions = option.questions.length>0

      // console.log(util.inspect( {option} , false, null, true /* enable colors */));
      await option.save()
    }
    else{
      let option = new optionModel({
        _id: data.optionId[i],
        name:  data['opName'+data.optionId[i]],        
        questions: (typeof data['questions'+data.optionId[i]] === 'undefined' ? [] : data['questions'+data.optionId[i]] ),
        hasRelatedQuestions: false,
      })
      option.hasRelatedQuestions = option.questions.length>0

      // console.log(util.inspect( {option} , false, null, true /* enable colors */));
      await option.save()
    }
    
  }
  res.redirect('/admin/profile/edit')
})

// this is for deleting section subsection....have to delete this later
router.get("/deleteSectionSubsection", deleteSecSubSecQuesOp);

// this is for clearing whole vaccine collection, substance collection and uploading again all vaccines and subtances to the database
router.get("/uploadVaccineAndSubstanceToDB", uploadVaccineAndSubstanceToDB);

// this provides new id
router.get('/getNewId', async (req, res) => {
  res.send({ id: new mongoose.Types.ObjectId() })
})

module.exports = router;
