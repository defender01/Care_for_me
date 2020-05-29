const express = require('express')
const router = express.Router()
const sectionModel= require('../models/inputCollection').sectionModel
const subSectionModel = require('../models/inputCollection').subSectionModel
let sections = ["Birth and Developmental History", "Family Information", "Lifestyle", "Education and Occupation Details", "Previous Diseases and Disorders"]
let subSections =[["Birth history", "Development history"],
                  ["Father's details", "Mother's details", "Sibling's details", "Children's details", "Relative's details"],
                  ["Food Habit", "Physical Exercise", "Smoking History", "Substance Use History"],
                  ["Educational Background", "Specialization", "Occupational Details", "Occupational Exposure Inventory"],
                  ["Disease Quaries"]
                ]
for(var i=0; i<sections.length; i++){

  for(var j=0; j<subSections[i].length; j++)
  {

  }
}




const {
    checkAuthenticated,
    checkNotAuthenticated
  } = require('../controllers/auth_helper');
  

// router.get("/addQues", checkAuthenticated, async (req, res) => {
//     res.render('addQues')
//   })
  
  router.get("/addQues", async (req, res) => {
    res.render('addQues')
  })

  router.post("/addQues", async (req, res) => {
    console.log(req.body)
    console.log("second="+req.body[2])
    res.redirect("/admin/addQues")
  })

  module.exports = router;