const express = require('express')
const router = express.Router()
const util = require('util')

const {sectionModel, subSectionModel}= require('../models/inputCollection')
const {saveSectionSubSection, deleteSectionSubSection, getSectionSubSection, getWholeSection, saveQues} = require('../controllers/adminFunctions')
const {
    checkAuthenticated,
    checkNotAuthenticated
  } = require('../controllers/auth_helper');
  

// router.get("/addQues", checkAuthenticated, async (req, res) => {
//     res.render('addQues')
//   })
 
  router.get("/addQues", async (req, res) => {
    // deleting data of sections subSections
    // await deleteSectionSubSection()

    // saving data of sectionModel and subSectionModel
    // await saveSectionSubSection()
    
    let {sectionNames, subSectionNames} = await getSectionSubSection()
 
    res.render('addQues',{
      sectionNames,
      subSectionNames
    })
  })
  // this is for deleting section subsection....have to delete this later
  router.get("/deleteSectionSubsection",  async (req, res) =>{
    // deleting data of sections subSections
    await deleteSectionSubSection()

    // saving data of sectionModel and subSectionModel
    await saveSectionSubSection()

    return res.json({
      "msg": "section and sub section deleted"
    })
    
  })

  
  router.post("/addQues", async (req, res) => {
    // return res.json(req.body)
    console.log(req.body)

    let sectionData = await getWholeSection(req.body.section, req.body.subSection)
    let subSectionData = sectionData[0].subSections[0]

    
    let question = await saveQues(req.body)
  
    subSectionData.questions.push(question)
    let questionToAdd = subSectionData.questions
    
    await subSectionModel.findByIdAndUpdate(
      {_id: subSectionData._id},
      {questions: questionToAdd,},
      (err, result) => {
        if(err){
          res.send(err)
        }
      }
    )
    
    let datas = await subSectionModel.find({
      _id : subSectionData._id
    }).populate({
      path: 'questions',
      populate: {
        path: 'options',
        populate: {
          path: 'questions',
          populate: {
            path: 'options',
            populate: {
              path: 'questions',
              populate: {
                path: 'options',
              }
            }
          }
        }
      }
    }).exec()
    console.log(util.inspect({datas}, false, null, true /* enable colors */))
    
    // return res.json(datas)

    res.redirect("/admin/addQues")
  })

  module.exports = router;