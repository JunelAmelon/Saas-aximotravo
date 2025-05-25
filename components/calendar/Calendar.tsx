"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import CalendarEvent from "./CalendarEvent";

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

          <div className="flex bg-teal-600 rounded-md overflow-hidden">
            <button
              onClick={() => setView("mois")}
              className={cn(
                "px-4 py-1.5 text-sm font-medium transition-colors",
                view === "mois" ? "bg-teal-700 text-white" : "text-white hover:bg-teal-700"
              )}
            >
              mois
            </button>
            <button
              onClick={() => setView("semaine")}
              className={cn(
                "px-4 py-1.5 text-sm font-medium transition-colors",
                view === "semaine" ? "bg-teal-700 text-white" : "text-white hover:bg-teal-700"
              )}
            >
              semaine
            </button>
            <button
              onClick={() => setView("jour")}
              className={cn(
                "px-4 py-1.5 text-sm font-medium transition-colors",
                view === "jour" ? "bg-teal-700 text-white" : "text-white hover:bg-teal-700"
              )}
            >
              jour
            </button>
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
                "border-r border-b p-1 min-h-[100px]",
                dayIdx % 7 === 6 && "border-r-0",
                !isSameMonth(day, currentDate) && "bg-gray-50",
                isSameDay(day, today) && "bg-blue-50"
              )}
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
      </div>
    </div>
  );
}