import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const { EMAIL, PASSWORD } = process.env;

export function sendMail(details) {    
    const { recipient, subject, body } = details;    
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: EMAIL,
            pass: PASSWORD
        }
    });

    const mailOptions = {
        from:  `"Flow CRM" <${EMAIL}>`,
        to: recipient,
        subject: subject,
        text: body
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });
}