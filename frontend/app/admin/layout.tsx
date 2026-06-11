import SidebarLayout from "@/components/layout/SidebarLayout";
import { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Vue d'ensemble", exact: true },
  { href: "/admin/users", label: "Utilisateurs", exact: false },
  { href: "/admin/agencies", label: "Agences", exact: false },
  { href: "/admin/listings", label: "Annonces", exact: false },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout
      navItems={NAV_ITEMS}
      title="Ymmo Admin"
      subtitle="Administration"
      innerClassName="max-w-6xl mx-auto p-6"
    >
      {children}
    </SidebarLayout>
  );
}
