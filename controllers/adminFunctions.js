const mongoose = require("mongoose");
const util = require("util");
const {
  sectionModel,
  subSectionModel,
  questionModel,
  optionModel,
} = require("../models/inputCollection");

// once sections and sub sections are uploaded, then these functions are no longer needed

let sections = [
  "Birth and Developmental History",
  "Family Information",
  "Lifestyle",
  "Education and Occupation Details",
  "Previous Diseases and Disorders",
];
let subSections = [
  ["Birth History", "Development History", "Immunization History"],
  [
    "Father's Details",
    "Mother's Details",
    "Sibling's Details",
    "Children's Details",
    "Relative's Details",
  ],
  [
    "General Information",
    "Food Habit",
    "Sleep Pattern",
    "Hobbies",
    "Physical Exercise",
    "Smoking History",
    "Substance Use History",
  ],
  [
    "Educational Background",
    "Specialization",
    "Occupational Details",
    "Occupational Exposure Inventory",
  ],
  ["Disease Queries"],
];

async function saveSubSection(subSecName) {
  const subSection = new subSectionModel({
    _id: new mongoose.Types.ObjectId(),
    name: subSecName,
  });
  await subSection.save((err) => {
    if (err) console.error(err);
  });
  return subSection._id;
}

async function saveSection(secName, subSecNames) {
  let subSecIds = [];
  for (var i = 0; i < subSecNames.length; i++) {
    subSecIds.push(await saveSubSection(subSecNames[i]));
  }
  const section = new sectionModel({
    _id: new mongoose.Types.ObjectId(),
    name: secName,
    subSections: subSecIds,
  });
  await section.save((err) => {
    if (err) console.error(err);
  });
}

async function saveSectionSubSection() {
  for (var i = 0; i < sections.length; i++) {
    await saveSection(sections[i], subSections[i]);
  }
}
async function deleteSectionSubSection() {
  // deleting all data from sectionModel and subSectionModel
  await sectionModel.deleteMany({});
  await subSectionModel.deleteMany({});
}
async function deleteQuestionOption() {
  await questionModel.deleteMany({});
  await optionModel.deleteMany({});
}
// once sections and sub sections are uploaded, then these upper functions are no longer needed

let getSectionSubSection = async () => {
  // returns section and sub sections names
  let sectionData = await sectionModel.find({}).populate("subSections").exec();
  let sectionNames = [],
    subSectionNames = [];
  for (var i = 0; i < sectionData.length; i++) {
    sectionNames.push(sectionData[i].name);
    let names = [];
    for (var j = 0; j < sectionData[i].subSections.length; j++) {
      names.push(sectionData[i].subSections[j].name);
    }
    subSectionNames.push(names);
  }
  return { sectionNames, subSectionNames };
};

async function getWholeSection(sectionName, subSectionName) {
  let sectionData = await sectionModel
    .find({
      name: sectionName,
    })
    .populate({
      path: "subSections",
      match: { name: subSectionName },
    })
    .exec();
  return sectionData;
}

