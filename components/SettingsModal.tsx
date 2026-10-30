"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStaff } from "@/context/StaffContext";
import { useLanguage } from "@/context/LanguageContext";
import { playSound } from "@/lib/sounds";
import {
  Settings, X, Store, Phone, MapPin,
  Bell, Volume2, Save, Loader2, Check,
  Smartphone, Share2, Bike, Globe
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { lang, t, dir } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "whatsapp" | "integrations">("general");

  const [settings, setSettings] = useState({
    restaurantName: "مطعم الوجبة الشهية",
    phone: "01019845220",
    hotlines: "01019845220 | 01111316817 | 01111316439",
    address: "6 أكتوبر - الحي الثاني - شارع جيل 2000 - المجاورة الثانية، عمارة 661 - مقابل مدرسة أم المؤمنين",
    soundsEnabled: true,
    whatsappOrdersEnabled: true,
    ownerWhatsapp: "01019845220",
    saro5WebhookUrl: "",
    talabatWebhookUrl: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  async function fetchSettings() {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          restaurantName: data.restaurantName || "مطعم الوجبة الشهية",
          phone: data.phone || "01019845220",
          hotlines: data.hotlines || "01019845220 | 01111316817 | 01111316439",
          address: data.address || "6 أكتوبر - الحي الثاني - شارع جيل 2000 - المجاورة الثانية، عمارة 661 - مقابل مدرسة أم المؤمنين",
          soundsEnabled: data.soundsEnabled ?? true,
          whatsappOrdersEnabled: data.whatsappOrdersEnabled ?? true,
          ownerWhatsapp: data.ownerWhatsapp || "01019845220",
          saro5WebhookUrl: data.saro5WebhookUrl || "",
          talabatWebhookUrl: data.talabatWebhookUrl || "",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    playSound("click");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        playSound("success");
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div dir={dir} style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      backgroundColor: "rgba(0, 0, 0, 0.82)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{
        backgroundColor: "#17120F",
        borderRadius: "20px",
        border: "1px solid rgba(245, 158, 11, 0.3)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)",
        width: "100%",
        maxWidth: "620px",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        color: "#FFFFFF",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 24px",
          borderBottom: "1px solid rgba(245, 158, 11, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #1C1511 0%, #17110E 100%)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(220, 38, 38, 0.35)",
            }}>
              <Settings size={20} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 900, color: "#FFFFFF", margin: 0 }}>
                {t("إعدادات النظام والتشغيل", "System & Operations Settings")}
              </h2>
              <p style={{ fontSize: "11px", color: "#F59E0B", margin: "2px 0 0" }}>
                مطعم الوجبة الشهية — 6 أكتوبر
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#9CA3AF",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex",
          padding: "8px 20px 0",
          gap: "8px",
          borderBottom: "1px solid rgba(245, 158, 11, 0.15)",
          background: "#140F0C",
        }}>
          {[
            { id: "general", label: "🏢 بيانات المطعم", icon: Store },
            { id: "whatsapp", label: "💬 تنبيهات واتساب", icon: Phone },
            { id: "integrations", label: "🛵 الربط والتوصيل (صاروخ)", icon: Bike },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: "10px 14px",
                fontSize: "12.5px",
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
                borderBottom: activeTab === tab.id ? "2.5px solid #DC2626" : "2.5px solid transparent",
                color: activeTab === tab.id ? "#F59E0B" : "#9CA3AF",
                background: "transparent",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div style={{
          padding: "20px 24px",
          overflowY: "auto",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
              <Loader2 className="animate-spin text-[#F59E0B]" size={32} />
            </div>
          ) : (
            <>
              {activeTab === "general" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 800, color: "#F59E0B", marginBottom: "6px", display: "block" }}>
                      اسم المطعم التجاري:
                    </label>
                    <input
                      type="text"
                      value={settings.restaurantName}
                      onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
                      style={{
                        width: "100%",
                        height: "42px",
                        backgroundColor: "#1F1814",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        borderRadius: "10px",
                        color: "#FFFFFF",
                        padding: "0 12px",
                        fontSize: "13.5px",
                        fontWeight: 700,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 800, color: "#F59E0B", marginBottom: "6px", display: "block" }}>
                      خطوط الهاتف الساخنة للطلبات:
                    </label>
                    <input
                      type="text"
                      value={settings.hotlines}
                      onChange={(e) => setSettings({ ...settings, hotlines: e.target.value })}
                      style={{
                        width: "100%",
                        height: "42px",
                        backgroundColor: "#1F1814",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        borderRadius: "10px",
                        color: "#FFFFFF",
                        padding: "0 12px",
                        fontSize: "13.5px",
                        fontWeight: 700,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 800, color: "#F59E0B", marginBottom: "6px", display: "block" }}>
                      عنوان الفرع في 6 أكتوبر:
                    </label>
                    <textarea
                      rows={2}
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      style={{
                        width: "100%",
                        backgroundColor: "#1F1814",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        borderRadius: "10px",
                        color: "#FFFFFF",
                        padding: "10px 12px",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        lineHeight: 1.5,
                      }}
                    />
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px",
                    borderRadius: "12px",
                    background: "rgba(245, 158, 11, 0.08)",
                    border: "1px solid rgba(245, 158, 11, 0.2)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Volume2 size={18} color="#F59E0B" />
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#FFFFFF" }}>أصوات التنبيهات الفورية</div>
                        <div style={{ fontSize: "11px", color: "#9CA3AF" }}>تشغيل جرس صوتي عند وصول أي أوردر جديد</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.soundsEnabled}
                      onChange={(e) => setSettings({ ...settings, soundsEnabled: e.target.checked })}
                      style={{ width: "18px", height: "18px", accentColor: "#DC2626", cursor: "pointer" }}
                    />
                  </div>
                </div>
              )}

              {activeTab === "whatsapp" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{
                    padding: "16px",
                    borderRadius: "14px",
                    background: settings.whatsappOrdersEnabled ? "rgba(34, 197, 94, 0.1)" : "#1C1511",
                    border: settings.whatsappOrdersEnabled ? "1.5px solid #22C55E" : "1px solid rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "10px",
                          background: settings.whatsappOrdersEnabled ? "#22C55E" : "#333",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#FFF", fontSize: "18px",
                        }}>
                          💬
                        </div>
                        <div>
                          <div style={{ fontSize: "13.5px", fontWeight: 900, color: "#FFFFFF" }}>
                            إرسال رسائل الطلبات لواتساب الإدارة
                          </div>
                          <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                            توجيه تفاصيل كل أوردر فور تسجيله إلى واتساب صاحب المطعم
                          </div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.whatsappOrdersEnabled}
                        onChange={(e) => setSettings({ ...settings, whatsappOrdersEnabled: e.target.checked })}
                        style={{ width: "20px", height: "20px", accentColor: "#22C55E", cursor: "pointer" }}
                      />
                    </div>

                    {settings.whatsappOrdersEnabled && (
                      <div style={{ paddingTop: "10px", borderTop: "1px dashed rgba(34, 197, 94, 0.3)" }}>
                        <label style={{ fontSize: "12px", fontWeight: 800, color: "#86EFAC", display: "block", marginBottom: "6px" }}>
                          رقم واتساب الإدارة / صاحب المطعم:
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={settings.ownerWhatsapp}
                          onChange={(e) => setSettings({ ...settings, ownerWhatsapp: e.target.value })}
                          style={{
                            width: "100%",
                            height: "42px",
                            backgroundColor: "#0D0A08",
                            border: "1.5px solid #22C55E",
                            borderRadius: "10px",
                            color: "#86EFAC",
                            padding: "0 12px",
                            fontSize: "14px",
                            fontWeight: 800,
                          }}
                        />
                        <span style={{ fontSize: "11px", color: "#4ADE80", marginTop: "4px", display: "block" }}>
                          ✓ يتم إرسال رسالة منسقة بالأصناف، الإجمالي، العنوان ورابط الفاتورة المباشر.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "integrations" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{
                    padding: "16px",
                    borderRadius: "14px",
                    background: "rgba(220, 38, 38, 0.08)",
                    border: "1px solid rgba(220, 38, 38, 0.25)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Bike className="text-[#DC2626]" size={20} />
                      <div style={{ fontSize: "13.5px", fontWeight: 900, color: "#FFFFFF" }}>
                        ربط تطبيق صاروخ لأسطول الدليفري (Saro5 Delivery App)
                      </div>
                    </div>
                    <p style={{ fontSize: "11px", color: "#D1D5DB" }}>
                      إرسال إحداثيات وتفاصيل الأوردر تلقائياً لكباتن الدليفري المسجلين على تطبيق صاروخ.
                    </p>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="https://api.saro5.com/webhook/wagba-shahia"
                      value={settings.saro5WebhookUrl}
                      onChange={(e) => setSettings({ ...settings, saro5WebhookUrl: e.target.value })}
                      style={{
                        width: "100%",
                        height: "40px",
                        backgroundColor: "#1F1814",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        borderRadius: "10px",
                        color: "#FFFFFF",
                        padding: "0 12px",
                        fontSize: "12px",
                      }}
                    />
                  </div>

                  <div style={{
                    padding: "16px",
                    borderRadius: "14px",
                    background: "rgba(245, 158, 11, 0.08)",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Globe className="text-[#F59E0B]" size={20} />
                      <div style={{ fontSize: "13.5px", fontWeight: 900, color: "#FFFFFF" }}>
                        ربط مجمعات الطلبات الخارجية (طلبات Talabat Webhook)
                      </div>
                    </div>
                    <p style={{ fontSize: "11px", color: "#D1D5DB" }}>
                      استقبال طلبات طلبات وتوجيهها مباشرة لشاشة الكاشير والمطبخ.
                    </p>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="https://talabat-relay.orca.cloud/v1/wagba"
                      value={settings.talabatWebhookUrl}
                      onChange={(e) => setSettings({ ...settings, talabatWebhookUrl: e.target.value })}
                      style={{
                        width: "100%",
                        height: "40px",
                        backgroundColor: "#1F1814",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        borderRadius: "10px",
                        color: "#FFFFFF",
                        padding: "0 12px",
                        fontSize: "12px",
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid rgba(245, 158, 11, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#140F0C",
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              backgroundColor: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#9CA3AF",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            إلغاء
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
              border: "none",
              color: "#FFFFFF",
              fontSize: "13.5px",
              fontWeight: 900,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 15px rgba(220, 38, 38, 0.4)",
            }}
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : savedSuccess ? <Check size={16} /> : <Save size={16} />}
            <span>{savedSuccess ? "تم الحفظ بنجاح! ✓" : saving ? "جاري الحفظ..." : "حفظ الإعدادات"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
