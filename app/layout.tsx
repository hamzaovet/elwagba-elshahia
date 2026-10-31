import type { Metadata } from "next";
import { Cairo } from "next/font/google";
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

export const metadata: Metadata = {
  title: "مطعم الوجبة الشهية | مشويات وصواني وشاورما على أصولها",
  description: "أشهى صواني اللمة والعيلة، مشويات الشواية، والشاورما السوري المحمصة في 6 أكتوبر - خدمة توصيل وتيك أواي وصالة",
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
      className={cairo.variable}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-[#FAF7F2] text-[#2B170E] antialiased selection:bg-[#C2410C] selection:text-white"
        style={{ fontFamily: "var(--font-cairo), 'Segoe UI', Tahoma, sans-serif" }}
        suppressHydrationWarning
      >
        <LanguageProvider>
          <StaffProvider>
            <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", justifyContent: "space-between" }}>
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
