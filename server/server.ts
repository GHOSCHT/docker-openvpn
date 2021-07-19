import { createTransport } from "nodemailer";
import { Options } from "nodemailer/lib/mailer";
import { config } from "dotenv";
import { resolve } from "path";
import { promises } from "dns";
import * as ngrok from "ngrok";
config({ path: resolve(__dirname, "./.env") });

const senderMail: string | undefined = process.env.SENDERMAIL;
const senderPassword: string | undefined = process.env.SENDERPASSWORD;
const recipientMail: string | undefined = process.env.RECIPIENTMAIL;
const authtoken: string | undefined = process.env.AUTHTOKEN;
let mailText: string;
let recipients: string[];
let ngrok_url: string;

if (recipientMail !== undefined) {
  recipients = recipientMail.split(",");
} else {
  console.log("No recipients");
  process.exit();
}

const getMailText = () => {
  if (ngrok_url !== undefined) {
    const clean_ngrok_url = ngrok_url
      .replace("tcp://", "")
      .replace(/["']/g, "")
      .replace(".tcp.ngrok.io:", ":");
    const split_ngrok_url = clean_ngrok_url.split(":");
    return `Server: ${split_ngrok_url[0]}.tcp.ngrok.io\nPort: ${split_ngrok_url[1]}`;
  } else {
    return "ngrok error, please restart VPN";
  }
};

const checkConnectivity = async (callback: () => void) => {
  const retryDelayInSeconds = 10;
  const testServerIp = "1.1.1.1";

  const lookup = async () => {
    const details = promises.lookupService(testServerIp, 53);
    return details;
  };

  const check = async () => {
    try {
      await lookup();
      callback();
    } catch {
      console.log(
        `No internet connection, waiting ${retryDelayInSeconds} seconds to try again`
      );
      setTimeout(check, retryDelayInSeconds * 1000);
    }
  };

  check();
};

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
    subject: "❗️ New VPN Settings ❗️",
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

const startNgrokServer = async () => {
  if (authtoken !== undefined) {
    console.log("Starting server");

    try {
      await ngrok.authtoken(authtoken);
    } catch {
      console.log("Incorrect authtoken");
      process.exit();
    }

    const url = await ngrok.connect({ proto: "tcp", addr: 1194 });
    console.log(`Server running at ${url}`);

    return url;
  } else {
    console.log("No existing authtoken");
    process.exit();
  }
};

checkConnectivity(async () => {
  ngrok_url = await startNgrokServer();
  mailText = getMailText();

  recipients.forEach((recipient) => {
    sendMail(mailText, recipient);
  });
});
