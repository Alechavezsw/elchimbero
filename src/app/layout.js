import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "El Chimbero | Guía Comercial, Clasificados y Servicios de Chimbas",
  description: "La plataforma digital de Chimbas, San Juan. Buscá farmacias de turno hoy, kioscos 24h, directorio de comercios locales, mapa interactivo y clasificados.",
  keywords: ["Chimbas", "San Juan", "Guia comercial Chimbas", "Clasificados Chimbas", "Farmacias de turno Chimbas", "Kioscos 24h Chimbas"],
  authors: [{ name: "El Chimbero Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <div className="bg-aurora" />
        <div className="bg-stars" />
        <div className="bg-scanline" />
        <div className="bg-vignette" />
        <div className="neon-orb orb-violet" />
        <div className="neon-orb orb-pink" />
        <div className="neon-orb orb-teal" />
        <div className="neon-orb orb-purple" />
        <div className="shooting-star shooting-star-1" />
        <div className="shooting-star shooting-star-2" />
        <div className="shooting-star shooting-star-3" />
        <div className="firefly firefly-1" />
        <div className="firefly firefly-2" />
        <div className="firefly firefly-3" />
        <div className="firefly firefly-4" />
        <div className="firefly firefly-5" />
        <div className="firefly firefly-6" />
        <AuthProvider>
          <Navbar />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
