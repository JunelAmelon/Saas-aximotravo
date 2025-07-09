"use client";
import React, { useEffect, useState } from "react";
import { useRevolutTransactions } from "@/hooks/useRevolutTransactions";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ProjectPayment, updatePaymentStatus } from "@/hooks/useProjectPayments";

interface Validation {
    montant: number;
    devise: string;
    dateVirement: string;
    reference: string;
    banque: string | null;
    updatedAt: string;
}

export default function TransactionsAdminPage() {
    // ...
    const [loadingValidatingId, setLoadingValidatingId] = useState<string | null>(null);
    // ...
    // Liste des transactions Revolut
    const { transactions, loading: loadingTx, error: errorTx, refetch } = useRevolutTransactions();

    // Liste des paiements Firestore
    const [payments, setPayments] = useState<ProjectPayment[]>([]);
    const [loadingPayments, setLoadingPayments] = useState(false);
    const [errorPayments, setErrorPayments] = useState<string | null>(null);

    // Extraction de la logique de rechargement des paiements
    const reloadPayments = async () => {
        setLoadingPayments(true);
        setErrorPayments(null);
        try {
            const q = query(collection(db, "payments"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as ProjectPayment[];
            setPayments(data);
        } catch (err: any) {
            setErrorPayments(err.message);
        } finally {
            setLoadingPayments(false);
        }
    };

    useEffect(() => {
        reloadPayments();
    }, []);

    // Onglet actif : 0 = Transactions Revolut, 1 = Paiements
    const [activeTab, setActiveTab] = useState(0);

    // Badge de statut inspiré de ModernDevisSection
    const StatusBadge = ({ status }: { status: string }) => {
        const config = status === "validé"
            ? { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Validé" }
            : { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", label: "En attente" };
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8">Transactions & Paiements</h1>
            {/* Onglets */}
            <div className="flex gap-2 mb-8 border-b border-gray-200">
                <button
                    className={`px-5 py-2.5 font-medium rounded-t-lg transition-all ${activeTab === 0 ? "bg-white border-x border-t border-gray-200 -mb-px text-[#f26755]" : "text-gray-500 hover:text-[#f26755]"}`}
                    onClick={() => setActiveTab(0)}
                >
                    Transactions Revolut
                </button>
                <button
                    className={`px-5 py-2.5 font-medium rounded-t-lg transition-all ${activeTab === 1 ? "bg-white border-x border-t border-gray-200 -mb-px text-[#f26755]" : "text-gray-500 hover:text-[#f26755]"}`}
                    onClick={() => setActiveTab(1)}
                >
                    Paiements
                </button>
            </div>

            {/* Tableau Transactions Revolut */}
            {activeTab === 0 && (
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">État</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Montant</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Devise</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Référence</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions && transactions.length > 0 ? (
                                transactions.map((tx: any) => {
                                    const leg = tx.legs?.[0];
                                    return (
                                        <tr key={tx.id} className="border-t hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">{tx.type}</td>
                                            <td className="px-6 py-4 capitalize">{tx.state}</td>
                                            <td className="px-6 py-4">{tx.updated_at ? new Date(tx.updated_at).toLocaleString("fr-FR") : "-"}</td>
                                            <td className="px-6 py-4">{leg?.amount ?? "-"}</td>
                                            <td className="px-6 py-4">{leg?.currency ?? "-"}</td>
                                            <td className="px-6 py-4">{leg?.description ?? "-"}</td>
                                            <td className="px-6 py-4">{tx.reference ?? "-"}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-gray-400">Aucune transaction trouvée</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tableau Paiements */}
            {activeTab === 1 && (
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Titre</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Montant</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Validation</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments && payments.length > 0 ? (
                                payments.filter((pay) => pay.status === "en_attente").map((pay) => (
                                    <tr key={pay.id} className="border-t hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{pay.title}</td>
                                        <td className="px-6 py-4">{pay.amount} €</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={pay.status} />
                                        </td>
                                        <td className="px-6 py-4">{pay.date ? new Date(pay.date).toLocaleDateString() : '-'}</td>
                                        <td className="px-6 py-4">
                                            {pay.validation ? (
                                                <div className="space-y-1">
                                                    <div><span className="font-semibold">Montant :</span> {pay.validation.montant} {pay.validation.devise}</div>
                                                    <div><span className="font-semibold">Date :</span> {pay.validation.dateVirement}</div>
                                                    <div><span className="font-semibold">Réf :</span> {pay.validation.reference}</div>
                                                    <div><span className="font-semibold">Banque :</span> {pay.validation.banque || '-'} </div>
                                                    <div><span className="font-semibold">Maj :</span> {pay.validation.updatedAt ? new Date(pay.validation.updatedAt).toLocaleString() : '-'} </div>
                                                </div>
                                            ) : (
                                                <span className="italic text-gray-400">Non validé</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {pay.status === "en_attente" && pay.validation ? (
                                                <button
                                                    className={
                                                        "bg-[#f26755] hover:bg-[#e55a4a] text-white font-semibold px-4 py-2 rounded transition flex items-center justify-center" +
                                                        (loadingValidatingId === pay.id ? " opacity-60 cursor-not-allowed" : "")
                                                    }
                                                    disabled={loadingValidatingId === pay.id}
                                                    onClick={async () => {
                                                        setLoadingValidatingId(pay.id);
                                                        await updatePaymentStatus(pay.id, "validé");
                                                        await reloadPayments();
                                                        setLoadingValidatingId(null);
                                                    }}
                                                >
                                                    {loadingValidatingId === pay.id ? (
                                                        <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                                    ) : null}
                                                    Valider
                                                </button>
                                            ) : (
                                                <span className="italic text-gray-400"></span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-gray-400">Aucun paiement trouvé</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
