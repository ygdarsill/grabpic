const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
require('dotenv').config();

let transporter;

// Store the init promise so sendEmail can await it
const transporterReady = (async () => {
  if (process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate a test ethereal account on the fly
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('Test email account generated:', testAccount.user);
  }
})();

const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'GrabPic',
    link: process.env.CLIENT_URL || 'http://localhost:5173',
  }
});

const sendEmail = async ({ email, subject, mailgenContent }) => {
  // Wait for transporter to be fully initialized before sending
  await transporterReady;

  const emailBody = mailGenerator.generate(mailgenContent);
  const emailText = mailGenerator.generatePlaintext(mailgenContent);
  
  const info = await transporter.sendMail({
    from: `"GrabPic" <${process.env.SMTP_USER || 'noreply@grabpic.test'}>`,
    to: email,
    subject: subject,
    text: emailText,
    html: emailBody
  });
  
  console.log('Message sent: %s', info.messageId);

  let previewUrl = null;
  if (!process.env.SMTP_USER) {
    previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('Preview URL: %s', previewUrl);
  }

  return { info, previewUrl };
};

const emailVerificationMailgenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: 'Welcome to GrabPic! We\'re very excited to have you on board.',
      action: {
        instructions: 'To verify your email and complete your registration, please click the button below:',
        button: {
          color: '#22BC66', 
          text: 'Verify your account',
          link: verificationUrl
        }
      },
      outro: 'If you did not sign up for an account, no further action is required.'
    }
  };
};

const forgotPasswordMailgenContent = (username, resetUrl) => {
  return {
    body: {
      name: username,
      intro: 'You have received this email because a password reset request for your account was received.',
      action: {
        instructions: 'Click the button below to reset your password:',
        button: {
          color: '#DC4D2F',
          text: 'Reset your password',
          link: resetUrl
        }
      },
      outro: 'If you did not request a password reset, no further action is required on your part.'
    }
  };
};

module.exports = {
  sendEmail,
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent
};
