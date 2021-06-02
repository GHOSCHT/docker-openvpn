import { createTransport } from "nodemailer";
import { Options } from "nodemailer/lib/mailer";

const senderMail: string | undefined = process.env.SENDERMAIL;
const senderPassword: string | undefined = process.env.SENDERPASSWORD;
const recipientMail: string | undefined = process.env.RECIPIENTMAIL;
const ngrok_url: string | undefined = process.env.NGROK_URL;
let mailText: string;

if (ngrok_url !== undefined) {
  const clean_ngrok_url = ngrok_url
    .replace("tcp://", "")
    .replace(".tcp.ngrok.io:", ":");
  const split_ngrok_url = clean_ngrok_url.split(":");
  mailText = `remote ${split_ngrok_url[0]}.tcp.ngrok.io ${split_ngrok_url[1]} tcp`;
} else {
  mailText = "ngrok error, please restart VPN";
}

var transporter = createTransport({
  service: "gmail",
  auth: {
    user: senderMail,
    pass: senderPassword,
  },
});

var mailOptions: Options = {
  from: senderMail,
  to: recipientMail,
  subject: "New VPN Settings",
  text: mailText,
};

transporter.sendMail(mailOptions, function (error, info) {
  if (error) {
    console.log(error);
  } else {
    console.log("Email sent: " + info.response);
  }
});
