// utils/emailService.js
const nodemailer = require('nodemailer');
const path = require('path');
const pug = require('pug');
const config = require('../config/env');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_PORT === 465,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    });
  }

  /**
   * Envoie un email de confirmation de commande
   */
  async sendOrderConfirmation(order, user) {
    const templatePath = path.join(__dirname, '../templates/orderConfirmation.pug');
    const html = pug.renderFile(templatePath, {
      order,
      user,
      date: new Date().toLocaleDateString('fr-FR'),
    });

    const mailOptions = {
      from: `"${config.FROM_NAME}" <${config.FROM_EMAIL}>`,
      to: user.email,
      subject: `Confirmation de commande #${order._id}`,
      html,
      text: `Bonjour ${user.name},\nVotre commande #${order._id} a été confirmée.\nTotal: €${order.totalPrice}`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  async sendPasswordReset(email, url) {
    const templatePath = path.join(__dirname, '../templates/passwordReset.pug');

    const html = pug.renderFile(templatePath, {
      resetUrl: url, // ✅ utilisé dans le template
    });

    const mailOptions = {
      from: `"${config.FROM_NAME}" <${config.FROM_EMAIL}>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html,
      text: `Vous avez demandé la réinitialisation de votre mot de passe. Cliquez ici : ${url}`, // ✅ utilise bien url
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Envoie un email de vérification d'email
   */
  async sendEmailVerification(email, url, userName) {
    const templatePath = path.join(__dirname, '../templates/emailVerification.pug');

    const html = pug.renderFile(templatePath, {
      verificationUrl: url,
      userName: userName,
    });

    const mailOptions = {
      from: `"${config.FROM_NAME}" <${config.FROM_EMAIL}>`,
      to: email,
      subject: 'Confirmez votre adresse email',
      html,
      text: `Bonjour ${userName},\n\nMerci de vous être inscrit sur notre site. Pour activer votre compte, veuillez confirmer votre adresse email en visitant ce lien : ${url}\n\nCe lien expirera dans 24 heures.\n\nSi vous n'avez pas créé de compte, vous pouvez ignorer cet email.\n\nCordialement,\nL'équipe de notre plateforme`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();
