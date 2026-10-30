import type { Metadata } from "next";
import { Cairo, Playfair_Display } from "next/font/google";
import "./globals.css";
import { StaffProvider } from "@/context/StaffContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SoundAlertToggle from "@/components/SoundAlertToggle";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700", "900"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "مطعم الوجبة الشهية | أكل بطعم بيحبه قلبك",
  description: "أشهى صواني اللمة والعيلة، مشويات الشواية، والشاورما السوري في 6 أكتوبر - خدمة توصيل وتيك أواي وصالة",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-[#0D0A08] text-[#FFFFFF] antialiased selection:bg-[#DC2626] selection:text-white"
        style={{ fontFamily: "var(--font-cairo), system-ui, -apple-system, sans-serif" }}
        suppressHydrationWarning
      >
        <LanguageProvider>
          <StaffProvider>
            <div className="flex min-h-screen flex-col justify-between">
              <div>
                <Navbar />
                <main>{children}</main>
              </div>
              <Footer />
            </div>
            <SoundAlertToggle />
          </StaffProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
