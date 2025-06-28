"use client";

import { cn } from "@/lib/utils";
import { Event } from "./Calendar";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface CalendarEventProps {
  event: Event;
}

import { typeColors } from "./typeColors";

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