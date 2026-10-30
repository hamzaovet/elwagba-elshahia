import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public order placement for مطعم الوجبة الشهية
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.customerName || !body.phone || !body.items) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const pad = (n: number) => String(n).padStart(2, "0");
    const now = new Date();
    const orderNumber = `WS-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${String(Date.now()).slice(-4)}`;

    const orderType = body.orderType || "delivery";
    const items = typeof body.items === "string" ? body.items : JSON.stringify(body.items);
    const subtotal = Number(body.subtotal) || 0;
    const deliveryFee = (orderType === "takeaway" || orderType === "dinein") ? 0 : (Number(body.deliveryFee) || 15);
    const total = subtotal + deliveryFee;
    const deposit = Number(body.deposit) || 0;
    const remaining = total - deposit;
    const timeline = JSON.stringify([{ stage: "new", at: now.toISOString(), by: "customer" }]);

    const defaultZone = orderType === "takeaway"
      ? "استلام من فرع الحي الثاني - 6 أكتوبر"
      : orderType === "dinein"
      ? "صالة المطعم"
      : (body.zone || "الحي الثاني - 6 أكتوبر");

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: body.customerName,
        phone: body.phone,
        address: body.address || "",
        zone: defaultZone,
        orderType,
        items,
        subtotal,
        deliveryFee,
        total,
        deposit,
        remaining,
        paymentMethod: body.paymentMethod || "cash",
        notes: body.notes || "",
        customerEmail: body.customerEmail || null,
        customerId: body.customerId || null,
        timeline,
        status: "new",
      },
    });

    // Auto-save/update customer in Customer database
    try {
      const cleanPhone = String(body.phone).trim();
      const cleanName = String(body.customerName).trim();
      const cleanAddr = String(body.address || "").trim();
      const cleanZone = String(defaultZone).trim();
      const cleanEmail = body.customerEmail ? String(body.customerEmail).trim().toLowerCase() : null;

      await prisma.$executeRawUnsafe(`
        INSERT INTO "Customer" (id, name, phone, email, address, zone, "isVerified", "updatedAt")
        VALUES (
          ${`'cust_${Date.now()}'`},
          ${`'${cleanName.replace(/'/g, "''")}'`},
          ${`'${cleanPhone.replace(/'/g, "''")}'`},
          ${cleanEmail ? `'${cleanEmail.replace(/'/g, "''")}'` : 'NULL'},
          ${`'${cleanAddr.replace(/'/g, "''")}'`},
          ${`'${cleanZone.replace(/'/g, "''")}'`},
          false,
          NOW()
        )
        ON CONFLICT (phone) DO UPDATE SET
          name = EXCLUDED.name,
          address = EXCLUDED.address,
          zone = EXCLUDED.zone,
          "updatedAt" = NOW();
      `);
    } catch (custErr) {
      console.warn("Auto-save customer error:", custErr);
    }

    // Prepare WhatsApp Order Alert for Owner / Management
    let whatsappNotify: { enabled: boolean; targetPhone: string; waUrl: string } | null = null;
    try {
      const settings = await prisma.systemSettings.findUnique({ where: { id: "default" } });
      const targetPhone = settings?.ownerWhatsapp || settings?.phone || "01019845220";
      const cleanTarget = targetPhone.replace(/[^0-9]/g, "");
      const fullTarget = cleanTarget.startsWith("2") ? cleanTarget : `2${cleanTarget}`;

      let parsedItems: any[] = [];
      try {
        parsedItems = typeof body.items === "string" ? JSON.parse(body.items) : body.items;
      } catch {}

      const itemsLines = parsedItems
        .map((i: any) => `• ${i.nameAr || i.nameEn || "صنف"} (×${i.qty}) - ${Number(i.unitPrice || 0) * Number(i.qty || 1)} ج`)
        .join("\n");

      const typeLabel =
        orderType === "takeaway" ? "🛍️ تيك أواي (استلام من الفرع)" :
        orderType === "dinein" ? "🍽️ صالة داخل المطعم" : "🛵 دليفري (توصيل للمنزل)";

      const paymentLabel =
        body.paymentMethod === "cash" ? "كاش عند الاستلام 💵" :
        body.paymentMethod === "instapay" ? "إنستاباي ⚡" :
        body.paymentMethod === "wallet" ? "محفظة كاش 📱" : "فيزا / كارت 💳";

      const origin = req.headers.get("origin") || "https://alwagba-alshahia.vercel.app";
      const receiptUrl = `${origin}/receipt/${order.id}`;

      const waText =
        `🔔 أوردر جديد تم تسجيله على سيستم الوجبة الشهية!\n` +
        `--------------------------------\n` +
        `رقم الأوردر: #${orderNumber}\n` +
        `نوع الطلب: ${typeLabel}\n` +
        `👤 العميل: ${body.customerName}\n` +
        `📱 الهاتف: ${body.phone}\n` +
        (orderType === "delivery" ? `📍 العنوان: ${body.address || "غير محدد"} (${defaultZone})\n` : "") +
        `--------------------------------\n` +
        `📋 الأصناف المطلوبة:\n${itemsLines}\n` +
        `--------------------------------\n` +
        `المجموع الفرعي: ${subtotal} ج\n` +
        (orderType === "delivery" ? `خدمة التوصيل: ${deliveryFee} ج\n` : "") +
        `💰 الإجمالي المطلوب تحصيله: ${total} ج.م\n` +
        `💳 طريقة الدفع: ${paymentLabel}\n` +
        (body.notes ? `📝 ملاحظات: ${body.notes}\n` : "") +
        `--------------------------------\n` +
        `🔗 رابط الفاتورة والتتبع الرقمي المباشر:\n${receiptUrl}`;

      whatsappNotify = {
        enabled: settings?.whatsappOrdersEnabled ?? true,
        targetPhone,
        waUrl: `https://wa.me/${fullTarget}?text=${encodeURIComponent(waText)}`,
      };
    } catch (waErr) {
      console.warn("WhatsApp notification error:", waErr);
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId: order.id,
      whatsappNotify,
    }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
