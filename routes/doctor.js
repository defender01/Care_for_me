const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const util = require('util')
const {
  checkAuthenticated,
  checkNotAuthenticated,
  checkAuthenticatedDoctor,
  checkEmailVerified
} = require("../controllers/auth_helper");


const { parameterModel } = require("../models/followup");
const { route } = require("./auth");

router.get('/followupQues',checkAuthenticatedDoctor, checkEmailVerified, async (req, res) => {
  let parameters = await parameterModel.find({})
  let navDisplayName = req.user.name.displayName;
    res.render('followupQues', {navDisplayName, parameters})
})

router.post('/followupQues/continue', checkAuthenticatedDoctor, checkEmailVerified, async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  let data = req.body
  let qIds = data.questionId
  let questions = []
  if(typeof qIds!== 'undefined'){
    if(Array.isArray(qIds)){
      for(let i=0; i< qIds.length; i++){
        let qId = qIds[i]
        let question = {
          id : qId,
          inputType : data['inputType'+qId],
          name : data['name'+qId],
          startDate : data['startDate'+qId],
          endDate : data['endDate'+qId],
          frequency : data['frequency'+qId],
          maxVal : data['maxVal'+qId],
          minVal : data['minVal'+qId],
        }
        questions.push(question)
      }    
    }
    else{
      let qId = qIds
      let question = {
        id : qId,
        inputType : data['inputType'+qId],
        name : data['name'+qId],
        startDate : data['startDate'+qId],
        endDate : data['endDate'+qId],
        frequency : data['frequency'+qId],
        maxVal : data['maxVal'+qId],
        minVal : data['minVal'+qId],
      }
      questions.push(question)
    }
  }
  
  console.log(util.inspect({questions}, false, null, true /* enable colors */))
  res.render('followUpQuesContinue', {questions, navDisplayName})
})

router.post('/followupQues/save', checkAuthenticatedDoctor, checkEmailVerified, async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  let data = req.body
  res.send({data})
})

// patient list page
router.get('/patients', (req, res) => {
  let navDisplayName = req.user.name.displayName;
  res.render('patients', {navDisplayName})
})

// this provides new id
router.get('/getNewId', (req, res) => {
  res.send({ id: new mongoose.Types.ObjectId() })
})


module.exports = router;
