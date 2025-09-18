const nodemailer = require("nodemailer");
const { Resend } = require("resend");
const hbs = require("nodemailer-express-handlebars").default;
const path = require("path");
const { logger } = require("../utils/logging");

let transporter = null;

const setupNodemailer = () => {
  const provider = process.env.EMAIL_PROVIDER || "brevo";

  let config = {};
  if (provider === "gmail") {
    config = {
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT || 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    };
  } else if (provider === "brevo") {
    config = {
      host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
      port: process.env.EMAIL_PORT || 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    };
  }

  const t = nodemailer.createTransport(config);

  // Configuration des templates Handlebars
  t.use("compile", hbs({
    viewEngine: {
      extname: ".hbs",
      layoutsDir: path.resolve("./views/emails/layouts"),
      partialsDir: path.resolve("./views/emails/partials"),
      defaultLayout: "main"
    },
    viewPath: path.resolve("./views/emails"),
    extName: ".hbs"
  }));

  return t;
};

const testEmailConfig = () => {
  const provider = process.env.EMAIL_PROVIDER || "brevo";
  
  if (provider === "resend") {
    if (!process.env.RESEND_API_KEY) {
      logger.warn("⚠️ RESEND_API_KEY manquant pour Resend");
    } else {
      logger.info("✅ Configuration Resend OK");
    }
  } else {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logger.warn(`⚠️ EMAIL_USER ou EMAIL_PASS manquant pour ${provider}`);
    } else {
      logger.info(`✅ Configuration ${provider} OK`);
    }
  }
};

const sendEmailWithResend = async ({ to, subject, template, context }) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  let html;
  if (template === "resetPassword") {
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Réinitialisation de votre mot de passe</h2>
        <p>Bonjour ${context?.name || 'Utilisateur'},</p>
        <p>Voici votre code de réinitialisation :</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
          ${context?.code || "Code non disponible"}
        </div>
        <p>Ce code expire dans 10 minutes.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          ${context?.appName || "Ophrus Immo"} - ${new Date().getFullYear()}
        </p>
      </div>
    `;
  } else if (template === "welcome") {
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bienvenue sur ${context?.appName || "Ophrus Immo"} !</h2>
        <p>Bonjour ${context?.name || 'Utilisateur'},</p>
        <p>Votre compte a été créé avec succès.</p>
        <p>Vous pouvez maintenant vous connecter et commencer à utiliser notre plateforme.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          ${context?.appName || "Ophrus Immo"} - ${new Date().getFullYear()}
        </p>
      </div>
    `;
  } else {
    html = `<p>Message: ${context?.message || "Aucun contenu"}</p>`;
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM || "noreply@ophrus-immo.com",
    to,
    subject,
    html
  });
};

const sendEmailWithNodemailer = async ({ to, subject, template, context }) => {
  if (!transporter) transporter = setupNodemailer();
  
  await transporter.sendMail({
    from: `"${process.env.APP_NAME || 'Ophrus Immo'}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    template,
    context: {
      ...context,
      appName: process.env.APP_NAME || "Ophrus Immo",
      appUrl: process.env.FRONTEND_URL || "http://localhost:3000",
      currentYear: new Date().getFullYear()
    }
  });
};

const sendEmail = async ({ to, subject, template, context }) => {
  const provider = process.env.EMAIL_PROVIDER || "brevo";

  try {
    if (provider === "resend") {
      await sendEmailWithResend({ to, subject, template, context });
      logger.info(`✅ Email envoyé avec Resend à ${to}`);
    } else {
      await sendEmailWithNodemailer({ to, subject, template, context });
      logger.info(`✅ Email envoyé à ${to} via ${provider}`);
    }
  } catch (err) {
    logger.error(`❌ Erreur ${provider}:`, err);
    
    // Fallback automatique vers Resend si Brevo/Gmail échoue
    if (provider !== "resend" && process.env.RESEND_API_KEY) {
      logger.info("🔄 Tentative de fallback vers Resend...");
      try {
        await sendEmailWithResend({ to, subject, template, context });
        logger.info(`✅ Email envoyé avec Resend (fallback) à ${to}`);
      } catch (fallbackErr) {
        logger.error("❌ Erreur Resend (fallback):", fallbackErr);
        throw fallbackErr;
      }
    } else {
      throw err;
    }
  }
};

module.exports = {
  sendEmail,
  testEmailConfig
};
