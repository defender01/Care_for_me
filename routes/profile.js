const express = require('express')
const router = express.Router()
const User = require('../models/userInfo')
var medHistoryModel = require('../models/medHistoryInfo')
const {
  getSectionData
} = require("../controllers/adminFunctions");



//import camelCase function
const camelCase = require('../controllers/functionCollection').camelCase

const {
    checkAuthenticated,
    checkNotAuthenticated
  } = require('../controllers/auth_helper');
  

router.get("/", checkAuthenticated, async (req, res) => {
    var displayName = req.user.name.displayName
    await User.find({email : req.user.email}, (err, data) => {
        console.log(data)
        if (err) throw err
        else res.render('profile', { data, displayName })
    });
  
  })

  let substanceNames = ['Alcohol','Cannabis','Stimulants','Amphetamines','Benzodiazepines/tranquilizers','Sedatives/hypnotics','Heroin','Street or illicit methadone','Opioids','Hallucinogens','Inhalants']

  var substanceNamesJson=[]
  for(var i=0; i<substanceNames.length; i++){
    substanceNamesJson.push({
      name: substanceNames[i],
    })
  }
  
  //console.log(substanceNamesJson)
  
  
  let physicalDiseases = ["Asthma", "Aneurysm", "Diabetes", "Epilepsy Seizures", "Headaches or migraines", "Heart diseases", "High blood pressure", "Kidney disease", "Lung Disease", "Migraine", "Arthritis", "Elevated cholesterol", "Multiple Sclerosis", "Stroke", "Thyroid", "Tuberculosis", "Bleeding disorder"]
  let mentalDiseases = ["Neurocognitive disordero: dementia/ alzheimer’s disease", "Neurodevelopmental disorder", "Obsessive compulsive disorder", "Schizophrenia", "Depression", "Panic disorder", "Mood disorder", "Attention deficit hyperactivity disorder", "Convulsions", "Somatoform disorder", "Stress disorder", "Eating disorder", "Impulsive control disorder", "Substance abuse disorder"]
  let vaccineNames = ["BCG","Pentavalent","PCV","OPV","MR,Measles","TT (Tetanus toxoid)"]
  let vaccineDiseases = ["Tuberculosis","Diphtheria, Pertussis, Tetanus, Hepatitis B, Hemophilus Influenza B","Pneumococcal Pneumonia","Poliomyelitis","Measles Rubella","Measles","Tetanus"]
  
  let physicalDiseasesJson = []
  let mentalDiseasesJson = []
  let vaccineInfoJson = []
  
  for(var i=0; i<vaccineNames.length; i++) {
    vaccineInfoJson.push({    
      name: vaccineNames[i],
      id: camelCase(vaccineNames[i]),
      diseases: vaccineDiseases[i]
    })
  }
  
  for(var i=0; i<physicalDiseases.length; i++) {
    physicalDiseasesJson.push({    
      name: physicalDiseases[i],
      id: camelCase(physicalDiseases[i])})
  }
  for(var i=0; i<mentalDiseases.length; i++) {
    mentalDiseasesJson.push({
      name: mentalDiseases[i],
      id: camelCase(mentalDiseases[i])})
  }
  
  router.get("/edit", async (req, res) => {
  
     await medHistoryModel.find({},(err, data) => {
      if (err) throw err
      else res.render("medHistory", { data, substanceNamesJson, physicalDiseasesJson, mentalDiseasesJson, vaccineInfoJson})
    })
  
  })
  
  router.post("/edit", async (req, res) => {
  
    console.log(req.body)
    res.redirect('/profile/edit') 
  })
  router.post('/formSubmit', async (req, res) => {
    // console.log(req.body)
  });

  router.get("/getSectionData/:section", getSectionData)
  

  module.exports = router;