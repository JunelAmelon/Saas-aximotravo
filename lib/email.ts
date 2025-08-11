import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GOOGLE_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  fromName?: string; // nom d'affichage expéditeur
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{ filename: string; content: any; path?: string; contentType?: string }>;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  fromName,
  replyTo,
  cc,
  bcc,
  attachments
}: SendEmailOptions) {
  try {
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
    const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;

    console.log('📧 Tentative d\'envoi d\'email:', {
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      from,
      hasAttachments: attachments && attachments.length > 0
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text,
      replyTo,
      cc,
      bcc,
      attachments
    });

    console.log('✅ Email envoyé avec succès:', {
      messageId: info.messageId,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      response: info.response
    });

    return info;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', {
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      timestamp: new Date().toISOString()
    });

    // Log des détails de configuration si l'erreur est liée à l'authentification
    if (error instanceof Error && (error.message.includes('auth') || error.message.includes('Authentication'))) {
      console.error('🔐 Vérifiez la configuration OAuth2:', {
        hasGoogleUser: !!process.env.GOOGLE_USER,
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        googleUser: process.env.GOOGLE_USER ? '***@gmail.com' : 'Non défini'
      });
    }

    throw error; // Re-lancer l'erreur pour que l'appelant puisse la gérer
  }
}

