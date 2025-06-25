import { ShieldCheck } from "lucide-react";

export function BadgeAmo() {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-semibold shadow-md border border-white transition-all duration-200 animate-fade-in hover:bg-orange-600 hover:shadow-lg hover:-translate-y-0.5"
      style={{
        boxShadow: '0 2px 8px 0 rgba(242, 103, 85, 0.15)',
        borderWidth: 2,
      }}
    >
      <ShieldCheck className="w-3 h-3" />
      AMO
    </span>
  );
}

// Ajoute cette animation dans ton CSS global si elle n’existe pas :
// .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.39, 0.575, 0.565, 1) both; }
// @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
