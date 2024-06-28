const nodemailer=require("nodemailer");

const ContactAgent = async(name,phone,email,partnerEmail,partnerName) => {
  
    try {
        var transporter=nodemailer.createTransport({
            service:"gmail",   
            auth:{
                user:'nestway2266@gmail.com',
                pass:'sizspjldgnpxzmpx'
            }
        });
        let mailOptions={
            from:"nestway2266@gmail.com",
            to:partnerEmail,
            subject:'Inquiry and Expression of Interest in Property Purchase',
            html: `  
            <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #F8F8FF;">

    <h2 style="color: #777; text-align: center; font-size: 24px; margin-bottom: 10px;">
        🏢 Property Inquiry
    </h2>
        
            <p>Dear ${partnerName},</p>
        
            <p>I hope this message finds you well. My name is ${name}, and I'm reaching out regarding your property listed on SevenSky.online.</p>
        
            <p>I am genuinely interested in purchasing your property and would like to discuss it further. I am available for a call or communication through email at ${email}, whichever suits you best.</p>
        
            <p>Thank you for taking the time to consider my inquiry. I look forward to the opportunity to connect and discuss this further.</p>
        
            <div style="border-top: 1px solid #ddd; margin-top: 20px; padding-top: 10px; text-align: right; color: #888; font-size: 12px;">
                <p>Best regards,<br>
                ${name}<br>
                Phone: ${phone}</p>
            </div>
        
        </div>
        
          `
        };
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error.message)
            }else{
                console.log(`Email sent to ${info.response} ${partnerEmail} successfully`)
            }
        });
        
    } catch (error) {
        console.log(error.message)
    }
}

module.exports= ContactAgent

