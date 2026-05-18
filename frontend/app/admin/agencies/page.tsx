"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Agency {
  id: string;
  name: string;
  city: string;
  address: string;
}

export default function AdminAgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/api/admin/agencies")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setAgencies)
      .catch(() => setError("Impossible de charger les agences."))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name || !city || !address) {
      setFormError("Tous les champs sont requis.");
      return;
    }
    setCreating(true);
    try {
      const res = await api.post("/api/admin/agencies", { name, city, address });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setAgencies((prev) => [...prev, created]);
      setName("");
      setCity("");
      setAddress("");
      setShowForm(false);
    } catch {
      setFormError("Erreur lors de la création de l'agence.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-playfair text-2xl font-bold text-charcoal">
          Agences
        </h1>
        <Button variant="primary" size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Annuler" : "Nouvelle agence"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-stone-100 rounded-xl shadow-sm p-6 mb-6 space-y-4"
        >
          <h2 className="font-semibold text-charcoal text-base">
            Créer une agence
          </h2>
          {formError && (
            <p className="text-red-600 text-sm">{formError}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ymmo Paris"
              required
            />
            <Input
              label="Ville"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Paris"
              required
            />
            <Input
              label="Adresse"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="12 Rue de Rivoli"
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={creating}>
              Créer
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-charcoal-light text-sm">Chargement…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agencies.map((agency) => (
            <div
              key={agency.id}
              className="bg-white rounded-xl border border-stone-100 shadow-sm p-5"
            >
              <p className="font-semibold text-charcoal mb-1">{agency.name}</p>
              <p className="text-sm text-charcoal-light">{agency.city}</p>
              <p className="text-xs text-charcoal-light mt-1">{agency.address}</p>
            </div>
          ))}
          {agencies.length === 0 && (
            <p className="text-charcoal-light text-sm col-span-full text-center py-8">
              Aucune agence.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
