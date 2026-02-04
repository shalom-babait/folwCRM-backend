import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const { EMAIL, PASSWORD } = process.env;

export async function sendMail(details) {    
    const { recipient, subject, body, html } = details;    
    
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: EMAIL,
            pass: PASSWORD
        }
    });

    const mailOptions = {
        from: `"Flow CRM" <${EMAIL}>`,
        to: recipient,
        subject: subject,
        text: body,
        html: html || body // אם יש HTML תשתמש בו, אחרת text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.response);
        return info;
    } catch (error) {
        console.error('❌ Email error:', error);
        throw error;
    }
}