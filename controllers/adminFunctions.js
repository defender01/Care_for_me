const mongoose = require('mongoose')
const {sectionModel, subSectionModel, questionModel, optionModel}= require('../models/inputCollection')

// once sections and sub sections are uploaded, then these functions are no longer needed

let sections = ["Birth and Developmental History", "Family Information", "Lifestyle", "Education and Occupation Details", "Previous Diseases and Disorders"]
let subSections =[["Birth History", "Development History", "Immunization History"],
                  ["Father's Details", "Mother's Details", "Sibling's Details", "Children's Details", "Relative's details"],
                  ["General Information", "Food Habit", "Sleep Pattern", "Hobbies" ,"Physical Exercise", "Smoking History", "Substance Use History"],
                  ["Educational Background", "Specialization", "Occupational Details", "Occupational Exposure Inventory"],
                  ["Disease Queries"]
                ]

async function saveSubSection(subSecName){
  const subSection = new subSectionModel({
    _id: new mongoose.Types.ObjectId(),
    name: subSecName
  })
  await subSection.save((err) => {
    if(err) console.error(err)
  })
  return subSection._id
}
                
async function saveSection(secName,subSecNames){
  let subSecIds=[]
  for (var i=0; i<subSecNames.length; i++){
    subSecIds.push(await saveSubSection(subSecNames[i]))
  }
  const section = new sectionModel({
    _id: new mongoose.Types.ObjectId(),
    name: secName,
    subSections : subSecIds
  })
  await section.save((err) => {
    if(err) console.error(err)
  })
}

async function saveSectionSubSection(){
  for(var i=0; i<sections.length; i++){
    await saveSection(sections[i], subSections[i])
  }  
}
async function deleteSectionSubSection(){
   // deleting all data from sectionModel and subSectionModel
   await sectionModel.deleteMany({})
   await subSectionModel.deleteMany({})
  //  await questionModel.deleteMany({})
  //  await optionModel.deleteMany({})
}
// once sections and sub sections are uploaded, then these upper functions are no longer needed

let getSectionSubSection = async ()=>{
    // returns section and sub sections names
    let sectionData = await sectionModel.find({}).populate('subSections').exec()
    let sectionNames=[], subSectionNames=[]
    for(var i = 0; i<sectionData.length; i++){
        sectionNames.push(sectionData[i].name)
        let names=[]
        for(var j=0; j<sectionData[i].subSections.length; j++){
            names.push(sectionData[i].subSections[j].name)
        }
        subSectionNames.push(names)
    }
    return {sectionNames, subSectionNames}
}

async function getWholeSection(sectionName, subSectionName){
  let sectionData = await sectionModel.find({
    name: sectionName
  }).populate({
    path: 'subSections',
    match: {name: subSectionName}
  }).exec()
  return sectionData
}

// this function is for saving option to database
async function saveOp(data, idAdder=''){
  let cData = JSON.parse(JSON.stringify(data))
  let qCount =  Array.isArray(data['qCount']) ? parseInt(data['qCount'].shift()) : parseInt(data['qCount'])
  let option = new optionModel({
    _id: new mongoose.Types.ObjectId(),
    name: Array.isArray(data['option']) ? data['option'].shift() : data['option'],
    hasRelatedQuestions: (qCount>0),
    questions: []
  })
  if(option.hasRelatedQuestions){
    //console.log({qCount})
    for(var i=0; i<qCount ; i++){ 
      let qId = await saveQues(data, idAdder+(i+1).toString())
      //console.log({qId})
      option.questions.push(qId)
    }
  }
  await option.save((err, result) => {
    if(err) console.error(err)
  })
  // console.log("In Options")
  // console.log({cData})
  // console.log({option})
  // return option
  return option._id
}
// this function is for saving questions to database
async function saveQues(data, idAdder=''){
  let cData = JSON.parse(JSON.stringify(data))
  let opCount = Array.isArray(data['opCount']) ? parseInt(data['opCount'].shift()) : parseInt(data['opCount'])
  let question = new questionModel({
    _id: new mongoose.Types.ObjectId(),
    name: Array.isArray(data['question']) ? data['question'].shift() : data['question'],
    inputType: Array.isArray(data['typeIndicator']) ? data['typeIndicator'].shift() : data['typeIndicator'],
    options: []
  })

  if(question.inputType =='multiChoiceSingleAns'|| question.inputType =='multiChoiceMultiAns'){
    //console.log({opCount})
    for(var i=0; i< opCount; i++){
      let opId = await saveOp(data, idAdder+(i+1).toString())
      //console.log({opId})
      question.options.push(opId)
    }
  }
  await question.save((err, result) => {
    if(err) console.error(err)
  })
  // console.log("In Questions")
  // console.log({cData})
  // console.log({question})
//  return question
  return question._id
}


module.exports ={
    saveSectionSubSection,
    deleteSectionSubSection,
    getSectionSubSection,
    getWholeSection,
    saveQues,
}