const {vaccineModel, substanceModel, answerModel} = require("../models/inputCollection") 

let substanceCategories = ['Alcohol','Cannabis','Stimulants','Sleeping pills','Opioids','Hallucinogens','Inhalants']
let substanceNames = [["Alcohol"],["Cannabis"],["Yaba","Cocaine"],["Diazepam", "Clonazepam", "Eszopiclone", "Flurazepam", "Lorazepam", "Midazolam", "Diphenhydramine hydrochloride"],["Opium", "Morphine", "Heroin"], ["LSD", "PCP", "MDA", "Mescaline", "Peyote", "Mushrooms", "Ecstasy(MDMA)", "Nitrous oxide"], ["Glue", "Gasoline", "Aerosols", "Paint thinner"]]

let vaccineNames = ["BCG","Pentavalent","PCV","OPV","MR","Measles","TT (Tetanus toxoid)"]
let vaccineDiseases = [["Tuberculosis"],["Diphtheria", "Pertussis", "Tetanus", "Hepatitis B", "Hemophilus Influenza B"],["Pneumococcal Pneumonia"],["Poliomyelitis"],["Measles", "Rubella"],["Measles"],["Tetanus"]]

let saveVaccine = async () =>
{
    // deleting all data from vaccine collection
    await vaccineModel.deleteMany({});

    // Saving vaccines to the vaccine collection
    for(let i=0, max = vaccineNames.length; i<max; i++){
        // console.log(vaccineNames[i] + "  " +vaccineDiseases[i].toString())
        const vaccine = new vaccineModel({
            name: vaccineNames[i],
            diseases: vaccineDiseases[i]
        })

        try{
            await vaccine.save();
        }catch(err){
            console.error(err);
        }
    }
}

let saveSubstance = async () =>
{
    // deleting all data from substance collection
    await substanceModel.deleteMany({});

    // Saving sbustances to the substance collection
    for(let i=0, max = substanceCategories.length; i<max; i++){

        for(let j=0, maxj = substanceNames[i].length; j<maxj; j++){
            // console.log(substanceCategories[i] + "   " + substanceNames[i][j]);
            
            const substance = new substanceModel({
                name: substanceNames[i][j],
                category: substanceCategories[i]
            })

            try{
                await substance.save();
            }catch(err){
                console.error(err);
            }
        }

    }
}

let uploadVaccineAndSubstanceToDB = async (req, res) => {
    
    // // clearing whole vaccine collection and uploading all vaccines to the database
    // await saveVaccine()

    // // clearing whole substance collection and uploading all substances to the database
    // await saveSubstance()

    // return res.json({
    //     msg : "vaccines and substances are uploaded to the database"
    // })

    return res.json({
        msg : "currently not available"
    })
}

let clearWholeAnswerCollection = async (req, res) =>
{
    // await answerModel.deleteMany({})

    // return res.send({
    //     "msg" : "The whole answer collection is cleared."
    // })

    return res.json({
        msg : "currently not available"
    })
}

function saveToNewDatabase(){
//     let {adminModel} = require('./models/admin')
//   let dailyInfo = require('./models/dailyInfo')
//   let {doctorModel} = require('./models/doctor')
//   let {doctorPatientModel} = require('./models/doctorPatient')
//   let {parameterModel,followupModel,followupQuesModel,followupQuesAnsModel} = require('./models/followup')
//   let {homeModel} = require('./models/home')
//   let {
//     sectionModel,
//     subSectionModel,
//     questionModel,
//     optionModel,
//   }  = require('./models/inputCollection')
//   let medHistoryModel = require('./models/medHistoryInfo')
//   let {notification} = require('./models/notification')
//   let patient = require('./models/patient')
//   let {randomStringModel} = require('./models/randomStringForURL')

//   let models = [adminModel, dailyInfo, doctorModel, doctorPatientModel, parameterModel,followupModel,followupQuesModel,
//                 followupQuesAnsModel, homeModel, sectionModel, subSectionModel, questionModel, optionModel,
//                 medHistoryModel,notification, patient, randomStringModel ]
//   let modelsName = ['adminModel', 'dailyInfo', 'doctorModel', 'doctorPatientModel', 'parameterModel','followupModel','followupQuesModel',
//     'followupQuesAnsModel', 'homeModel', 'sectionModel', 'subSectionModel', 'questionModel', 'optionModel',
//     'medHistoryModel','notification', 'patient', 'randomStringModel' ]
    
//   for(let i = 0; i<models.length; i++){
//     try{
//       let data = await models[i].find({})
//       // console.log(data)
//       console.log('i= '+i+'  data.length= ' +data.length+ ' model= '+modelsName[i])
//       // await fs.promises.writeFile(`./Database/${i}.json`, JSON.stringify(data))
//     }catch(err){
//       res.send({err})
//       return
//     }
//   }

  // save to new database
  
  // for(let i = 0; i<models.length; i++){
  //   try{
  //     let data = await fs.promises.readFile(`./Database/${i}.json`)
  //     data = JSON.parse(data)
  //     // if(i==1){
  //     //   console.log(data)
  //     // }
  //     for(let j=0; j<data.length;j++){
  //       let doc = new models[i](data[j])
  //       await doc.save()
  //     }
  //     // console.log(data)
  //     console.log('i= '+i+'  data.length= ' +data.length+ ' model= '+modelsName[i])
  //   }catch(err){
  //     res.send({err})
  //     return
  //   }
  // }
}

module.exports = {
    uploadVaccineAndSubstanceToDB,
    clearWholeAnswerCollection
}