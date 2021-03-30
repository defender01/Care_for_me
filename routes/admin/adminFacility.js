const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const util = require('util')
const multer = require('multer')
const path = require('path')
const fs = require('fs').promises;

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

const {checkNotNull} = require("../../controllers/functionCollection")

const {
  uploadVaccineAndSubstanceToDB,
  clearWholeAnswerCollection
} = require("../../controllers/database_controller");

const { questionModel, optionModel } = require("../../models/inputCollection");

const {parameterModel} = require("../../models/followup");
const {homeModel} = require("../../models/home");

const {checkAuthenticatedAdmin } = require("../../controllers/auth_helper");

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './resources/homePictures',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 5000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).any()

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

async function deleteFile(req, res, filePath){
  if(!checkNotNull(filePath)) return

  try {
    await fs.unlink(filePath);
    console.log(`successfully deleted ${filePath}`);
  } catch (err) {
    res.render('404',{'error': err.message})
    return
  }
}

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

router.get("/home/edit", checkAuthenticatedAdmin, async (req,res) => {
  let navDisplayName = req.user.name.displayName
  let data 
  try{
    data = await homeModel.findOne({})
  }catch(err){
    res.render('404',{'error': err.message})
    return
  }  
  // console.log('home data:')
  // console.log(util.inspect({data}, false, null, true /* enable colors */))
  res.render('adminHomeEdit', {navDisplayName, data})
})
router.post("/home/edit", checkAuthenticatedAdmin, async (req,res) => {  

  upload(req, res, async (err) => {
    let data = req.body
    let files = req.files
    let homeId = data.homeId
    let home = null
    let services = [], features = [], reviews = []
    
    // console.log(req.body)
    // console.log(req.files)

    if(err){
      req.flash('error_msg', err.message)
      res.redirect('back')
      return 
    } 
    console.log('File Uploaded!')
    
    let covImgIdx = files.findIndex((file) => {
      return file.fieldname == `coverImage`
    })
    let coverImagePath =  data['prevCoverImagePath']

    if(covImgIdx != -1){
      deleteFile(req,res, coverImagePath)
      coverImagePath = files[covImgIdx].path.replace(/\\/g, "/")
    }

    let aboutUsImgIdx = files.findIndex((file) => {
      return file.fieldname == `aboutUsImage`
    })
    let aboutUsImagePath =  data['prevAboutUsImagePath']

    if(aboutUsImgIdx != -1){
      deleteFile(req,res, aboutUsImagePath)
      aboutUsImagePath = files[aboutUsImgIdx].path.replace(/\\/g, "/")
    }
    
    let serviceId = typeof data.serviceId!= 'undefined'? Array.isArray(data.serviceId)? data.serviceId : [data.serviceId] : []
    let featureId = typeof data.featureId!= 'undefined'? Array.isArray(data.featureId)? data.featureId : [data.featureId] : []
    let reviewId = typeof data.reviewId!= 'undefined'? Array.isArray(data.reviewId)? data.reviewId : [data.reviewId] : []
    for(let i=0; i<serviceId.length; i++){
      let service = {
        _id: serviceId[i],
        name: data['serviceName'+serviceId[i]],
        details: data['serviceDetails'+serviceId[i]],
      }
      services.push(service)
    }
    for(let i=0; i<featureId.length; i++){
      let idx = files.findIndex((file) => {
        return file.fieldname == `featureImage${featureId[i]}`
      })

      let feature = {
        _id: featureId[i],
        name: data['featureName'+featureId[i]],
        details: data['featureDetails'+featureId[i]],
        imagePath: data['prevFeatureImagePath'+featureId[i]]
      }

      if(idx != -1){
        let prevPath =  data['prevFeatureImagePath'+featureId[i]]
        feature.imagePath = files[idx].path.replace(/\\/g, "/")
        deleteFile(req,res, prevPath)
      }
      features.push(feature)
    }
    
    for(let i=0; i<reviewId.length; i++){
      let idx = files.findIndex((file) => {
        return file.fieldname == `reviewImage${reviewId[i]}`
      })

      let review = {
        _id: reviewId[i],
        name: data['reviewerName'+reviewId[i]],
        details: data['reviewDetails'+reviewId[i]],
        imagePath: data['prevReviewImagePath'+reviewId[i]]
      }
      
      if(idx != -1){
        let prevPath =  data['prevReviewImagePath'+reviewId[i]]
        review.imagePath = files[idx].path.replace(/\\/g, "/")
        deleteFile(req,res, prevPath)
      }
      reviews.push(review)
    }  
    if(homeId ==''){
      home =  new homeModel({
        _id: new mongoose.Types.ObjectId()
      })
    }
    else{
      try{
        home = await homeModel.findOne({_id: homeId})
        home.features.forEach((feature) => {
          if(typeof data['featureName'+feature._id] == 'undefined') deleteFile(req, res, feature.imagePath)
        })

        home.reviews.forEach((review) => {
          if(typeof data['reviewerName'+review._id] == 'undefined') deleteFile(req, res, review.imagePath)
        })
      }catch(err){
        res.render('404',{'error':err.message})
        return
      }
    }
    home.coverImagePath = coverImagePath
    home.aboutUsImagePath = aboutUsImagePath
    home.aboutUs = data.aboutUs
    home.services = services
    home.features = features
    home.reviews = reviews
    // console.log(util.inspect({home}, false, null, true /* enable colors */))
    let result = null
    try{
      result = await home.save()
    }catch(err){
      res.render('404',{'error': err.message})
      return
    }  
    
    req.flash('success_msg', 'Successfully updated home details.')
    res.redirect('back')
    return
  });

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