// this function is for saving option to database
async function saveOp(data, idAdder = "") {
  let cData = JSON.parse(JSON.stringify(data));
  let qCount = Array.isArray(data["qCount"])
    ? parseInt(data["qCount"].shift())
    : parseInt(data["qCount"]);
  let option = new optionModel({
    _id: new mongoose.Types.ObjectId(),
    name: Array.isArray(data["option"])
      ? data["option"].shift()
      : data["option"],
    hasRelatedQuestions: qCount > 0,
    questions: [],
  });
  if (option.hasRelatedQuestions) {
    //console.log({qCount})
    for (var i = 0; i < qCount; i++) {
      let qId = await saveQues(data, idAdder + (i + 1).toString());
      //console.log({qId})
      option.questions.push(qId);
    }
  }
  await option.save((err, result) => {
    if (err) console.error(err);
  });
  // console.log("In Options")
  // console.log({cData})
  // console.log({option})
  // return option
  return option._id;
}
// this function is for saving questions to database
async function saveQues(data, idAdder = "") {
  let cData = JSON.parse(JSON.stringify(data));
  let opCount = Array.isArray(data["opCount"])
    ? parseInt(data["opCount"].shift())
    : parseInt(data["opCount"]);
  let question = new questionModel({
    _id: new mongoose.Types.ObjectId(),
    name: Array.isArray(data["question"])
      ? data["question"].shift()
      : data["question"],
    inputType: Array.isArray(data["typeIndicator"])
      ? data["typeIndicator"].shift()
      : data["typeIndicator"],
    options: [],
    qLabel: Array.isArray(data["qLabel"])
    ? data["qLabel"].shift()
    : data["qLabel"]
  });

  if (
    question.inputType == "multiChoiceSingleAns" ||
    question.inputType == "multiChoiceMultiAns"
  ) {
    //console.log({opCount})
    for (var i = 0; i < opCount; i++) {
      let opId = await saveOp(data, idAdder + (i + 1).toString());
      //console.log({opId})
      question.options.push(opId);
    }
  }
  await question.save((err, result) => {
    if (err) console.error(err);
  });
  // console.log("In Questions")
  // console.log({cData})
  // console.log({question})
  //  return question
  return question._id;
}

async function sendSectionSubSec(req, res) {
  let { sectionNames, subSectionNames } = await getSectionSubSection();

  res.render("adminAddProfileQues", {
    sectionNames,
    subSectionNames,
  });
}

async function saveQuesOp(req, res) {
  // console.log(util.inspect(req.body, false, null, true /* enable colors */));
  console.log(
    util.inspect(
      JSON.stringify(req.body),
      false,
      null,
      true /* enable colors */
    )
  );

  let sectionData = await getWholeSection(
    req.body.section,
    req.body.subSection
  );
  let subSectionData = sectionData[0].subSections[0];

  let question = await saveQues(req.body);

  subSectionData.questions.push(question);
  let questionToAdd = subSectionData.questions;

  await subSectionModel.findByIdAndUpdate(
    { _id: subSectionData._id },
    { questions: questionToAdd },
    (err, result) => {
      if (err) {
        res.send(err);
      }
    }
  );

  // let datas = await subSectionModel
  //   .find({
  //     _id: subSectionData._id,
  //   })
  //   .populate({
  //     path: "questions",
  //     populate: {
  //       path: "options",
  //       populate: {
  //         path: "questions",
  //         populate: {
  //           path: "options",
  //           populate: {
  //             path: "questions",
  //             populate: {
  //               path: "options",
  //             },
  //           },
  //         },
  //       },
  //     },
  //   })
  //   .exec();
  // console.log(util.inspect({ datas }, false, null, true /* enable colors */));

  res.redirect("/admin/addQues");
}

async function deleteSecSubSecQuesOp(req, res) {
  // // deleting data of sections subSections
  // await deleteSectionSubSection()

  // await deleteQuestionOption()

  // // saving data of sectionModel and subSectionModel
  // await saveSectionSubSection()

  // return res.json({
  //   "msg": "section and sub section, questions and options"
  // })
  return res.json({
    msg: "currently not available",
  });
}

async function getSectionData(req, res) {
  let section = req.params.section;
  let data = await sectionModel
    .findOne({
      name: section,
    })
    .populate({
      path: "subSections",
      populate: {
        path: "questions",
        populate: {
          path: "options",
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
        },
      },
    })
    .exec();

  // console.log(util.inspect({ data }, false, null, true /* enable colors */));
  res.send(data);
}

async function editProfileQues (req, res){
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
}

async function saveProfileQues (req, res) {
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
}

module.exports = {
  saveSectionSubSection,
  deleteSectionSubSection,
  deleteQuestionOption,
  getSectionSubSection,
  getWholeSection,
  saveQues,
  sendSectionSubSec,
  saveQuesOp,
  deleteSecSubSecQuesOp,
  getSectionData,
  editProfileQues,
  saveProfileQues
};
