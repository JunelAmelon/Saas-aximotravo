"use client";
import StatCard from "@/components/dashboard/StatCard";
// Icônes Lucide (si elles ne sont pas déjà importées dans la page principale)
import { Wallet, Clock, CheckCircle } from "lucide-react";
import React from "react";

interface StatCardsBlockProps {
  stats: {
    totalBalance: number;
    last30Days: number;
    pendingTransactions: number;
    completedProjects: number;
  };
}

export default function StatCardsBlock({ stats }: StatCardsBlockProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Solde Total"
        value={stats.totalBalance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        icon={<Wallet className="h-5 w-5 text-[#f26755]" />}
      />
      <StatCard
        title="30 derniers jours"
        value={stats.last30Days.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        icon={<Wallet className="h-5 w-5 text-blue-500" />}
      />
      <StatCard
        title="Transactions en attente"
        value={stats.pendingTransactions.toString()}
        icon={<Clock className="h-5 w-5 text-amber-500" />}
      />
      <StatCard
        title="Projets financés"
        value={stats.completedProjects.toString()}
        icon={<CheckCircle className="h-5 w-5 text-green-500" />}
      />
    </div>
  );
}
