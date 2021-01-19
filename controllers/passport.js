const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load Patient model
const Patient = require('../models/patient');
const Doctor = require("../models/doctor").doctorModel;

module.exports = {
  patientStrategy: function(passport) {
  passport.use( 
    'patientStrategy',   
    new LocalStrategy({ usernameField: 'emailOrPhone',passReqToCallback: true }, (req,emailOrPhone, password, done) => {
      // Match user
      Patient.findOne({
        // email: email
        // email: emailOrPhone
        $or: [ { email: emailOrPhone }, { phoneNumber: emailOrPhone } ] 
      }).then(async (patient) => {
        if (!patient) {
          return done(null, false, { message: 'That email or phone no is not registered' });
        }
        console.log('in passport strategy')
        console.log(patient)
        // Match password
        let  patientOtp
        if(typeof patient.otp!= 'undefined' && patient.otp!=''){
          console.log('checking otp')          
          patientOtp = patient.otp
          // resetting otp
          patient.otp =''
          await patient.save()          
        }

        try{
          // console.log(password, patient.password, patientOtp)
          // console.log(typeof(password), typeof(patient.password), typeof(patientOtp))
          // console.log(String(password), String(patient.password), String(patientOtp))

          let passwordMatch = await bcrypt.compare(String(password), String(patient.password));
          let passwordOrOtpMatch = await bcrypt.compare(String(password), String(patientOtp));
          // console.log(passwordMatch, "  ",passwordOrOtpMatch)
          if(passwordMatch|| passwordOrOtpMatch){
            req.session.currentLoggedIn = 'patient';
            return done(null, patient);
          } 
          else {
            return done(null, false, { message: 'Password incorrect' });
          }
        }catch(err){
          console.error(err)
        }

      });
    })
  );

  // passport.serializeUser(function(user, done) {
  //   done(null, user.id);
  // });

  // passport.deserializeUser(function(id, done) {
  //   Patient.findById(id, function(err, user) {
  //     done(err, user);
  //   });
  // });
},
doctorStrategy: function(passport) {
  passport.use(    
    'doctorStrategy',
    new LocalStrategy({ usernameField: 'emailOrPhone', passReqToCallback: true },  (req, emailOrPhone, password, done) => {
      // Match user
      Doctor.findOne({
        // email: email
        // email: emailOrPhone
        $or: [ { email: emailOrPhone }, { phoneNumber: emailOrPhone } ] 
      }).then(async (doctor) => {
        if (!doctor) {
          return done(null, false, { message: 'That email or phone no is not registered' });
        }

        // Match password
        let  doctorOtp
        if(typeof doctor.otp!= 'undefined' && doctor.otp!=''){
          console.log('checking otp')          
          doctorOtp = doctor.otp
          // resetting otp
          doctor.otp =''
          await doctor.save()          
        }

        try{
          // console.log(password, doctor.password, doctorOtp)
          // console.log(typeof(password), typeof(doctor.password), typeof(doctorOtp))
          // console.log(String(password), String(doctor.password), String(doctorOtp))

          let passwordMatch = await bcrypt.compare(String(password), String(doctor.password));
          let passwordOrOtpMatch = await bcrypt.compare(String(password), String(doctorOtp));
          // console.log(passwordMatch, "  ",passwordOrOtpMatch)
          if(passwordMatch|| passwordOrOtpMatch){
            req.session.currentLoggedIn = 'doctor';
            return done(null, doctor);
          } 
          else {
            return done(null, false, { message: 'Password incorrect' });
          }
        }catch(err){
          console.error(err)
        }

      });
    })
  );

  // passport.serializeUser(function(user, done) {
  //   done(null, user.id);
  // });

  // passport.deserializeUser(function(id, done) {
  //   Doctor.findById(id, function(err, user) {
  //     done(err, user);
  //   });
  // });
}
}