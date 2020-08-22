const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/userInfo');

module.exports = {
  patientStrategy: function(passport) {
  passport.use( 
    'patientStrategy',   
    new LocalStrategy({ usernameField: 'emailOrPhone' }, (emailOrPhone, password, done) => {
      // Match user
      User.findOne({
        // email: email
        // email: emailOrPhone
        $or: [ { email: emailOrPhone }, { phoneNumber: emailOrPhone } ] 
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email or phone no is not registered' });
        }

        // Match password
        let userPassword
        if(user.otp==undefined || user.otp==''){
          userPassword= user.password
        }
        else{
          userPassword= user.otp          
        }
        bcrypt.compare(password, userPassword, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
},
doctorStrategy: function(passport) {
  passport.use(    
    'doctorStrategy',
    new LocalStrategy({ usernameField: 'emailOrPhone' }, (emailOrPhone, password, done) => {
      // Match user
      User.findOne({
        // email: email
        // email: emailOrPhone
        $or: [ { email: emailOrPhone }, { phoneNumber: emailOrPhone } ] 
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email or phone no is not registered' });
        }

        // Match password
        let userPassword
        if(user.otp==''){
          userPassword= user.password
        }
        else{
          userPassword= user.otp
        }
        bcrypt.compare(password, userPassword, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
}
}