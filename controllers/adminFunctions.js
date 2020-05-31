const {sectionModel, subSectionModel}= require('../models/inputCollection')

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

function preprocessOp(data, opNo=0, qNo=0, idAdder=''){
  let option = {
    name: data['option'][0],
    hasRelatedQuestions: false,
    options: []
  }
  for(var i=0; i<data['opCount'][qNo]; i++){
    option.questions.push(preprocessOp(data,opNo, qNo+1, idAdder+toString(i+1)))
  }
  return option
}
function preprocessQues(data, opNo=0, qNo=0, idAdder=''){
  
  let question = {
    name: data['question'][0],
    inputType: data['type'+idAdder],
    options: []
  }
  for(var i=0; i<data['opCount'][qNo]; i++){
    question.options.push(preprocessOp(data,opNo, qNo+1, idAdder+toString(i+1)))
  }
  return question
}


module.exports ={
    saveSectionSubSection: saveSectionSubSection,
    getSectionSubSection: getSectionSubSection
}