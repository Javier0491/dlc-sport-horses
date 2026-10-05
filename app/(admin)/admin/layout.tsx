import type { Metadata } from "next";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { isAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Administración | Rancho DLC",
  robots: { index: false, follow: false },
};

// Zona de trabajo: menú lateral oscuro y contenido sobre fondo blanco, fuera de la estética pública.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authorized = await isAdmin();

  return (
    <div className="flex-1 bg-white font-sans text-neutral-900">
      {authorized ? (
        <div className="flex min-h-screen flex-col md:flex-row">
          <AdminSidebar />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      ) : (
        <AdminLogin />
      )}
    </div>
  );
}
