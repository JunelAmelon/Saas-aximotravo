"use client";
import Image from "next/image";
import { useParams } from "next/navigation";
import { usePlans } from "@/hooks/plans";

export default function ProjectPlansPage() {
  const params = useParams();
  // Correction robustesse : params peut être null ou ne pas contenir id
    let projectId = "";
    if (params && "id" in params && params.id) {
      projectId = Array.isArray(params.id) ? params.id[0] : params.id;
    }
    const { plans, loading, error } = usePlans(projectId);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#dd7109] to-amber-500 text-white rounded-lg font-semibold shadow hover:opacity-90 transition"
          onClick={() => window.history.back()}
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Retour
        </button>
        <h2 className="text-lg font-semibold text-gray-900">Plans du projet</h2>
      </div>
      <div className="space-y-8">
        {loading && (
          <div className="text-center text-gray-400 py-12">Chargement des plans...</div>
        )}
        {error && (
          <div className="text-center text-red-500 py-12">{error}</div>
        )}
        {!loading && !error && plans.length === 0 && (
          <div className="text-center text-gray-400 py-12">Aucun plan disponible actuellement</div>
        )}
        {plans.map(plan => (
          <div key={plan.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-semibold text-gray-800 text-base">{plan.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">déposé par {plan.author} le {plan.date}</div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">Plan validé pour exécution</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.images.map((img, idx) => (
                <div key={idx} className="relative overflow-hidden rounded-lg border">
                  <Image
                    src={img}
                    alt={plan.title + " " + (idx + 1)}
                    width={600}
                    height={340}
                    className="object-cover w-full h-56 md:h-72"
                  />
                  <span className="absolute left-2 bottom-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded">{plan.title}{plan.images.length > 1 ? (idx === 0 ? " existant" : " exécution") : ""}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
