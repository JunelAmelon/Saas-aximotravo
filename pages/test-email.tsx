import React, { useState } from "react";

export default function TestEmail() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, html }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("E-mail envoyé avec succès !");
      } else {
        setError(data.error || "Erreur inconnue");
      }
    } catch (err: any) {
      setError(err.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Test d'envoi d'e-mail</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Destinataire</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={to}
            onChange={e => setTo(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sujet</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contenu HTML</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={html}
            onChange={e => setHtml(e.target.value)}
            rows={5}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
          disabled={loading}
        >
          {loading ? "Envoi en cours..." : "Envoyer"}
        </button>
      </form>
      {success && <div className="mt-4 text-green-600">{success}</div>}
      {error && <div className="mt-4 text-red-600">{error}</div>}
    </div>
  );
}
