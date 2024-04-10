import nodemailer from 'nodemailer';

async function sendMail() {
    // Create a transporter object
    const transporter = nodemailer.createTransport({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
            user: 'your-email@example.com',
            pass: 'your-password',
        },
    });

    // Define the email options
    const mailOptions = {
        from: 'your-email@example.com',
        to: 'recipient@example.com',
        subject: 'Hello from Nodemailer',
        text: 'This is a test email sent using Nodemailer.',
    };

    try {
        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

sendMail();