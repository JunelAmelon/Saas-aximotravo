import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Calendar, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AddEventDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddEventDrawer({ isOpen, onOpenChange }: AddEventDrawerProps) {
  const [eventForm, setEventForm] = useState({
    type: '',
    title: '',
    startDate: '',
    endDate: '',
    address: '',
    description: '',
    addToCalendar: false,
    notifications: {
      client: { email: 'decouverte@test.fr', selected: false },
      artisan: { email: 'artisan-pro@placemaker.fr', selected: false },
      pilotRef: { email: 'edipe@placemaker.fr', selected: false },
      pilote: { email: 'pilote@placemaker.fr', selected: false },
      vendorRef: { email: 'pose.biganos@test.fr', selected: false }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Event form submitted:', eventForm);
    onOpenChange(false);
  };

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
                {Object.entries(eventForm.notifications).map(([key, value]) => (
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
                        - {value.email}
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
                  />
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
                    aria-label="Ajouter cette adresse email"
                    title="Ajouter cette adresse email"
                  >
                    Ajouter un email
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-[#f26755] text-white rounded-md text-sm font-medium hover:bg-[#f26755]/90 transition-colors"
                aria-label="Enregistrer l'événement"
                title="Enregistrer l'événement"
              >
                Enregistrer
              </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}