"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { playSound } from "@/lib/sounds";
import CustomerAccountModal from "@/components/CustomerAccountModal";
import CustomerChatWidget from "@/components/CustomerChatWidget";
import { ALL_DELIVERY_ZONES, DEFAULT_ZONE, ZoneItem } from "@/lib/zones";
import {
  ShoppingCart, X, Plus, Minus, Search,
  MapPin, Phone, Clock, CheckCircle2, Loader2,
  Bike, CreditCard, ChefHat, ChevronRight, ChevronLeft,
  Sparkles, Flame, Gift, Store, Utensils,
  Share2, ShieldCheck, Tag, Heart, Info, ArrowLeft, ArrowRight
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

// Hero Carousel Slides matching El Dahan aesthetic
const HERO_SLIDES = [
  {
    id: "farha",
    badge: "وفر 50 جنيه 🔥",
    title: "عرض فرخة شواية كاملة",
    subtitle: "فرخة شواية متحمرة ومظبوطة على الآخر مع أرز بسمتي أصفر + بطاطس + تومية + مخلل + عيش",
    price: 370,
    originalPrice: 420,
    note: "العرض متاح أيام الثلاثاء والأربعاء والخميس",
    image: "/menu/farha-shawaya.jpg",
    cta: "اطلب العرض الآن",
  },
  {
    id: "lamma",
    badge: "الصينية الملكية الأكثر طلباً 👑",
    title: "صينية لمة العيلة الفاخرة",
    subtitle: "ربع كيلو شاورما فراخ سوري + 2 سيخ شيش طاووق + وجبة فاهيتا + أرز بسمتي + بطاطس + تومية + مخلل + كولسلو",
    price: 580,
    originalPrice: 640,
    note: "تكفي حتى 5 أفراد مع الصوصات والخبز المحمص",
    image: "/menu/lamma-family-tray.jpg",
    cta: "اطلب الصينية الآن",
  },
  {
    id: "nos-farha",
    badge: "وفر 25 جنيه 🔥",
    title: "عرض نص فرخة شواية",
    subtitle: "نص فرخة شواية متحمرة ومظبوطة مع أرز بسمتي أصفر + بطاطس + تومية + مخلل + خبز",
    price: 185,
    originalPrice: 210,
    note: "طعم مش هتقاومه - ساري الثلاثاء والأربعاء والخميس",
    image: "/menu/nos-farha-promo.jpg",
    cta: "اطلب الوجبة الآن",
  },
  {
    id: "double-werk",
    badge: "وفر 30 جنيه 🔥",
    title: "عرض دبل ورك شواية",
    subtitle: "2 ورك شواية متحمرين على الجريل مع أرز بسمتي أصفر + بطاطس + تومية + مخلل",
    price: 170,
    originalPrice: 200,
    note: "ساري أيام الثلاثاء والأربعاء والخميس",
    image: "/menu/double-werk-shawaya.jpg",
    cta: "اطلب العرض الآن",
  },
  {
    id: "shawarma",
    badge: "طعم الصاج الأصلي 🌯",
    title: "شاورما فراخ صاج عالجريل",
    subtitle: "سندوتش شاورما فراخ صاج بـ 70 ج (بدل 90 ج) | وعرض 2 سندوتش شاورما بـ 150 ج (بدل 180 ج)",
    price: 70,
    originalPrice: 90,
    note: "محمص بالزيت والزعتر مع التومية والمخلل",
    image: "/menu/lamma-family-tray.jpg",
    cta: "اطلب شاورما صاج",
  },
];

const CATEGORY_NAMES = [
  "الكل",
  "عروض الوجبة الشهية",
  "مشويات الشواية",
  "صواني اللمة والعيلة",
  "الشاورما السوري والعروض",
  "البروستد والكرسبي والوجبات",
  "الإضافات والصوصات والمقبلات",
];

const EXTRA_OPTIONS = [
  { nameAr: "عادي كلاسيك", price: 0 },
  { nameAr: "سبايسي حار نار 🔥", price: 0 },
  { nameAr: "تومية سورية إضافية", price: 15 },
  { nameAr: "صوص سبايسي إضافي", price: 15 },
  { nameAr: "مخلل مشكل إضافي", price: 10 },
  { nameAr: "جبنة موتزاريلا سايحة 🧀", price: 25 },
  { nameAr: "أرز بسمتي أصفر زيادة", price: 40 },
  { nameAr: "عيش صاج محمص (3 أرغفة)", price: 10 },
];

export default function StorefrontPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Auto-scrolling Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStart(e.targetTouches[0].clientX);
  }

  function handleTouchMove(e: React.TouchEvent) {
    setTouchEnd(e.targetTouches[0].clientX);
  }

  function handleTouchEnd() {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;
    if (isLeftSwipe) {
      playSound("click");
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    } else if (isRightSwipe) {
      playSound("click");
      setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
    }
    setTouchStart(null);
    setTouchEnd(null);
  }

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

  // Customization Modal State
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [selectedOption, setSelectedOption] = useState("عادي كلاسيك");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [modalQty, setModalQty] = useState(1);

  // Customer Account Modal State
  const [customerModalOpen, setCustomerModalOpen] = useState(false);

  // Auto-scroll Carousel Effect every 3.5 seconds
  useEffect(() => {
    if (isCarouselPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isCarouselPaused]);

  // Initial Load
  useEffect(() => {
    fetchMenu();
    loadCartFromStorage();

    const handleCartOpen = () => setCartOpen(true);
    window.addEventListener("choco_open_cart", handleCartOpen);

    const handleCustomerOpen = () => setCustomerModalOpen(true);
    window.addEventListener("choco_open_customer", handleCustomerOpen);

    return () => {
      window.removeEventListener("choco_open_cart", handleCartOpen);
      window.removeEventListener("choco_open_customer", handleCustomerOpen);
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
      }
    } catch {}
  }

  function saveCartToStorage(updated: CartItem[]) {
    try {
      localStorage.setItem("wagba_cart", JSON.stringify(updated));
      const totalQty = updated.reduce((s, i) => s + i.qty, 0);
      localStorage.setItem("choco_cart_count", String(totalQty));
      window.dispatchEvent(new Event("choco_cart_update"));
    } catch {}
  }

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

  // Filter products by category & search
  const filteredProducts = products.filter((p) => {
    let matchesCat = true;
    if (activeCategory === "عروض الوجبة الشهية") {
      matchesCat = Boolean(p.promoActive || (p.originalPrice && p.originalPrice > p.basePrice));
    } else if (activeCategory !== "الكل") {
      matchesCat = p.category === activeCategory;
    }

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.nameAr.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q));

    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ backgroundColor: "#FAF7F2", minHeight: "100vh", color: "#2B170E", direction: "rtl" }}>
      {/* ══════════════════════════════════════════════════════════════
          1. EL DAHAN AUTO-SCROLLING HORIZONTAL HERO CAROUSEL
      ══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          maxWidth: "1340px",
          margin: "20px auto 10px",
          padding: "0 16px",
          position: "relative",
        }}
        onMouseEnter={() => setIsCarouselPaused(true)}
        onMouseLeave={() => setIsCarouselPaused(false)}
      >
        <div className="wagba-hero-container" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          {/* Horizontal Sliding Track (Smooth GLIDE across slides) */}
          <div
            className="wagba-hero-track"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            {HERO_SLIDES.map((slide) => (
              <div key={slide.id} className="wagba-hero-slide">
                {/* Right Side: Plated Dish Image with Arabesque Frame */}
                <div className="slide-image-col">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center",
                      transition: "transform 0.4s ease",
                    }}
                  />
                  {/* Subtle Gradient Overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to right, rgba(28, 18, 12, 0.35) 0%, transparent 60%)",
                    }}
                  />
                </div>

                {/* Left Side: Calligraphy, Details & Pricing (El Dahan Authentic Layout) */}
                <div className="slide-content-col">
                  {/* Badge */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 14px",
                      borderRadius: "8px",
                      backgroundColor: "#DC2626",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      fontWeight: 900,
                      boxShadow: "0 2px 8px rgba(220, 38, 38, 0.3)",
                    }}
                  >
                    <span>{slide.badge}</span>
                  </div>

                  {/* Main Title */}
                  <h2
                    style={{
                      fontSize: "28px",
                      fontWeight: 900,
                      color: "#24140D",
                      margin: 0,
                      lineHeight: 1.25,
                      fontFamily: "'Cairo', serif",
                    }}
                  >
                    {slide.title}
                  </h2>

                  {/* Subtitle / Composition */}
                  <p
                    style={{
                      fontSize: "13.5px",
                      color: "#6B5344",
                      lineHeight: 1.6,
                      margin: 0,
                      fontWeight: 600,
                      maxWidth: "460px",
                    }}
                  >
                    {slide.subtitle}
                  </p>

                  {/* Price Banner */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "10px",
                      marginTop: "6px",
                    }}
                  >
                    <span style={{ fontSize: "32px", fontWeight: 900, color: "#C2410C" }}>
                      {slide.price} <span style={{ fontSize: "18px" }}>جنيه</span>
                    </span>
                    {slide.originalPrice && (
                      <span style={{ fontSize: "18px", color: "#9CA3AF", textDecoration: "line-through", fontWeight: 700 }}>
                        {slide.originalPrice} جنيه
                      </span>
                    )}
                  </div>

                  {slide.note && (
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#C6873E" }}>
                      ⚡ {slide.note}
                    </span>
                  )}

                  {/* Order Button */}
                  <button
                    onClick={() => {
                      const match = products.find((p) => p.nameAr.includes(slide.title.replace("عرض ", "")));
                      if (match) addToCartDirect(match);
                      else {
                        const el = document.getElementById("menu");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    style={{
                      marginTop: "10px",
                      padding: "12px 28px",
                      borderRadius: "10px",
                      backgroundColor: "#24140D",
                      color: "#FBBF24",
                      fontSize: "14px",
                      fontWeight: 900,
                      border: "1.5px solid #C6873E",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 14px rgba(36, 20, 13, 0.2)",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#DC2626";
                      e.currentTarget.style.borderColor = "#DC2626";
                      e.currentTarget.style.color = "#FFFFFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#24140D";
                      e.currentTarget.style.borderColor = "#C6873E";
                      e.currentTarget.style.color = "#FBBF24";
                    }}
                  >
                    <ShoppingCart size={16} />
                    <span>{slide.cta}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Left Arrow Button */}
          <button
            className="carousel-arrow-btn"
            onClick={() => {
              playSound("click");
              setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
            }}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #EADBCC",
              boxShadow: "0 4px 14px rgba(43, 23, 14, 0.15)",
              color: "#24140D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-50%) scale(1.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(-50%) scale(1)")}
          >
            <ChevronLeft size={22} />
          </button>

          {/* Right Arrow Button */}
          <button
            className="carousel-arrow-btn"
            onClick={() => {
              playSound("click");
              setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
            }}
            style={{
              position: "absolute",
              right: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #EADBCC",
              boxShadow: "0 4px 14px rgba(43, 23, 14, 0.15)",
              color: "#24140D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-50%) scale(1.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(-50%) scale(1)")}
          >
            <ChevronRight size={22} />
          </button>

          {/* Dots Indicator */}
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "8px",
              zIndex: 10,
            }}
          >
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                style={{
                  width: idx === currentSlide ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  backgroundColor: idx === currentSlide ? "#DC2626" : "#EADBCC",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          2. EL DAHAN CALLIGRAPHY TITLE & ORNAMENTAL ARABESQUE BANNER
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ maxWidth: "1340px", margin: "30px auto 20px", padding: "0 16px", textAlign: "center" }}>
        {/* Main Title matching Screenshot 2 */}
        <h1 style={{
          fontSize: "30px",
          fontWeight: 900,
          color: "#24140D",
          margin: "0 0 16px",
          letterSpacing: "0.5px",
        }}>
          مطعم الوجبة الشهية للمشويات والصواني
        </h1>

        {/* Arabesque Flourished Divider Banner (Exact El Dahan Replica) */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          margin: "0 auto",
        }}>
          <div style={{ height: "1px", flex: 1, maxWidth: "320px", background: "linear-gradient(to left, #C6873E, transparent)" }} />

          <div style={{
            padding: "8px 24px",
            borderRadius: "10px",
            border: "1.5px solid #C6873E",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 2px 10px rgba(43, 23, 14, 0.05)",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <span style={{ color: "#C6873E", fontSize: "14px" }}>❖</span>
            <span style={{ fontSize: "16px", fontWeight: 900, color: "#24140D" }}>
              عروض الوجبة الشهية
            </span>
            <span style={{ color: "#C6873E", fontSize: "14px" }}>❖</span>
          </div>

          <div style={{ height: "1px", flex: 1, maxWidth: "320px", background: "linear-gradient(to right, #C6873E, transparent)" }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          3. CATEGORIES TABS & LIVE SEARCH BAR
      ══════════════════════════════════════════════════════════════ */}
      <section id="menu" style={{ maxWidth: "1340px", margin: "20px auto 30px", padding: "0 16px" }}>
        {/* Search Input */}
        <div style={{
          maxWidth: "480px",
          margin: "0 auto 20px",
          position: "relative",
        }}>
          <Search size={18} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: "14px", color: "#8C6A53" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في قائمة المشويات، الصواني، الشاورما، السندوتشات..."
            style={{
              width: "100%",
              height: "44px",
              padding: "0 44px 0 16px",
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #EADBCC",
              color: "#24140D",
              fontSize: "13.5px",
              fontWeight: 700,
              outline: "none",
              boxShadow: "0 2px 8px rgba(43, 23, 14, 0.04)",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Category Pills Slider (El Dahan Style) */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "30px",
        }}>
          {CATEGORY_NAMES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  playSound("click");
                }}
                style={{
                  padding: "8px 18px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  border: isActive ? "1.5px solid #24140D" : "1px solid #EADBCC",
                  backgroundColor: isActive ? "#24140D" : "#FFFFFF",
                  color: isActive ? "#FBBF24" : "#4A2E1D",
                  boxShadow: isActive ? "0 4px 12px rgba(36, 20, 13, 0.2)" : "0 2px 6px rgba(43, 23, 14, 0.03)",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            4. PRODUCTS GRID (Exact El Dahan Food Cards)
        ══════════════════════════════════════════════════════════════ */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "10px" }}>
            <Loader2 className="animate-spin text-[#C2410C]" size={36} />
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#6B5344" }}>جاري تحميل قائمة الوجبات...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "50px 20px",
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid #EADBCC",
          }}>
            <Utensils size={40} color="#C6873E" style={{ margin: "0 auto 10px", opacity: 0.5 }} />
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#24140D" }}>لا توجد وجبات تطابق هذا التصنيف</h3>
            <p style={{ fontSize: "12px", color: "#6B5344" }}>تصفح قسماً آخر أو ابحث بكلمة ثانية</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
            gap: "24px",
          }}>
            {filteredProducts.map((prod) => {
              const activePrice = getProductPrice(prod);
              const hasDiscount = prod.originalPrice && prod.originalPrice > activePrice;

              let trayItems: string[] = [];
              if (prod.trayComponents) {
                try {
                  trayItems = typeof prod.trayComponents === "string" ? JSON.parse(prod.trayComponents) : prod.trayComponents;
                } catch {}
              }

              return (
                <div
                  key={prod.id}
                  className="eldahan-card"
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "16px",
                    border: "1px solid #EADBCC",
                    boxShadow: "0 3px 12px rgba(43, 23, 14, 0.05)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                  }}
                >
                  <div>
                    {/* Food Photo Container */}
                    <div style={{
                      position: "relative",
                      height: "210px",
                      backgroundColor: "#1C120C",
                      overflow: "hidden",
                    }}>
                      <img
                        src={prod.image || "/menu/lamma-family-tray.jpg"}
                        alt={prod.nameAr}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.3s ease",
                        }}
                      />

                      {/* Discount Badge */}
                      {hasDiscount && (
                        <div style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          padding: "3px 10px",
                          borderRadius: "6px",
                          backgroundColor: "#DC2626",
                          color: "#FFFFFF",
                          fontSize: "11px",
                          fontWeight: 900,
                          boxShadow: "0 2px 6px rgba(220, 38, 38, 0.4)",
                        }}>
                          وفر {prod.originalPrice! - activePrice} ج 🔥
                        </div>
                      )}

                      {/* Tray Tag */}
                      {prod.category === "صواني اللمة والعيلة" && (
                        <div style={{
                          position: "absolute",
                          top: "10px",
                          left: "10px",
                          padding: "3px 10px",
                          borderRadius: "6px",
                          backgroundColor: "#24140D",
                          border: "1px solid #C6873E",
                          color: "#FBBF24",
                          fontSize: "11px",
                          fontWeight: 900,
                        }}>
                          👑 صينية عائلية
                        </div>
                      )}

                      {/* Category Label */}
                      <div style={{
                        position: "absolute",
                        bottom: "8px",
                        right: "10px",
                        padding: "2px 8px",
                        borderRadius: "5px",
                        backgroundColor: "rgba(0,0,0,0.75)",
                        color: "#FAF7F2",
                        fontSize: "10px",
                        fontWeight: 700,
                      }}>
                        {prod.category}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: "16px" }}>
                      <h3 style={{
                        fontSize: "16px",
                        fontWeight: 900,
                        color: "#24140D",
                        margin: "0 0 6px",
                        lineHeight: 1.3,
                      }}>
                        {prod.nameAr}
                      </h3>

                      {prod.description && (
                        <p style={{
                          fontSize: "12px",
                          color: "#6B5344",
                          lineHeight: 1.5,
                          margin: "0 0 10px",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}>
                          {prod.description}
                        </p>
                      )}

                      {/* Tray items breakdown chips */}
                      {trayItems.length > 0 && (
                        <div style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "4px",
                          marginBottom: "12px",
                          paddingTop: "6px",
                          borderTop: "1px dashed #EADBCC",
                        }}>
                          {trayItems.slice(0, 4).map((comp, cIdx) => (
                            <span
                              key={cIdx}
                              style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "#4A2E1D",
                                backgroundColor: "#FAF7F2",
                                border: "1px solid #EADBCC",
                                padding: "2px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              • {comp}
                            </span>
                          ))}
                          {trayItems.length > 4 && (
                            <span style={{ fontSize: "10px", fontWeight: 800, color: "#C2410C", alignSelf: "center" }}>
                              +{trayItems.length - 4} أصناف
                            </span>
                          )}
                        </div>
                      )}

                      {/* Price Section */}
                      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "4px" }}>
                        <span style={{ fontSize: "22px", fontWeight: 900, color: "#C2410C" }}>
                          {activePrice} <span style={{ fontSize: "14px" }}>ج.م</span>
                        </span>
                        {hasDiscount && (
                          <span style={{ fontSize: "13px", color: "#9CA3AF", textDecoration: "line-through", fontWeight: 700 }}>
                            {prod.originalPrice} ج
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div style={{
                    padding: "0 16px 16px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                  }}>
                    <button
                      onClick={() => openCustomizeModal(prod)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "8px",
                        backgroundColor: "#FAF7F2",
                        border: "1px solid #EADBCC",
                        color: "#24140D",
                        fontSize: "12px",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                      }}
                    >
                      <Sparkles size={13} color="#C2410C" />
                      <span>تخصيص 🌶️</span>
                    </button>

                    <button
                      onClick={() => addToCartDirect(prod)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "8px",
                        backgroundColor: "#24140D",
                        border: "1px solid #24140D",
                        color: "#FBBF24",
                        fontSize: "12px",
                        fontWeight: 900,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        transition: "all 0.18s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#DC2626";
                        e.currentTarget.style.borderColor = "#DC2626";
                        e.currentTarget.style.color = "#FFFFFF";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#24140D";
                        e.currentTarget.style.borderColor = "#24140D";
                        e.currentTarget.style.color = "#FBBF24";
                      }}
                    >
                      <ShoppingCart size={13} />
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
          5. CUSTOMIZE MODAL (النكهات والإضافات)
      ══════════════════════════════════════════════════════════════ */}
      {customizingProduct && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}>
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "18px",
            border: "1px solid #EADBCC",
            width: "100%",
            maxWidth: "460px",
            maxHeight: "90vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 45px rgba(43, 23, 14, 0.3)",
          }}>
            {/* Header */}
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid #EADBCC",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#FAF7F2",
            }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#24140D", margin: 0 }}>
                  {customizingProduct.nameAr}
                </h3>
                <span style={{ fontSize: "12px", color: "#C2410C", fontWeight: 800 }}>
                  {getProductPrice(customizingProduct)} ج.م
                </span>
              </div>
              <button
                onClick={() => setCustomizingProduct(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6B5344",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Flavor Selector */}
              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 800, color: "#24140D", display: "block", marginBottom: "8px" }}>
                  النكهة الأساسية:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {["عادي كلاسيك", "سبايسي حار نار 🔥"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedOption(opt)}
                      style={{
                        padding: "10px",
                        borderRadius: "10px",
                        fontWeight: 800,
                        fontSize: "12px",
                        cursor: "pointer",
                        border: selectedOption === opt ? "1.5px solid #DC2626" : "1px solid #EADBCC",
                        backgroundColor: selectedOption === opt ? "#DC2626" : "#FAF7F2",
                        color: selectedOption === opt ? "#FFFFFF" : "#24140D",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extras Multi-select */}
              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 800, color: "#24140D", display: "block", marginBottom: "8px" }}>
                  إضافات وصوصات مفضلة:
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {EXTRA_OPTIONS.filter((e) => e.price > 0).map((extra) => {
                    const isSelected = selectedExtras.includes(extra.nameAr);
                    return (
                      <label
                        key={extra.nameAr}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          border: isSelected ? "1.5px solid #C6873E" : "1px solid #EADBCC",
                          backgroundColor: isSelected ? "#FAF7F2" : "#FFFFFF",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                            style={{ accentColor: "#DC2626" }}
                          />
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#24140D" }}>{extra.nameAr}</span>
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: 900, color: "#C2410C" }}>+{extra.price} ج</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Quantity */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px dashed #EADBCC" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#24140D" }}>الكمية:</span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#FAF7F2", padding: "4px 10px", borderRadius: "10px", border: "1px solid #EADBCC" }}>
                  <button
                    onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                    style={{ width: "26px", height: "26px", borderRadius: "6px", border: "none", backgroundColor: "#FFFFFF", cursor: "pointer", fontWeight: 900 }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: "14px", fontWeight: 900, color: "#24140D" }}>{modalQty}</span>
                  <button
                    onClick={() => setModalQty(modalQty + 1)}
                    style={{ width: "26px", height: "26px", borderRadius: "6px", border: "none", backgroundColor: "#FFFFFF", cursor: "pointer", fontWeight: 900 }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: "16px 20px",
              borderTop: "1px solid #EADBCC",
              backgroundColor: "#FAF7F2",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <span style={{ fontSize: "11px", color: "#6B5344", display: "block" }}>إجمالي الصنف:</span>
                <span style={{ fontSize: "18px", fontWeight: 900, color: "#C2410C" }}>
                  {(getProductPrice(customizingProduct) +
                    selectedExtras.reduce((s, ex) => s + (EXTRA_OPTIONS.find((o) => o.nameAr === ex)?.price || 0), 0)) *
                    modalQty}{" "}
                  ج.م
                </span>
              </div>

              <button
                onClick={addCustomizedToCart}
                style={{
                  padding: "10px 24px",
                  borderRadius: "10px",
                  backgroundColor: "#24140D",
                  color: "#FBBF24",
                  fontSize: "13px",
                  fontWeight: 900,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 12px rgba(36, 20, 13, 0.2)",
                }}
              >
                <ShoppingCart size={15} />
                <span>أضف للطلب</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          6. FLOATING CART & CHECKOUT DRAWER
      ══════════════════════════════════════════════════════════════ */}
      {cart.length > 0 && !cartOpen && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          left: "24px",
          right: "24px",
          maxWidth: "460px",
          margin: "0 auto",
          zIndex: 90,
        }}>
          <button
            onClick={() => {
              playSound("click");
              setCartOpen(true);
            }}
            style={{
              width: "100%",
              padding: "14px 20px",
              borderRadius: "16px",
              backgroundColor: "#24140D",
              border: "1.5px solid #C6873E",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              boxShadow: "0 10px 30px rgba(36, 20, 13, 0.4)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ShoppingCart size={20} color="#FBBF24" />
              <span style={{ fontSize: "14px", fontWeight: 900, color: "#FFFFFF" }}>
                عرض عربة طلباتك ({cart.reduce((s, i) => s + i.qty, 0)})
              </span>
            </div>
            <div style={{
              backgroundColor: "#DC2626",
              color: "#FFFFFF",
              padding: "4px 12px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 900,
            }}>
              {cartTotal} ج.م
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          justifyContent: "flex-end",
        }}>
          <div style={{
            width: "100%",
            maxWidth: "460px",
            backgroundColor: "#FFFFFF",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.25)",
          }}>
            {/* Drawer Header */}
            <div style={{
              padding: "16px 20px",
              backgroundColor: "#24140D",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShoppingCart size={20} color="#FBBF24" />
                <h3 style={{ fontSize: "16px", fontWeight: 900, margin: 0 }}>عربة طلباتك</h3>
                <span style={{ fontSize: "11px", backgroundColor: "#DC2626", padding: "2px 8px", borderRadius: "10px", fontWeight: 900 }}>
                  {cart.length} أصناف
                </span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                style={{ background: "none", border: "none", color: "#FAF7F2", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: "16px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#6B5344" }}>
                  <ShoppingCart size={40} color="#C6873E" style={{ margin: "0 auto 10px", opacity: 0.4 }} />
                  <p style={{ fontWeight: 800, fontSize: "14px", color: "#24140D" }}>عربتك فارغة حالياً</p>
                  <p style={{ fontSize: "12px" }}>تصفح المنيو وأضف وجباتك المفضلة</p>
                </div>
              ) : (
                <>
                  {/* Service Mode Selector */}
                  <div style={{
                    padding: "12px",
                    borderRadius: "12px",
                    backgroundColor: "#FAF7F2",
                    border: "1px solid #EADBCC",
                  }}>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#24140D", display: "block", marginBottom: "8px" }}>
                      طريقة استلام الطلب:
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                      {[
                        { id: "delivery", label: "دليفري 🛵" },
                        { id: "takeaway", label: "تيك أواي 🛍️" },
                        { id: "dinein", label: "صالة 🍽️" },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setOrderType(mode.id as any)}
                          style={{
                            padding: "8px 4px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 800,
                            cursor: "pointer",
                            border: orderType === mode.id ? "1.5px solid #24140D" : "1px solid #EADBCC",
                            backgroundColor: orderType === mode.id ? "#24140D" : "#FFFFFF",
                            color: orderType === mode.id ? "#FBBF24" : "#24140D",
                          }}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cart Items List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {cart.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "12px",
                          borderRadius: "12px",
                          backgroundColor: "#FAF7F2",
                          border: "1px solid #EADBCC",
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: "10px",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: "13px", fontWeight: 900, color: "#24140D", margin: "0 0 2px" }}>
                            {item.product.nameAr}
                          </h4>
                          {item.selectedOption && (
                            <span style={{ fontSize: "11px", color: "#DC2626", fontWeight: 700, display: "block" }}>
                              {item.selectedOption}
                            </span>
                          )}
                          {item.extras.length > 0 && (
                            <span style={{ fontSize: "11px", color: "#6B5344", display: "block" }}>
                              + {item.extras.join("، ")}
                            </span>
                          )}
                          <div style={{ fontSize: "13px", fontWeight: 900, color: "#C2410C", marginTop: "4px" }}>
                            {item.unitPrice * item.qty} ج.م
                          </div>
                        </div>

                        {/* Qty changer */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#FFFFFF", padding: "2px 8px", borderRadius: "8px", border: "1px solid #EADBCC" }}>
                          <button
                            onClick={() => updateItemQty(idx, -1)}
                            style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 900 }}
                          >
                            -
                          </button>
                          <span style={{ fontSize: "12px", fontWeight: 900, color: "#24140D" }}>{item.qty}</span>
                          <button
                            onClick={() => updateItemQty(idx, 1)}
                            style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 900 }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checkout Form */}
                  <form id="checkout-form" onSubmit={handleCheckout} style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px", paddingTop: "12px", borderTop: "1px dashed #EADBCC" }}>
                    <span style={{ fontSize: "13px", fontWeight: 900, color: "#24140D" }}>بيانات التوصيل والتواصل:</span>

                    <div>
                      <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B5344", display: "block", marginBottom: "4px" }}>
                        اسم العميل:
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="الاسم بالكامل"
                        style={{ width: "100%", height: "38px", padding: "0 10px", borderRadius: "8px", border: "1px solid #EADBCC", fontSize: "12.5px", boxSizing: "border-box" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B5344", display: "block", marginBottom: "4px" }}>
                        رقم الموبايل / واتساب:
                      </label>
                      <input
                        type="tel"
                        required
                        dir="ltr"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="010XXXXXXXX"
                        style={{ width: "100%", height: "38px", padding: "0 10px", borderRadius: "8px", border: "1px solid #EADBCC", fontSize: "12.5px", boxSizing: "border-box" }}
                      />
                    </div>

                    {orderType === "delivery" && (
                      <>
                        <div>
                          <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B5344", display: "block", marginBottom: "4px" }}>
                            منطقة التوصيل (6 أكتوبر والشيخ زايد):
                          </label>
                          <select
                            value={selectedZone.code}
                            onChange={(e) => {
                              const found = ALL_DELIVERY_ZONES.find((z) => z.code === e.target.value);
                              if (found) setSelectedZone(found);
                            }}
                            style={{ width: "100%", height: "38px", padding: "0 8px", borderRadius: "8px", border: "1px solid #EADBCC", fontSize: "12px", fontWeight: 700, boxSizing: "border-box" }}
                          >
                            {ALL_DELIVERY_ZONES.map((z) => (
                              <option key={z.code} value={z.code}>
                                {z.nameAr} ({z.fee} ج توصيل)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B5344", display: "block", marginBottom: "4px" }}>
                            العنوان بالتفصيل:
                          </label>
                          <input
                            type="text"
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="الشارع، رقم العمارة، الشقة، علامة مميزة"
                            style={{ width: "100%", height: "38px", padding: "0 10px", borderRadius: "8px", border: "1px solid #EADBCC", fontSize: "12px", boxSizing: "border-box" }}
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B5344", display: "block", marginBottom: "4px" }}>
                        ملاحظات خاصة:
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="تومية زيادة، عيش مقرمش..."
                        style={{ width: "100%", height: "38px", padding: "0 10px", borderRadius: "8px", border: "1px solid #EADBCC", fontSize: "12px", boxSizing: "border-box" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B5344", display: "block", marginBottom: "4px" }}>
                        طريقة الدفع:
                      </label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                        {[
                          { id: "cash", label: "كاش عند الاستلام 💵" },
                          { id: "instapay", label: "إنستاباي ⚡" },
                          { id: "wallet", label: "محفظة كاش 📱" },
                          { id: "card", label: "فيزا / كارت 💳" },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPaymentMethod(m.id)}
                            style={{
                              padding: "8px 4px",
                              borderRadius: "8px",
                              fontSize: "11px",
                              fontWeight: 800,
                              cursor: "pointer",
                              border: paymentMethod === m.id ? "1.5px solid #24140D" : "1px solid #EADBCC",
                              backgroundColor: paymentMethod === m.id ? "#24140D" : "#FFFFFF",
                              color: paymentMethod === m.id ? "#FBBF24" : "#24140D",
                            }}
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
              <div style={{
                padding: "16px 20px",
                borderTop: "1px solid #EADBCC",
                backgroundColor: "#FAF7F2",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6B5344" }}>
                  <span>المجموع الفرعي:</span>
                  <span>{cartSubtotal} ج</span>
                </div>
                {orderType === "delivery" && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6B5344" }}>
                    <span>رسوم التوصيل ({selectedZone.nameAr}):</span>
                    <span>{deliveryFee} ج</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: 900, color: "#24140D", paddingTop: "6px", borderTop: "1px dashed #EADBCC" }}>
                  <span>الإجمالي المطلوب:</span>
                  <span style={{ color: "#C2410C" }}>{cartTotal} ج.م</span>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    backgroundColor: "#DC2626",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: 900,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(220, 38, 38, 0.4)",
                  }}
                >
                  {submitting ? "جاري تسجيل الطلب..." : "تأكيد الطلب وإرسال الأوردر 🚀"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          7. ORDER SUCCESS MODAL
      ══════════════════════════════════════════════════════════════ */}
      {orderSuccess && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}>
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            border: "1px solid #EADBCC",
            maxWidth: "440px",
            width: "100%",
            padding: "28px 24px",
            textAlign: "center",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
          }}>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "rgba(34, 197, 94, 0.15)",
              color: "#16A34A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: 900, color: "#24140D", margin: "0 0 6px" }}>
              تم استلام طلبكم بنجاح! 🔥
            </h3>
            <p style={{ fontSize: "12.5px", color: "#6B5344", margin: "0 0 16px" }}>
              شكراً لاختياركم مطعم الوجبة الشهية. طلبك الآن في المطبخ للتحضير.
            </p>

            <div style={{
              padding: "10px",
              borderRadius: "10px",
              backgroundColor: "#FAF7F2",
              border: "1px solid #EADBCC",
              fontSize: "13px",
              fontWeight: 900,
              color: "#C2410C",
              marginBottom: "18px",
            }}>
              رقم الأوردر: #{orderSuccess.orderNumber}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link
                href={`/receipt/${orderSuccess.orderId}`}
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  backgroundColor: "#24140D",
                  color: "#FBBF24",
                  fontSize: "13px",
                  fontWeight: 900,
                  textDecoration: "none",
                  display: "block",
                }}
              >
                عرض الفاتورة وتتبع الأوردر مباشرة 📄
              </Link>

              {orderSuccess.whatsappNotify?.waUrl && (
                <a
                  href={orderSuccess.whatsappNotify.waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    backgroundColor: "#22C55E",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: 900,
                    textDecoration: "none",
                    display: "block",
                  }}
                >
                  متابعة الطلب عبر واتساب المطعم 💬
                </a>
              )}

              <button
                onClick={() => setOrderSuccess(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#6B5344",
                  fontSize: "12px",
                  cursor: "pointer",
                  marginTop: "6px",
                }}
              >
                العودة للقائمة الرئيسية
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Account & Live Chat Modals */}
      <CustomerAccountModal
        isOpen={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        lang="ar"
      />
      <CustomerChatWidget />
    </div>
  );
}
