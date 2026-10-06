import CustomCursor from "@/components/CustomCursor";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";

// Sitio público: menú, pie de página y cursor de marca. El panel (admin) no los hereda.
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <SiteFooter />
      <CustomCursor />
    </>
  );
}
