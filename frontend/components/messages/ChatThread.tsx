"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";

interface Message {
  id: string;
  offer_id: string | null;
  property_id: string | null;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ChatThreadProps {
  offerId: string;
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(new Date(iso));
}

export default function ChatThread({ offerId }: ChatThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);
  const currentUser = auth.getUser();

  const loadMessages = useCallback(async () => {
    try {
      const res = await api.get(`/api/messages?offer_id=${offerId}`);
      if (!res.ok) throw new Error();
      const data: Message[] = await res.json();
      setMessages((prev) => (data.length === prev.length ? prev : data));
    } catch {
      setError("Impossible de charger les messages.");
    } finally {
      setLoading(false);
    }
  }, [offerId]);

  useEffect(() => {
    loadMessages();

    const interval = setInterval(() => {
      if (!sendingRef.current) loadMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSending(true);
    sendingRef.current = true;
    try {
      const res = await api.post("/api/messages", {
        offer_id: offerId,
        content: draft.trim(),
      });
      if (!res.ok) throw new Error();
      const newMsg: Message = await res.json();
      setMessages((prev) => [...prev, newMsg]);
      setDraft("");
    } catch {
      setError("Impossible d'envoyer le message.");
    } finally {
      setSending(false);
      sendingRef.current = false;
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <h2 className="font-playfair text-lg font-semibold text-charcoal mb-3">
        Messages
      </h2>

      {error && (
        <p className="text-xs text-red-600 mb-2">{error}</p>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 rounded-xl bg-stone-100 animate-pulse"
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-charcoal-light text-center py-6">
            Aucun message pour le moment.
          </p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === currentUser?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    isOwn
                      ? "bg-terracotta text-white rounded-br-sm"
                      : "bg-stone-100 text-charcoal rounded-bl-sm"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? "text-white/70" : "text-charcoal-light"
                    }`}
                  >
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Écrire un message…"
          disabled={sending}
          className="flex-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-charcoal placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
          aria-label="Contenu du message"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="px-4 py-2 rounded-lg bg-terracotta text-white text-sm font-medium hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
        >
          {sending ? "…" : "Envoyer"}
        </button>
      </form>
    </div>
  );
}
