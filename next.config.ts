import type { NextConfig } from "next";

// Fotos del bucket público de Supabase Storage. El host sale de la URL del proyecto;
// si no está definida, se acepta cualquier proyecto de Supabase.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Subida de fotos del panel de medios (máx. 8 MB + margen del multipart).
      bodySizeLimit: "9mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
