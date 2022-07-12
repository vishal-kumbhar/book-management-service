var nodemailer = require('nodemailer');
var Email = require('email-templates');
const Helper = require('../services/Helper')
module.exports= {

  sendMailForgot: async (toEmail, mailSubject, Data) => {
    if (process.env.SEND_EMAIL === "true") {
      const configOption = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {     
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      };
      //const viewPath = 'src/views/emails';
      const transporter = await nodemailer.createTransport(configOption);
      const email = new Email({
        transport: transporter,
        send: true,
        preview: false
      });
      // send mail with defined transport object
      const info = await email.send({

        //  template: templateName,
        message: {
          from: process.env.COMPANY_EMAIL,
          to: toEmail,
          subject: mailSubject,
          html: Data
        },
      });
      if (info) {
        console.log(info);
        console.log('Message sent: %s', info.messageId);
      }
      return info;
    } else {
      return true;
    }
  },
  sendMail: async (toEmail, mailSubject, templateName, locale) => {
    if (process.env.SEND_EMAIL === "true") {
      const configOption = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      };
      const viewPath = 'src/views/emails';
      const transporter = await nodemailer.createTransport(configOption);
      const email = new Email({
        transport: transporter,
        send: true,
        preview: false,
        views: {
          options: {
            extension: 'pug'
          },
          root: viewPath
        }
      });
      // send mail with defined transport object
      const info = await email.send({
        template: templateName,
        message: {
          from: `${Helper.AppName} <${process.env.COMPANY_EMAIL}>`,
          to: toEmail,
          subject: mailSubject
        },
        locals: locale
      });
      if (info) {
        console.log('Message sent: %s', info.messageId);
      }
      console.log(info)
      return info;
    } else {
      return true;
    }
  }
}
