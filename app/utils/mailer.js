/** Installed external modules */
const nodeMailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

/**
 * email account connection configuration
 */
const transporterOption = smtpTransport({
    host: process.env.MAIL_SERVEICE_HOST_NAME,
    port: process.env.MAIL_SERVEICE_PORT,
    secure: false, /** true for 465, false for other ports */
    auth: {
        user: process.env.MAIL_SERVEICE_USERNAME,
        pass: process.env.MAIL_SERVEICE_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    }
});


/**
 * send email
 * @param {string} email email address that you want to send email to
 * @param {string} subject subject of email
 * @param {string} title title shown in email content
 * @param {html|string} content email main message text - it can contain html tags
 */
exports.sendEmail = async (email, subject, title, content) => {
    /**
     * create transport from option variables
     */
    const transporter = nodeMailer.createTransport(transporterOption);

    /**
     * transfer email address to lower case
     * @type {string}
     */
    email = email.toLowerCase();

    /**
     * email message default style
     * @type {string}
     */
    const messageStyle = `
        <h3 style="direction: rtl;text-align: right">${title}</h3>
        <p style="direction: rtl;text-align: right">
           ${content}
        </p>
    `

    /**
     * send email
     */
    const info = await transporter.sendMail({
        from: '"مجله آموزشی راکت" <info@localhost:3000>',
        to: email,
        subject,
        html: `${messageStyle}`
    })

    console.log("Message sent: %s", info.messageId);

}
