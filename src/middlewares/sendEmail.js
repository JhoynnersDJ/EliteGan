import "dotenv/config";
import nodemailer from "nodemailer";

export async function sendEmail(html, email) {   
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWD,
      },
    });
    var mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Actualización de Correo Electronico",
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