const { mailtrapClient, sender } = require("../mailtrap/mailtrap.config");
const { VERIFICATION_EMAIL_TEMPLATE } = require("./emailTemplate");

const sendVerificationEmail = async (email, verificationCode) => {
  const htmlContent = VERIFICATION_EMAIL_TEMPLATE.replace(
    "{verificationCode}",
    verificationCode
  );

  const message = {
    to: [{ email: email }],
    from: { email: sender.email, name: sender.name },
    subject: "Email Verification",
    html: htmlContent,
  };

  console.log(message);

  try {
    await mailtrapClient.send(message);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

module.exports = {
  sendVerificationEmail,
};
