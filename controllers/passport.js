const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/userInfo');
const Doctor = require("../models/doctor").doctorModel;

module.exports = {
  patientStrategy: function(passport) {
  passport.use( 
    'patientStrategy',   
    new LocalStrategy({ usernameField: 'emailOrPhone',passReqToCallback: true }, (req,emailOrPhone, password, done) => {
      // Match user
      User.findOne({
        // email: email
        // email: emailOrPhone
        $or: [ { email: emailOrPhone }, { phoneNumber: emailOrPhone } ] 
      }).then(async (user) => {
        if (!user) {
          return done(null, false, { message: 'That email or phone no is not registered' });
        }
        console.log('in passport strategy')
        console.log(user)
        // Match password
        let  userOtp
        if(typeof user.otp!= 'undefined' && user.otp!=''){
          console.log('checking otp')          
          userOtp = user.otp
          // resetting otp
          user.otp =''
          await user.save()          
        }

        try{
          // console.log(password, user.password, userOtp)
          // console.log(typeof(password), typeof(user.password), typeof(userOtp))
          // console.log(String(password), String(user.password), String(userOtp))

          let passwordMatch = await bcrypt.compare(String(password), String(user.password));
          let passwordOrOtpMatch = await bcrypt.compare(String(password), String(userOtp));
          console.log(passwordMatch, "  ",passwordOrOtpMatch)
          if(passwordMatch|| passwordOrOtpMatch){
            req.session.currentLoggedIn = 'patient';
            return done(null, user);
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
  //   User.findById(id, function(err, user) {
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
      }).then(async (user) => {
        if (!user) {
          return done(null, false, { message: 'That email or phone no is not registered' });
        }

        // Match password
        let  userOtp
        if(typeof user.otp!= 'undefined' && user.otp!=''){
          console.log('checking otp')          
          userOtp = user.otp
          // resetting otp
          user.otp =''
          await user.save()          
        }

        try{
          console.log(password, user.password, userOtp)
          console.log(typeof(password), typeof(user.password), typeof(userOtp))
          console.log(String(password), String(user.password), String(userOtp))

          let passwordMatch = await bcrypt.compare(String(password), String(user.password));
          let passwordOrOtpMatch = await bcrypt.compare(String(password), String(userOtp));
          console.log(passwordMatch, "  ",passwordOrOtpMatch)
          if(passwordMatch|| passwordOrOtpMatch){
            req.session.currentLoggedIn = 'doctor';
            return done(null, user);
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