// Centralisation des couleurs par type d'événement calendrier
export const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  livraison: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
  chantier: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
  visite: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
  autre: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" },
};
