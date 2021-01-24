const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const util = require('util')

const {
  sendSectionSubSec,
  saveQuesOp,
  deleteSecSubSecQuesOp,
  getSectionData,
  editProfileQues,
  saveProfileQues,
  getAddQuesDoctor,
  saveDoctorQues
} = require("../../controllers/adminFunctions");

const {
  uploadVaccineAndSubstanceToDB,
  clearWholeAnswerCollection
} = require("../../controllers/database_controller");

const { questionModel, optionModel } = require("../../models/inputCollection");

const { parameterModel } = require("../../models/followup");

const {checkAuthenticatedAdmin } = require("../../controllers/auth_helper");

router.get('/', checkAuthenticatedAdmin,  (req, res)=> {
  let navDisplayName = req.user.name.displayName
  res.render('admin',{navDisplayName})
})


// this is for deleting section subsection....have to delete this later
router.get("/deleteSectionSubsection", checkAuthenticatedAdmin, deleteSecSubSecQuesOp);

// this is for clearing whole vaccine collection, substance collection and uploading again all vaccines and subtances to the database
router.get("/uploadVaccineAndSubstanceToDB", checkAuthenticatedAdmin, uploadVaccineAndSubstanceToDB);

// This is for clearing whole answer collection
router.get("/clearWholeAnswerCollection", checkAuthenticatedAdmin, clearWholeAnswerCollection)

// this provides new id
router.get('/getNewId', checkAuthenticatedAdmin, async (req, res) => {
  res.send({ id: new mongoose.Types.ObjectId() })
})

router.get("/followupQues/edit", checkAuthenticatedAdmin, async (req,res) => {
  let navDisplayName = req.user.name.displayName
  let parameters = await parameterModel.find({})
  
  res.render('adminEditFollowupQues', {navDisplayName, parameters})
})
// saving parameter details after edit or change in doctor followup questions
router.post('/followupQues/edit', checkAuthenticatedAdmin, async(req, res) => {
  let navDisplayName = req.user.name.displayName
  let parameters,parameter
  data = req.body
  
  try{
    parameter = await parameterModel.findOne({_id: data.parameterId})
  }catch(err){
    res.render('404',{'error': err.message})
    return
  }  
  
  parameter.name = data.parameterName
  //removing previously saved questions
  parameter.questions = [] 
  // adding edited and new added questions
  if(Array.isArray(data.qId)){
    for(let i=0; i<data.qId.length; i++){
      let quesId = data.qId[i]
      let ques = {
        _id: quesId,
        name: data['question'+quesId],
        inputType: data['quesType'+quesId]
      }
      parameter.questions.push(ques)
    }
  }
  else if(typeof data.qId!=='undefined'){
    let quesId = data.qId
    let ques = {
      _id: quesId,
      name: data['question'+quesId],
      inputType: data['quesType'+quesId]
    }
    parameter.questions.push(ques)
  }
 
  try{
    parameter = await parameter.save()
    parameters = await parameterModel.find({})
  }catch(err){
    res.render('404',{'error': err.message})
    return
  }  

  // console.log(util.inspect({parameter}, false, null, true /* enable colors */))

  res.render('adminEditFollowupQues', {navDisplayName, parameters})
  // res.send({data})

})

//creating new parameter for doctor followup questions
router.get('/newFollowupParam', checkAuthenticatedAdmin, async (req, res) => {
  let parameter = new parameterModel({
    _id: new mongoose.Types.ObjectId(),
  })
  // console.log({parameter})

  try{
    await parameter.save()
  }catch(err){
    res.send({'error': err.message})
    return
  }
  res.send({parameter})
})


router.get('/deleteParameter/:pId', checkAuthenticatedAdmin, async(req, res) => {
  let id = req.params.pId
  console.log({id})
  let parameters
  try{
    parameters = await parameterModel.findByIdAndDelete({_id: id})
    // parameters = await parameterModel.find({})
  }catch(err){
    res.send({'error': err.message})
    return
  }
  res.send({success:'delete completed'})
})


router.use("/profile", require("./profile.js"))

module.exports = router;
