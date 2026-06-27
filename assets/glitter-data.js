(function () {
  const keys = {
    products: "glitterProducts",
    coupons: "glitterCoupons",
    orders: "glitterOrders",
    settings: "glitterSettings",
    admins: "glitterAdmins",
    session: "glitterAdminSession",
    cart: "glitterCart"
  };

  const defaultSettings = {
    storeName: "Glitter",
    currency: "ج.م",
    shippingFee: 65,
    freeShippingFrom: 2500,
    adminWhatsApp: "201287737602",
    supportWhatsApp: "201287737602",
    supportEmail: "glitterstoreonline7@gmail.com",
    // For GitHub Pages, fill these values before uploading so every visitor can send order emails.
    // Admin settings are saved in localStorage, so they only affect the current browser.
    emailjsEnabled: true,
emailjsServiceId: "service_26ngd6n",
emailjsTemplateId: "template_8aa4psh",
emailjsPublicKey: "BfhTpX14VsvS--cMi",
    visual: {
      heroTitleAr: "Glitter لكل ستايل.",
      heroTitleEn: "Glitter for every style.",
      heroTextAr: "اختار القسم المناسب وابدأ تجربة تسوق سريعة، واضحة، ومناسبة للرفع على GitHub Pages.",
      heroTextEn: "Choose your section and start a fast, clean shopping experience ready for GitHub Pages.",
      categoryOrder: ["men", "women", "kids"],
      categories: {
        women: {
          ar: "نساء",
          en: "Women",
          textAr: "قصات عصرية وخامات مريحة لإطلالات يومية وخروج.",
          textEn: "Modern cuts and comfortable fabrics for everyday looks.",
          image: "assets/category-women.svg"
        },
        men: {
          ar: "رجال",
          en: "Men",
          textAr: "قطع كاجوال نظيفة وتفاصيل ذهبية هادئة.",
          textEn: "Clean casual pieces with subtle gold details.",
          image: "assets/category-men.svg"
        },
        kids: {
          ar: "أطفال",
          en: "Kids",
          textAr: "راحة وحركة وخامات مناسبة للأطفال.",
          textEn: "Comfort, movement, and kid-friendly fabrics.",
          image: "assets/category-kids.svg"
        }
      },
      sectionPage: {
        eyebrowAr: "Glitter",
        eyebrowEn: "Glitter",
        searchLabelAr: "بحث",
        searchLabelEn: "Search",
        searchPlaceholderAr: "ابحث باسم المنتج",
        searchPlaceholderEn: "Search product name",
        filterLabelAr: "القسم",
        filterLabelEn: "Category",
        sortLabelAr: "الترتيب",
        sortLabelEn: "Sort",
        emptyTextAr: "لا توجد منتجات في هذا القسم حاليا.",
        emptyTextEn: "No products in this section yet."
      },
      benefits: [
        { arTitle: "خامات مختارة", arText: "تركيز على الراحة والتشطيب المناسب للبس المتكرر.", enTitle: "Selected Fabrics", enText: "Comfortable materials with clean finishing for repeated wear." },
        { arTitle: "قيمة واضحة", arText: "سعر مناسب مقابل جودة القطعة وقابليتها للتنسيق.", enTitle: "Clear Value", enText: "Fair pricing for quality and easy styling." },
        { arTitle: "طلب سريع", arText: "دفع عند الاستلام ورسالة واتساب جاهزة لتأكيد الطلب.", enTitle: "Fast Order", enText: "Cash on delivery with a ready WhatsApp confirmation." }
      ]
    },
    motionPromos: [],
    invoiceBusinessName: "Glitter | GL Fashion",
    invoiceTaxId: "",
    invoiceAddress: "أضف عنوان المتجر من الإعدادات",
    warrantyText: "ضمان ضد عيوب الصناعة لمدة 14 يوم من تاريخ الاستلام.",
    returnText: "الاستبدال متاح حسب حالة المنتج وسياسة البراند.",
    invoiceFooter: "شكرا لاختيارك Glitter."
  };

  const defaultProducts = [
    {
      id: "p-men-hoodie",
      name: "Glitter Oversized Hoodie",
      category: "هوديز",
      audiences: ["men", "women"],
      price: 1250,
      oldPrice: 1450,
      stock: 18,
      badge: "New",
      fabric: "قطن مبطن",
      description: "هودي واسع بخامة مريحة وتفصيلة ذهبية هادئة.",
      detailsDescription: "قصة oversized مريحة، Rib قوي عند الأطراف، وخامة مناسبة للاستخدام اليومي.",
      sizeImage: "",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: [{ name: "أسود", value: "#171513" }, { name: "رمادي", value: "#8b8b86" }, { name: "بيج", value: "#c9b18a" }],
      image: "",
      tone: "#d7bd78",
      featured: true,
      createdAt: "2026-06-01T10:00:00.000Z"
    },
    {
      id: "p-men-denim",
      name: "Clean Denim Jacket",
      category: "جاكيتات",
      audiences: ["men"],
      price: 1550,
      oldPrice: 0,
      stock: 12,
      badge: "Best Seller",
      fabric: "دنيم متوسط الوزن",
      description: "جاكيت دنيم بقصة نظيفة وسهل التنسيق.",
      detailsDescription: "خياطة واضحة، جيوب عملية، ولون مناسب للمواسم.",
      sizeImage: "",
      sizes: ["S", "M", "L", "XL"],
      colors: [{ name: "أزرق دنيم", value: "#6d7f91" }, { name: "أسود", value: "#1f1c18" }],
      image: "",
      tone: "#c4c9c8",
      featured: true,
      createdAt: "2026-06-08T10:00:00.000Z"
    },
    {
      id: "p-women-set",
      name: "Soft Gold Set",
      category: "أطقم",
      audiences: ["women"],
      price: 1720,
      oldPrice: 0,
      stock: 16,
      badge: "Signature",
      fabric: "ميلتون خفيف",
      description: "طقم مريح بخامة ناعمة وقصة أنيقة غير مقيدة.",
      detailsDescription: "يتكون من قطعتين بتناسق لون واحد، مناسب للأيام الطويلة والخروج.",
      sizeImage: "",
      sizes: ["S", "M", "L", "XL"],
      colors: [{ name: "رمادي", value: "#8b8b86" }, { name: "كافيه", value: "#8b735a" }, { name: "أسود", value: "#171513" }],
      image: "",
      tone: "#cfc5b4",
      featured: true,
      createdAt: "2026-06-16T10:00:00.000Z"
    },
    {
      id: "p-women-jacket",
      name: "Minimal Bomber Jacket",
      category: "جاكيتات",
      audiences: ["women", "men"],
      price: 1980,
      oldPrice: 2250,
      stock: 9,
      badge: "Limited",
      fabric: "نايلون مبطن",
      description: "جاكيت بومبر خفيف بتصميم نظيف وتفصيلة ذهبية صغيرة.",
      detailsDescription: "مبطن بخفة، مناسب للتنسيق فوق التيشيرت أو الهودي.",
      sizeImage: "",
      sizes: ["M", "L", "XL", "XXL"],
      colors: [{ name: "أسود", value: "#161513" }, { name: "زيتوني", value: "#3d4a3c" }],
      image: "",
      tone: "#6b5b37",
      featured: false,
      createdAt: "2026-06-18T10:00:00.000Z"
    },
    {
      id: "p-kids-tee",
      name: "Kids Signature Tee",
      category: "أطفال",
      audiences: ["kids"],
      price: 390,
      oldPrice: 460,
      stock: 30,
      badge: "Kids",
      fabric: "قطن ناعم",
      description: "تيشيرت أطفال خفيف وناعم مع شعار Glitter صغير.",
      detailsDescription: "خامة قطنية مناسبة للحركة، سهلة الغسيل، ومريحة للاستخدام اليومي.",
      sizeImage: "",
      sizes: ["2Y", "4Y", "6Y", "8Y", "10Y", "12Y"],
      colors: [{ name: "أبيض", value: "#fff9ee" }, { name: "أسود", value: "#171513" }, { name: "رملي", value: "#c7b08b" }],
      image: "",
      tone: "#ead8bc",
      featured: true,
      createdAt: "2026-06-12T10:00:00.000Z"
    },
    {
      id: "p-kids-hoodie",
      name: "Kids Cozy Hoodie",
      category: "أطفال",
      audiences: ["kids"],
      price: 690,
      oldPrice: 0,
      stock: 22,
      badge: "Comfy",
      fabric: "قطن مبطن خفيف",
      description: "هودي أطفال مريح بخامة دافئة وتفصيل عملي.",
      detailsDescription: "مناسب للمدرسة والخروج، مع قصّة تسمح بالحركة.",
      sizeImage: "",
      sizes: ["4Y", "6Y", "8Y", "10Y", "12Y"],
      colors: [{ name: "رمادي", value: "#8d8c86" }, { name: "ذهبي هادئ", value: "#c9a34d" }, { name: "كحلي", value: "#30384d" }],
      image: "",
      tone: "#d7c8a2",
      featured: false,
      createdAt: "2026-06-20T10:00:00.000Z"
    }
  ];

  const defaultCoupons = [
    { id: "c-1", code: "GLITTER10", type: "percent", value: 10, minOrder: 700, maxDiscount: 250, expiresAt: "2026-12-31", active: true, usage: 0 },
    { id: "c-2", code: "GLVIP", type: "fixed", value: 150, minOrder: 1200, maxDiscount: 150, expiresAt: "2026-12-31", active: true, usage: 0 }
  ];

  const defaultAdmins = [
    { id: "admin-root", name: "المدير الرئيسي", username: "admin", password: "Glitter@2026", role: "super", active: true, createdAt: "2026-06-27T00:00:00.000Z" }
  ];

  function read(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function migrateProducts(products) {
    const legacyIds = new Set(["p-velvet-001", "p-satin-002", "p-blazer-003", "p-skirt-004", "p-shirt-005", "p-abaya-006"]);
    let changed = false;
    let cleaned = products.filter(product => {
      if (legacyIds.has(product.id)) {
        changed = true;
        return false;
      }
      return true;
    }).map(product => {
      if (Array.isArray(product.audiences) && product.audiences.length) return product;
      changed = true;
      return { ...product, audiences: ["men", "women"] };
    });
    if (!cleaned.length || changed) {
      const existingIds = new Set(cleaned.map(product => product.id));
      cleaned = [...defaultProducts.filter(product => !existingIds.has(product.id)), ...cleaned];
      write(keys.products, cleaned);
    }
    return cleaned;
  }

  function seed() {
    if (!localStorage.getItem(keys.products)) write(keys.products, defaultProducts);
    if (!localStorage.getItem(keys.coupons)) write(keys.coupons, defaultCoupons);
    if (!localStorage.getItem(keys.orders)) write(keys.orders, []);
    if (!localStorage.getItem(keys.settings)) write(keys.settings, defaultSettings);
    if (!localStorage.getItem(keys.admins)) write(keys.admins, defaultAdmins);
    const settings = getSettings();
    if (settings.adminWhatsApp === "201000000000") settings.adminWhatsApp = defaultSettings.adminWhatsApp;
    if (settings.supportWhatsApp === "201000000000") settings.supportWhatsApp = defaultSettings.supportWhatsApp;
    if (settings.supportEmail === "support@glitter.eg") settings.supportEmail = defaultSettings.supportEmail;
    if (!settings.emailjsEnabled && defaultSettings.emailjsEnabled) settings.emailjsEnabled = true;
    if (!settings.emailjsServiceId && defaultSettings.emailjsServiceId) settings.emailjsServiceId = defaultSettings.emailjsServiceId;
    if (!settings.emailjsTemplateId && defaultSettings.emailjsTemplateId) settings.emailjsTemplateId = defaultSettings.emailjsTemplateId;
    if (!settings.emailjsPublicKey && defaultSettings.emailjsPublicKey) settings.emailjsPublicKey = defaultSettings.emailjsPublicKey;
    write(keys.settings, settings);
    migrateProducts(read(keys.products, defaultProducts));
  }

  function deepMerge(base, next) {
    const out = { ...base };
    Object.keys(next || {}).forEach(key => {
      if (next[key] && typeof next[key] === "object" && !Array.isArray(next[key])) out[key] = deepMerge(base[key] || {}, next[key]);
      else out[key] = next[key];
    });
    return out;
  }

  function getSettings() { return deepMerge(defaultSettings, read(keys.settings, defaultSettings)); }
  function saveSettings(settings) { write(keys.settings, deepMerge(defaultSettings, settings)); }
  function getProducts() { return migrateProducts(read(keys.products, defaultProducts)); }
  function saveProducts(products) { write(keys.products, products); }
  function getOrders() { return read(keys.orders, []); }
  function saveOrders(orders) { write(keys.orders, orders); }
  function getCoupons() { return read(keys.coupons, defaultCoupons); }
  function saveCoupons(coupons) { write(keys.coupons, coupons); }
  function getAdmins() { return read(keys.admins, defaultAdmins); }
  function saveAdmins(admins) { write(keys.admins, admins); }
  function getCart() { return read(keys.cart, []); }
  function saveCart(cart) { write(keys.cart, cart); }

  function money(value) {
    const settings = getSettings();
    return `${Number(value || 0).toLocaleString("ar-EG")} ${settings.currency || "ج.م"}`;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));
  }

  window.Glitter = {
    keys,
    defaultSettings,
    defaultProducts,
    defaultCoupons,
    defaultAdmins,
    seed,
    read,
    write,
    getSettings,
    saveSettings,
    getProducts,
    saveProducts,
    getOrders,
    saveOrders,
    getCoupons,
    saveCoupons,
    getAdmins,
    saveAdmins,
    getCart,
    saveCart,
    money,
    escapeHtml
  };
})();
