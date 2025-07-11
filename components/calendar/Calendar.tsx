"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import CalendarEvent from "./CalendarEvent";

import { typeColors } from "./typeColors";

interface CalendarProps {
  events?: Event[];
}

export interface Event {
  id: string;
  title: string;
  client: string;
  startDate: string;
  endDate: string;
  type: "livraison" | "chantier" | "visite" | "autre";
  color?: string;
}

export default function Calendar({ events = [] }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"mois" | "semaine" | "jour">("mois");
  // Pour la modal de détail
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<Event[]>([]);

  const navigate = {
    previous: () => {
      switch (view) {
        case "mois":
          setCurrentDate(subMonths(currentDate, 1));
          break;
        case "semaine":
          setCurrentDate(subWeeks(currentDate, 1));
          break;
        case "jour":
          setCurrentDate(subDays(currentDate, 1));
          break;
      }
    },
    next: () => {
      switch (view) {
        case "mois":
          setCurrentDate(addMonths(currentDate, 1));
          break;
        case "semaine":
          setCurrentDate(addWeeks(currentDate, 1));
          break;
        case "jour":
          setCurrentDate(addDays(currentDate, 1));
          break;
      }
    }
  };

  const getDays = () => {
    switch (view) {
      case "mois": {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
      }
      case "semaine": {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: weekStart, end: weekEnd });
      }
      case "jour":
        return [currentDate];
    }
  };

  const days = getDays();
  const formattedDate = format(currentDate, view === "jour" ? "d MMMM yyyy" : "MMMM yyyy", { locale: fr });
  const today = new Date();

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={navigate.previous}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <span className="text-gray-900 font-medium uppercase">{formattedDate}</span>
            <button
              onClick={navigate.next}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="relative inline-flex items-center bg-gray-100 rounded-xl px-2 py-1 shadow-inner">
            {/* Icône de la vue sélectionnée */}
            {view === "mois" && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="5" width="18" height="16" rx="2" strokeWidth="2" /><line x1="3" y1="9" x2="21" y2="9" strokeWidth="2" /></svg>
            )}
            {view === "semaine" && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="5" width="18" height="16" rx="2" strokeWidth="2" /><line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" /></svg>
            )}
            {view === "jour" && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="5" width="18" height="16" rx="2" strokeWidth="2" /><line x1="12" y1="5" x2="12" y2="21" strokeWidth="2" /></svg>
            )}
            <select
              value={view}
              onChange={e => setView(e.target.value as "mois" | "semaine" | "jour")}
              className="appearance-none bg-transparent pl-1 pr-6 py-1 text-sm font-medium text-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
              style={{ minWidth: 90 }}
              aria-label="Changer la vue du calendrier"
            >
              <option value="mois">Mois</option>
              <option value="semaine">Semaine</option>
              <option value="jour">Jour</option>
            </select>
            {/* Chevron down */}
            <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-200">
        {["lun", "mar", "mer", "jeu", "ven", "sam", "dim"].map((day) => (
          <div key={day} className="py-2 text-center text-sm text-gray-500 border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-7">
        {days.map((day, dayIdx) => {
          const dayEvents = events.filter(event => {
            const eventStart = parseISO(event.startDate);
            const eventEnd = parseISO(event.endDate);
            return isSameDay(day, eventStart) || (eventStart <= day && eventEnd >= day);
          });

          return (
            <div
              key={day.toString()}
              className={cn(
                "border-r border-b p-1 min-h-[100px] cursor-pointer transition hover:bg-blue-100",
                dayIdx % 7 === 6 && "border-r-0",
                !isSameMonth(day, currentDate) && "bg-gray-50",
                isSameDay(day, today) && "bg-blue-50"
              )}
              onClick={() => {
                setSelectedDay(day);
                setSelectedDayEvents(dayEvents);
                setShowModal(true);
              }}
            >
              <div className={cn(
                "text-right text-sm font-medium mb-1",
                !isSameMonth(day, currentDate) && "text-gray-400",
                isSameDay(day, today) && "text-blue-600"
              )}>
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <CalendarEvent key={event.id} event={event} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Modal pour afficher les événements d'une journée */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-4 relative animate-fade-in">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
                onClick={() => setShowModal(false)}
                aria-label="Fermer"
              >
                ×
              </button>
              <div className="mb-3 text-center">
                <div className="text-lg font-semibold">
                  {selectedDay ? format(selectedDay, "EEEE d MMMM yyyy", { locale: fr }) : ""}
                </div>
                <div className="text-sm text-gray-500">{selectedDayEvents?.length || 0} événement(s)</div>
              </div>
              <div className={cn("space-y-3", selectedDayEvents && selectedDayEvents.length > 5 && "max-h-64 overflow-y-auto")}>
                {selectedDayEvents && selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map(event => (
                    <div
                      key={event.id}
                      className={cn(
                        "p-2 rounded border",
                        typeColors[event.type]?.bg || typeColors.autre.bg,
                        typeColors[event.type]?.border || typeColors.autre.border
                      )}
                    >
                      <div className={cn("font-medium", typeColors[event.type]?.text || typeColors.autre.text)}>{event.title}</div>
                      <div className="text-xs text-gray-600 mb-1">{event.client}</div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="inline-block px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                          {format(parseISO(event.startDate), "HH'h'mm", { locale: fr })}
                          {event.endDate &&
                            ` - ${format(parseISO(event.endDate), "HH'h'mm", { locale: fr })}`}
                        </span>
                        <span
                          className={cn(
                            "inline-block px-2 py-0.5 rounded text-xs",
                            typeColors[event.type]?.bg || typeColors.autre.bg,
                            typeColors[event.type]?.text || typeColors.autre.text
                          )}
                        >
                          {event.type}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400">Aucun événement</div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}