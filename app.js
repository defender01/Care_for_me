var express = require('express')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
require('dotenv').config()

var dataModel = require('./models/dailyinfo')

var app = express()

var PORT = process.env.PORT || 3000

app.use('/assets', express.static(__dirname + '/public'))

app.set('view engine', 'ejs')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

mongoose.connect(
    'mongodb+srv://user1:987654321@cluster0-t11g2.mongodb.net/keepLearning?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    },
    () => console.log('connected to database!!')
  );

app.get('/', async (req, res) => {
    var data = await dataModel.find()
    res.render('info_display', {data})
})

app.get('/data', async (req, res) => {
    // var data = await dataModel.find()
    res.render('storyForm')
})

app.post('/data', async (req, res) => {
    console.log(req.body)
    var userData = new dataModel({
        _someId: req.body.ObjectId,
        symptoms: {
            chest_pain: req.body.chest_pain,     
            respiratory: req.body.respiratory,
            cardio_vascular: req.body.cardio_vascular,
            hematological: req.body.hematological,
            lymphatic: req.body.lymphatic,
            neurolohical: req.body.neurolohical,
            psychological: req.body.psychological,
            gasttrointestinal: req.body.gasttrointestinal,
            genitourinary: req.body.genitourinary,
            weight_gain: req.body.weight_gain,
            weight_loss: req.body.weight_loss,
            musculoskeletal: req.body.musculoskeletal
        },
        weight: req.body.weight,
        systolic: req.body.systolic,
        diastolic: req.body.diastolic,
        taking_med: req.body.taking_med,
        med_details: (req.body.taking_med=='yes' ? req.body.med_details : ""),
        diary: req.body.diary
    })
    await userData.save( (err, data) => {
        if(err) console.error(err)
        console.log(' data with this id is saved')
    })
    res.redirect('/')
})

app.listen(PORT);