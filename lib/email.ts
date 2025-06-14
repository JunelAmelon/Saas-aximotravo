import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true si port 465, false sinon
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
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
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
  const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;

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
  return info;
}

