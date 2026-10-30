"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { playSound } from "@/lib/sounds";
import CustomerAccountModal from "@/components/CustomerAccountModal";
import CustomerChatWidget from "@/components/CustomerChatWidget";
import { ALL_DELIVERY_ZONES, DEFAULT_ZONE, findZone, ZoneItem } from "@/lib/zones";
import {
  ShoppingCart, X, Plus, Minus, Search,
  MapPin, Phone, Clock, CheckCircle2, Loader2,
  Bike, CreditCard, ChefHat, ChevronDown,
  Sparkles, Flame, Gift, Store, Utensils,
  Share2, ShieldCheck, Tag, Heart, Info, ArrowRight
} from "lucide-react";

interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  basePrice: number;
  originalPrice?: number | null;
  promoPrice?: number | null;
  promoDays?: string | null;
  promoActive?: boolean;
  isFlashDeal?: boolean;
  trayComponents?: string | null;
  modifiers?: string | null;
  sizes?: string | null;
  image?: string | null;
  description?: string | null;
  isAvailable: boolean;
  sortOrder?: number;
}

interface CartItem {
  product: Product;
  qty: number;
  extras: string[];
  unitPrice: number;
  selectedOption?: string | null;
}

const CATEGORY_ICONS: Record<string, string> = {
  "الكل": "🍽️",
  "صواني اللمة والعيلة": "👑",
  "مشويات الشواية": "🔥",
  "الشاورما السوري والعروض": "🌯",
  "البروستد والكرسبي والوجبات": "🍗",
  "الإضافات والصوصات والمقبلات": "🍟",
  "All": "🍽️",
  "Family Trays & Combos": "👑",
  "Rotisserie & Grills": "🔥",
  "Syrian Shawarma & Deals": "🌯",
  "Broasted & Crispy Meals": "🍗",
  "Sides, Sauces & Salads": "🍟",
};

const CATEGORY_SUBTITLES: Record<string, string> = {
  "صواني اللمة والعيلة": "صواني ملكية تكفي كل العيلة والحبايب مع أرز بسمتي وصوصات",
  "مشويات الشواية": "فراخ متبلة على الشواية والفحم مع عروض الثلاثاء والأربعاء والخميس 🔥",
  "الشاورما السوري والعروض": "طعم الصاج الأصلي محمص عالجريل مع التومية والمخلل",
  "البروستد والكرسبي والوجبات": "دجاج كرسبي مقرمش ذهبي ووجبات إسكالوب وفاهيتا",
  "الإضافات والصوصات والمقبلات": "أرز بسمتي، بطاطس فارم فريتس، تومية وصوصات شهية",
};

const EXTRA_OPTIONS = [
  { nameAr: "عادي كلاسيك", nameEn: "Regular", price: 0 },
  { nameAr: "سبايسي حار نار 🔥", nameEn: "Spicy", price: 0 },
  { nameAr: "تومية سورية إضافية", nameEn: "Extra Toumia", price: 15 },
  { nameAr: "صوص سبايسي إضافي", nameEn: "Extra Spicy Sauce", price: 15 },
  { nameAr: "مخلل مشكل إضافي", nameEn: "Extra Pickles", price: 10 },
  { nameAr: "جبنة موتزاريلا سايحة 🧀", nameEn: "Extra Mozzarella", price: 25 },
  { nameAr: "أرز بسمتي أصفر إضافي", nameEn: "Extra Rice", price: 40 },
  { nameAr: "عيش صاج محمص (3 أرغفة)", nameEn: "Toasted Saj Bread", price: 10 },
];

