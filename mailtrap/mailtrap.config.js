const { MailtrapClient } = require("mailtrap");
const dotenv = require("dotenv");  // Make sure to require dotenv correctly

dotenv.config();  // Load environment variables

const mailtrapClient = new MailtrapClient({
  endpoint: process.env.MAILTRAP_ENDPOINT,  // Ensure these variables are defined in .env
  token: process.env.MAILTRAP_TOKEN,
});

const sender = {
  email: "hello@demomailtrap.com",
  name: "giakhoitest",
};

module.exports = {
  mailtrapClient,
  sender,  // Ensure 'sender' is exported correctly as well
};
