import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Calendar, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { fetchProjectEmails } from '@/lib/projectEmails';

interface AddEventDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEvent?: (event: any) => Promise<void>;
  loading?: boolean;
  projectId: string;
}

// Copie de la fonction d'envoi d'email depuis ProjectNoteForm
async function sendEventEmail({ to, subject, html }: { to: string[]; subject: string; html: string }) {
  await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html })
  });
}

export default function AddEventDrawer({ isOpen, onOpenChange, onAddEvent, loading, projectId }: AddEventDrawerProps) {
  const [eventForm, setEventForm] = useState({
    type: '',
    title: '',
    startDate: '',
    endDate: '',
    address: '',
    description: '',
    addToCalendar: false,
    notifications: {
      client: { email: '', selected: false },
      artisans: { email: '', selected: false },
      courtier: { email: '', selected: false },
      vendor: { email: '', selected: false }
    },
    emails: [] as string[],
  });
  const [additionalEmail, setAdditionalEmail] = useState('');
  const [projectEmails, setProjectEmails] = useState<any>(null);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [emailsError, setEmailsError] = useState<string|null>(null);

  // Charge dynamiquement les emails du projet à l'ouverture
  React.useEffect(() => {
    if (!isOpen || !projectId) return;
    setEmailsLoading(true);
    fetchProjectEmails(projectId)
      .then((emails) => {
        setProjectEmails(emails);
        setEventForm((prev) => ({
          ...prev,
          notifications: {
            client: { email: emails.client || '', selected: false },
            artisans: { email: (emails.artisans && emails.artisans.length > 0) ? emails.artisans.join(', ') : '', selected: false },
            courtier: { email: emails.courtier || '', selected: false },
            vendor: { email: emails.vendor || '', selected: false },
          }
        }));
        setEmailsLoading(false);
      })
      .catch((err) => {
        setEmailsError("Erreur lors du chargement des emails du projet");
        setEmailsLoading(false);
      });
  }, [isOpen, projectId]);
  const [error, setError] = useState<string|null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (!eventForm.type || !eventForm.title || !eventForm.startDate || !eventForm.endDate || !eventForm.address) {
        setError("Tous les champs obligatoires doivent être remplis.");
        setSubmitting(false);
        return;
      }
      // Construction de l'objet event pour Firestore
      const eventData = {
        // projectId injecté par le parent via closure ou context (voir ci-dessous)
        type: eventForm.type,
        name: eventForm.title,
        start: eventForm.startDate,
        end: eventForm.endDate,
        address: eventForm.address,
        typeColor: getTypeColor(eventForm.type),
        description: eventForm.description,
        // timestamp ajouté côté hook Firestore
      };
      if (onAddEvent) {
        await onAddEvent(eventData);
      }

      // --- Notification email ---
      // Récupère les emails cochés
      const checkedEmails: string[] = Object.values(eventForm.notifications)
        .filter((notif) => notif.selected && notif.email)
        .flatMap((notif) => notif.email.split(',').map(e => e.trim()).filter(Boolean));
      // Ajoute les emails additionnels saisis manuellement
      const additionalEmails: string[] = (eventForm.emails || []).filter(Boolean);
      const recipients = [...checkedEmails, ...additionalEmails];

      if (recipients.length > 0) {
        const now = new Date().toLocaleString();
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f26755; margin-bottom: 0.5em;">Nouvel événement ajouté au projet</h2>
            <div style="font-size: 1em; color: #333; margin-bottom: 1em;">
              <strong>Type :</strong> ${eventForm.type}<br/>
              <strong>Titre :</strong> ${eventForm.title}<br/>
              <strong>Date de début :</strong> ${eventForm.startDate}<br/>
              <strong>Date de fin :</strong> ${eventForm.endDate}<br/>
              <strong>Adresse :</strong> ${eventForm.address}<br/>
              <strong>Date de création :</strong> ${now}
            </div>
            <div style="margin-top: 1em;">${eventForm.description}</div>
          </div>
        `;
        try {
          await sendEventEmail({
            to: recipients,
            subject: eventForm.title || 'Nouvel événement de projet',
            html: htmlContent
          });
        } catch (emailErr) {
          // L'événement est créé même si l'email échoue
          console.error('Erreur lors de l\'envoi de l\'email de notification :', emailErr);
        }
      }
      onOpenChange(false);
    } catch (err: any) {
      setError("Erreur lors de l'ajout de l'événement.");
    } finally {
      setSubmitting(false);
    }
  };

  // Utilitaire pour la couleur du type
  function getTypeColor(type: string) {
    switch (type) {
      case 'sav': return 'bg-red-50 text-red-800 border-red-200';
      case 'visite': return 'bg-green-50 text-green-800 border-green-200';
      case 'demarrage': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'construction': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'livraison': return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'autre': return 'bg-gray-50 text-gray-800 border-gray-200';
      case 'releve_technique': return 'bg-purple-50 text-purple-800 border-purple-200';
      default: return '';
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto p-4 sm:p-6">
        <SheetHeader>
          <SheetTitle>Nouvel événement</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 mt-4 sm:mt-6 max-h-[80vh] overflow-y-auto pr-1">
          <div className="space-y-4">
            <div>
              <label htmlFor="event-type" className="block text-sm font-medium text-gray-700 mb-1">
                Type d&apos;événement
              </label>
              <select
                id="event-type"
                value={eventForm.type}
                onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#f26755] focus:border-[#f26755]"
                title="Type d'événement"
                aria-label="Sélectionner le type d'événement"
              >
                <option value="">Sélectionner...</option>
                <option value="sav">SAV</option>
                <option value="visite">Visite</option>
                <option value="demarrage">Démarrage</option>
                <option value="construction">Construction</option>
                <option value="livraison">Livraison</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 mb-1">
                Titre
              </label>
              <input
                id="event-title"
                type="text"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#f26755] focus:border-[#f26755]"
                aria-label="Titre de l'événement"
              />
            </div>

            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-emerald-700 mb-1">
                Date de début
              </label>
              <input
                id="start-date"
                type="datetime-local"
                value={eventForm.startDate}
                onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                className="w-full border border-emerald-200 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/30"
                aria-label="Date et heure de début de l'événement"
              />
            </div>

            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-rose-700 mb-1">
                Date de fin
              </label>
              <input
                id="end-date"
                type="datetime-local"
                value={eventForm.endDate}
                onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                className="w-full border border-rose-200 rounded-md px-3 py-2 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/30"
                aria-label="Date et heure de fin de l'événement"
              />
            </div>

            <div>
              <label htmlFor="event-address" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                id="event-address"
                type="text"
                value={eventForm.address}
                onChange={(e) => setEventForm({ ...eventForm, address: e.target.value })}
                placeholder="Adresse du client"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#f26755] focus:border-[#f26755]"
                aria-label="Adresse de l&apos;événement"
              />
            </div>

            <div>
              <label htmlFor="event-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="event-description"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#f26755] focus:border-[#f26755]"
                aria-label="Description de l&apos;événement"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="addToCalendar"
                checked={eventForm.addToCalendar}
                onChange={(e) => setEventForm({ ...eventForm, addToCalendar: e.target.checked })}
                className="rounded border-gray-300 text-[#f26755] focus:ring-[#f26755]"
              />
              <label htmlFor="addToCalendar" className="text-sm text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                Ajouter cet événement à mon google calendar
              </label>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-4 w-4 text-gray-500" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-700">
                  Envoyer cet événement par mail
                </span>
              </div>
              
              <div className="space-y-3">
                {emailsLoading && (
                  <div className="text-sm text-gray-500">Chargement des emails du projet...</div>
                )}
                {emailsError && (
                  <div className="text-sm text-red-500">{emailsError}</div>
                )}
                {!emailsLoading && !emailsError && Object.entries(eventForm.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <input
                      id={`notification-${key}`}
                      type="checkbox"
                      checked={value.selected}
                      onChange={(e) => setEventForm({
                        ...eventForm,
                        notifications: {
                          ...eventForm.notifications,
                          [key]: { ...value, selected: e.target.checked }
                        }
                      })}
                      className="rounded border-gray-300 text-[#f26755] focus:ring-[#f26755]"
                      title={`Notifier ${key.replace(/([A-Z])/g, ' $1').trim()}`}
                      aria-label={`Notifier ${key.replace(/([A-Z])/g, ' $1').trim()} par email`}
                    />
                    <label htmlFor={`notification-${key}`} className="flex-1">
                      <span className="text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        - {key === 'artisans' && value.email ? value.email.split(',').map((mail, i) => (
                          <span key={i}>{mail.trim()}{i < value.email.split(',').length - 1 ? ', ' : ''}</span>
                        )) : value.email}
                      </span>
                    </label>
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <input
                    type="email"
                    id="additional-email"
                    placeholder="Ajouter un email"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#f26755] focus:border-[#f26755]"
                    aria-label="Adresse email additionnelle"
                    value={additionalEmail}
                    onChange={e => setAdditionalEmail(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (additionalEmail && !eventForm.emails.includes(additionalEmail)) {
                          setEventForm(prev => ({ ...prev, emails: [...prev.emails, additionalEmail] }));
                          setAdditionalEmail('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
                    aria-label="Ajouter cette adresse email"
                    title="Ajouter cette adresse email"
                    onClick={() => {
                      if (additionalEmail && !eventForm.emails.includes(additionalEmail)) {
                        setEventForm(prev => ({ ...prev, emails: [...prev.emails, additionalEmail] }));
                        setAdditionalEmail('');
                      }
                    }}
                  >
                    Ajouter un email
                  </button>
                </div>
                {eventForm.emails && eventForm.emails.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {eventForm.emails.map((email, idx) => (
                      <span key={email} className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center">
                        {email}
                        <button
                          type="button"
                          className="ml-1 text-red-500 hover:text-red-700"
                          aria-label={`Supprimer ${email}`}
                          title={`Supprimer ${email}`}
                          onClick={() => setEventForm(prev => ({ ...prev, emails: prev.emails.filter((e: string) => e !== email) }))}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm pb-2">{error}</div>
          )}
          <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-[#f26755] text-white rounded-md text-sm font-medium hover:bg-[#f26755]/90 transition-colors disabled:opacity-60"
                aria-label="Enregistrer l'événement"
                title="Enregistrer l'événement"
                disabled={loading || submitting}
              >
                {loading || submitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}