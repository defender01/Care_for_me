var express = require('express');
var router = express.Router();
var dataModel = require('../models/dailyinfo');

const {
  checkAuthenticated,
  checkNotAuthenticated
} = require('../controllers/auth_helper');

router.get('/input', checkAuthenticated, async (req, res) => {
  var displayName = req.user.name.displayName;
  res.render('storyForm', { displayName });
});

router.post('/input', async (req, res) => {
  console.log(req.body);
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
    med_details: req.body.taking_med == 'yes' ? req.body.med_details : '',
    diary: req.body.diary
  });
  await userData.save((err, data) => {
    if (err) console.error(err);
    console.log(' data with this id is saved');
  });
  res.redirect('/data/collection');
});

router.get('/collection', checkAuthenticated, async (req, res) => {
  var displayName = req.user.name.displayName;
  await dataModel.find({}, (err, data) => {
    if (err) throw err;
    else res.render('info_display', { data, displayName });
  });
});

router.post('/medHistory', checkAuthenticated, async (req, res) => {});

module.exports = router;
