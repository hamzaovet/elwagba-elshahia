"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStaff } from "@/context/StaffContext";
import { playSound } from "@/lib/sounds";
import {
  Phone, MapPin, Headphones, Download, ShieldCheck,
  ShoppingBag, Menu, X, User, Globe, Flame
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, isAuthenticated, permissions } = useStaff();

  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [customer, setCustomer] = useState<{ id: string; name: string; phone: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    function syncCart() {
      try {
        const raw = localStorage.getItem("wagba_cart");
        if (raw) {
          const items = JSON.parse(raw);
          const totalQty = items.reduce((s: number, i: any) => s + (i.qty || 1), 0);
          const totalSum = items.reduce((s: number, i: any) => s + (i.unitPrice || 0) * (i.qty || 1), 0);
          setCartCount(totalQty);
          setCartTotal(totalSum);
        } else {
          setCartCount(0);
          setCartTotal(0);
        }
      } catch {
        setCartCount(0);
        setCartTotal(0);
      }
    }

    function syncCustomer() {
      try {
        const raw = localStorage.getItem("choco_customer");
        setCustomer(raw ? JSON.parse(raw) : null);
      } catch {
        setCustomer(null);
      }
    }

    syncCart();
    syncCustomer();

    window.addEventListener("choco_cart_update", syncCart);
    window.addEventListener("choco_customer_updated", syncCustomer);

    try {
      const savedLang = localStorage.getItem("choco_lang") as "ar" | "en";
      if (savedLang) setLang(savedLang);
    } catch {}

    return () => {
      window.removeEventListener("choco_cart_update", syncCart);
      window.removeEventListener("choco_customer_updated", syncCustomer);
    };
  }, []);

  function toggleLanguage() {
    const nextLang = lang === "ar" ? "en" : "ar";
    setLang(nextLang);
    try {
      localStorage.setItem("choco_lang", nextLang);
    } catch {}
    window.dispatchEvent(new CustomEvent("choco_lang_change", { detail: nextLang }));
    playSound("click");
  }

  function openCart() {
    playSound("click");
    window.dispatchEvent(new CustomEvent("choco_open_cart"));
  }

  function openCustomer() {
    playSound("click");
    window.dispatchEvent(new CustomEvent("choco_open_customer"));
  }

  // Only render public customer navbar on public route ("/")
  if (pathname !== "/") return null;

  return (
    <header style={{ width: "100%", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 4px 20px rgba(35, 20, 12, 0.08)" }}>
      {/* ══════════════════════════════════════════════════════════════
          TIER 1: TOP UTILITY BAR (Exact El Dahan Replica - White)
      ══════════════════════════════════════════════════════════════ */}
      <div style={{
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #EADBCC",
        padding: "8px 24px",
      }}>
        <div style={{
          maxWidth: "1340px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}>
          {/* Right: El Dahan Arabic Calligraphy Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <img
              src="/wagba-calligraphy-logo.svg"
              alt="مطعم الوجبة الشهية"
              style={{ height: "46px", width: "auto", display: "block" }}
            />
          </Link>

          {/* Center / Left Utility Links (Hidden on small mobile) */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            fontSize: "13px",
            fontWeight: 700,
            color: "#2B170E",
          }}>
            {/* Staff / Admin Login */}
            <Link
              href={mounted && isAuthenticated && currentUser ? permissions.defaultRoute : "/login"}
              onClick={() => playSound("click")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#2B170E",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#C2410C")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#2B170E")}
            >
              <ShieldCheck size={16} color="#C2410C" />
              <span>
                {mounted && isAuthenticated && currentUser
                  ? (currentUser.name ? currentUser.name.split(" ")[0] : "لوحة التحكم")
                  : "تسجيل الدخول / الإدارة"}
              </span>
            </Link>

            {/* Branch */}
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#6B5344" }}>
              <MapPin size={15} color="#C2410C" />
              <span>6 أكتوبر (الحي الثاني)</span>
            </span>

            {/* Customer Service */}
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#6B5344" }}>
              <Headphones size={15} color="#C6873E" />
              <span>خدمة العملاء</span>
            </span>

            {/* Hotline */}
            <a
              href="tel:01019845220"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#2B170E",
                fontWeight: 900,
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              <Phone size={15} color="#22C55E" />
              <span dir="ltr">010 1984 5220</span>
            </a>

            {/* Download Menu Button */}
            <a
              href="#menu"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#2B170E",
                textDecoration: "none",
                padding: "4px 10px",
                borderRadius: "8px",
                backgroundColor: "#FAF7F2",
                border: "1px solid #EADBCC",
              }}
            >
              <Download size={14} color="#C6873E" />
              <span>تحميل منيو الوجبة</span>
            </a>

            {/* Language Switcher Pill */}
            <button
              onClick={toggleLanguage}
              style={{
                padding: "4px 14px",
                borderRadius: "8px",
                backgroundColor: "#FAF7F2",
                border: "1px solid #EADBCC",
                color: "#C2410C",
                fontSize: "12.5px",
                fontWeight: 800,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {lang === "ar" ? "English" : "العربية"}
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          TIER 2: MAIN ROASTED CHOCOLATE NAVBAR (Exact El Dahan Theme)
      ══════════════════════════════════════════════════════════════ */}
      <div style={{
        backgroundColor: "#23140C",
        borderBottom: "1px solid #3D2214",
        padding: "0 24px",
      }}>
        <div style={{
          maxWidth: "1340px",
          margin: "0 auto",
          height: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* Categories Links (RTL) */}
          <nav style={{
            display: "flex",
            alignItems: "center",
            gap: "22px",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}>
            <a
              href="#offers"
              onClick={() => playSound("click")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "#FBBF24",
                fontWeight: 900,
                fontSize: "14px",
                textDecoration: "none",
                whiteSpace: "nowrap",
                padding: "4px 10px",
                borderRadius: "6px",
                backgroundColor: "rgba(220, 38, 38, 0.2)",
                border: "1px solid rgba(220, 38, 38, 0.4)",
              }}
            >
              <Flame size={15} color="#DC2626" />
              <span>عروض الوجبة الشهية 🔥</span>
            </a>

            {[
              { label: "مشويات الشواية", href: "#menu" },
              { label: "صواني وسرافيس العيلة 👑", href: "#menu" },
              { label: "الشاورما السوري", href: "#menu" },
              { label: "البروستد والكرسبي", href: "#menu" },
              { label: "السندوتشات والوجبات", href: "#menu" },
              { label: "المقبلات والصوصات", href: "#menu" },
              { label: "تتبع الطلب", href: "#track" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => playSound("click")}
                style={{
                  color: "#FAF7F2",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#C6873E")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#FAF7F2")}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Far Left: El Dahan Cart Button with gold icon & price */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <button
              onClick={openCart}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "10px",
                backgroundColor: "#331C10",
                border: "1px solid #C6873E",
                color: "#FFFFFF",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#442516")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#331C10")}
            >
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <ShoppingBag size={18} color="#C6873E" />
                {mounted && cartCount > 0 && (
                  <span style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    backgroundColor: "#DC2626",
                    color: "#FFFFFF",
                    fontSize: "10px",
                    fontWeight: 900,
                    width: "17px",
                    height: "17px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1.5px solid #23140C",
                  }}>
                    {cartCount}
                  </span>
                )}
              </div>
              <span style={{ fontSize: "13px", fontWeight: 900, color: "#FBBF24" }}>
                {cartTotal > 0 ? `${cartTotal} ج.م` : "0 ج.م"}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#331C10",
                border: "1px solid #4D2D1B",
                color: "#FAF7F2",
                cursor: "pointer",
              }}
              className="eldahan-mobile-toggle"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: "#23140C",
          borderBottom: "2px solid #C6873E",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          fontSize: "13.5px",
          fontWeight: 700,
          color: "#FAF7F2",
        }}>
          <a href="#offers" onClick={() => setMobileMenuOpen(false)} style={{ color: "#FBBF24", textDecoration: "none" }}>
            🔥 عروض الوجبة الشهية
          </a>
          <a href="#menu" onClick={() => setMobileMenuOpen(false)} style={{ color: "#FAF7F2", textDecoration: "none" }}>
            🍗 مشويات الشواية
          </a>
          <a href="#menu" onClick={() => setMobileMenuOpen(false)} style={{ color: "#FAF7F2", textDecoration: "none" }}>
            👑 صواني اللمة والعيلة
          </a>
          <a href="#menu" onClick={() => setMobileMenuOpen(false)} style={{ color: "#FAF7F2", textDecoration: "none" }}>
            🌯 الشاورما السوري
          </a>
          <a href="#menu" onClick={() => setMobileMenuOpen(false)} style={{ color: "#FAF7F2", textDecoration: "none" }}>
            🍟 المقبلات والصوصات
          </a>
          <div style={{ borderTop: "1px solid #4D2D1B", paddingTop: "10px", display: "flex", gap: "10px" }}>
            <a href="tel:01019845220" style={{ color: "#22C55E", textDecoration: "none", fontWeight: 800 }}>
              📞 01019845220
            </a>
            <span style={{ color: "#666" }}>|</span>
            <Link href="/login" style={{ color: "#C6873E", textDecoration: "none" }}>
              🔐 دخول الإدارة
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
