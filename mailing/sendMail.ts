import { createTransport } from "nodemailer";
import { Options } from "nodemailer/lib/mailer";
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "./.env") });

const senderMail: string | undefined = process.env.SENDERMAIL;
const senderPassword: string | undefined = process.env.SENDERPASSWORD;
const recipientMail: string | undefined = process.env.RECIPIENTMAIL;
const ngrok_url: string | undefined = process.env.NGROK_URL;
let mailText: string;
let recipients: string[];

if (recipientMail !== undefined) {
  recipients = recipientMail.split(",");
} else {
  console.log("No recipients");
  process.exit();
}

if (ngrok_url !== undefined) {
  const clean_ngrok_url = ngrok_url
    .replace("tcp://", "")
    .replace(".tcp.ngrok.io:", ":");
  const split_ngrok_url = clean_ngrok_url.split(":");
  mailText = `remote ${split_ngrok_url[0]}.tcp.ngrok.io ${split_ngrok_url[1]} tcp`;
} else {
  mailText = "ngrok error, please restart VPN";
}

const sendMail = (text: string, recipient: string) => {
  var transporter = createTransport({
    service: "gmail",
    auth: {
      user: senderMail,
      pass: senderPassword,
    },
  });

  var mailOptions: Options = {
    from: senderMail,
    to: recipient,
    subject: "New VPN Settings",
    text,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

recipients.forEach((recipient) => {
  sendMail(mailText, recipient);
});
