"use client";
import { useParams } from "next/navigation";
import Image from "next/image";
import { usePayments } from "@/hooks/payments";
import PaymentModal from "@/components/PaymentModal";
import { useState } from "react";

export default function ProjectPaymentsPage() {
  const params = useParams();
  // Correction robustesse : params peut être null ou ne pas contenir id
    let projectId = "";
    if (params && "id" in params && params.id) {
      projectId = Array.isArray(params.id) ? params.id[0] : params.id;
    }
    const { payments, loading, error } = usePayments(projectId);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<import("@/hooks/payments").ProjectPayment | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <PaymentModal open={modalOpen} onClose={() => setModalOpen(false)} payment={selectedPayment} />
      <div className="flex items-center justify-between mb-8">
        <button
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#dd7109] to-amber-500 text-white rounded-lg font-semibold shadow hover:opacity-90 transition"
          onClick={() => window.history.back()}
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Retour
        </button>
        <h2 className="text-lg font-semibold text-gray-900">Acomptes</h2>
      </div>
      <div className="flex flex-col gap-8">
        {loading && (
          <div className="text-center text-gray-400 py-12">Chargement des acomptes...</div>
        )}
        {error && (
          <div className="text-center text-red-500 py-12">{error}</div>
        )}
        {!loading && !error && payments.length === 0 && (
          <div className="text-center text-gray-400 py-12">Aucune demande d&apos;acompte pour ce projet</div>
        )}
        {payments.length > 0 && payments.filter((payment) => payment.status === "en_attente").map(payment => (
          <div key={payment.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-semibold text-base text-gray-900">{payment.title}</span>
                {payment.status === "validé" ? (
                  <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700 font-medium">Validé</span>
                ) : (
                  <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-yellow-50 text-yellow-700 font-medium">En attente</span>
                )}
              </div>
              <div className="text-xs text-gray-500 mb-0.5">{payment.date}</div>
              <div className="text-sm text-gray-700 mb-3">{payment.description}</div>
              <div className="flex gap-3 flex-wrap">
                {payment.images.map((img, idx) => (
                  <div key={idx} className="w-40 h-28 rounded-lg overflow-hidden border border-gray-100 bg-gray-100">
                    <Image src={img} alt="photo acompte" width={160} height={112} className="object-cover w-full h-full" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-4 mt-4 md:mt-0 md:ml-8 min-w-[160px]">
              <div className="text-2xl font-bold text-gray-900 whitespace-nowrap">{payment.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</div>
              {payment.status === "en_attente" && (
                <button
                  className="px-4 py-2 bg-[#dd7109] text-white rounded-lg font-semibold shadow hover:opacity-90 transition"
                  onClick={() => { setSelectedPayment(payment); setModalOpen(true); }}
                >
                  Payer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
