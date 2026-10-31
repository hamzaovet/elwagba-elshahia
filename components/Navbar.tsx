"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStaff } from "@/context/StaffContext";
import { playSound } from "@/lib/sounds";
import {
  Phone, MapPin, Headphones, Download, ShieldCheck,
  ShoppingBag, Menu, X, User, Globe, Flame, Smartphone
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, isAuthenticated, permissions } = useStaff();

  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkWidth = () => {
      setIsMobile(window.innerWidth < 880);
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);

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

    syncCart();
    window.addEventListener("choco_cart_update", syncCart);

    try {
      const savedLang = localStorage.getItem("choco_lang") as "ar" | "en";
      if (savedLang) setLang(savedLang);
    } catch {}

    return () => {
      window.removeEventListener("resize", checkWidth);
      window.removeEventListener("choco_cart_update", syncCart);
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

  // Only render public customer navbar on public route ("/")
  if (pathname !== "/") return null;

  return (
    <header
      style={{
        width: "100%",
        maxWidth: "100vw",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 4px 20px rgba(35, 20, 12, 0.08)",
        overflowX: "clip",
        boxSizing: "border-box",
      }}
    >
      {/* ══════════════════════════════════════════════════════════════
          TIER 1: TOP UTILITY BAR (Exact El Dahan Replica - White)
      ══════════════════════════════════════════════════════════════ */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #EADBCC",
          padding: isMobile ? "8px 14px" : "8px 24px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "1340px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Right: El Dahan Arabic Calligraphy Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", flexShrink: 0 }}>
            <img
              src="/wagba-calligraphy-logo.svg"
              alt="مطعم الوجبة الشهية"
              style={{ height: isMobile ? "36px" : "46px", width: "auto", display: "block" }}
            />
          </Link>

          {/* DESKTOP Utility Links (Hidden on screens < 880px) */}
          {!isMobile ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#2B170E",
                flexWrap: "nowrap",
              }}
            >
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
          ) : (
            /* MOBILE Header Actions (Compact, Clean & Fast) */
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Direct Hotline Call Button */}
              <a
                href="tel:01019845220"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  backgroundColor: "#DC2626",
                  color: "#FFFFFF",
                  padding: "5px 10px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "12px",
                  fontWeight: 900,
                  boxShadow: "0 2px 8px rgba(220, 38, 38, 0.3)",
                }}
              >
                <Phone size={13} color="#FFFFFF" />
                <span dir="ltr">1984 5220</span>
              </a>

              {/* Lang Pill */}
              <button
                onClick={toggleLanguage}
                style={{
                  padding: "5px 9px",
                  borderRadius: "8px",
                  backgroundColor: "#FAF7F2",
                  border: "1px solid #EADBCC",
                  color: "#C2410C",
                  fontSize: "11.5px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {lang === "ar" ? "EN" : "عربي"}
              </button>

              {/* Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "#23140C",
                  color: "#FBBF24",
                  border: "none",
                  cursor: "pointer",
                }}
                aria-label="قائمة الخيارات"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          TIER 2: MAIN ROASTED CHOCOLATE NAVBAR (Exact El Dahan Theme)
      ══════════════════════════════════════════════════════════════ */}
      <div
        style={{
          backgroundColor: "#23140C",
          borderBottom: "1px solid #3D2214",
          padding: isMobile ? "0 10px" : "0 24px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "1340px",
            margin: "0 auto",
            height: isMobile ? "44px" : "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Categories Links (Horizontally Scrollable) */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "14px" : "22px",
              overflowX: "auto",
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
              flex: 1,
              paddingRight: "4px",
            }}
          >
            <a
              href="#offers"
              onClick={() => playSound("click")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "#FBBF24",
                fontWeight: 900,
                fontSize: isMobile ? "12px" : "14px",
                textDecoration: "none",
                whiteSpace: "nowrap",
                padding: "3px 8px",
                borderRadius: "6px",
                backgroundColor: "rgba(220, 38, 38, 0.25)",
                border: "1px solid rgba(220, 38, 38, 0.5)",
                flexShrink: 0,
              }}
            >
              <Flame size={14} color="#DC2626" />
              <span>عروض الوجبة 🔥</span>
            </a>

            {[
              { label: "مشويات الشواية", href: "#menu" },
              { label: "صواني العيلة 👑", href: "#menu" },
              { label: "شاورما سوري", href: "#menu" },
              { label: "البروستد والكرسبي", href: "#menu" },
              { label: "السندوتشات", href: "#menu" },
              { label: "المقبلات والصوصات", href: "#menu" },
              { label: "تتبع الطلب", href: "#track" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => playSound("click")}
                style={{
                  color: "#FAF7F2",
                  fontSize: isMobile ? "12px" : "13.5px",
                  fontWeight: 700,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <button
              onClick={openCart}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: isMobile ? "4px 10px" : "6px 14px",
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
                <ShoppingBag size={isMobile ? 16 : 18} color="#C6873E" />
                {mounted && cartCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-7px",
                      right: "-7px",
                      backgroundColor: "#DC2626",
                      color: "#FFFFFF",
                      fontSize: "9.5px",
                      fontWeight: 900,
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1.5px solid #23140C",
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </div>
              <span style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: 900, color: "#FBBF24" }}>
                {cartTotal > 0 ? `${cartTotal} ج` : "0 ج"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MOBILE SLIDE-DOWN DRAWER
      ══════════════════════════════════════════════════════════════ */}
      {isMobile && mobileMenuOpen && (
        <div
          style={{
            backgroundColor: "#201108",
            borderBottom: "3px solid #C6873E",
            padding: "18px 20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            fontSize: "14px",
            fontWeight: 700,
            color: "#FAF7F2",
            animation: "fadeIn 0.25s ease-out",
            boxShadow: "0 14px 35px rgba(0,0,0,0.5)",
          }}
        >
          {/* Staff Login */}
          <Link
            href={mounted && isAuthenticated && currentUser ? permissions.defaultRoute : "/login"}
            onClick={() => {
              playSound("click");
              setMobileMenuOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#FBBF24",
              textDecoration: "none",
              padding: "10px 14px",
              borderRadius: "10px",
              backgroundColor: "rgba(198, 135, 62, 0.15)",
              border: "1px solid rgba(198, 135, 62, 0.3)",
            }}
          >
            <ShieldCheck size={18} color="#FBBF24" />
            <span>
              {mounted && isAuthenticated && currentUser
                ? `لوحة التحكم (${currentUser.name?.split(" ")[0]})`
                : "تسجيل دخول الإدارة والكاشير"}
            </span>
          </Link>

          {/* Branch */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", color: "#EADBCC", fontSize: "13px" }}>
            <MapPin size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>مدينة 6 أكتوبر — الحي الثاني — شارع جيل 2000 — عمارة 661</span>
          </div>

          {/* Hotline */}
          <a
            href="tel:01019845220"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#22C55E",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            <Phone size={16} color="#22C55E" />
            <span dir="ltr">010 1984 5220 • خدمة التوصيل</span>
          </a>

          {/* Customer Service */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#EADBCC", fontSize: "13px" }}>
            <Headphones size={16} color="#C6873E" />
            <span>خدمة العملاء: يومياً 11 ص - 2 ص</span>
          </div>

          {/* Download App APK */}
          <Link
            href="/download"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#FFFFFF",
              textDecoration: "none",
              padding: "10px 14px",
              borderRadius: "10px",
              backgroundColor: "#DC2626",
              fontWeight: 800,
              boxShadow: "0 4px 12px rgba(220, 38, 38, 0.4)",
            }}
          >
            <Smartphone size={18} color="#FFFFFF" />
            <span>تحميل تطبيق الأندرويد الرسمي (APK)</span>
          </Link>
        </div>
      )}
    </header>
  );
}
