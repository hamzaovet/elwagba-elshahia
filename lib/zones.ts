export interface ZoneItem {
  id?: string;
  code?: string;
  nameEn: string;
  nameAr: string;
  fee: number;
  timeMinutes: number;
  isActive?: boolean;
}

export const OCTOBER_DELIVERY_ZONES: ZoneItem[] = [
  { code: "6OCT-02", nameAr: "الحي الثاني (الفرع والمجاورة)", nameEn: "District 2 (Branch Area)", fee: 15.0, timeMinutes: 25 },
  { code: "6OCT-01-03", nameAr: "الحي الأول والحي الثالث", nameEn: "District 1 & 3", fee: 20.0, timeMinutes: 30 },
  { code: "6OCT-04-05", nameAr: "الحي الرابع والحي الخامس", nameEn: "District 4 & 5", fee: 25.0, timeMinutes: 35 },
  { code: "6OCT-HOS", nameAr: "الحصري ومحور الكفراوي وجامعة 6 أكتوبر", nameEn: "Hosary, Kafrawy & University", fee: 20.0, timeMinutes: 30 },
  { code: "6OCT-07-09", nameAr: "الحي السابع والثامن والتاسع", nameEn: "District 7, 8, 9", fee: 30.0, timeMinutes: 40 },
  { code: "6OCT-10-12", nameAr: "الحي العاشر والحادي عشر والثاني عشر", nameEn: "District 10, 11, 12", fee: 30.0, timeMinutes: 40 },
  { code: "6OCT-MOT", nameAr: "الحي المتميز وغرب سوميد", nameEn: "Distinctive District & West Somid", fee: 35.0, timeMinutes: 45 },
  { code: "6OCT-GAR", nameAr: "حدائق أكتوبر وأكتوبر الجديدة", nameEn: "October Gardens & New October", fee: 40.0, timeMinutes: 50 },
  { code: "ZAYED-01", nameAr: "الشيخ زايد والقرية الذكية وحدائق المهندسين", nameEn: "Sheikh Zayed & Smart Village", fee: 45.0, timeMinutes: 50 },
  { code: "6OCT-IND", nameAr: "المنطقة الصناعية ومحور 26 يوليو", nameEn: "Industrial Zone & 26th July Axis", fee: 35.0, timeMinutes: 45 },
];

export const CAIRO_DELIVERY_ZONES: ZoneItem[] = OCTOBER_DELIVERY_ZONES;
export const ALL_DELIVERY_ZONES: ZoneItem[] = OCTOBER_DELIVERY_ZONES;

export const DEFAULT_ZONE: ZoneItem = ALL_DELIVERY_ZONES[0]; // الحي الثاني 15 ج.م

export function findZone(nameOrCode?: string): ZoneItem {
  if (!nameOrCode) return DEFAULT_ZONE;
  const clean = nameOrCode.trim().toLowerCase();
  const match = ALL_DELIVERY_ZONES.find(
    (z) =>
      (z.code && z.code.toLowerCase() === clean) ||
      z.nameAr.toLowerCase().includes(clean) ||
      z.nameEn.toLowerCase().includes(clean) ||
      clean.includes(z.nameAr.toLowerCase()) ||
      clean.includes(z.nameEn.toLowerCase())
  );
  return (
    match || {
      nameAr: nameOrCode,
      nameEn: nameOrCode,
      fee: 20.0,
      timeMinutes: 35,
    }
  );
}
