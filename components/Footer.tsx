"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, MapPin, Clock, ShieldCheck, Heart, Sparkles, ChefHat } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer completely on Login and Cashier POS to keep them clean & focused
  if (pathname === "/login" || pathname === "/cashier") {
    return null;
  }

  // On Admin & Operations Pages: Show only a minimalist, unobtrusive 1-line legal attribution
  const isAdminPage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/kitchen") ||
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/customers") ||
    pathname.startsWith("/offers-admin") ||
    pathname.startsWith("/menu-admin");

  if (isAdminPage) {
    return (
      <footer
        style={{
          width: "100%",
          padding: "16px 20px",
          backgroundColor: "#180E08",
          borderTop: "1px solid #2B170E",
          textAlign: "center",
          fontSize: "12px",
          color: "#9E8270",
          direction: "rtl",
        }}
      >
        <span>© {new Date().getFullYear()} مطعم الوجبة الشهية • </span>
        <span style={{ color: "#FBBF24", fontWeight: 700 }}>
          تم تطوير النظام بواسطة شركة أوركا للحلول البرمجية والخدمات السحابية
        </span>
      </footer>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // PUBLIC STOREFRONT LUXURY FOOTER (El Dahan Theme - Roasted Chocolate)
  // ══════════════════════════════════════════════════════════════
  return (
    <footer
      style={{
        width: "100%",
        backgroundColor: "#1F1109",
        borderTop: "2px solid #3D2214",
        color: "#E2D7CC",
        paddingTop: "48px",
        paddingBottom: "32px",
        marginTop: "40px",
        direction: "rtl",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1340px",
          margin: "0 auto",
          padding: "0 24px",
          boxSizing: "border-box",
        }}
      >
        {/* 4-Column Responsive Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "36px",
            paddingBottom: "40px",
            borderBottom: "1px solid #382115",
          }}
        >
          {/* Column 1: Brand & Tagline */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img
                src="/wagba-calligraphy-logo-white.svg"
                alt="مطعم الوجبة الشهية"
                style={{ height: "46px", width: "auto", display: "block" }}
              />
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "#B8A394",
                lineHeight: 1.7,
                margin: 0,
                fontWeight: 500,
              }}
            >
              أشهى صواني اللمة والعيلة، مشويات الشواية، والشاورما السوري المحمصة على أصولها في قلب مدينة 6 أكتوبر.
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#2B170E",
                border: "1px solid #5A351D",
                padding: "6px 14px",
                borderRadius: "8px",
                color: "#FBBF24",
                fontSize: "12px",
                fontWeight: 800,
                alignSelf: "flex-start",
              }}
            >
              <Sparkles size={14} color="#FBBF24" />
              <span>GOOD FOOD BETTER MOOD ✨</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4
              style={{
                fontSize: "15px",
                fontWeight: 900,
                color: "#FFFFFF",
                margin: "0 0 16px",
                borderRight: "3px solid #DC2626",
                paddingRight: "8px",
              }}
            >
              روابط سريعة
            </h4>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "13px",
              }}
            >
              <li>
                <a
                  href="#menu"
                  style={{ color: "#E2D7CC", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#FBBF24")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#E2D7CC")}
                >
                  قائمة الطعام والصواني
                </a>
              </li>
              <li>
                <a
                  href="#offers"
                  style={{ color: "#E2D7CC", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#FBBF24")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#E2D7CC")}
                >
                  عروض مشويات الشواية 🔥
                </a>
              </li>
              <li>
                <Link
                  href="/receipt/track"
                  style={{ color: "#E2D7CC", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#FBBF24")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#E2D7CC")}
                >
                  تتبع حالة طلبك أونلاين
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  style={{ color: "#FBBF24", textDecoration: "none", fontWeight: 700 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#FBBF24")}
                >
                  دخول الإدارة والكاشير 🛡️
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Hotlines */}
          <div>
            <h4
              style={{
                fontSize: "15px",
                fontWeight: 900,
                color: "#FFFFFF",
                margin: "0 0 16px",
                borderRight: "3px solid #DC2626",
                paddingRight: "8px",
              }}
            >
              الخط الساخن والطلبات
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <a
                href="tel:01019845220"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#FFFFFF",
                  textDecoration: "none",
                  fontWeight: 800,
                }}
              >
                <Phone size={15} color="#22C55E" />
                <span dir="ltr">010 1984 5220</span>
                <span
                  style={{
                    fontSize: "10.5px",
                    backgroundColor: "rgba(220, 38, 38, 0.25)",
                    color: "#FCA5A5",
                    padding: "2px 8px",
                    borderRadius: "6px",
                  }}
                >
                  واتساب / طلبات
                </span>
              </a>

              <a
                href="tel:01111316817"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#FFFFFF",
                  textDecoration: "none",
                  fontWeight: 800,
                }}
              >
                <Phone size={15} color="#FBBF24" />
                <span dir="ltr">011 1131 6817</span>
              </a>

              <a
                href="tel:01111316439"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#FFFFFF",
                  textDecoration: "none",
                  fontWeight: 800,
                }}
              >
                <Phone size={15} color="#FBBF24" />
                <span dir="ltr">011 1131 6439</span>
              </a>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#B8A394", marginTop: "4px" }}>
                <Clock size={15} color="#C6873E" />
                <span>يومياً من 11:00 صباحاً حتى 2:00 بعد منتصف الليل</span>
              </div>
            </div>
          </div>

          {/* Column 4: Address & Delivery Zones */}
          <div>
            <h4
              style={{
                fontSize: "15px",
                fontWeight: 900,
                color: "#FFFFFF",
                margin: "0 0 16px",
                borderRight: "3px solid #DC2626",
                paddingRight: "8px",
              }}
            >
              عنوان الفرع
            </h4>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", lineHeight: 1.6 }}>
              <MapPin size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: "3px" }} />
              <span>
                مدينة 6 أكتوبر — الحي الثاني — شارع جيل 2000 — المجاورة الثانية، عمارة 661 (مقابل مدرسة أم المؤمنين)
              </span>
            </div>
            <div
              style={{
                marginTop: "14px",
                padding: "10px 14px",
                borderRadius: "10px",
                backgroundColor: "#2B170E",
                border: "1px solid #5A351D",
                fontSize: "12px",
                color: "#FBBF24",
                lineHeight: 1.5,
              }}
            >
              🛵 أسطول دليفري سريع يغطي كافة أحياء ومناطق 6 أكتوبر والشيخ زايد.
            </div>
          </div>
        </div>

        {/* Global Mandatory Attribution & Copyright */}
        <div
          style={{
            marginTop: "28px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            fontSize: "12.5px",
            color: "#A89484",
          }}
        >
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} مطعم الوجبة الشهية. جميع الحقوق محفوظة.
          </p>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              borderRadius: "10px",
              backgroundColor: "#29160D",
              border: "1px solid #C6873E",
              color: "#FFFFFF",
              fontWeight: 800,
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#22C55E",
                display: "inline-block",
              }}
            />
            <span style={{ color: "#FBBF24" }}>
              تم تطوير النظام بواسطة شركة أوركا للحلول البرمجية والخدمات السحابية
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
