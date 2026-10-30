with open('d:/Work/orca-wagba/components/ErpLayout.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('/waffle-house-logo.jpg', '/logo.jpg')
c = c.replace('alt="Waffle House"', 'alt="الوجبة الشهية"')
c = c.replace('>Waffle House<', '>الوجبة الشهية<')
c = c.replace('Waffle House', 'الوجبة الشهية')
c = c.replace('linear-gradient(135deg, #1C0500 0%, #290802 35%, #4A0E06 70%, #150300 100%)', 'linear-gradient(135deg, #0D0A08 0%, #17100D 35%, #24120C 70%, #0A0807 100%)')
c = c.replace('backgroundColor: "#160401"', 'backgroundColor: "#120E0C"')
c = c.replace('#3E1005', '#2A1E17')

# Footer attribution in ErpLayout
c = c.replace(
    '<span>{t("تم تطوير وبرمجة النظام بواسطة ", "System developed by ")}</span>',
    '<span>{t("تم تطوير النظام بواسطة شركة أوركا للحلول البرمجية والخدمات السحابية", "System developed by Orca Cloud & Software Solutions")}</span>'
)

with open('d:/Work/orca-wagba/components/ErpLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print('ErpLayout patched successfully!')
