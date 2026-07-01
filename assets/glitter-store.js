(function () {
  const G = window.Glitter;
  G.seed();

  let settings = G.getSettings();
  let products = G.getProducts();
  let cart = G.getCart();
  let selectedProduct = null;
  let selectedOptions = {};
  let selectedQty = 1;
  let activeCoupon = null;

  const page = document.body.dataset.page || "home";
  const audience = document.body.dataset.audience || "";
  const $ = selector => document.querySelector(selector);

  function prefLang() { return localStorage.getItem("glitterLang") || "ar"; }
  function prefTheme() { return localStorage.getItem("glitterTheme") || "light"; }
  function isAr() { return prefLang() === "ar"; }
  function text(ar, en) { return isAr() ? ar : en; }

  function setupPrefs() {
    document.documentElement.lang = prefLang();
    document.documentElement.dir = isAr() ? "rtl" : "ltr";
    document.documentElement.dataset.theme = prefTheme();
  }

  function escape(value) { return G.escapeHtml(value); }
  function money(value) { return G.money(value); }
  function cssImage(value) {
    const raw = String(value || "");
    const normalized = raw.startsWith("assets/") ? `/${raw}` : raw;
    return `url('${escape(normalized)}')`;
  }

  function categoryMeta(id) {
    return settings.visual.categories[id] || settings.visual.categories.men;
  }

  function pageHref(id) {
    return ({ men: "glitter-men.html", women: "glitter-women.html", kids: "glitter-kids.html" })[id] || "glitter-store.html";
  }

  function renderChrome() {
    const top = $("#topStrip");
    if (top) {
      top.innerHTML = `<div class="strip-track">
        <span>${text("الدفع عند الاستلام", "Cash on delivery")}</span>
        <span>${text("خامات مختارة", "Selected fabrics")}</span>
        <span>${text("رجال، نساء، أطفال", "Men, Women, Kids")}</span>
        <span>${text("تأكيد الطلب عبر واتساب", "WhatsApp order confirmation")}</span>
      </div>`;
    }

    const header = $("#siteHeader");
    if (header) {
      header.innerHTML = `
        <a class="brand" href="glitter-store.html" aria-label="Glitter">
          <img class="brand-logo" src="assets/glitter-logo.jpeg" alt="Glitter logo">
          <span class="brand-name"><strong>Glitter</strong><span>GL Fashion</span></span>
        </a>
        <div></div>
        <div class="header-actions">
          <span class="toggle-pill" aria-label="${text("تبديل اللغة", "Language switch")}">
            <button type="button" data-lang="ar" class="${isAr() ? "active" : ""}">AR</button>
            <button type="button" data-lang="en" class="${!isAr() ? "active" : ""}">EN</button>
          </span>
          <button class="icon-btn" type="button" id="themeToggle" title="${text("الوضع الليلي", "Dark mode")}">${prefTheme() === "dark" ? "☀" : "☾"}</button>
          <a class="icon-btn" href="glitter-cart.html" title="${text("السلة", "Cart")}">🛒<span id="cartBadge">${cartCount()}</span></a>
          <button class="icon-btn" id="menuOpen" type="button" aria-label="${text("القائمة", "Menu")}">☰</button>
        </div>`;
    }

    const side = $("#sideMenu");
    const backdrop = $("#sideBackdrop");
    if (side && backdrop) {
      side.dir = isAr() ? "rtl" : "ltr";
      side.innerHTML = `
        <div class="side-head">
          <span class="brand"><img class="brand-logo" src="assets/glitter-logo.jpeg" alt=""><span class="brand-name"><strong>Glitter</strong><span>Menu</span></span></span>
          <button class="icon-btn" id="menuClose" type="button">×</button>
        </div>
        <nav class="side-links">
          <a href="glitter-store.html"><span>${text("الرئيسية", "Home")}</span><b></b></a>
          <a href="glitter-women.html"><span>${text("نساء", "Women")}</span><b></b></a>
          <a href="glitter-men.html"><span>${text("رجال", "Men")}</span><b></b></a>
          <a href="glitter-kids.html"><span>${text("أطفال", "Kids")}</span><b></b></a>
          <a href="glitter-cart.html"><span>${text("السلة والدفع", "Cart & Checkout")}</span><b></b></a>
        </nav>
        <div>${text("واتساب الدعم", "Support WhatsApp")}: ${escape(settings.supportWhatsApp)}</div>`;
    }

    const footer = $("#siteFooter");
    if (footer) {
      footer.innerHTML = `<div class="container">
        <strong>Glitter | GL Fashion</strong>
        <p>${text("جميع الحقوق محفوظة. للتواصل:", "All rights reserved. Contact:")} ${escape(settings.supportEmail)}</p>
      </div>`;
    }

    bindChrome();
  }

  function bindChrome() {
    document.querySelectorAll("[data-lang]").forEach(button => {
      button.addEventListener("click", () => {
        localStorage.setItem("glitterLang", button.dataset.lang);
        location.reload();
      });
    });
    $("#themeToggle")?.addEventListener("click", () => {
      localStorage.setItem("glitterTheme", prefTheme() === "dark" ? "light" : "dark");
      location.reload();
    });
    $("#menuOpen")?.addEventListener("click", () => {
      $("#sideBackdrop").hidden = false;
      $("#sideMenu").hidden = false;
    });
    $("#menuClose")?.addEventListener("click", closeMenu);
    $("#sideBackdrop")?.addEventListener("click", () => {
      if ($("#productDrawer") && !$("#productDrawer").hidden) closeDrawer();
      else closeMenu();
    });
  }

  function closeMenu() {
    $("#sideBackdrop").hidden = true;
    $("#sideMenu").hidden = true;
  }

  function cartCount() {
    return cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  }

  function renderHome() {
    const root = $("#homeRoot");
    if (!root) return;
    const order = settings.visual.categoryOrder || ["women", "men", "kids"];
    root.innerHTML = `
      <section class="hero-home container">
        <div class="home-title">
          <span class="eyebrow">${text("اختر القسم", "Choose a section")}</span>
          <h1><span class="gold-text">${escape(text(settings.visual.heroTitleAr, settings.visual.heroTitleEn))}</span></h1>
          <p>${escape(text(settings.visual.heroTextAr, settings.visual.heroTextEn))}</p>
        </div>
        <div class="category-tiles">
          ${order.map(id => {
            const meta = categoryMeta(id);
            return `<a class="category-tile" href="${pageHref(id)}" style="--tile-image:${cssImage(meta.image)}">
              <small>${text("اذهب إلى القسم", "Go to fashion")}</small>
              <strong>${escape(text(meta.ar, meta.en))}</strong>
              <span>${escape(text(meta.textAr, meta.textEn))}</span>
            </a>`;
          }).join("")}
        </div>
      </section>
      ${renderMotionPromos()}
      ${renderHomeInfo()}
      ${renderBenefits()}`;
  }

  function renderHomeInfo() {
    return `<section class="container page-hero">
      <div class="page-card page-title">
        <span class="eyebrow">${text("قبل الشراء", "Before Buying")}</span>
        <h1>${text("اختيار أسهل وطلب أوضح.", "Easier choice, clearer order.")}</h1>
        <p>${text("كل منتج له تفاصيله الخاصة من خامة ومقاسات وألوان. افتح المنتج، راجع التفاصيل، ثم أضفه للسلة وكمّل الطلب بالدفع عند الاستلام.", "Each product has its own fabric, sizing, and colors. Open the product, review the details, add it to cart, and complete with cash on delivery.")}</p>
      </div>
      <div class="page-photo" style="--tile-image:${cssImage("assets/category-kids.svg")}"></div>
    </section>`;
  }

  function renderMotionPromos() {
    const promos = (settings.motionPromos || []).filter(item => item && item.active !== false && item.mediaUrl);
    if (!promos.length) return "";
    return `<section class="motion-spotlight">${promos.map(item => {
      const media = item.mediaType === "video"
        ? `<video src="${escape(item.mediaUrl)}" muted autoplay loop playsinline></video>`
        : `<img src="${escape(item.mediaUrl)}" alt="">`;
      return `<article class="motion-slide"><div class="motion-media-grid" aria-hidden="true">${media}${media}${media}</div><div class="motion-copy"><strong>${escape(item.kicker || "DROP")}</strong><span>${escape(item.beforeText || "FROM")}</span><b>${escape(item.mainText || "NEW")}</b><small>${escape(item.afterText || "ONLINE")}</small></div></article>`;
    }).join("")}</section>`;
  }

  function renderBenefits() {
    return `<section class="container info-grid">
      ${(settings.visual.benefits || []).map((item, index) => `<article class="panel info-card">
        <b>${String(index + 1).padStart(2, "0")}</b>
        <h3>${escape(text(item.arTitle, item.enTitle))}</h3>
        <p>${escape(text(item.arText, item.enText))}</p>
      </article>`).join("")}
    </section>`;
  }

  function renderInfo() {
    const root = $("#infoRoot");
    if (!root) return;
    root.innerHTML = `<section class="container page-hero">
      <div class="page-card page-title">
        <span class="eyebrow">${text("قبل الشراء", "Before Buying")}</span>
        <h1>${text("تجربة واضحة من أول اختيار.", "A clear experience from the first choice.")}</h1>
        <p>${text("هنا بنركز على ما يهمك كعميل: الخامة، المقاس الخاص بكل منتج، السعر مقابل الجودة، وطريقة تأكيد الطلب.", "We focus on what matters: fabric, product-specific sizing, value for money, and order confirmation.")}</p>
      </div>
      <div class="page-photo" style="--tile-image:${cssImage("assets/category-men.svg")}"></div>
    </section>${renderBenefits()}`;
  }

  function productMatchesAudience(product) {
    return Array.isArray(product.audiences) && product.audiences.includes(audience);
  }

  function renderCategoryPage() {
    const root = $("#categoryRoot");
    if (!root) return;
    const meta = categoryMeta(audience);
    const sectionPage = settings.visual.sectionPage || {};
    root.innerHTML = `
      <section class="container page-hero">
        <div class="page-card page-title">
          <span class="eyebrow">${escape(text(sectionPage.eyebrowAr || "Glitter", sectionPage.eyebrowEn || "Glitter"))}</span>
          <h1>${escape(text(meta.ar, meta.en))}</h1>
          <p>${escape(text(meta.textAr, meta.textEn))}</p>
        </div>
        <div class="page-photo" style="--tile-image:${cssImage(meta.image)}"></div>
      </section>
      <section class="container">
        <div class="toolbar">
          <div class="field"><label>${escape(text(sectionPage.searchLabelAr || "بحث", sectionPage.searchLabelEn || "Search"))}</label><input id="searchInput" type="search" placeholder="${escape(text(sectionPage.searchPlaceholderAr || "ابحث باسم المنتج", sectionPage.searchPlaceholderEn || "Search product name"))}"></div>
          <div class="field"><label>${escape(text(sectionPage.filterLabelAr || "القسم", sectionPage.filterLabelEn || "Category"))}</label><select id="categoryFilter"></select></div>
          <div class="field"><label>${escape(text(sectionPage.sortLabelAr || "الترتيب", sectionPage.sortLabelEn || "Sort"))}</label><select id="sortFilter"><option value="featured">${text("المميز", "Featured")}</option><option value="low">${text("الأقل سعرا", "Lowest")}</option><option value="high">${text("الأعلى سعرا", "Highest")}</option><option value="new">${text("الأحدث", "Newest")}</option></select></div>
        </div>
        <div class="product-grid" id="productGrid"></div>
      </section>`;
    renderCategoryFilter();
    renderProducts();
    $("#searchInput").addEventListener("input", renderProducts);
    $("#categoryFilter").addEventListener("change", renderProducts);
    $("#sortFilter").addEventListener("change", renderProducts);
  }

  function renderCategoryFilter() {
    const filtered = products.filter(productMatchesAudience).filter(product => Number(product.stock) > 0);
    const categories = [text("الكل", "All"), ...new Set(filtered.map(product => product.category).filter(Boolean))];
    $("#categoryFilter").innerHTML = categories.map(category => `<option value="${escape(category)}">${escape(category)}</option>`).join("");
  }

  function getFilteredProducts() {
    const query = ($("#searchInput")?.value || "").trim().toLowerCase();
    const allLabel = text("الكل", "All");
    const category = $("#categoryFilter")?.value || allLabel;
    const sort = $("#sortFilter")?.value || "featured";
    let list = products.filter(productMatchesAudience).filter(product => Number(product.stock) > 0).filter(product => {
      const haystack = `${product.name} ${product.category} ${product.fabric} ${product.description}`.toLowerCase();
      return (!query || haystack.includes(query)) && (category === allLabel || product.category === category);
    });
    if (sort === "low") list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "high") list.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "new") list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    if (sort === "featured") list.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    return list;
  }

  function renderProducts() {
    const grid = $("#productGrid");
    const list = getFilteredProducts();
    if (!list.length) {
      const sectionPage = settings.visual.sectionPage || {};
      grid.innerHTML = `<div class="empty">${escape(text(sectionPage.emptyTextAr || "لا توجد منتجات في هذا القسم حاليا.", sectionPage.emptyTextEn || "No products in this section yet."))}</div>`;
      return;
    }
    grid.innerHTML = list.map((product, index) => {
      const image = product.image ? `<img src="${escape(product.image)}" alt="${escape(product.name)}">` : "";
      return `<article class="product-card in-view" style="--visual-tone:${escape(product.tone || "#d8c082")}; transition-delay:${Math.min(index * 35, 220)}ms">
        <div class="product-visual">${product.badge ? `<span class="badge">${escape(product.badge)}</span>` : ""}${image}</div>
        <div class="product-body">
          <div class="product-title"><h3>${escape(product.name)}</h3><small>${escape(product.fabric || "")}</small></div>
          <div class="price"><span>${money(product.price)}</span>${Number(product.oldPrice) > 0 ? `<del>${money(product.oldPrice)}</del>` : ""}</div>
          <p class="product-desc">${escape(product.description)}</p>
          <button class="gold-btn" type="button" data-open-product="${escape(product.id)}">${text("اختيار التفاصيل", "Choose details")}</button>
        </div>
      </article>`;
    }).join("");
    document.querySelectorAll("[data-open-product]").forEach(button => button.addEventListener("click", () => openProduct(button.dataset.openProduct)));
  }

  function openProduct(id) {
    selectedProduct = products.find(product => product.id === id);
    if (!selectedProduct) return;
    selectedQty = 1;
    selectedOptions = {
      size: selectedProduct.sizes?.[0] || "Free",
      color: selectedProduct.colors?.[0]?.name || "Basic"
    };
    renderProductDrawer();
    $("#sideBackdrop").hidden = false;
    $("#productDrawer").hidden = false;
  }

  function renderProductDrawer() {
    const p = selectedProduct;
    const image = p.image ? `<img src="${escape(p.image)}" alt="${escape(p.name)}">` : "";
    $("#productDrawer").innerHTML = `
      <div class="drawer-head"><strong>${escape(p.name)}</strong><button class="icon-btn" id="closeDrawer" type="button">×</button></div>
      <div class="drawer-body">
        <div class="drawer-product-visual" style="--visual-tone:${escape(p.tone || "#d8c082")}">${p.badge ? `<span class="badge">${escape(p.badge)}</span>` : ""}${image}</div>
        <div class="price"><span>${money(p.price)}</span>${Number(p.oldPrice) > 0 ? `<del>${money(p.oldPrice)}</del>` : ""}</div>
        <p class="detail-box">${escape(p.detailsDescription || p.description).replace(/\n/g, "<br>")}</p>
        ${p.sizeImage ? `<div class="detail-box"><strong>${text("مقاسات المنتج", "Product sizing")}</strong><img src="${escape(p.sizeImage)}" alt=""></div>` : ""}
        <div><div class="option-label">${text("المقاس", "Size")}</div><div class="size-row">${(p.sizes || ["Free"]).map(size => `<button class="size-chip ${selectedOptions.size === size ? "active" : ""}" data-size="${escape(size)}">${escape(size)}</button>`).join("")}</div></div>
        <div><div class="option-label">${text("اللون", "Color")}</div><div class="color-row">${(p.colors || [{ name: "Basic", value: "#c9a34d" }]).map(color => `<button class="swatch ${selectedOptions.color === color.name ? "active" : ""}" title="${escape(color.name)}" style="background:${escape(color.value)}" data-color="${escape(color.name)}"></button>`).join("")}</div></div>
        <div><div class="option-label">${text("الكمية", "Qty")}</div><div class="actions-row"><button class="btn" id="qtyMinus" type="button">-</button><strong>${selectedQty}</strong><button class="btn" id="qtyPlus" type="button">+</button></div></div>
        <div class="drawer-actions-sticky"><button class="gold-btn" id="addToCart" type="button">${text("إضافة للسلة", "Add to cart")}</button></div>
      </div>`;
    $("#closeDrawer").addEventListener("click", closeDrawer);
    document.querySelectorAll("[data-size]").forEach(button => button.addEventListener("click", () => { selectedOptions.size = button.dataset.size; renderProductDrawer(); }));
    document.querySelectorAll("[data-color]").forEach(button => button.addEventListener("click", () => { selectedOptions.color = button.dataset.color; renderProductDrawer(); }));
    $("#qtyMinus").addEventListener("click", () => { selectedQty = Math.max(1, selectedQty - 1); renderProductDrawer(); });
    $("#qtyPlus").addEventListener("click", () => { selectedQty += 1; renderProductDrawer(); });
    $("#addToCart").addEventListener("click", addSelectedToCart);
  }

  function closeDrawer() {
    $("#sideBackdrop").hidden = true;
    $("#productDrawer").hidden = true;
  }

  function addSelectedToCart() {
    const p = selectedProduct;
    const key = `${p.id}__${selectedOptions.size}__${selectedOptions.color}`;
    const existing = cart.find(item => item.key === key);
    if (existing) existing.qty += selectedQty;
    else cart.push({ key, productId: p.id, name: p.name, price: Number(p.price), size: selectedOptions.size, color: selectedOptions.color, qty: selectedQty });
    G.saveCart(cart);
    $("#cartBadge").textContent = cartCount();
    closeDrawer();
    toast(text("تمت إضافة المنتج للسلة.", "Added to cart."));
  }

  function renderCartPage() {
    const root = $("#cartRoot");
    if (!root) return;
    root.innerHTML = `<section class="container page-hero">
      <div class="page-card page-title"><span class="eyebrow">Glitter</span><h1>${text("السلة والدفع", "Cart & Checkout")}</h1><p>${text("الدفع المتاح حاليا هو الدفع عند الاستلام. عند إرسال الطلب سيتم تسجيله وفتح واتساب لإرسال الطلبية.", "Cash on delivery is available. Submitting records the order, opens WhatsApp for admin, To send order details.")}</p></div>
      <div class="page-photo" style="--tile-image:${cssImage("assets/category-women.svg")}"></div>
    </section>
    <section class="container admin-two">
      <div><div class="cart-list" id="cartList"></div><div class="summary" id="cartSummary"></div></div>
      <form class="form-panel" id="checkoutForm">
        <h2>${text("بيانات الطلب", "Order details")}</h2>
        <div class="form-grid">
          <div class="field"><label>${text("الاسم", "Name")}</label><input name="name" required></div>
          <div class="field"><label>${text("الهاتف", "Phone")}</label><input name="phone" required inputmode="tel"></div>
          <div class="field"><label>${text("المدينة", "City")}</label><input name="city" required></div>
          <div class="field"><label>${text("المنطقة", "Area")}</label><input name="area" required></div>
          <div class="field full"><label>${text("العنوان", "Address")}</label><textarea name="address" required></textarea></div>
          <div class="field full"><label>${text("ملاحظات", "Notes")}</label><textarea name="notes"></textarea></div>
        </div>
        <button class="gold-btn" type="submit">${text("إرسال الطلب", "Submit order")}</button>
      </form>
    </section>`;
    renderCart();
    $("#checkoutForm").addEventListener("submit", submitOrder);
  }

  function totals() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shipping = cart.length && subtotal < Number(settings.freeShippingFrom || 0) ? Number(settings.shippingFee || 0) : 0;
    return { subtotal, shipping, total: subtotal + shipping };
  }

  function renderCart() {
    const list = $("#cartList");
    const summary = $("#cartSummary");
    if (!cart.length) list.innerHTML = `<div class="empty">${text("السلة فارغة.", "Cart is empty.")}</div>`;
    else list.innerHTML = cart.map(item => `<div class="cart-item">
      <div><strong>${escape(item.name)}</strong><br><small>${escape(item.size)} / ${escape(item.color)} / x${item.qty}</small></div>
      <button class="btn" data-remove="${escape(item.key)}" type="button">${text("حذف", "Remove")}</button>
    </div>`).join("");
    document.querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", () => {
      cart = cart.filter(item => item.key !== button.dataset.remove);
      G.saveCart(cart);
      renderCart();
      $("#cartBadge").textContent = cartCount();
    }));
    const t = totals();
    summary.innerHTML = `<div><span>${text("المجموع", "Subtotal")}</span><strong>${money(t.subtotal)}</strong></div><div><span>${text("الشحن", "Shipping")}</span><strong>${money(t.shipping)}</strong></div><div class="total"><span>${text("الإجمالي", "Total")}</span><strong>${money(t.total)}</strong></div>`;
  }

  async function submitOrder(event) {
    event.preventDefault();
    if (!cart.length) return toast(text("أضف منتجا واحدا على الأقل.", "Add at least one product."));
    const form = event.currentTarget;
    const t = totals();
    const order = {
      id: `GL-${Date.now().toString().slice(-7)}`,
      createdAt: new Date().toISOString(),
      status: "new",
      paymentMethod: "Cash on delivery",
      customer: {
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        city: form.city.value.trim(),
        area: form.area.value.trim(),
        address: form.address.value.trim(),
        notes: form.notes.value.trim()
      },
      items: cart.map(item => ({ ...item })),
      subtotal: t.subtotal,
      discount: 0,
      shipping: t.shipping,
      total: t.total,
      coupon: ""
    };
    const orders = G.getOrders();
    orders.unshift(order);
    G.saveOrders(orders);
    try {
      await G.createCloudOrder(order);
    } catch (error) {
      console.warn("Glitter cloud order sync failed:", error);
    }
    const message = buildOrderMessage(order);
    await notifyEmail(order, message);
    G.saveCart([]);
    cart = [];
    renderCart();
    window.open(whatsappUrl(settings.adminWhatsApp, message), "_blank", "noopener");
    toast(text("تم تسجيل الطلب.", "Order saved."));
  }

  function buildOrderMessage(order) {
    const items = order.items.map((item, index) => `${index + 1}) ${item.name} - ${item.size} - ${item.color} - x${item.qty} - ${money(item.price * item.qty)}`).join("\n");
    return [
      "New Glitter order",
      `Order: ${order.id}`,
      `Name: ${order.customer.name}`,
      `Phone: ${order.customer.phone}`,
      `Address: ${order.customer.city} - ${order.customer.area} - ${order.customer.address}`,
      order.customer.notes ? `Notes: ${order.customer.notes}` : "",
      "",
      items,
      "",
      `Total: ${money(order.total)}`,
      `Payment: Cash on delivery`
    ].filter(Boolean).join("\n");
  }

  async function notifyEmail(order, message) {
    if (!settings.emailjsEnabled) return;
    const missing = [];
    if (!settings.emailjsServiceId) missing.push("Service ID");
    if (!settings.emailjsTemplateId) missing.push("Template ID");
    if (!settings.emailjsPublicKey) missing.push("Public Key");
    if (!window.emailjs) missing.push("EmailJS script");
    if (missing.length) {
      console.warn(`EmailJS skipped. Missing: ${missing.join(", ")}`);
      return;
    }
    try {
      const customerAddress = `${order.customer.city} - ${order.customer.area} - ${order.customer.address}`;
      const orderItems = order.items.map(item => `${item.name} | Size: ${item.size} | Color: ${item.color} | Qty: ${item.qty} | ${money(item.price * item.qty)}`).join("\n");
      const replyEmail = settings.supportEmail || "glitterstoreonline7@gmail.com";
      window.emailjs.init({ publicKey: settings.emailjsPublicKey });
      await sendEmailjs(settings.emailjsServiceId, settings.emailjsTemplateId, {
        name: order.customer.name || "Glitter customer",
        email: replyEmail,
        reply_to: replyEmail,
        time: new Date(order.createdAt).toLocaleString(isAr() ? "ar-EG" : "en-US"),
        to_email: settings.supportEmail,
        admin_email: settings.supportEmail,
        store_name: settings.storeName,
        order_id: order.id,
        customer_name: order.customer.name,
        customer_phone: order.customer.phone,
        customer_city: order.customer.city,
        customer_area: order.customer.area,
        customer_address: customerAddress,
        customer_notes: order.customer.notes || "",
        order_items: orderItems,
        order_subtotal: money(order.subtotal),
        order_shipping: money(order.shipping),
        order_total: money(order.total),
        payment_method: order.paymentMethod,
        message
      });
    } catch (error) {
      console.error("EmailJS failed", error);
    }
  }

  async function sendEmailjs(serviceId, templateId, params) {
    try {
      return await window.emailjs.send(serviceId, templateId, params);
    } catch (error) {
      const alternate = alternateTemplateId(templateId);
      const text = String(error?.text || error?.message || error).toLowerCase();
      if (alternate && (text.includes("template") || text.includes("not found"))) {
        console.warn(`EmailJS retrying with alternate template ID: ${alternate}`);
        return window.emailjs.send(serviceId, alternate, params);
      }
      throw error;
    }
  }

  function alternateTemplateId(templateId) {
    const id = String(templateId || "").trim();
    if (!id) return "";
    return id.startsWith("template_") ? id.replace(/^template_/, "") : `template_${id}`;
  }

  function whatsappUrl(phone, message) {
    const clean = String(phone || settings.adminWhatsApp).replace(/[^\d]/g, "");
    return `https://wa.me/${clean}?text=${encodeURIComponent(message || "")}`;
  }

  function toast(message) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(window.glitterToastTimer);
    window.glitterToastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  function refreshPage() {
    settings = G.getSettings();
    products = G.getProducts();
    cart = G.getCart();
    setupPrefs();
    renderChrome();
    renderHome();
    renderInfo();
    renderCategoryPage();
    renderCartPage();
  }

  document.addEventListener("glitter:sync-updated", refreshPage);
  G.onReady(refreshPage);
})();
