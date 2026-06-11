"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

interface Notification {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    api
      .get("/api/notifications")
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setNotifications(data as Notification[]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function handleNotificationClick(id: string) {
    const notification = notifications.find((n) => n.id === id);
    if (!notification?.read) {
      api
        .put("/api/notifications/read", { id })
        .then(() => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
          );
        })
        .catch(() => {});
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div ref={containerRef} className="relative">
      <button
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full text-charcoal hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-terracotta text-white text-[10px] font-bold flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          aria-live="polite"
          className="absolute right-0 mt-2 w-80 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-stone-100">
            <p className="font-inter font-semibold text-sm text-charcoal">
              Notifications
            </p>
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-sm text-charcoal-light text-center">
              Aucune notification
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto divide-y divide-stone-100">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => handleNotificationClick(n.id)}
                  className={`px-4 py-3 text-sm cursor-pointer hover:bg-stone-50 transition-colors ${
                    n.read ? "opacity-60" : "bg-stone-50"
                  }`}
                >
                  <p className="font-medium text-charcoal capitalize">
                    {n.type.replace(/_/g, " ")}
                  </p>
                  {Boolean(n.payload.message) && (
                    <p className="text-charcoal-light mt-0.5 text-xs line-clamp-2">
                      {String(n.payload.message)}
                    </p>
                  )}
                  <p className="text-charcoal-light/60 text-xs mt-1">
                    {formatDate(n.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
