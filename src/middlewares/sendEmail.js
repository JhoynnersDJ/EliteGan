import "dotenv/config";
import nodemailer from "nodemailer";

export async function sendEmail(html, email, asunto) {   
    var transporter = nodemailer.createTransport({
      service: "gmail",
      // host: "smtp.ethereal.email",
      // port: 587,
      // secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWD,
      },
    });
    var mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: asunto,
      html: html,
    };
  
    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }