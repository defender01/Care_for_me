var express = require("express")
var mongoose = require("mongoose")
var bodyParser = require("body-parser")
var flash = require('connect-flash')
var session = require("express-session")
var passport = require("passport")
var medHistoryModel = require('./models/medHistoryInfo')

var displayName = ''

//import camelCase function
const camelCase = require('./controllers/functionCollection').camelCase

require("dotenv").config()

// Passport Config
require('./controllers/passport')(passport)

var database_controller = require("./controllers/database_controller")

var app = express()


app.use("/assets", express.static(__dirname + "/public"))
app.use("/resources", express.static(__dirname + "/resources"))

//setting ejs as view engine
app.set("view engine", "ejs")

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Express session
app.use(
  session({
    secret: "secret care",
    resave: true,
    saveUninitialized: true
  })
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Connect flash
app.use(flash())

mongoose
  .connect(
    "mongodb+srv://defender:11223344@cluster0-rrw3g.mongodb.net/test?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    }
  )
  .then(() => console.log("connected to database!!"))
  .catch(err => console.log(err))

  // Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  next()
})

app.get("/home", async (req, res) => {
  if(req.user)
    displayName = req.user.name.displayName
  else displayName = ''
   res.render("home", {displayName})
})

app.get("/", async (req, res) => {
  if(req.user)
    displayName = req.user.name.displayName
  else displayName = ''
   res.render("home", {displayName})
})


app.get("/test", async (req, res) => {
  res.render("test")
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

app.get("/medHistory", async (req, res) => {

   await medHistoryModel.find({},(err, data) => {
    if (err) throw err
    else res.render("medHistory", { data, substanceNamesJson, physicalDiseasesJson, mentalDiseasesJson, vaccineInfoJson})
  })

})

app.post("/medHistory", async (req, res) => {
    var userData = new medHistoryModel({
      _someId: req.body.ObjectId
  })
  await userData.save( (err, data) => {
      if(err) console.error(err)
      console.log(' data with this id is saved')
  })
  res.redirect('/medHistory') 
})

app.get("/termsAndConditions", (req, res) => {
    res.render("termsAndConditions")
})


//routes
app.use("/data", require("./routes/data.js"))
app.use("/auth", require("./routes/auth.js"))
app.use("/profile", require("./routes/profile.js"))
app.use("/admin", require("./routes/adminFacility.js"))

database_controller(app)



var PORT = process.env.PORT || 5000
// app.listen(PORT)
app.listen(PORT, () => {
  console.log('Express server listening on port', PORT)
})

