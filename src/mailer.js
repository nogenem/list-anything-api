import nodemailer from "nodemailer";

const from = '"ListAnything" <info@listanything.com>';

function setup() {
  // https://mailtrap.io
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

export function sendConfirmationEmail(user) {
  const tranport = setup();
  const email = {
    from,
    to: user.email,
    subject: "Welcome to ListAnything",
    text: `
    Welcome to ListAnything. Please, confirm your email.

    ${user.generateConfirmationUrl()}
    `
  };

  tranport.sendMail(email);
}

export function sendResetPasswordEmail(user) {
  const tranport = setup();
  const email = {
    from,
    to: user.email,
    subject: "Reset Password",
    text: `
    To reset password follow this link

    ${user.generateResetPasswordUrl()}
    `
  };

  tranport.sendMail(email);
}
