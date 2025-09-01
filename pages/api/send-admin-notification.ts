import type { NextApiRequest, NextApiResponse } from "next";
import { sendEmail } from "../../lib/email";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { artisanData, courtierId, courtierName } = req.body;

  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@aximotravo.com";
    
    const subject = `Nouveau dossier artisan à valider - ${artisanData.firstName} ${artisanData.lastName}`;
    
    const html = `
    <div style="font-family: Arial, sans-serif; color: #222; max-width: 600px; margin: 0 auto; border: 1px solid #f26755; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(90deg, #f26755 0%, #f28c55 100%); padding: 20px 24px;">
        <h2 style="color: #fff; margin: 0; font-size: 1.5rem; font-weight: bold;">
          🔔 Nouveau dossier artisan à valider
        </h2>
      </div>
      
      <div style="padding: 24px;">
        <p style="margin-bottom: 16px; font-size: 16px;">
          Bonjour,
        </p>
        
        <p style="margin-bottom: 20px;">
          Un nouveau dossier d'artisan a été soumis par le courtier <strong>${courtierName || 'Non spécifié'}</strong> et nécessite votre validation.
        </p>
        
        <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #f26755; font-size: 18px;">Informations de l'artisan</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 40%;">Nom complet :</td>
              <td style="padding: 8px 0;">${artisanData.firstName} ${artisanData.lastName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email :</td>
              <td style="padding: 8px 0;">${artisanData.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Téléphone :</td>
              <td style="padding: 8px 0;">${artisanData.phone || 'Non renseigné'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Entreprise :</td>
              <td style="padding: 8px 0;">${artisanData.companyName || 'Non renseigné'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Spécialité :</td>
              <td style="padding: 8px 0;">${artisanData.specialty || 'Non renseigné'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Courtier :</td>
              <td style="padding: 8px 0;">${courtierName || 'Non spécifié'}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0; color: #856404;">
            <strong>📋 Documents soumis :</strong><br>
            ${artisanData.certificationUrl ? '✅ Certification professionnelle<br>' : '❌ Certification professionnelle manquante<br>'}
            ${artisanData.insuranceUrl ? '✅ Assurance responsabilité civile<br>' : '❌ Assurance responsabilité civile manquante<br>'}
            ${artisanData.fiscalUrl ? '✅ Attestation fiscale<br>' : '❌ Attestation fiscale manquante<br>'}
            ${artisanData.kbisUrl ? '✅ Extrait KBIS' : '❌ Extrait KBIS manquant'}
          </p>
        </div>
        
        <p style="margin-bottom: 20px;">
          Veuillez vous connecter à l'interface d'administration pour examiner le dossier et procéder à la validation ou au rejet.
        </p>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://aximotravo.com'}/admin/artisans" 
             style="background: linear-gradient(90deg, #f26755 0%, #f28c55 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Accéder à l'administration
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; margin: 0;">
          <em>Cet email a été envoyé automatiquement par le système Aximotravo.</em>
        </p>
      </div>
    </div>`;

    await sendEmail({
      to: adminEmail,
      subject,
      html,
      fromName: "Aximotravo - Notifications"
    });

    res.status(200).json({ success: true, message: "Notification envoyée à l'admin" });
  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification admin:", error);
    res.status(500).json({ 
      success: false, 
      error: (error as Error).message 
    });
  }
}
