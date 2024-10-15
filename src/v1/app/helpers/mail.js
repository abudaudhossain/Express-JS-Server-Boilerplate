const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

const sendToMail = async (email) => {
    const mailOptions = {
        from: "greventproject@gmail.com",
        to: email.to,
        subject: email.subject,
        html: email.html,
        attachments: email.attachments
    };

    let message = "";
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Error sending email: ", error);
            message = "Email Sent Fail😥";
        } else {
            console.log("Email send: ", info.response);

            message = "Email Sent Successfully👌";
        }
    });

    return message;
};

module.exports = { sendToMail };
