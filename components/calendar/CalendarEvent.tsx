"use client";

import { cn } from "@/lib/utils";
import { Event } from "./Calendar";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface CalendarEventProps {
  event: Event;
}

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  livraison: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
  chantier: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
  visite: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
  autre: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" },
};

export default function CalendarEvent({ event }: CalendarEventProps) {
  const { title, client, type, startDate } = event;
  const typeStyle = typeColors[type] || typeColors.autre;
  
  const startTime = format(parseISO(startDate), "HH'h'mm", { locale: fr });

  return (
    <div
      className={cn(
        "text-xs p-1 rounded border cursor-pointer transition-all hover:opacity-90",
        typeStyle.bg,
        typeStyle.text,
        typeStyle.border
      )}
    >
      <div className="font-medium truncate">{startTime} - {title}</div>
      <div className="truncate text-xs opacity-80">{client}</div>
    </div>
  );
}