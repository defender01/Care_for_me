let express = require('express');
let router = express.Router();
let dataModel = require('../models/dailyInfo');

const {
  checkAuthenticated,
  checkNotAuthenticated
} = require('../controllers/auth_helper');

router.get('/input', checkAuthenticated, async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  res.render('storyForm', { navDisplayName });
});

router.post('/input', async (req, res) => {
  console.log(req.body);
  let userData = new dataModel({
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
  let navDisplayName = req.user.name.displayName;
  await dataModel.find({}, (err, data) => {
    if (err) console.error(err);
    else res.render('info_display', { data, navDisplayName });
  });
});



module.exports = router;
