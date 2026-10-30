"use client";

import Link from "next/link";
import { Phone, MapPin, Clock, ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0A0807] border-t border-[#F59E0B]/20 text-[#D1D5DB] pt-12 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#2A201A]">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#DC2626] to-[#F59E0B] p-[2px] shadow-lg shadow-red-900/40">
                <div className="w-full h-full bg-[#14100D] rounded-[10px] flex items-center justify-center overflow-hidden">
                  <img src="/logo.jpg" alt="الوجبة الشهية" className="w-full h-full object-cover" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-wide">الوجبة الشهية</h3>
                <p className="text-xs text-[#F59E0B] font-semibold">أكل بطعم بيحبه قلبك 🔥</p>
              </div>
            </div>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              أشهى صواني اللمة والعيلة، مشويات الشواية، والشاورما السوري المحمصة على أصولها في قلب 6 أكتوبر.
            </p>
            <div className="text-xs text-[#FBBF24] font-bold bg-[#1A1410] px-3 py-1.5 rounded-lg border border-[#F59E0B]/20 inline-block">
              GOOD FOOD BETTER MOOD ✨
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-r-2 border-[#DC2626] pr-2">
              روابط سريعة
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#menu" className="hover:text-[#F59E0B] transition-colors">قائمة الطعام والصواني</a>
              </li>
              <li>
                <a href="#offers" className="hover:text-[#F59E0B] transition-colors">عروض مشويات الشواية 🔥</a>
              </li>
              <li>
                <Link href="/receipt/track" className="hover:text-[#F59E0B] transition-colors">تتبع حالة طلبك</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#F59E0B] transition-colors">دخول الإدارة والكاشير</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Hotlines */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-r-2 border-[#DC2626] pr-2">
              الخط الساخن والطلبات
            </h4>
            <div className="space-y-2.5 text-xs">
              <a href="tel:01019845220" className="flex items-center gap-2 text-white hover:text-[#F59E0B] transition">
                <Phone className="w-4 h-4 text-[#DC2626]" />
                <span dir="ltr" className="font-bold">010 1984 5220</span>
                <span className="text-[10px] bg-red-950/60 text-red-400 px-1.5 py-0.5 rounded">واتساب / طلبات</span>
              </a>
              <a href="tel:01111316817" className="flex items-center gap-2 text-white hover:text-[#F59E0B] transition">
                <Phone className="w-4 h-4 text-[#F59E0B]" />
                <span dir="ltr" className="font-bold">011 1131 6817</span>
              </a>
              <a href="tel:01111316439" className="flex items-center gap-2 text-white hover:text-[#F59E0B] transition">
                <Phone className="w-4 h-4 text-[#F59E0B]" />
                <span dir="ltr" className="font-bold">011 1131 6439</span>
              </a>
              <div className="flex items-center gap-2 text-[#9CA3AF] pt-1">
                <Clock className="w-4 h-4 text-[#F59E0B]" />
                <span>يومياً من 11:00 صباحاً حتى 2:00 بعد منتصف الليل</span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-r-2 border-[#DC2626] pr-2">
              عنوان الفرع
            </h4>
            <div className="flex items-start gap-2.5 text-xs text-[#D1D5DB] leading-relaxed">
              <MapPin className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <span>
                مدينة 6 أكتوبر — الحي الثاني — شارع جيل 2000 — المجاورة الثانية، عمارة 661 (مقابل مدرسة أم المؤمنين)
              </span>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-[#14100D] border border-[#F59E0B]/20 text-[11px] text-[#FBBF24]">
              🛵 أسطول دليفري سريع يغطي كافة أحياء ومناطق 6 أكتوبر والشيخ زايد.
            </div>
          </div>
        </div>

        {/* Global Mandatory Attribution */}
        <div className="mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#9CA3AF]">
          <p>© {new Date().getFullYear()} مطعم الوجبة الشهية. جميع الحقوق محفوظة.</p>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#17120F] border border-[#F59E0B]/30 shadow-lg text-white font-bold">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
            <span className="text-[#FBBF24]">تم تطوير النظام بواسطة شركة أوركا للحلول البرمجية والخدمات السحابية</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
