let express = require('express');
let router = express.Router();
let dataModel = require('../models/dailyInfo');
const {
  camelCase, 
  checkNotNull, 
  calculateUnseenNotifications, 
  preprocessData} = require("../controllers/functionCollection")

const {
  checkAuthenticated,
  checkNotAuthenticated,
  checkEmailVerified
} = require('../controllers/auth_helper');

router.get('/input', checkAuthenticated, checkEmailVerified, async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role
  let totalUnseenNotifications = 0
  try{
    totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
  }catch(err){
    return res.render("404", {
      navDisplayName,
      userRole,
      error: err.message,
    });
  }
  res.render('storyForm', { navDisplayName, userRole, totalUnseenNotifications });
});

router.post('/input', checkAuthenticated, checkEmailVerified, async (req, res) => {
  preprocessData(req.body)
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
  userData.save((err, data) => {
    if (err) console.error(err);
    console.log(' data with this id is saved');
  });
  res.redirect('/data/collection');
});

router.get('/collection', checkAuthenticated, checkEmailVerified, async (req, res) => {
  let navDisplayName = req.user.name.displayName;
  let userRole = req.user.role
  let data
  try{
    data = await dataModel.find({})
    let totalUnseenNotifications = await calculateUnseenNotifications(req.user._id, userRole)
    res.render('info_display', { data, userRole, navDisplayName, totalUnseenNotifications});
  }catch(err){
    return res.render("404", {
      navDisplayName,
      userRole,
      error: err.message,
    });
  }
});

module.exports = router;
