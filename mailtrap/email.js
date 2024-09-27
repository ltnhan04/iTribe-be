// const { mailtrapClient, sender } = require("../mailtrap/mailtrap.config");
// const { VERIFICATION_EMAIL_TEMPLATE } = require("./emailTemplate");



// const sendVerificationEmail = async (email, verificationCode) => {
//     // Replace the placeholder with the actual verification code
//     const htmlContent = VERIFICATION_EMAIL_TEMPLATE.replace('{verificationCode}', verificationCode);
    
//     const message = {
//       to: [email],
//       from: sender,
//       subject: "Email Verification",
//       html: htmlContent,  // Use the modified HTML content
//     };
//     console.log(message)
  
//     try {
//       await mailtrapClient.send(message);
//     } catch (error) {
//       console.error("Error sending verification email:", error);
//     }
//   };
  

// module.exports = {
//   sendVerificationEmail,
// };


const { mailtrapClient, sender } = require("../mailtrap/mailtrap.config");
const { VERIFICATION_EMAIL_TEMPLATE } = require("./emailTemplate");

const sendVerificationEmail = async (email, verificationCode) => {
  // Replace the placeholder with the actual verification code
  const htmlContent = VERIFICATION_EMAIL_TEMPLATE.replace(
    "{verificationCode}",
    verificationCode
  );

  const message = {
    to: [{ email: email }], // Correct 'to' field to an array of objects with 'email'
    from: { email: sender.email, name: sender.name }, // Ensure 'from' is properly structured
    subject: "Email Verification",
    html: htmlContent, // Use the modified HTML content
  };

  console.log(message); // Debugging log to check the message structure

  try {
    await mailtrapClient.send(message);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

module.exports = {
  sendVerificationEmail,
};
