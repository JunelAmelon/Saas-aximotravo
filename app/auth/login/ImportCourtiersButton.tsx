"use client";
import { useState } from "react";

export default function ImportCourtiersButton() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setStatus(null);
    try {
      const tsv = await file.text();
      const res = await fetch("/api/import-courtiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tsv }),
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(`Import réussi (${data.count} courtiers)`);
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus(data.error ? `Erreur: ${data.error}` : "Erreur lors de l'import");
      }
    } catch (err: any) {
      setStatus("Erreur réseau ou serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 24, fontSize: 13 }}>
      <label style={{ color: '#dd7109', cursor: 'pointer', fontWeight: 500 }}>
        <input
          type="file"
          accept=".tsv"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          disabled={loading}
        />
        Importer des courtiers (.tsv)
      </label>
      {loading && <span style={{ marginLeft: 8, color: '#888' }}>Import en cours…</span>}
      {status && <div style={{ marginTop: 6, color: status.startsWith('Import réussi') ? 'green' : 'red' }}>{status}</div>}
    </div>
  );
}
