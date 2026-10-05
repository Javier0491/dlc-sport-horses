import CustomCursor from "@/components/CustomCursor";
import Navbar from "@/components/Navbar";

// Sitio público: menú y cursor de marca. El panel (admin) no los hereda.
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <CustomCursor />
    </>
  );
}
