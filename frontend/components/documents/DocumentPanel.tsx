"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SignModal from "./SignModal";

interface DocumentItem {
  id: string;
  transaction_id: string;
  file_url: string;
  uploaded_by: string;
  signed_at: string | null;
  signed_by: string | null;
}

interface DocumentPanelProps {
  transactionId: string;
}

function getFileName(url: string): string {
  return url.split("/").pop() ?? url;
}

export default function DocumentPanel({ transactionId }: DocumentPanelProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingDocId, setSigningDocId] = useState<string | null>(null);
  const [signingFileName, setSigningFileName] = useState("");

  async function loadDocuments() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/transactions/${transactionId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDocuments(data.documents ?? []);
    } catch {
      setError("Impossible de charger les documents.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, [transactionId]);

  function openSign(doc: DocumentItem) {
    setSigningDocId(doc.id);
    setSigningFileName(getFileName(doc.file_url));
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-stone-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div>
      <h2 className="font-playfair text-lg font-semibold text-charcoal mb-3">
        Documents
      </h2>

      {documents.length === 0 ? (
        <p className="text-sm text-charcoal-light">
          Aucun document disponible.
        </p>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => {
            const isSigned = !!doc.signed_at;
            const fileName = getFileName(doc.file_url);
            return (
              <li
                key={doc.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-stone-50 border border-stone-100"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <svg
                    className="w-4 h-4 shrink-0 text-charcoal-light"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm text-charcoal truncate">{fileName}</span>
                </div>

                {isSigned ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Signé
                  </span>
                ) : (
                  <button
                    onClick={() => openSign(doc)}
                    className="text-xs font-medium text-terracotta border border-terracotta/30 rounded-full px-3 py-0.5 hover:bg-terracotta/5 transition-colors shrink-0"
                  >
                    Signer
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {signingDocId && (
        <SignModal
          documentId={signingDocId}
          fileName={signingFileName}
          open={!!signingDocId}
          onClose={() => setSigningDocId(null)}
          onSuccess={loadDocuments}
        />
      )}
    </div>
  );
}
