var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'careformebd@gmail.com',
    pass: 'its an open and shut case'
  }
});

function mailOptions(mailData){
  return {
    from: 'careformebd@gmail.com',
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