export default function StorefrontPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Cart & Order State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderType, setOrderType] = useState<"delivery" | "takeaway" | "dinein">("delivery");
  const [selectedZone, setSelectedZone] = useState<ZoneItem>(DEFAULT_ZONE);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  // Item customization modal
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("عادي كلاسيك");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [modalQty, setModalQty] = useState(1);

  // Language & UI State
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Days promo check: is today Tuesday, Wednesday, or Thursday?
  const todayDay = new Date().getDay(); // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  const isPromoDay = todayDay === 2 || todayDay === 3 || todayDay === 4;

  useEffect(() => {
    setMounted(true);
    fetchMenu();
    loadCartFromStorage();

    const handleCartOpen = () => setCartOpen(true);
    window.addEventListener("choco_open_cart", handleCartOpen);
    const handleCustomerOpen = () => setCustomerModalOpen(true);
    window.addEventListener("choco_open_customer", handleCustomerOpen);

    const handleLangChange = (e: any) => {
      if (e.detail) setLang(e.detail);
    };
    window.addEventListener("choco_lang_change", handleLangChange);

    try {
      const savedLang = localStorage.getItem("choco_lang") as "ar" | "en";
      if (savedLang) setLang(savedLang);
    } catch {}

    return () => {
      window.removeEventListener("choco_open_cart", handleCartOpen);
      window.removeEventListener("choco_open_customer", handleCustomerOpen);
      window.removeEventListener("choco_lang_change", handleLangChange);
    };
  }, []);

  async function fetchMenu() {
    try {
      setLoading(true);
      const res = await fetch("/api/public/menu");
      if (res.ok) {
        const data = await res.json();
        const prods: Product[] = Array.isArray(data) ? data : (data.products || []);
        setProducts(prods);

        const cats = ["الكل", ...Array.from(new Set(prods.map((p) => p.category)))];
        setCategories(cats);
      }
    } catch (err) {
      console.error("Failed to fetch menu:", err);
    } finally {
      setLoading(false);
    }
  }

  function loadCartFromStorage() {
    try {
      const saved = localStorage.getItem("wagba_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        setCart(parsed);
        updateCartCount(parsed);
      }
    } catch {}
  }

  function saveCartToStorage(updated: CartItem[]) {
    try {
      localStorage.setItem("wagba_cart", JSON.stringify(updated));
      updateCartCount(updated);
    } catch {}
  }

  function updateCartCount(items: CartItem[]) {
    const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
    try {
      localStorage.setItem("choco_cart_count", String(totalQty));
      window.dispatchEvent(new Event("choco_cart_update"));
    } catch {}
  }

  // Calculate product active price taking promo into account
  function getProductPrice(prod: Product): number {
    if (prod.promoActive && prod.promoPrice) {
      return prod.promoPrice;
    }
    return prod.basePrice;
  }

  function openCustomizeModal(prod: Product) {
    playSound("click");
    setCustomizingProduct(prod);
    setSelectedOption("عادي كلاسيك");
    setSelectedExtras([]);
    setModalQty(1);
  }

  function addToCartDirect(prod: Product) {
    playSound("click");
    const unitPrice = getProductPrice(prod);
    const existingIndex = cart.findIndex(
      (item) => item.product.id === prod.id && item.extras.length === 0 && !item.selectedOption
    );

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...cart];
      updated[existingIndex].qty += 1;
    } else {
      updated = [...cart, { product: prod, qty: 1, extras: [], unitPrice, selectedOption: null }];
    }
    setCart(updated);
    saveCartToStorage(updated);
    playSound("order");
  }

  function addCustomizedToCart() {
    if (!customizingProduct) return;
    playSound("click");

    const baseUnit = getProductPrice(customizingProduct);
    const extrasTotal = selectedExtras.reduce((sum, extraName) => {
      const found = EXTRA_OPTIONS.find((e) => e.nameAr === extraName);
      return sum + (found ? found.price : 0);
    }, 0);

    const finalUnitPrice = baseUnit + extrasTotal;

    const newItem: CartItem = {
      product: customizingProduct,
      qty: modalQty,
      extras: selectedExtras,
      unitPrice: finalUnitPrice,
      selectedOption,
    };

    const updated = [...cart, newItem];
    setCart(updated);
    saveCartToStorage(updated);
    setCustomizingProduct(null);
    playSound("order");
  }

  function updateItemQty(index: number, delta: number) {
    playSound("click");
    const updated = [...cart];
    updated[index].qty += delta;
    if (updated[index].qty <= 0) {
      updated.splice(index, 1);
    }
    setCart(updated);
    saveCartToStorage(updated);
  }

  function clearCart() {
    playSound("click");
    setCart([]);
    saveCartToStorage([]);
  }

  // Subtotal & Totals
  const cartSubtotal = cart.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  const deliveryFee = orderType === "delivery" ? selectedZone.fee : 0;
  const cartTotal = cartSubtotal + deliveryFee;

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerName.trim() || !phone.trim()) {
      alert("يرجى إدخال اسم العميل ورقم الموبايل للمتابعة");
      return;
    }
    if (orderType === "delivery" && !address.trim()) {
      alert("يرجى كتابة عنوان التوصيل بالتفصيل");
      return;
    }

    setSubmitting(true);
    playSound("click");

    try {
      const itemsPayload = cart.map((item) => ({
        productId: item.product.id,
        nameAr: item.product.nameAr,
        nameEn: item.product.nameEn,
        qty: item.qty,
        unitPrice: item.unitPrice,
        selectedOption: item.selectedOption,
        extras: item.extras,
      }));

      const res = await fetch("/api/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          address: orderType === "delivery" ? address : null,
          zone: orderType === "delivery" ? selectedZone.nameAr : "استلام من الفرع",
          orderType,
          items: itemsPayload,
          subtotal: cartSubtotal,
          deliveryFee,
          total: cartTotal,
          paymentMethod,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playSound("order");
        setOrderSuccess(data);
        clearCart();

        // Direct WhatsApp owner alert if enabled
        if (data.whatsappNotify?.enabled && data.whatsappNotify.waUrl) {
          window.open(data.whatsappNotify.waUrl, "_blank");
        }
      } else {
        alert(data.error || "حدث خطأ أثناء تسجيل الطلب، يرجى المحاولة مرة أخرى.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("فشل الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت.");
    } finally {
      setSubmitting(false);
    }
  }

  // Filtered menu
  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === "الكل" || p.category === activeCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      p.nameAr.toLowerCase().includes(query) ||
      p.nameEn.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0D0A08] text-white selection:bg-[#DC2626] selection:text-white" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* ══════════════════════════════════════════════════════════════
          1. HERO HEADER — El Dahan Fiery Charcoal & Gold Luxury Aesthetic
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 border-b border-[#F59E0B]/20 bg-gradient-to-b from-[#140F0C] via-[#0D0A08] to-[#0A0706]">
        {/* Glow ambient background effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Sizzling Flame Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1F1713] border border-[#DC2626]/40 shadow-lg shadow-red-900/20 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] animate-pulse" />
              <span className="text-xs md:text-sm font-black text-[#FBBF24] tracking-wide">
                🔥 أكل بطعم بيحبه قلبك • GOOD FOOD BETTER MOOD
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-4">
              مطعم <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC2626] via-[#EA580C] to-[#F59E0B]">الوجبة الشهية</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[#D1D5DB] leading-relaxed mb-8 font-medium">
              أشهى صواني اللمة والعيلة، مشويات الشواية المتبلة على الفحم، والشاورما السوري المحمصة عالجريل. بنحضرها طازجة لحظة طلبك في قلب 6 أكتوبر!
            </p>

            {/* Fast Order & Promo CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 mb-10">
              <a
                href="#menu"
                onClick={() => playSound("click")}
                className="btn-flame px-7 py-3.5 rounded-xl text-sm md:text-base font-black flex items-center gap-2"
              >
                <span>اطلب أونلاين الآن 🛵</span>
              </a>

              <a
                href="#offers"
                onClick={() => playSound("click")}
                className="btn-gold px-6 py-3.5 rounded-xl text-sm md:text-base font-black flex items-center gap-2"
              >
                <span>عروض مشويات الشواية 🔥</span>
              </a>

              <button
                onClick={() => {
                  setActiveCategory("صواني اللمة والعيلة");
                  const el = document.getElementById("menu");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-5 py-3.5 rounded-xl text-sm font-bold bg-[#1A1410] border border-[#F59E0B]/30 text-[#FBBF24] hover:bg-[#251D18] transition"
              >
                صواني اللمة والعيلة 👑
              </button>
            </div>

            {/* Address & Hotline Badge */}
            <div className="inline-flex flex-wrap items-center justify-center gap-4 text-xs md:text-sm text-[#9CA3AF] bg-[#140F0C]/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-1.5 text-[#F59E0B]">
                <MapPin className="w-4 h-4 text-[#DC2626]" />
                <span>6 أكتوبر — الحي الثاني — شارع جيل 2000 (عمارة 661 مقابل مدرسة أم المؤمنين)</span>
              </div>
              <span className="hidden md:inline text-white/20">|</span>
              <a href="tel:01019845220" className="flex items-center gap-1.5 text-white hover:text-[#F59E0B] font-bold">
                <Phone className="w-4 h-4 text-[#22C55E]" />
                <span dir="ltr">010 1984 5220</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          2. ROTISSERIE PROMOTIONS SHOWCASE (الثلاثاء والأربعاء والخميس)
      ══════════════════════════════════════════════════════════════ */}
      <section id="offers" className="py-12 border-b border-[#F59E0B]/15 bg-[#100C0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#DC2626]/20 border border-[#DC2626]/40 text-[#EF4444] text-xs font-black uppercase mb-2">
                <Flame className="w-3.5 h-3.5 animate-bounce" />
                عروض الشواية التوفيرية الكبرى
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-white">
                عروض الثلاثاء والأربعاء والخميس 🔥
              </h2>
              <p className="text-xs md:text-sm text-[#9CA3AF] mt-1">
                وفر حتى 50 جنيه على مشويات الشواية كاملة مع الأرز والبطاطس والتومية والعيش!
              </p>
            </div>

            <div className="px-4 py-2 rounded-xl bg-[#1C1511] border border-[#F59E0B]/30 text-xs font-bold text-[#FBBF24] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#DC2626]" />
              <span>{isPromoDay ? "✓ العرض ساري ومتاح للطلب اليوم!" : "العرض يتجدد أسبوعياً: الثلاثاء، الأربعاء، والخميس"}</span>
            </div>
          </div>

          {/* Cards Grid of the 3 Promo Grills with Real Uploaded Posters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Promo 1: فرخة شواية */}
            <div className="wagba-card overflow-hidden group flex flex-col justify-between">
              <div>
                <div className="relative h-64 overflow-hidden bg-[#0A0706]">
                  <img
                    src="/menu/farha-shawaya.jpg"
                    alt="فرخة شواية"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 badge-promo px-3 py-1 rounded-lg text-xs">
                    وفر 50 جنيه 🔥
                  </div>
                  <div className="absolute bottom-3 right-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] text-[#FDE047] font-bold">
                    مع أرز بسمتي + بطاطس + تومية + مخلل + عيش
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-black text-white mb-1">فرخة شواية كاملة</h3>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed mb-4">
                    متحمرة ومظبوطة على الآخر على سيخ الشواية الدوار بتتبيلتنا الخاصة الشهية.
                  </p>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-black text-[#F59E0B]">370 ج.م</span>
                    <span className="text-sm text-red-500 line-through font-bold">420 ج</span>
                    <span className="text-[10px] bg-red-950/60 text-red-400 px-2 py-0.5 rounded border border-red-800/40">
                      سعر العرض
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => {
                    const item = products.find((p) => p.nameAr.includes("فرخة شواية كاملة"));
                    if (item) addToCartDirect(item);
                  }}
                  className="w-full btn-flame py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>أضف بالعرض (370 ج)</span>
                </button>
              </div>
            </div>

            {/* Promo 2: نص فرخة شواية */}
            <div className="wagba-card overflow-hidden group flex flex-col justify-between">
              <div>
                <div className="relative h-64 overflow-hidden bg-[#0A0706]">
                  <img
                    src="/menu/nos-farha-promo.jpg"
                    alt="نص فرخة شواية"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 badge-promo px-3 py-1 rounded-lg text-xs">
                    وفر 25 جنيه 🔥
                  </div>
                  <div className="absolute bottom-3 right-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] text-[#FDE047] font-bold">
                    رز بسمتي أصفر + بطاطس + تومية + مخلل + خبز
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-black text-white mb-1">نص فرخة شواية</h3>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed mb-4">
                    وجبة مشبعة ومتحمرة مظبوطة على الآخر بطعم مش هتقاومه أبداً.
                  </p>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-black text-[#F59E0B]">185 ج.م</span>
                    <span className="text-sm text-red-500 line-through font-bold">210 ج</span>
                    <span className="text-[10px] bg-red-950/60 text-red-400 px-2 py-0.5 rounded border border-red-800/40">
                      سعر العرض
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => {
                    const item = products.find((p) => p.nameAr === "نص فرخة شواية");
                    if (item) addToCartDirect(item);
                  }}
                  className="w-full btn-flame py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>أضف بالعرض (185 ج)</span>
                </button>
              </div>
            </div>

            {/* Promo 3: دبل ورك شواية */}
            <div className="wagba-card overflow-hidden group flex flex-col justify-between">
              <div>
                <div className="relative h-64 overflow-hidden bg-[#0A0706]">
                  <img
                    src="/menu/double-werk-shawaya.jpg"
                    alt="دبل ورك شواية"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 badge-promo px-3 py-1 rounded-lg text-xs">
                    وفر 30 جنيه 🔥
                  </div>
                  <div className="absolute bottom-3 right-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] text-[#FDE047] font-bold">
                    2 ورك شواية + رز + بطاطس + تومية + مخلل
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-black text-white mb-1">دبل ورك شواية</h3>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed mb-4">
                    لعشاق الأوراك المتحمرة مع الأرز البسمتي بالبهارات والصوصات.
                  </p>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-black text-[#F59E0B]">170 ج.م</span>
                    <span className="text-sm text-red-500 line-through font-bold">200 ج</span>
                    <span className="text-[10px] bg-red-950/60 text-red-400 px-2 py-0.5 rounded border border-red-800/40">
                      سعر العرض
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => {
                    const item = products.find((p) => p.nameAr.includes("دبل ورك"));
                    if (item) addToCartDirect(item);
                  }}
                  className="w-full btn-flame py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>أضف بالعرض (170 ج)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          3. FULL INTERACTIVE MENU & TRAY BROWSER
      ══════════════════════════════════════════════════════════════ */}
      <section id="menu" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-4xl font-black text-white mb-2">
            قائمة أكلات <span className="text-[#F59E0B]">الوجبة الشهية</span>
          </h2>
          <p className="text-xs md:text-sm text-[#9CA3AF] max-w-xl mx-auto">
            اختر أكلتك المفضلة من صواني العيلة، مشويات الشواية، شاورما الصاج السوري والبروستد، وأضف إضافاتك المميزة
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8 relative">
          <Search className="w-5 h-5 absolute top-1/2 -translate-y-1/2 right-3.5 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم: صينية، شواية، شاورما، بروستد..."
            className="w-full h-11 pr-11 pl-4 rounded-xl bg-[#17120F] border border-[#F59E0B]/25 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#F59E0B] transition"
          />
        </div>

        {/* Category Pills Slider (Wrapped & Responsive) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const icon = CATEGORY_ICONS[cat] || "🍗";
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  playSound("click");
                }}
                className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-2 ${
                  isActive
                    ? "btn-flame shadow-lg scale-105"
                    : "bg-[#17120F] text-[#D1D5DB] border border-[#F59E0B]/20 hover:border-[#F59E0B]/60 hover:text-white"
                }`}
              >
                <span>{icon}</span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Category Subtitle */}
        {CATEGORY_SUBTITLES[activeCategory] && (
          <div className="text-center mb-6">
            <span className="text-xs md:text-sm text-[#FBBF24] bg-[#1C1511] px-4 py-1.5 rounded-full border border-[#F59E0B]/20 font-bold">
              ✨ {CATEGORY_SUBTITLES[activeCategory]}
            </span>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#F59E0B]" />
            <span className="text-sm text-[#9CA3AF]">جاري تحميل أشهى الوجبات...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-[#140F0C] rounded-2xl border border-white/5">
            <Utensils className="w-12 h-12 text-[#9CA3AF] mx-auto mb-3 opacity-40" />
            <p className="text-base font-bold text-white mb-1">لا توجد وجبات تطابق بحثك حالياً</p>
            <p className="text-xs text-[#9CA3AF]">جرب البحث بكلمة أخرى أو تصفح الأقسام</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => {
              const activePrice = getProductPrice(prod);
              const hasDiscount = prod.originalPrice && prod.originalPrice > activePrice;

              // Parse tray components if any
              let trayItems: string[] = [];
              if (prod.trayComponents) {
                try {
                  trayItems = typeof prod.trayComponents === "string" ? JSON.parse(prod.trayComponents) : prod.trayComponents;
                } catch {}
              }

              return (
                <div key={prod.id} className="wagba-card overflow-hidden flex flex-col justify-between group">
                  <div>
                    {/* Image & Badges */}
                    <div className="relative h-56 overflow-hidden bg-[#0A0706]">
                      <img
                        src={prod.image || "/menu/lamma-family-tray.jpg"}
                        alt={prod.nameAr}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Promo or Signature Badge */}
                      {hasDiscount && (
                        <div className="absolute top-3 right-3 badge-promo px-2.5 py-1 rounded-md text-[11px]">
                          خصم {prod.originalPrice! - activePrice} ج 🔥
                        </div>
                      )}

                      {prod.category === "صواني اللمة والعيلة" && (
                        <div className="absolute top-3 left-3 bg-[#D97706]/90 text-white font-black px-2.5 py-1 rounded-md text-[11px] flex items-center gap-1 shadow">
                          <span>👑 صينية ملكية</span>
                        </div>
                      )}

                      {/* Category Tag */}
                      <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-[#F59E0B] font-bold">
                        {prod.category}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-5">
                      <h3 className="text-base md:text-lg font-black text-white mb-1.5 leading-snug">
                        {prod.nameAr}
                      </h3>

                      {prod.description && (
                        <p className="text-xs text-[#9CA3AF] leading-relaxed mb-3 line-clamp-2">
                          {prod.description}
                        </p>
                      )}

                      {/* Tray components chips */}
                      {trayItems.length > 0 && (
                        <div className="mb-4 pt-2 border-t border-white/5">
                          <span className="text-[10px] font-bold text-[#F59E0B] block mb-1.5">مكونات الصينية:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {trayItems.slice(0, 5).map((comp, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-[#1F1713] text-[#D1D5DB] px-2 py-0.5 rounded border border-[#F59E0B]/20"
                              >
                                • {comp}
                              </span>
                            ))}
                            {trayItems.length > 5 && (
                              <span className="text-[10px] text-[#FBBF24] font-bold self-center">
                                +{trayItems.length - 5} أصناف أخرى
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Price Display */}
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-xl md:text-2xl font-black text-[#F59E0B]">
                          {activePrice} ج.م
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-red-500 line-through font-bold">
                            {prod.originalPrice} ج
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Actions */}
                  <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openCustomizeModal(prod)}
                      className="py-2.5 rounded-xl text-xs font-bold bg-[#1C1511] border border-[#F59E0B]/30 text-[#FBBF24] hover:bg-[#251D18] transition flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#DC2626]" />
                      <span>تخصيص 🌶️</span>
                    </button>

                    <button
                      onClick={() => addToCartDirect(prod)}
                      className="btn-flame py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>أضف للطلب</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════
          4. CUSTOMIZE ITEM MODAL (عادي / سبايسي + إضافات)
      ══════════════════════════════════════════════════════════════ */}
      {customizingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#17120F] border border-[#F59E0B]/30 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-[#F59E0B]/20 flex items-center justify-between bg-[#140F0C]">
              <div>
                <h3 className="text-base font-black text-white">{customizingProduct.nameAr}</h3>
                <span className="text-xs text-[#F59E0B]">{getProductPrice(customizingProduct)} ج.م</span>
              </div>
              <button
                onClick={() => setCustomizingProduct(null)}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#9CA3AF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Flavor Selector */}
              <div>
                <label className="font-bold text-[#F59E0B] block mb-2">النكهة الأساسية:</label>
                <div className="grid grid-cols-2 gap-2">
                  {["عادي كلاسيك", "سبايسي حار نار 🔥"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedOption(opt)}
                      className={`py-2 px-3 rounded-xl font-bold border transition ${
                        selectedOption === opt
                          ? "bg-[#DC2626] border-[#DC2626] text-white shadow-md shadow-red-900/40"
                          : "bg-[#1F1814] border-white/10 text-[#D1D5DB]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extras Multi-select */}
              <div>
                <label className="font-bold text-[#F59E0B] block mb-2">إضافات وصوصات مفضلة:</label>
                <div className="space-y-1.5">
                  {EXTRA_OPTIONS.filter((e) => e.price > 0).map((extra) => {
                    const isSelected = selectedExtras.includes(extra.nameAr);
                    return (
                      <label
                        key={extra.nameAr}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                          isSelected ? "bg-[#251B15] border-[#F59E0B]" : "bg-[#1A1410] border-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExtras([...selectedExtras, extra.nameAr]);
                              } else {
                                setSelectedExtras(selectedExtras.filter((x) => x !== extra.nameAr));
                              }
                            }}
                            className="rounded accent-[#DC2626]"
                          />
                          <span className="font-bold text-white">{extra.nameAr}</span>
                        </div>
                        <span className="text-[#FBBF24] font-black">+{extra.price} ج</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="font-bold text-[#D1D5DB]">الكمية المطلوبة:</span>
                <div className="flex items-center gap-3 bg-[#140F0C] px-3 py-1.5 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                    className="w-6 h-6 rounded bg-white/10 text-white font-bold"
                  >
                    -
                  </button>
                  <span className="font-black text-sm text-[#F59E0B]">{modalQty}</span>
                  <button
                    type="button"
                    onClick={() => setModalQty(modalQty + 1)}
                    className="w-6 h-6 rounded bg-white/10 text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-[#F59E0B]/20 bg-[#140F0C] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#9CA3AF] block">الإجمالي للصنف:</span>
                <span className="text-lg font-black text-[#F59E0B]">
                  {(getProductPrice(customizingProduct) +
                    selectedExtras.reduce((s, ex) => s + (EXTRA_OPTIONS.find((o) => o.nameAr === ex)?.price || 0), 0)) *
                    modalQty}{" "}
                  ج.م
                </span>
              </div>

              <button
                type="button"
                onClick={addCustomizedToCart}
                className="btn-flame px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>أضف للطلب</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          5. FLOATING CART & CHECKOUT DRAWER
      ══════════════════════════════════════════════════════════════ */}
      {/* Floating Trigger Pill */}
      {cart.length > 0 && !cartOpen && (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 z-40">
          <button
            onClick={() => {
              playSound("click");
              setCartOpen(true);
            }}
            className="w-full md:w-auto btn-flame px-6 py-3.5 rounded-2xl shadow-2xl flex items-center justify-between md:justify-start gap-4 border border-red-500/50 animate-bounce"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-white" />
              <span className="font-black text-sm">عرض عربة الطلبات ({cart.reduce((s, i) => s + i.qty, 0)})</span>
            </div>
            <div className="bg-black/40 px-3 py-1 rounded-xl text-xs font-black text-[#FDE047]">
              {cartTotal} ج.م
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer Overlay */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#140F0C] border-l border-[#F59E0B]/30 h-full flex flex-col shadow-2xl text-xs">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#F59E0B]/20 flex items-center justify-between bg-[#17120F]">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#DC2626]" />
                <h3 className="text-base font-black text-white">عربة طلباتك</h3>
                <span className="text-[11px] bg-red-950/60 text-red-400 px-2 py-0.5 rounded-full font-bold">
                  {cart.length} أصناف
                </span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#9CA3AF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-[#9CA3AF]">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30 text-[#F59E0B]" />
                  <p className="font-bold text-white text-sm">عربتك فارغة حالياً</p>
                  <p className="text-[11px] mt-1">تصفح المنيو وأضف وجباتك المفضلة</p>
                </div>
              ) : (
                <>
                  {/* Service Mode Selector */}
                  <div className="p-3 rounded-xl bg-[#1C1511] border border-[#F59E0B]/20">
                    <span className="font-bold text-[#F59E0B] block mb-2">طريقة استلام الطلب:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "delivery", label: "دليفري 🛵" },
                        { id: "takeaway", label: "تيك أواي 🛍️" },
                        { id: "dinein", label: "صالة 🍽️" },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setOrderType(mode.id as any)}
                          className={`py-2 rounded-lg font-bold text-center transition ${
                            orderType === mode.id
                              ? "bg-[#DC2626] text-white shadow"
                              : "bg-[#140F0C] text-[#9CA3AF] border border-white/5"
                          }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2">
                    {cart.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#1A1410] border border-white/5 flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-black text-white text-xs">{item.product.nameAr}</h4>
                          {item.selectedOption && (
                            <span className="text-[10px] text-[#DC2626] font-bold block">{item.selectedOption}</span>
                          )}
                          {item.extras.length > 0 && (
                            <span className="text-[10px] text-[#9CA3AF] block">+ {item.extras.join("، ")}</span>
                          )}
                          <div className="text-xs font-black text-[#F59E0B] mt-1">
                            {item.unitPrice * item.qty} ج.م
                          </div>
                        </div>

                        {/* Qty changer */}
                        <div className="flex items-center gap-2 bg-[#140F0C] px-2 py-1 rounded-lg border border-white/10">
                          <button
                            onClick={() => updateItemQty(idx, -1)}
                            className="w-5 h-5 rounded bg-white/10 text-white font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="font-bold text-[#F59E0B] text-xs">{item.qty}</span>
                          <button
                            onClick={() => updateItemQty(idx, 1)}
                            className="w-5 h-5 rounded bg-white/10 text-white font-bold text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checkout Form */}
                  <form id="checkout-form" onSubmit={handleCheckout} className="space-y-3 pt-3 border-t border-white/10">
                    <span className="font-black text-white block text-sm">بيانات العميل والتوصيل:</span>

                    <div>
                      <label className="text-[#9CA3AF] block mb-1">اسم العميل:</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="الاسم بالكامل"
                        className="w-full h-9 px-3 rounded-lg bg-[#1F1814] border border-white/10 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[#9CA3AF] block mb-1">رقم الموبايل / واتساب:</label>
                      <input
                        type="tel"
                        required
                        dir="ltr"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="010XXXXXXXX"
                        className="w-full h-9 px-3 rounded-lg bg-[#1F1814] border border-white/10 text-white text-xs"
                      />
                    </div>

                    {orderType === "delivery" && (
                      <>
                        <div>
                          <label className="text-[#9CA3AF] block mb-1">منطقة التوصيل (6 أكتوبر والشيخ زايد):</label>
                          <select
                            value={selectedZone.code}
                            onChange={(e) => {
                              const found = ALL_DELIVERY_ZONES.find((z) => z.code === e.target.value);
                              if (found) setSelectedZone(found);
                            }}
                            className="w-full h-9 px-2 rounded-lg bg-[#1F1814] border border-white/10 text-white text-xs font-bold"
                          >
                            {ALL_DELIVERY_ZONES.map((z) => (
                              <option key={z.code} value={z.code}>
                                {z.nameAr} ({z.fee} ج توصيل)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[#9CA3AF] block mb-1">العنوان بالتفصيل:</label>
                          <input
                            type="text"
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="الشارع، رقم العمارة، الشقة، علامة مميزة"
                            className="w-full h-9 px-3 rounded-lg bg-[#1F1814] border border-white/10 text-white text-xs"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="text-[#9CA3AF] block mb-1">ملاحظات خاصة بالشيف:</label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="تومية زيادة، عيش مقرمش، بدون مخلل..."
                        className="w-full h-9 px-3 rounded-lg bg-[#1F1814] border border-white/10 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[#9CA3AF] block mb-1">طريقة الدفع:</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "cash", label: "كاش 💵" },
                          { id: "instapay", label: "إنستاباي ⚡" },
                          { id: "wallet", label: "محفظة كاش 📱" },
                          { id: "card", label: "فيزا / كارت 💳" },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPaymentMethod(m.id)}
                            className={`py-2 rounded-lg font-bold transition ${
                              paymentMethod === m.id
                                ? "bg-[#DC2626] text-white"
                                : "bg-[#1F1814] text-[#9CA3AF] border border-white/5"
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </form>
                </>
              )}
            </div>

            {/* Drawer Footer Checkout Button */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-[#F59E0B]/20 bg-[#17120F] space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[#9CA3AF]">
                    <span>المجموع الفرعي:</span>
                    <span>{cartSubtotal} ج</span>
                  </div>
                  {orderType === "delivery" && (
                    <div className="flex justify-between text-[#9CA3AF]">
                      <span>خدمة التوصيل ({selectedZone.nameAr}):</span>
                      <span>{deliveryFee} ج</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-black text-sm pt-1 border-t border-white/10">
                    <span>الإجمالي المطلوب:</span>
                    <span className="text-[#F59E0B] text-base">{cartTotal} ج.م</span>
                  </div>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting}
                  className="w-full btn-flame py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-900/40"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{submitting ? "جاري تسجيل الطلب..." : "تأكيد الطلب وإرسال التفاصيل"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          6. ORDER SUCCESS MODAL
      ══════════════════════════════════════════════════════════════ */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#17120F] border border-[#22C55E]/40 rounded-2xl w-full max-w-md p-6 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4 text-[#22C55E]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-white mb-1">تم تسجيل طلبكم بنجاح! 🔥</h3>
            <p className="text-xs text-[#9CA3AF] mb-4">
              شكراً لاختياركم مطعم الوجبة الشهية. طلبكم الآن في المطبخ للتحضير السريع.
            </p>

            <div className="bg-[#140F0C] p-3 rounded-xl border border-white/5 text-xs text-[#FBBF24] font-black mb-5">
              رقم الأوردر: #{orderSuccess.orderNumber}
            </div>

            <div className="space-y-2">
              <Link
                href={`/receipt/${orderSuccess.orderId}`}
                className="w-full btn-gold py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2"
              >
                <span>عرض الفاتورة الرقمية والتتبع المباشر 📄</span>
              </Link>

              {orderSuccess.whatsappNotify?.waUrl && (
                <a
                  href={orderSuccess.whatsappNotify.waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl text-xs font-black bg-[#22C55E] text-white flex items-center justify-center gap-2"
                >
                  <span>متابعة تفاصيل الطلب عبر واتساب 💬</span>
                </a>
              )}

              <button
                onClick={() => setOrderSuccess(null)}
                className="w-full py-2 text-xs text-[#9CA3AF] hover:text-white"
              >
                العودة للمنيو
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals & Live Widgets */}
      <CustomerAccountModal isOpen={customerModalOpen} onClose={() => setCustomerModalOpen(false)} lang={lang} />
      <CustomerChatWidget />
    </div>
  );
}
