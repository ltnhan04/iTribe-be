const {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  ORDER_CONFIRMATION_TEMPLATE,
} = require("./template.service");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const sendVerificationEmail = async (email, verificationCode) => {
  const htmlContent = VERIFICATION_EMAIL_TEMPLATE.replace(
    "{verificationCode}",
    verificationCode
  );
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const info = await transporter.sendMail({
    from: '"iTribe.huflit" <iTribe.huflit@gmail.com>',
    to: email,
    subject: "Verification code",
    text: "Verification code",
    html: htmlContent,
  });
  return info;
};

const sendPasswordResetEmail = async (email, resetURL) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const info = await transporter.sendMail({
      from: '"iTribe.huflit" <iTribe.huflit@gmail.com>',
      to: email,
      subject: "Reset your password",
      text: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
    });
    return info;
  } catch (error) {
    console.log("Error sending password reset email:", error);
  }
};

const sendResetSuccessEmail = async (email) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const info = await transporter.sendMail({
      from: '"iTribe.huflit" <iTribe.huflit@gmail.com>',
      to: email,
      subject: "Password reset Successful",
      text: "Password reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    });
    return info;
  } catch (error) {
    console.log(`Error sending password reset success email`, error);
  }
};
//Gửi email xác nhận đơn hàng
const sendOrderConfirmationEmail = async (order, customer) => {
  try {
    // Tạo bảng sản phẩm HTML
    const orderItemsHtml = `
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 10px; text-align: left;">Sản phẩm</th>
            <th style="padding: 10px; text-align: right;">Số lượng</th>
            <th style="padding: 10px; text-align: right;">Giá</th>
          </tr>
        </thead>
        <tbody>
          ${order.productVariants.map(item => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.productVariant.name}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${item.quantity}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${item.productVariant.price.toLocaleString('vi-VN')} VND</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Thay thế các placeholder trong template
    const htmlContent = ORDER_CONFIRMATION_TEMPLATE
      .replace("{customerName}", customer.name)
      .replace("{orderId}", order._id)
      .replace("{orderDate}", new Date(order.createdAt).toLocaleDateString('vi-VN'))
      .replace("{deliveryDate}", new Date().toLocaleDateString('vi-VN'))
      .replace("{totalAmount}", order.totalAmount.toLocaleString('vi-VN'))
      .replace("{orderItems}", orderItemsHtml)
      .replace("{shippingAddress}", order.shippingAddress);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: '"iTribe.huflit" <iTribe.huflit@gmail.com>',
      to: customer.email,
      subject: "Đơn hàng đã giao thành công!",
      html: htmlContent,
    });

    return info;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendOrderConfirmationEmail,
};
