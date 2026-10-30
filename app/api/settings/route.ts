import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

let cachedSettings: any = null;
let lastSettingsTime = 0;
const SETTINGS_TTL_MS = 10_000; // 10 seconds

export async function GET() {
  try {
    const now = Date.now();
    if (cachedSettings && now - lastSettingsTime < SETTINGS_TTL_MS) {
      return NextResponse.json(cachedSettings);
    }

    let settings = await prisma.systemSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: "default",
          restaurantName: "مطعم الوجبة الشهية",
          phone: "01019845220",
          hotlines: "01019845220 | 01111316817 | 01111316439",
          address: "6 أكتوبر - الحي الثاني - شارع جيل 2000 - المجاورة الثانية، عمارة 661 - مقابل مدرسة أم المؤمنين",
          deliveryZones: JSON.stringify([
            { name: "الحي الثاني (الفرع والمجاورة)", fee: 15 },
            { name: "الحي الأول والثالث", fee: 20 },
            { name: "الحي الرابع والخامس", fee: 25 },
            { name: "الحصري ومحور الكفراوي", fee: 20 },
            { name: "الحي السابع والثامن والتاسع", fee: 30 },
            { name: "الحي المتميز وغرب سوميد", fee: 35 },
            { name: "حدائق أكتوبر وأكتوبر الجديدة", fee: 40 },
            { name: "الشيخ زايد والقرية الذكية", fee: 45 },
          ]),
          soundsEnabled: true,
          offersEnabled: true,
          whatsappOrdersEnabled: true,
          ownerWhatsapp: "01019845220",
        },
      });
    }

    cachedSettings = settings;
    lastSettingsTime = now;
    return NextResponse.json(settings);
  } catch (err: unknown) {
    if (cachedSettings) return NextResponse.json(cachedSettings);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const updateData: any = {};
    if (body.restaurantName !== undefined) updateData.restaurantName = body.restaurantName;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.hotlines !== undefined) updateData.hotlines = body.hotlines;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.soundsEnabled !== undefined) updateData.soundsEnabled = body.soundsEnabled;
    if (body.offersEnabled !== undefined) updateData.offersEnabled = body.offersEnabled;
    if (body.specialOffers !== undefined) updateData.specialOffers = typeof body.specialOffers === "string" ? body.specialOffers : JSON.stringify(body.specialOffers);
    if (body.deliveryZones !== undefined) updateData.deliveryZones = typeof body.deliveryZones === "string" ? body.deliveryZones : JSON.stringify(body.deliveryZones);
    if (body.whatsappOrdersEnabled !== undefined) updateData.whatsappOrdersEnabled = body.whatsappOrdersEnabled;
    if (body.ownerWhatsapp !== undefined) updateData.ownerWhatsapp = body.ownerWhatsapp;
    if (body.saro5WebhookUrl !== undefined) updateData.saro5WebhookUrl = body.saro5WebhookUrl;
    if (body.talabatWebhookUrl !== undefined) updateData.talabatWebhookUrl = body.talabatWebhookUrl;

    const updated = await prisma.systemSettings.upsert({
      where: { id: "default" },
      update: updateData,
      create: {
        id: "default",
        restaurantName: body.restaurantName || "مطعم الوجبة الشهية",
        phone: body.phone || "01019845220",
        hotlines: body.hotlines || "01019845220 | 01111316817 | 01111316439",
        address: body.address || "6 أكتوبر - الحي الثاني - شارع جيل 2000 - المجاورة الثانية، عمارة 661 - مقابل مدرسة أم المؤمنين",
        soundsEnabled: body.soundsEnabled ?? true,
        offersEnabled: body.offersEnabled ?? true,
        whatsappOrdersEnabled: body.whatsappOrdersEnabled ?? true,
        ownerWhatsapp: body.ownerWhatsapp || "01019845220",
        saro5WebhookUrl: body.saro5WebhookUrl || null,
        talabatWebhookUrl: body.talabatWebhookUrl || null,
        deliveryZones: typeof body.deliveryZones === "string" ? body.deliveryZones : JSON.stringify(body.deliveryZones || []),
      },
    });

    cachedSettings = updated;
    lastSettingsTime = Date.now();

    return NextResponse.json(updated);
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
