import nodemailer from "nodemailer";

const from = `${process.env.EMAIL_USER} <${process.env.EMAIL_USER}>`;

function setup() {
  if (process.env.MY_NODE_ENV === "production") {
    return nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
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

export function sendConfirmationEmail(user, host) {
  const tranport = setup();
  const url = user.generateConfirmationUrl(host);
  const email = {
    from,
    to: `${user.email} <${user.email}>`,
    subject: "Welcome to ListAnything",
    html: `
    Welcome to ListAnything. Please, confirm your email.<br/>

    <a href="${url}">${url}</a>
    `
  };

  tranport.sendMail(email);
}

export function sendResetPasswordEmail(user, host) {
  const tranport = setup();
  const url = user.generateResetPasswordUrl(host);
  const email = {
    from,
    to: `${user.email} <${user.email}>`,
    subject: "Reset Password",
    html: `
    To reset password follow this link:<br/>

    <a href="${url}">${url}</a>
    `
  };

  tranport.sendMail(email);
}
