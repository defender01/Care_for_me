const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const User = require("../models/userInfo");

const {sendMail}= require('./mailController')

async function forgotpassHandler (req, res){ 
  const {role, emailOrPhone} = req.body
  console.log('came in forgotpass')
  console.log(req.body)
  try{
    if(role==='generalUser'){
      let otp = new mongoose.Types.ObjectId()
      let hashedOtp
  
      // hashing the otp before saving to database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(otp, salt, (err, hash) => {
          if(err)res.send({ error: err.message })
          hashedOtp=hash
        });
      });
      
      let user= await User.findOneAndUpdate(
          {
            $or: [ { email: emailOrPhone }, { phoneNumber: emailOrPhone } ]
          },
          {
            otp: hashedOtp
          },
          {
            new: true
          }
        )
        
        let mailData ={
          mailTo: user.email,
          subject: 'Account passowrd forgotten',
          msg: `Dear user, We are providing you an one time password.Please use this one time password to login.`+
          `After login please change the password. Your one time password is:\n ${otp}\n `,
        }
        sendMail(mailData)
    }
    res.send({ successMsg:"We have sent you an email with temporary password"});

  }catch(err){
    res.send({error: err.message})
  }
}

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'Please log in to view that resource')
  res.redirect('/auth/login');
}
function checkNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  req.flash('success_msg', 'You are logged in')
  res.redirect('/data/collection');      
}


async function postResetPass (req, res){
  let displayName = req.user.name.displayName;

  const{
    password,
    password2
  }=req.body


  let errors = [];

  if (   
    !password ||
    !password2 
  ) {
    errors.push({ msg: "Please enter all required fields" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }


  if (errors.length > 0) {
    res.render("resetPass", {displayName, errors});
  } else {
    let user = User.findOne({email:req.user.name.email})
    console.log({user})

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) res.render('404',{error: err.message});
        user.password = hash;

        try{          
          await user.save()
          res.render("home",{displayName});
        }catch(err){res.render('404',{error: err.message})}

      });
    });

  }
}

module.exports= {
  forgotpassHandler,
  postResetPass,
  checkAuthenticated,
  checkNotAuthenticated
}
