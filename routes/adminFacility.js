const express = require('express')
const router = express.Router()

const {sectionModel, subSectionModel}= require('../models/inputCollection')
const {getSectionSubSectionn, preprocessQues} = require('../controllers/adminFunctions')
const {
    checkAuthenticated,
    checkNotAuthenticated
  } = require('../controllers/auth_helper');
  

// router.get("/addQues", checkAuthenticated, async (req, res) => {
//     res.render('addQues')
//   })
  
  router.get("/addQues", async (req, res) => {
    // deleting all data from sectionModel and subSectionModel
    // await sectionModel.deleteMany({})
    // await subSectionModel.deleteMany({})
    // saving data of sectionModel and subSectionModel
    // await saveSectionSubSection()
    
    let {sectionNames, subSectionNames} = await getSectionSubSection()
 
    res.render('addQues',{
      sectionNames,
      subSectionNames
    })
  })

  router.post("/addQues", async (req, res) => {
    return res.json(req.body)
    let data = preprocessQues(req.body)
    // res.redirect("/admin/addQues")
  })

  module.exports = router;