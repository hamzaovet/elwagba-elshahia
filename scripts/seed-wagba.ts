import { PrismaClient } from "../lib/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_XZhHCQ4L9zbj@ep-dry-field-barihkn7-pooler.c-8.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
  connectionString,
  max: 5,
  connectionTimeoutMillis: 30000,
});
const adapter = new PrismaPg(pool, { schema: "public" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔥 Starting seed for مطعم الوجبة الشهية...");

  // 1. Settings
  await prisma.systemSettings.upsert({
    where: { id: "default" },
    update: {
      restaurantName: "مطعم الوجبة الشهية",
      phone: "01019845220",
      hotlines: "01019845220 | 01111316817 | 01111316439",
      address: "6 أكتوبر - الحي الثاني - شارع جيل 2000 - المجاورة الثانية، عمارة 661 - مقابل مدرسة أم المؤمنين",
      whatsappOrdersEnabled: true,
      ownerWhatsapp: "01019845220",
      soundsEnabled: true,
      offersEnabled: true,
      specialOffers: JSON.stringify({
        enabled: true,
        bannerText: "عروض مشويات الشواية سارية الثلاثاء والأربعاء والخميس 🔥 | خصومات حتى 50 جنيه على الفراخ والشاورما!",
        activeDays: ["Tuesday", "Wednesday", "Thursday"],
        flashDeal: {
          title: "عرض اليوم الصاعق 🔥",
          item: "سندوتش شاورما فراخ صاج بـ 50 ج بدلاً من 90 ج في مناسبات الفلاش!",
        },
      }),
    },
    create: {
      id: "default",
      restaurantName: "مطعم الوجبة الشهية",
      phone: "01019845220",
      hotlines: "01019845220 | 01111316817 | 01111316439",
      address: "6 أكتوبر - الحي الثاني - شارع جيل 2000 - المجاورة الثانية، عمارة 661 - مقابل مدرسة أم المؤمنين",
      whatsappOrdersEnabled: true,
      ownerWhatsapp: "01019845220",
      soundsEnabled: true,
      offersEnabled: true,
      deliveryZones: JSON.stringify([
        { name: "الحي الثاني (الفرع والجوار)", fee: 15 },
        { name: "الحي الأول والثالث", fee: 20 },
        { name: "الحي الرابع والخامس", fee: 25 },
        { name: "الحي السابع والثامن", fee: 30 },
        { name: "الحصري ومحور الكفراوي", fee: 20 },
        { name: "الحي المتميز وغرب سوميد", fee: 35 },
        { name: "الشيخ زايد والقرية الذكية", fee: 45 },
      ]),
      specialOffers: JSON.stringify({
        enabled: true,
        bannerText: "عروض مشويات الشواية سارية الثلاثاء والأربعاء والخميس 🔥 | خصومات حتى 50 جنيه على الفراخ والشاورما!",
        activeDays: ["Tuesday", "Wednesday", "Thursday"],
      }),
    },
  });

  // 2. Users
  const users = [
    { name: "صاحب ومدير المطعم", phone: "01019845220", pin: "123456", role: "owner" },
    { name: "كاشير الصالة والدليفري", phone: "01111316817", pin: "1111", role: "cashier" },
    { name: "شيف المشويات والشاورما", phone: "01111316439", pin: "2222", role: "chef" },
    { name: "كابتن أوركا المحاسب", phone: "01018671000", pin: "3333", role: "accountant" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { phone: u.phone },
      update: { name: u.name, pin: u.pin, role: u.role },
      create: u,
    });
  }

  // 3. Categories
  const categories = [
    { nameAr: "صواني اللمة والعيلة", nameEn: "Family Trays & Combos", sortOrder: 1, image: "/menu/lamma-family-tray.jpg" },
    { nameAr: "مشويات الشواية", nameEn: "Rotisserie & Grills", sortOrder: 2, image: "/menu/farha-shawaya.jpg" },
    { nameAr: "الشاورما السوري والعروض", nameEn: "Syrian Shawarma & Deals", sortOrder: 3, image: "/menu/lamma-family-tray.jpg" },
    { nameAr: "البروستد والكرسبي والوجبات", nameEn: "Broasted & Crispy Meals", sortOrder: 4, image: "/menu/nos-farha-shawaya.jpg" },
    { nameAr: "الإضافات والصوصات والمقبلات", nameEn: "Sides, Sauces & Salads", sortOrder: 5, image: "/menu/double-werk-shawaya.jpg" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { nameAr: cat.nameAr },
      update: { nameEn: cat.nameEn, sortOrder: cat.sortOrder, image: cat.image },
      create: cat,
    });
  }

  // 4. Raw Ingredients for Recipe Costing
  const ingredients = [
    { name: "فرخة شواية طازجة", unit: "عدد", quantity: 50, minStock: 10, costPerUnit: 160 },
    { name: "صدور دجاج مخلية", unit: "كيلو", quantity: 45, minStock: 8, costPerUnit: 190 },
    { name: "أوراك دجاج طازجة", unit: "كيلو", quantity: 40, minStock: 8, costPerUnit: 140 },
    { name: "أرز بسمتي هندي درجة أولى", unit: "كيلو", quantity: 60, minStock: 15, costPerUnit: 75 },
    { name: "عيش صاج سوري طازج", unit: "ربطة", quantity: 100, minStock: 20, costPerUnit: 35 },
    { name: "بطاطس نصف مقلية فارم فريتس", unit: "كيلو", quantity: 80, minStock: 15, costPerUnit: 45 },
    { name: "تومية وثوم وزيت أصلي", unit: "لتر", quantity: 30, minStock: 5, costPerUnit: 60 },
    { name: "صوص سبايسي وشطة حارة", unit: "لتر", quantity: 25, minStock: 5, costPerUnit: 50 },
    { name: "تتبيلة وخلطة بروستد سرية", unit: "كيلو", quantity: 35, minStock: 5, costPerUnit: 55 },
    { name: "علب وتغليف دليفري وسلوفان", unit: "عدد", quantity: 500, minStock: 50, costPerUnit: 8 },
  ];

  for (const ing of ingredients) {
    const existing = await prisma.ingredient.findFirst({ where: { name: ing.name } });
    if (!existing) {
      await prisma.ingredient.create({ data: ing });
    }
  }

  // 5. Products (Real Menu Data)
  const products = [
    // Category A: صواني اللمة والعيلة
    {
      nameAr: "صينية الوجبة الشهية (الصينية الملكية)",
      nameEn: "Al Wagba Al Shahia Signature Tray",
      category: "صواني اللمة والعيلة",
      basePrice: 650,
      originalPrice: 720,
      promoPrice: 650,
      description: "نص فرخة بروستد + نص فرخة مشوي + 3 قطع كرسبي + 3 قطع سكالوب + سندوتش شاورما مقطع + أرز بسمتي أصفر + بطاطس محمرة + تومية + مخلل + صوص سبايسي + كولسلو",
      trayComponents: JSON.stringify([
        "نص فرخة بروستد كرسبي مقرمشة",
        "نص فرخة مشوية عالشواية والفحم",
        "3 قطع كرسبي سوبريم ذهبي",
        "3 قطع إسكالوب فراخ بانيه",
        "سندوتش شاورما صاج مقطع عالجريل",
        "طبق أرز بسمتي أصفر بالخلطة",
        "بطاطس محمرة عائلية",
        "تومية سورية أصيلة",
        "مخلل مشكل مقرمش",
        "صوص سبايسي حار",
        "سلطة كولسلو فاخرة"
      ]),
      modifiers: JSON.stringify([
        { nameAr: "عادي", nameEn: "Regular", price: 0 },
        { nameAr: "سبايسي حار 🔥", nameEn: "Spicy", price: 0 },
        { nameAr: "تومية إضافية", nameEn: "Extra Toumia", price: 15 },
        { nameAr: "صوص سبايسي إضافي", nameEn: "Extra Spicy Sauce", price: 15 },
        { nameAr: "جبنة موتزاريلا سايحة", nameEn: "Extra Melted Cheese", price: 25 },
      ]),
      image: "/menu/lamma-family-tray.jpg",
      sortOrder: 1,
    },
    {
      nameAr: "صينية لمة العيلة",
      nameEn: "Family Gathering Tray",
      category: "صواني اللمة والعيلة",
      basePrice: 580,
      originalPrice: 640,
      promoPrice: 580,
      description: "ربع كيلو شاورما + 2 سيخ شيش طاووق + وجبة فاهيتا + أرز بسمتي + بطاطس + تومية + مخلل + خبز + صوص سبايسي + كولسلو",
      trayComponents: JSON.stringify([
        "ربع كيلو شاورما فراخ سوري متبلة",
        "2 سيخ شيش طاووق مشوي عالجريل",
        "وجبة فاهيتا فراخ مكسيكي بالخضار",
        "أرز بسمتي أصفر فاخر",
        "بطاطس مقلية كرسبي",
        "تومية سورية أصيلة",
        "مخلل مشكل",
        "خبز سوري محمص عالجريل",
        "صوص سبايسي حار",
        "سلطة كولسلو منعشة"
      ]),
      modifiers: JSON.stringify([
        { nameAr: "عادي", nameEn: "Regular", price: 0 },
        { nameAr: "سبايسي حار 🔥", nameEn: "Spicy", price: 0 },
        { nameAr: "تومية زيادة", nameEn: "Extra Toumia", price: 15 },
        { nameAr: "صوص سبايسي زيادة", nameEn: "Extra Spicy", price: 15 },
      ]),
      image: "/menu/lamma-family-tray.jpg",
      sortOrder: 2,
    },
    {
      nameAr: "صينية وجبة شاورما عائلي",
      nameEn: "Family Shawarma Feast Tray",
      category: "صواني اللمة والعيلة",
      basePrice: 420,
      originalPrice: 460,
      promoPrice: 420,
      description: "6 سندوتشات شاورما صاج مقطعين عالجريل + بطاطس محمرة + تومية + مخلل + خبز محمر عالجريل + صوص سبايسي",
      trayComponents: JSON.stringify([
        "6 سندوتشات شاورما صاج محمصين عالجريل",
        "بطاطس محمرة حجم عائلي",
        "2 عبوة تومية سورية كلاسيك",
        "مخلل مشكل مقرمش",
        "خبز صاج مقرمش ومتبل",
        "صوص سبايسي حار"
      ]),
      modifiers: JSON.stringify([
        { nameAr: "عادي", nameEn: "Regular", price: 0 },
        { nameAr: "سبايسي حار 🔥", nameEn: "Spicy", price: 0 },
        { nameAr: "تومية زيادة", nameEn: "Extra Toumia", price: 15 },
      ]),
      image: "/menu/lamma-family-tray.jpg",
      sortOrder: 3,
    },

    // Category B: مشويات الشواية (With Day-Specific Promo Logic)
    {
      nameAr: "فرخة شواية كاملة",
      nameEn: "Whole Rotisserie Chicken Meal",
      category: "مشويات الشواية",
      basePrice: 420,
      originalPrice: 420,
      promoPrice: 370,
      promoDays: "الثلاثاء والأربعاء والخميس",
      promoActive: true,
      description: "فرخة شواية متحمرة ومظبوطة على الآخر مع أرز بسمتي أصفر + بطاطس + تومية + مخلل + عيش",
      trayComponents: JSON.stringify([
        "فرخة شواية كاملة مشوية ومتحمرة",
        "أرز بسمتي أصفر مبهر",
        "بطاطس محمرة مقرمشة",
        "تومية سورية أصيلة",
        "مخلل مشكل",
        "عيش سوري طازج"
      ]),
      modifiers: JSON.stringify([
        { nameAr: "عادي", nameEn: "Regular", price: 0 },
        { nameAr: "سبايسي حار 🔥", nameEn: "Spicy", price: 0 },
        { nameAr: "تومية إضافية", nameEn: "Extra Toumia", price: 15 },
        { nameAr: "أرز بسمتي زيادة", nameEn: "Extra Rice", price: 40 },
      ]),
      image: "/menu/farha-shawaya.jpg",
      sortOrder: 4,
    },
    {
      nameAr: "نص فرخة شواية",
      nameEn: "Half Rotisserie Chicken Meal",
      category: "مشويات الشواية",
      basePrice: 210,
      originalPrice: 210,
      promoPrice: 185,
      promoDays: "الثلاثاء والأربعاء والخميس",
      promoActive: true,
      description: "نص فرخة شواية متحمرة ومظبوطة مع أرز بسمتي أصفر + بطاطس + تومية + مخلل + خبز",
      trayComponents: JSON.stringify([
        "نص فرخة شواية محمرة",
        "أرز بسمتي أصفر بالخلطة",
        "بطاطس مقلية",
        "تومية سورية",
        "مخلل",
        "عيش سوري"
      ]),
      modifiers: JSON.stringify([
        { nameAr: "ورك ونص", nameEn: "Thigh Side", price: 0 },
        { nameAr: "صدر وجناح", nameEn: "Breast Side", price: 0 },
        { nameAr: "سبايسي حار 🔥", nameEn: "Spicy", price: 0 },
        { nameAr: "تومية إضافية", nameEn: "Extra Toumia", price: 15 },
      ]),
      image: "/menu/nos-farha-promo.jpg",
      sortOrder: 5,
    },
    {
      nameAr: "دبل ورك شواية",
      nameEn: "Double Rotisserie Thighs Meal",
      category: "مشويات الشواية",
      basePrice: 200,
      originalPrice: 200,
      promoPrice: 170,
      promoDays: "الثلاثاء والأربعاء والخميس",
      promoActive: true,
      description: "2 ورك شواية متحمرين على الجريل مع أرز بسمتي أصفر + بطاطس + تومية + مخلل",
      trayComponents: JSON.stringify([
        "2 ورك شواية متحمرين ومتبلين",
        "أرز بسمتي أصفر",
        "بطاطس مقلية كرسبي",
        "تومية سورية",
        "مخلل"
      ]),
      modifiers: JSON.stringify([
        { nameAr: "عادي", nameEn: "Regular", price: 0 },
        { nameAr: "سبايسي حار 🔥", nameEn: "Spicy", price: 0 },
        { nameAr: "تومية زيادة", nameEn: "Extra Toumia", price: 15 },
      ]),
      image: "/menu/double-werk-shawaya.jpg",
      sortOrder: 6,
    },

    // Category C: الشاورما السوري والعروض
    {
      nameAr: "سندوتش شاورما فراخ صاج",
      nameEn: "Chicken Shawarma Saj Sandwich",
      category: "الشاورما السوري والعروض",
      basePrice: 90,
      originalPrice: 90,
      promoPrice: 70,
      promoActive: true,
      isFlashDeal: true,
      description: "طعم الصاج الأصلي مع التومية والمخلل والعيش السوري المحمص عالجريل",
      modifiers: JSON.stringify([
        { nameAr: "عادي", nameEn: "Regular", price: 0 },
        { nameAr: "سبايسي حار 🌶️", nameEn: "Spicy", price: 0 },
        { nameAr: "إضافة جبنة موتزاريلا 🧀", nameEn: "Extra Mozzarella", price: 20 },
        { nameAr: "تومية زيادة", nameEn: "Extra Toumia", price: 10 },
      ]),
      image: "/menu/lamma-family-tray.jpg",
      sortOrder: 7,
    },
    {
      nameAr: "عرض 2 سندوتش شاورما صاج",
      nameEn: "Duo Shawarma Saj Deal (2 Sandwiches)",
      category: "الشاورما السوري والعروض",
      basePrice: 180,
      originalPrice: 180,
      promoPrice: 150,
      promoActive: true,
      description: "عرض الأكيلة: أي اتنين سندوتش شاورما صاج محمصين عالجريل مع التومية والمخلل",
      modifiers: JSON.stringify([
        { nameAr: "2 عادي", nameEn: "Both Regular", price: 0 },
        { nameAr: "2 سبايسي حار 🔥", nameEn: "Both Spicy", price: 0 },
        { nameAr: "1 عادي + 1 سبايسي", nameEn: "1 Regular + 1 Spicy", price: 0 },
      ]),
      image: "/menu/lamma-family-tray.jpg",
      sortOrder: 8,
    },
    {
      nameAr: "وجبة شاورما عربي صاج",
      nameEn: "Arabic Shawarma Meal Box",
      category: "الشاورما السوري والعروض",
      basePrice: 130,
      originalPrice: 145,
      promoPrice: 130,
      description: "سندوتش شاورما كبير مقطع أصابع مع بطاطس محمرة + تومية + مخلل + صوص سبايسي",
      image: "/menu/lamma-family-tray.jpg",
      sortOrder: 9,
    },
    {
      nameAr: "فتة شاورما فراخ سوري",
      nameEn: "Syrian Chicken Shawarma Fatta",
      category: "الشاورما السوري والعروض",
      basePrice: 140,
      originalPrice: 155,
      promoPrice: 140,
      description: "أرز بسمتي أصفر مبهر + قطع شاورما دجاج متبلة + خبز شامي مقرمش محمص + صوص تومية أصيل",
      image: "/menu/lamma-family-tray.jpg",
      sortOrder: 10,
    },

    // Category D: البروستد والكرسبي والوجبات
    {
      nameAr: "وجبة بروستد 4 قطع (نص فرخة)",
      nameEn: "4-Piece Broasted Chicken Meal",
      category: "البروستد والكرسبي والوجبات",
      basePrice: 195,
      description: "4 قطع دجاج بروستد كرسبي مقرمش + بطاطس + تومية + كولسلو + عيش",
      modifiers: JSON.stringify([
        { nameAr: "عادي كرسبي", nameEn: "Regular", price: 0 },
        { nameAr: "سبايسي نار 🔥", nameEn: "Spicy", price: 0 },
      ]),
      image: "/menu/nos-farha-shawaya.jpg",
      sortOrder: 11,
    },
    {
      nameAr: "وجبة بروستد 8 قطع (فرخة كاملة)",
      nameEn: "8-Piece Broasted Family Feast",
      category: "البروستد والكرسبي والوجبات",
      basePrice: 380,
      description: "8 قطع دجاج بروستد ذهبي مقرمش + بطاطس حجم عائلي + 2 كولسلو + 2 تومية + 4 عيش",
      modifiers: JSON.stringify([
        { nameAr: "عادي كرسبي", nameEn: "Regular", price: 0 },
        { nameAr: "سبايسي نار 🔥", nameEn: "Spicy", price: 0 },
        { nameAr: "مشكل 4 عادي و 4 سبايسي", nameEn: "Half & Half", price: 0 },
      ]),
      image: "/menu/nos-farha-shawaya.jpg",
      sortOrder: 12,
    },
    {
      nameAr: "وجبة كرسبي سوبريم (5 قطع)",
      nameEn: "5-Piece Crispy Strips Supreme Meal",
      category: "البروستد والكرسبي والوجبات",
      basePrice: 175,
      description: "5 أصابع كرسبي ستربس مقرمشة ومتبلة + بطاطس محمرة + تومية + كولسلو + عيش",
      image: "/menu/nos-farha-shawaya.jpg",
      sortOrder: 13,
    },
    {
      nameAr: "سندوتش فاهيتا فراخ مكسيكي",
      nameEn: "Chicken Fajita Sandwich",
      category: "البروستد والكرسبي والوجبات",
      basePrice: 95,
      description: "شرائح صدور دجاج مشوية مع فلفل ألوان وبصل وتوابل فاهيتا وصوص مكسيكي",
      image: "/menu/lamma-family-tray.jpg",
      sortOrder: 14,
    },
    {
      nameAr: "سندوتش شيش طاووق جريل",
      nameEn: "Shish Tawook Grilled Sandwich",
      category: "البروستد والكرسبي والوجبات",
      basePrice: 95,
      description: "أسياخ شيش طاووق مشوية على الفحم مع التومية والمخلل",
      image: "/menu/lamma-family-tray.jpg",
      sortOrder: 15,
    },
    {
      nameAr: "سندوتش إسكالوب فراخ بانيه",
      nameEn: "Crispy Escalope Chicken Sandwich",
      category: "البروستد والكرسبي والوجبات",
      basePrice: 90,
      description: "صدر دجاج إسكالوب بانيه كرسبي مع الجبنة والمايونيز والخس المقرمش",
      image: "/menu/nos-farha-shawaya.jpg",
      sortOrder: 16,
    },

    // Category E: الإضافات والصوصات والمقبلات
    {
      nameAr: "أرز بسمتي أصفر فاخر",
      nameEn: "Yellow Basmati Rice",
      category: "الإضافات والصوصات والمقبلات",
      basePrice: 40,
      description: "أرز بسمتي هندي طويل الحبة مطبوخ بالبهارات والخلطة السرية",
      image: "/menu/nos-farha-promo.jpg",
      sortOrder: 17,
    },
    {
      nameAr: "بطاطس محمرة فارم فريتس",
      nameEn: "Crispy French Fries",
      category: "الإضافات والصوصات والمقبلات",
      basePrice: 35,
      description: "أصابع بطاطس مقلية ذهبية مقرمشة",
      image: "/menu/double-werk-shawaya.jpg",
      sortOrder: 18,
    },
    {
      nameAr: "تومية سورية أصلية",
      nameEn: "Syrian Garlic Toumia",
      category: "الإضافات والصوصات والمقبلات",
      basePrice: 20,
      description: "علبة تومية سورية كريمية طازجة",
      image: "/menu/lamma-family-tray.jpg",
      sortOrder: 19,
    },
    {
      nameAr: "صوص سبايسي حار",
      nameEn: "Hot Spicy Sauce",
      category: "الإضافات والصوصات والمقبلات",
      basePrice: 20,
      description: "صوص الشطة الحارة بالخلطة الخاصة لعشاق السبايسي",
      image: "/menu/lamma-family-tray.jpg",
      sortOrder: 20,
    },
    {
      nameAr: "سلطة كولسلو",
      nameEn: "Coleslaw Salad",
      category: "الإضافات والصوصات والمقبلات",
      basePrice: 25,
      description: "كرنب وجزر طازج مع دريسينج الكولسلو الحلو المنعش",
      image: "/menu/lamma-family-tray.jpg",
      sortOrder: 21,
    },
    {
      nameAr: "مخلل مشكل سوري",
      nameEn: "Mixed Pickles",
      category: "الإضافات والصوصات والمقبلات",
      basePrice: 15,
      description: "خيار ولفت وجزر وفلفل مخلل مقرمش",
      image: "/menu/double-werk-shawaya.jpg",
      sortOrder: 22,
    },
    {
      nameAr: "خبز صاج سوري محمص (3 أرغفة)",
      nameEn: "Toasted Saj Bread (3 pcs)",
      category: "الإضافات والصوصات والمقبلات",
      basePrice: 10,
      description: "خبز صاج سوري رقيق محمص بالزعتر والزيت عالجريل",
      image: "/menu/lamma-family-tray.jpg",
      sortOrder: 23,
    },
  ];

  for (const prod of products) {
    const existing = await prisma.product.findFirst({ where: { nameAr: prod.nameAr } });
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: prod,
      });
    } else {
      await prisma.product.create({
        data: prod,
      });
    }
  }

  // 6. Delivery Zones (6th of October & Nearby)
  const zones = [
    { nameAr: "الحي الثاني (الفرع والمجاورة)", nameEn: "District 2 (Branch Area)", fee: 15, timeMinutes: 30, code: "6OCT-02" },
    { nameAr: "الحي الأول والحي الثالث", nameEn: "District 1 & 3", fee: 20, timeMinutes: 35, code: "6OCT-01-03" },
    { nameAr: "الحي الرابع والحي الخامس", nameEn: "District 4 & 5", fee: 25, timeMinutes: 40, code: "6OCT-04-05" },
    { nameAr: "الحصري ومحور الكفراوي", nameEn: "Hosary & Kafrawy Axis", fee: 20, timeMinutes: 35, code: "6OCT-HOS" },
    { nameAr: "الحي السابع والثامن والتاسع", nameEn: "District 7, 8, 9", fee: 30, timeMinutes: 45, code: "6OCT-07-09" },
    { nameAr: "الحي المتميز وغرب سوميد", nameEn: "Distinctive & West Somid", fee: 35, timeMinutes: 45, code: "6OCT-MOT" },
    { nameAr: "حدائق أكتوبر وأكتوبر الجديدة", nameEn: "October Gardens & New Oct", fee: 40, timeMinutes: 50, code: "6OCT-GAR" },
    { nameAr: "الشيخ زايد والقرية الذكية", nameEn: "Sheikh Zayed & Smart Village", fee: 45, timeMinutes: 55, code: "ZAYED-01" },
  ];

  for (const z of zones) {
    const existing = await prisma.deliveryZone.findFirst({ where: { nameAr: z.nameAr } });
    if (existing) {
      await prisma.deliveryZone.update({
        where: { id: existing.id },
        data: z,
      });
    } else {
      await prisma.deliveryZone.create({
        data: z,
      });
    }
  }

  console.log("✅ Seed completed successfully for مطعم الوجبة الشهية!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
