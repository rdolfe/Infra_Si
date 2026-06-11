"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";

const PROPERTY_TYPES = [
  { value: "apartment", label: "Appartement" },
  { value: "house", label: "Maison" },
  { value: "villa", label: "Villa" },
  { value: "studio", label: "Studio" },
  { value: "office", label: "Bureau" },
  { value: "retail", label: "Commerce" },
  { value: "warehouse", label: "Entrepôt" },
];

const PROPERTY_CATEGORIES = [
  { value: "residential", label: "Résidentiel" },
  { value: "professional", label: "Professionnel" },
];

const DPE_RATINGS = ["A", "B", "C", "D", "E", "F", "G"];

const STEPS = ["Informations", "Localisation", "Détails", "Photos"];

interface FormState {
  title: string;
  description: string;
  type: string;
  category: string;
  price: string;
  surface: string;
  rooms: string;
  dpe_rating: string;
  address: string;
  lat: string;
  lng: string;
  floor: string;
  parking: boolean;
  cellar: boolean;
  garden: boolean;
  coup_de_coeur: boolean;
}

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState | null>(null);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [geocoding, setGeocoding] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const user = auth.getUser();

  useEffect(() => {
    api
      .get(`/api/properties/${propertyId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((p) => {
        setForm({
          title: p.title ?? "",
          description: p.description ?? "",
          type: p.type ?? "apartment",
          category: p.category ?? "residential",
          price: String(p.price ?? ""),
          surface: String(p.surface ?? ""),
          rooms: String(p.rooms ?? ""),
          dpe_rating: p.dpe_rating ?? "",
          address: p.address ?? "",
          lat: p.lat != null ? String(p.lat) : "",
          lng: p.lng != null ? String(p.lng) : "",
          floor: p.floor != null ? String(p.floor) : "",
          parking: p.parking ?? false,
          cellar: p.cellar ?? false,
          garden: p.garden ?? false,
          coup_de_coeur: p.coup_de_coeur ?? false,
        });
      })
      .catch(() => setSubmitError("Impossible de charger le bien."))
      .finally(() => setLoading(false));
  }, [propertyId]);

  function set(field: keyof FormState, value: string | boolean) {
    setForm((f) => f ? { ...f, [field]: value } : f);
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validateStep(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (step === 0) {
      if (!form?.title?.trim()) e.title = "Titre requis";
      if (!form?.description?.trim()) e.description = "Description requise";
      if (!form?.price || isNaN(+form.price) || +form.price <= 0) e.price = "Prix invalide";
      if (!form?.surface || isNaN(+form.surface) || +form.surface <= 0) e.surface = "Surface invalide";
      if (!form?.rooms || isNaN(+form.rooms) || +form.rooms < 1) e.rooms = "Nombre de pièces invalide";
    }
    if (step === 1) {
      if (!form?.address?.trim()) e.address = "Adresse requise";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function geocode() {
    if (!form?.address?.trim()) return;
    setGeocoding(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.address)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "fr" } });
      const data = await res.json();
      if (data.length > 0) {
        setForm((f) => f ? { ...f, lat: data[0].lat, lng: data[0].lon } : f);
      } else {
        setErrors((e) => ({ ...e, address: "Adresse non trouvée." }));
      }
    } catch {
      setErrors((e) => ({ ...e, address: "Échec de la géolocalisation." }));
    } finally {
      setGeocoding(false);
    }
  }

  async function handleSubmit() {
    if (!validateStep() || !form) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const body = {
        title: form.title,
        description: form.description,
        type: form.type,
        category: form.category,
        price: parseFloat(form.price),
        surface: parseFloat(form.surface),
        rooms: parseInt(form.rooms),
        dpe_rating: form.dpe_rating || null,
        address: form.address,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
        floor: form.floor ? parseInt(form.floor) : null,
        parking: form.parking,
        cellar: form.cellar,
        garden: form.garden,
        coup_de_coeur: form.coup_de_coeur,
      };

      const res = await api.put(`/api/properties/${propertyId}`, body);
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        setSubmitError(b?.detail ?? "Erreur lors de la mise à jour.");
        return;
      }

      for (const photo of newPhotos) {
        const fd = new FormData();
        fd.append("file", photo);
        fd.append("display_order", String(newPhotos.indexOf(photo)));
        await api.postForm(`/api/properties/${propertyId}/photos`, fd);
      }

      router.push("/agency/listings");
    } catch {
      setSubmitError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  }

  function advance() {
    if (!validateStep()) return;
    setStep((s) => s + 1);
  }

  if (user?.role !== "agent") {
    return <div className="p-6 text-center text-red-600">Accès réservé aux agents.</div>;
  }

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="h-8 w-48 bg-stone-100 rounded animate-pulse mb-6" />
        <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-6 space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-stone-100 rounded animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!form) {
    return <div className="p-6 text-center text-red-600">Bien introuvable.</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="font-playfair text-2xl font-bold text-charcoal mb-6">
        Modifier le bien
      </h1>

      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i < step ? "bg-terracotta text-white" : i === step ? "bg-terracotta text-white ring-2 ring-terracotta ring-offset-2" : "bg-stone-100 text-charcoal-light"}`}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${i === step ? "text-terracotta" : "text-charcoal-light"}`}>{label}</span>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-stone-200" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-6">
        {step === 0 && (
          <div className="space-y-4">
            <Input label="Titre" value={form.title} onChange={(e) => set("title", e.target.value)} error={errors.title} required />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-charcoal font-inter">Description <span className="text-red-500">*</span></label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className={`rounded-md border px-3 py-2 text-sm text-charcoal font-inter focus:outline-none focus:ring-2 focus:ring-terracotta resize-none ${errors.description ? "border-red-500" : "border-stone-200"}`} />
              {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-charcoal font-inter">Type</label>
                <select value={form.type} onChange={(e) => set("type", e.target.value)} className="rounded-md border border-stone-200 px-3 py-2 text-sm text-charcoal font-inter focus:outline-none focus:ring-2 focus:ring-terracotta">
                  {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-charcoal font-inter">Catégorie</label>
                <select value={form.category} onChange={(e) => set("category", e.target.value)} className="rounded-md border border-stone-200 px-3 py-2 text-sm text-charcoal font-inter focus:outline-none focus:ring-2 focus:ring-terracotta">
                  {PROPERTY_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Prix (€)" type="number" min="0" step="1000" value={form.price} onChange={(e) => set("price", e.target.value)} error={errors.price} required />
              <Input label="Surface (m²)" type="number" min="0" step="1" value={form.surface} onChange={(e) => set("surface", e.target.value)} error={errors.surface} required />
              <Input label="Pièces" type="number" min="1" step="1" value={form.rooms} onChange={(e) => set("rooms", e.target.value)} error={errors.rooms} required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-charcoal font-inter">DPE</label>
              <select value={form.dpe_rating} onChange={(e) => set("dpe_rating", e.target.value)} className="rounded-md border border-stone-200 px-3 py-2 text-sm text-charcoal font-inter focus:outline-none focus:ring-2 focus:ring-terracotta">
                <option value="">— Non renseigné —</option>
                {DPE_RATINGS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input label="Adresse complète" value={form.address} onChange={(e) => set("address", e.target.value)} error={errors.address} required />
              </div>
              <Button type="button" variant="secondary" onClick={geocode} disabled={geocoding || !form.address.trim()}>
                {geocoding ? "…" : "Géocoder"}
              </Button>
            </div>
            {form.lat && form.lng && <p className="text-xs text-charcoal-light">Coordonnées : {parseFloat(form.lat).toFixed(5)}, {parseFloat(form.lng).toFixed(5)}</p>}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Latitude (optionnel)" type="number" step="0.00001" value={form.lat} onChange={(e) => set("lat", e.target.value)} />
              <Input label="Longitude (optionnel)" type="number" step="0.00001" value={form.lng} onChange={(e) => set("lng", e.target.value)} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Input label="Étage (optionnel)" type="number" min="0" step="1" value={form.floor} onChange={(e) => set("floor", e.target.value)} />
            {(["parking", "cellar", "garden", "coup_de_coeur"] as const).map((field) => (
              <label key={field} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form[field] as boolean} onChange={(e) => set(field, e.target.checked)} className="w-4 h-4 accent-terracotta rounded" />
                <span className="text-sm font-medium text-charcoal font-inter">
                  {field === "parking" ? "Parking" : field === "cellar" ? "Cave" : field === "garden" ? "Jardin" : "Coup de cœur"}
                </span>
              </label>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-charcoal-light">Ajoutez de nouvelles photos (elles s'ajouteront aux existantes).</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setNewPhotos(Array.from(e.target.files ?? []).slice(0, 10))}
              className="block w-full text-sm text-charcoal file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-terracotta/10 file:text-terracotta hover:file:bg-terracotta/20"
            />
            {newPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {newPhotos.map((file, i) => (
                  <div key={i} className="aspect-[4/3] bg-stone-100 rounded-lg overflow-hidden">
                    <img src={URL.createObjectURL(file)} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {submitError && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {submitError}
          </div>
        )}

        <div className="flex justify-between mt-6 pt-4 border-t border-stone-100">
          <Button type="button" variant="ghost" onClick={() => step === 0 ? router.push("/agency/listings") : setStep((s) => s - 1)} disabled={submitting}>
            {step === 0 ? "Annuler" : "Précédent"}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" variant="primary" onClick={advance}>Suivant</Button>
          ) : (
            <Button type="button" variant="primary" loading={submitting} onClick={handleSubmit}>Enregistrer</Button>
          )}
        </div>
      </div>
    </div>
  );
}
