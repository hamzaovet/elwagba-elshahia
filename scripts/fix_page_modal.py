with open('d:/Work/orca-wagba/app/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Add customerModalOpen state
c = c.replace(
    '  const [lang, setLang] = useState<"ar" | "en">("ar");',
    '  const [lang, setLang] = useState<"ar" | "en">("ar");\n  const [customerModalOpen, setCustomerModalOpen] = useState(false);'
)

# Listen to choco_open_customer event
c = c.replace(
    '    const handleCartOpen = () => setCartOpen(true);\n    window.addEventListener("choco_open_cart", handleCartOpen);',
    '    const handleCartOpen = () => setCartOpen(true);\n    window.addEventListener("choco_open_cart", handleCartOpen);\n    const handleCustomerOpen = () => setCustomerModalOpen(true);\n    window.addEventListener("choco_open_customer", handleCustomerOpen);'
)

c = c.replace(
    '      window.removeEventListener("choco_open_cart", handleCartOpen);\n      window.removeEventListener("choco_lang_change", handleLangChange);',
    '      window.removeEventListener("choco_open_cart", handleCartOpen);\n      window.removeEventListener("choco_open_customer", handleCustomerOpen);\n      window.removeEventListener("choco_lang_change", handleLangChange);'
)

# Update CustomerAccountModal rendering
c = c.replace(
    '<CustomerAccountModal />',
    '<CustomerAccountModal isOpen={customerModalOpen} onClose={() => setCustomerModalOpen(false)} lang={lang} />'
)

with open('d:/Work/orca-wagba/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print('app/page.tsx customer modal updated successfully!')
