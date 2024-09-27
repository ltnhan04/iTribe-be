const { MailtrapClient } = require("mailtrap");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const mailtrapClient = new MailtrapClient({
  endpoint: process.env.MAILTRAP_ENDPOINT,
  token: process.env.MAILTRAP_TOKEN,
});

const sender = {
  email: "hello@demomailtrap.com",
  name: "iTribe",
};

module.exports = {
  mailtrapClient,
  sender,
};
