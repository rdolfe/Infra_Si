import SidebarLayout from "@/components/layout/SidebarLayout";
import { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/agency/listings", label: "Mes annonces", exact: false },
  { href: "/agency/offers", label: "Offres reçues", exact: false },
  { href: "/agency/analytics", label: "Analyse marché", exact: false },
];

export default function AgencyLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout
      navItems={NAV_ITEMS}
      title="Ymmo Agence"
      subtitle="Back-office"
    >
      {children}
    </SidebarLayout>
  );
}
