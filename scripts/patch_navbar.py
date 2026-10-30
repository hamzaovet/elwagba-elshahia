with open('d:/Work/orca-wagba/components/Navbar.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Replace header background and styles
c = c.replace('color: #2B170E;', 'color: #F3F4F6;')
c = c.replace('background: "rgba(250, 246, 238, 0.95)"', 'background: "rgba(13, 10, 8, 0.96)"')
c = c.replace('borderBottom: "1px solid #E8DAC8"', 'borderBottom: "1px solid rgba(245, 158, 11, 0.25)"')
c = c.replace('boxShadow: "0 2px 14px rgba(78, 44, 21, 0.04)"', 'boxShadow: "0 4px 20px rgba(0, 0, 0, 0.6)"')

# Brand logo and texts
c = c.replace('/waffle-house-logo.jpg', '/logo.jpg')
c = c.replace('alt="Waffle House"', 'alt="الوجبة الشهية"')
c = c.replace('>Waffle House<', '>الوجبة الشهية<')
c = c.replace('color: "#2B170E"', 'color: "#FFFFFF"')
c = c.replace('color: "#C6873E"', 'color: "#F59E0B"')
c = c.replace('background: "#FAF6EE"', 'background: "#17120F"')
c = c.replace('border: "1.5px solid #E8DAC8"', 'border: "1.5px solid rgba(245, 158, 11, 0.4)"')
c = c.replace('{lang === "en" ? "PANCAKES • DRINKS" : "وافل هاوس"}', '{lang === "en" ? "GOOD FOOD BETTER MOOD" : "أكل بطعم بيحبه قلبك 🔥"}')

# Nav links
c = c.replace('{ href: "#menu",      label: "المنيو" }', '{ href: "#menu",      label: "المنيو والصواني" }')
c = c.replace('{ href: "#offers",    label: "العروض" }', '{ href: "#offers",    label: "عروض الشواية 🔥" }')

# Cart button
c = c.replace('background: "#d99b56"', 'background: "linear-gradient(135deg, #DC2626 0%, #EA580C 100%)"')
c = c.replace('color="#180e06"', 'color="#FFFFFF"')

with open('d:/Work/orca-wagba/components/Navbar.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print('Navbar patched successfully!')
