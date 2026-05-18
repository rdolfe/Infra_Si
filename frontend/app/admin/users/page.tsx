"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  agency_id: string | null;
  created_at: string;
}

const ROLES = ["visitor", "client", "agent", "admin"];

const ROLE_VARIANT: Record<string, "default" | "success" | "warning" | "error" | "info"> = {
  admin: "error",
  agent: "warning",
  client: "info",
  visitor: "default",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/api/admin/users")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setUsers)
      .catch(() => setError("Impossible de charger les utilisateurs."))
      .finally(() => setLoading(false));
  }, []);

  async function saveRole(userId: string) {
    setSaving(true);
    try {
      const res = await api.put(`/api/admin/users/${userId}`, { role: editRole });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      setEditingId(null);
    } catch {
      setError("Erreur lors de la mise à jour du rôle.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="font-playfair text-2xl font-bold text-charcoal mb-6">
        Utilisateurs
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-charcoal-light text-sm">Chargement…</p>
      ) : (
        <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-light uppercase tracking-wide">
                  Nom
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-light uppercase tracking-wide">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-light uppercase tracking-wide">
                  Rôle
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-light uppercase tracking-wide">
                  Inscrit le
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-charcoal">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 text-charcoal-light">{user.email}</td>
                  <td className="px-4 py-3">
                    {editingId === user.id ? (
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="rounded-md border border-stone-200 px-2 py-1 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Badge
                        label={user.role}
                        variant={ROLE_VARIANT[user.role] ?? "default"}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 text-charcoal-light text-xs">
                    {new Date(user.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingId === user.id ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => saveRole(user.id)}
                          disabled={saving}
                          className="text-xs font-medium text-white bg-terracotta hover:bg-terracotta-dark px-3 py-1.5 rounded-md disabled:opacity-50 transition-colors"
                        >
                          Enregistrer
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs font-medium text-charcoal-light hover:text-charcoal px-3 py-1.5 rounded-md transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(user.id);
                          setEditRole(user.role);
                        }}
                        className="text-xs font-medium text-terracotta hover:underline"
                      >
                        Modifier rôle
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="text-center text-sm text-charcoal-light py-8">
              Aucun utilisateur.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
