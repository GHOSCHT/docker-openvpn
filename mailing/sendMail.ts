import {createTransport} from 'nodemailer'
import Mail from 'nodemailer/lib/mailer';

const senderMail: string | undefined = process.env.SENDERMAIL
const senderPassword: string | undefined = process.env.SENDERPASSWORD
const recipientMail: string | undefined = process.env.RECIPIENTMAIL
const ngrok_url: string | undefined = process.env.NGROK_URL

var transporter = createTransport({
    service: 'gmail',
    auth: {
      user: senderMail,
      pass: senderPassword
    }
  });
  
  var mailOptions: Mail.Options = {
    from: senderMail,
    to: recipientMail,
    subject: "New VPN Domain",
    text: ngrok_url,
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  