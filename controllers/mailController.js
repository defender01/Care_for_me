var nodemailer = require('nodemailer');

// var transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'careformebd@gmail.com',
//     pass: 'its an open and shut case'
//   }
// });

var transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: 'amarshastho@monerdaktar.health',
    pass: 'zxcVBN<>5421'
  }
});


function mailOptions(mailData){
  return {
    from: 'amarshastho@monerdaktar.health',
    to: mailData.mailTo,
    subject: mailData.subject,
    text: mailData.msg
  }
};

function sendMail(mailData){
  transporter.sendMail(mailOptions(mailData), function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

module.exports={
    sendMail
}