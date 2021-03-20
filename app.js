var express = require("express")
var mongoose = require("mongoose")
var bodyParser = require("body-parser")
var flash = require('connect-flash')
var session = require("express-session")
var passport = require("passport")
const Patient = require('./models/patient');
const Doctor = require("./models/doctor").doctorModel;
const Admin = require("./models/admin").adminModel;
const {homeModel} = require("./models/home");

require("dotenv").config()

// Passport Config
require('./controllers/passport').patientStrategy(passport)
require('./controllers/passport').doctorStrategy(passport)
require('./controllers/passport').adminStrategy(passport)

passport.serializeUser(function (user, done) {
  var key = {
    id: user._id,
    type: user.role
  }
  done(null, key);
});

passport.deserializeUser(function (key, done) {
  let Model
  if (key.type == 'patient'){
    Model = Patient
  }
  else if(key.type == 'doctor'){
    Model = Doctor
  }
  else{
    Model = Admin
  }
  Model.findOne({ _id: key.id }, function (err, user) {
    done(err, user);
  })
});

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
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  next()
})


app.get("/", async (req, res) => {
  let navDisplayName = ''
  let userRole = '', data = null
  if (req.user){
    navDisplayName = req.user.name.displayName
    userRole = req.user.role
  }
  try{
    data = await homeModel.findOne({})
  }catch(err){
    res.render('404',{'error': err.message})
    return
  }  
  res.render("home", { navDisplayName, userRole, data })
})

app.get("/test", async (req, res) => {
  let navDisplayName = ''
  let userRole = ''
  if (req.user){
    navDisplayName = req.user.name.displayName
    userRole = req.user.role
  }

  try{
    let patients = await Patient.find({"gender": {$in: ['male', 'female']} })
    console.log(patients.length)
    res.send(patients)
  }catch(err){
    console.log(err)
    res.send(err)
  }
  
  // res.render("test", { navDisplayName, userRole })
})

app.post("/test", async (req, res) => {
  console.log(req.body)
})


app.get("/termsAndConditions", (req, res) => {
  let navDisplayName = ''
  let userRole = ''
  if (req.user){
    navDisplayName = req.user.name.displayName
    userRole = req.user.role
  }
  res.render("termsAndConditions", { navDisplayName, userRole })
})


//routes
app.use("/data", require("./routes/data.js"))
app.use("/admin", require("./routes/admin/adminFacility.js"))
app.use("/auth", require("./routes/auth.js"))
app.use("/patient", require("./routes/patient/patient.js"))
app.use("/doctor", require("./routes/doctor/doctor.js"))


// 404
app.use((req, res, next) => {
  let navDisplayName = ''
  let userRole = ''
  if (req.user){
    navDisplayName = req.user.name.displayName
    userRole = req.user.role
  }

  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('404', {navDisplayName, userRole, error: '404 Page Not Found' });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});


var PORT = process.env.PORT || 5000
// app.listen(PORT)
app.listen(PORT, () => {
  console.log('Express server listening on port', PORT)
})
