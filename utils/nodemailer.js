const nodemailer = require("nodemailer");
const otpmodel = require("../model/otp.js")
const dotenv = require('dotenv')
dotenv.config()

const sendGmail = async (name,email,userId) => {
  try {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'nestway2266@gmail.com',
        pass: 'sizspjldgnpxzmpx'
      }
    });
    let otp = Math.floor(1000 + Math.random() * 9000)
    let mailOptions = {
      from: 'nestway2266@gmail.com',
      to: email,
      subject: 'Sending Email using Node.js',
      html: `  
      <div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
        <div style="margin: 50px auto; width: 70%; padding: 20px 0">
          <div style="border-bottom: 1px solid #eee">
            <a href="" style="font-size: 1.4em; color: #82AE46; text-decoration: none; font-weight: 600">
            NestWay
            </a>
          </div>
          <p style="font-size: 1.1em">Hi,${name}</p>
          <p>Thank you for choosing NestWay. Use the following OTP to complete your Sign Up procedures. OTP is valid for a few minutes</p>
          <h2 style="background: #82AE46; margin: 0 auto; width: max-content; padding: 0 10px; color: white; border-radius: 4px;">
            ${otp}
          </h2>
          <p style="font-size: 0.9em;">Regards,<br />NestWay</p>
          <hr style="border: none; border-top: 1px solid #eee" />
          <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
            <p>NestWay</p>
            <p>1600 Ocean Of Heaven</p>
            <p>Pacific</p>
          </div>
        </div>
      </div>
    `
    };
    const verificationOtp = new otpmodel({
      userId:userId,
      otp:otp,
      createdAt:Date.now(),
      expiresAt:Date.now()+300000
    })
    let verified = await verificationOtp.save()
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log(`Email sent to ${info.response} and Otp is ${otp}` );
      }
    });
    return verified._id

  } catch (error) {
    console.log(error.message)
  }
}
module.exports = sendGmail