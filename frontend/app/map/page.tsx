import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-stone-100 text-charcoal-light text-sm">
      Chargement de la carte…
    </div>
  ),
});

export const metadata = {
  title: "Carte – Ymmo",
  description: "Explorez les biens immobiliers sur la carte interactive",
};

export default function MapPage() {
  return (
    <div className="h-[calc(100vh-64px)] w-full">
      <MapView />
    </div>
  );
}
