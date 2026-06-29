(function () {
  const G = window.Glitter;
  G.seed();

  const page = document.body.dataset.adminPage || "login";
  const $ = selector => document.querySelector(selector);
  let settings = G.getSettings();
  let products = G.getProducts();
  let orders = G.getOrders();
  let coupons = G.getCoupons();
  let admins = G.getAdmins();
  let currentAdmin = admins.find(admin => admin.id === localStorage.getItem(G.keys.session));
  let visualSelection = { page: "home", type: "hero" };
  let workingColors = [];

  const COLOR_PRESETS = [
    { name: "أسود", value: "#171513" },
    { name: "أبيض", value: "#ffffff" },
    { name: "أوف وايت", value: "#f4efe2" },
    { name: "رمادي", value: "#8f9189" },
    { name: "فضي", value: "#c6c7c2" },
    { name: "بيج", value: "#d6c3a1" },
    { name: "جملي", value: "#b68a55" },
    { name: "ذهبي", value: "#c9a34d" },
    { name: "بني", value: "#6d4f35" },
    { name: "كحلي", value: "#1f2f46" },
    { name: "أزرق", value: "#315f9f" },
    { name: "لبني", value: "#9fc4dc" },
    { name: "أخضر", value: "#3f6f52" },
    { name: "زيتوني", value: "#70734b" },
    { name: "أحمر", value: "#a72f2f" },
    { name: "نبيتي", value: "#6f2331" },
    { name: "وردي", value: "#d9a3ac" },
    { name: "موف", value: "#8a6aa6" }
  ];

  function escape(value) { return G.escapeHtml(value); }
  function money(value) { return G.money(value); }
  function cssImage(value) {
    const raw = String(value || "");
    const normalized = raw.startsWith("assets/") ? `/${raw}` : raw;
    return `url('${escape(normalized)}')`;
  }
  function toast(message) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(window.glitterAdminToast);
    window.glitterAdminToast = setTimeout(() => el.classList.remove("show"), 2600);
  }

  function requireAuth() {
    if (page === "login") return true;
    if (!currentAdmin) {
      location.href = "glitter-admin.html";
      return false;
    }
    return true;
  }

  function renderLogin() {
    const form = $("#loginForm");
    if (!form) return;
    form.addEventListener("submit", event => {
      event.preventDefault();
      const admin = admins.find(item => item.username === form.username.value.trim() && item.password === form.password.value && item.active);
      if (!admin) return toast("بيانات الدخول غير صحيحة أو الحساب غير نشط.");
      localStorage.setItem(G.keys.session, admin.id);
      location.href = "glitter-admin-dashboard.html";
    });
  }

  function navItems() {
    return [
      ["dashboard", "الرئيسية", "glitter-admin-dashboard.html"],
      ["products", "المنتجات", "glitter-admin-products.html"],
      ["visual", "تعديل بصري", "glitter-admin-visual.html"],
      ["orders", "الطلبات", "glitter-admin-orders.html"],
      ["coupons", "الكوبونات", "glitter-admin-coupons.html"],
      ["motion", "موشن العروض", "glitter-admin-motion.html"],
      ["invoice", "الفاتورة", "glitter-admin-invoice.html"],
      ["managers", "المديرين", "glitter-admin-managers.html"],
      ["settings", "الإعدادات", "glitter-admin-settings.html"]
    ];
  }

  function renderShell() {
    const root = $("#adminRoot");
    if (!root) return;
    const active = page;
    root.innerHTML = `<div class="admin-shell">
      <aside class="admin-side">
        <a class="brand" href="glitter-admin-dashboard.html">
          <img class="brand-logo" src="assets/glitter-logo.jpeg" alt="">
          <span class="brand-name"><strong>Glitter</strong><span>Admin</span></span>
        </a>
        <nav class="admin-nav">
          ${navItems().map(([id, label, href], index) => `<a class="${active === id ? "active" : ""}" href="${href}"><span>${label}</span><b>${String(index + 1).padStart(2, "0")}</b></a>`).join("")}
        </nav>
        <div>
          <p>${escape(currentAdmin?.name || "Admin")}</p>
          <button class="btn" id="logoutBtn" type="button">تسجيل خروج</button>
        </div>
      </aside>
      <main class="admin-main">
        <div class="page-title" style="margin-bottom:18px">
          <span class="eyebrow">Glitter Admin</span>
          <h1>${pageTitle()}</h1>
          <p>${pageSubtitle()}</p>
        </div>
        <div id="adminContent"></div>
      </main>
    </div>`;
    $("#logoutBtn").addEventListener("click", () => {
      localStorage.removeItem(G.keys.session);
      location.href = "glitter-admin.html";
    });
  }

  function pageTitle() {
    return {
      dashboard: "الرئيسية",
      products: "إضافة المنتجات",
      visual: "تعديل بصري",
      orders: "الطلبات والمعاملات",
      coupons: "الكوبونات",
      motion: "موشن العروض",
      invoice: "الفاتورة",
      managers: "المديرين",
      settings: "الإعدادات"
    }[page] || "لوحة التحكم";
  }

  function pageSubtitle() {
    return {
      dashboard: "نظرة سريعة على المتجر والطلبات.",
      products: "أضف صور المنتجات من جهازك أو برابط، وحدد القسم والجمهور.",
      visual: "اضغط على عناصر موقع التسوق وعدل النصوص والصور والترتيب بدون كود.",
      orders: "تابع الطلبات وغير حالتها.",
      coupons: "أنشئ أكواد خصم واضبط قواعد الشحن.",
      motion: "أضف صور أو فيديوهات للعروض المتحركة.",
      invoice: "عدل بيانات الضمان والاستبدال ونص الفاتورة.",
      managers: "أضف مديرين فرعيين أو عدل كلمات المرور.",
      settings: "واتساب، إيميل، وبيانات EmailJS."
    }[page] || "";
  }

  function renderDashboard() {
    const revenue = orders.filter(order => order.status !== "cancelled").reduce((sum, order) => sum + Number(order.total || 0), 0);
    $("#adminContent").innerHTML = `<div class="admin-grid">
      ${stat("المنتجات", products.length)}
      ${stat("الطلبات", orders.length)}
      ${stat("طلبات جديدة", orders.filter(order => order.status === "new").length)}
      ${stat("المبيعات", money(revenue))}
    </div>
    <div class="admin-two" style="margin-top:14px">
      <div class="admin-card"><h2>روابط سريعة</h2><div class="actions-row"><a class="gold-btn" href="glitter-admin-products.html">إضافة منتج</a><a class="btn" href="glitter-admin-visual.html">تعديل بصري</a><a class="btn" href="glitter-store.html">فتح المتجر</a></div></div>
      <div class="admin-card"><h2>آخر الطلبات</h2>${orders.slice(0, 5).map(order => `<p>${escape(order.id)} - ${escape(order.customer?.name || "-")} - ${money(order.total)}</p>`).join("") || `<div class="empty">لا توجد طلبات بعد.</div>`}</div>
    </div>`;
  }

  function stat(label, value) {
    return `<div class="admin-card"><span>${label}</span><strong>${value}</strong></div>`;
  }

  function renderProducts() {
    $("#adminContent").innerHTML = `<div class="admin-two">
      <form class="form-panel" id="productForm">
        <h2 id="productFormTitle">منتج جديد</h2>
        <input type="hidden" id="productId">
        <input type="hidden" id="productImageValue">
        <input type="hidden" id="productSizeImageValue">
        <input type="hidden" id="productColors">
        <div class="form-grid">
          ${field("productName", "اسم المنتج")}
          ${field("productCategory", "القسم")}
          ${field("productPrice", "السعر", "number")}
          ${field("productOldPrice", "السعر قبل الخصم", "number")}
          ${field("productStock", "المخزون", "number")}
          ${field("productBadge", "شارة المنتج")}
          ${field("productFabric", "الخامة")}
          <div class="field"><label>لون العرض</label><input id="productTone" type="color" value="#d7bd78"></div>
          <div class="field full"><label>الجمهور</label><div class="actions-row">
            <label><input type="checkbox" name="audience" value="men"> رجال</label>
            <label><input type="checkbox" name="audience" value="women"> نساء</label>
            <label><input type="checkbox" name="audience" value="kids"> أطفال</label>
          </div></div>
          <div class="field full"><label>صورة المنتج من الجهاز</label><input id="productImageFile" type="file" accept="image/*"></div>
          <div class="field full"><label>أو رابط صورة المنتج</label><input id="productImageUrl" placeholder="https://..."></div>
          <div class="field full"><label>وصف مختصر</label><textarea id="productDescription" required></textarea></div>
          <div class="field full"><label>وصف التفاصيل</label><textarea id="productDetailsDescription"></textarea></div>
          <div class="field full"><label>صورة مقاسات المنتج من الجهاز</label><input id="productSizeFile" type="file" accept="image/*"></div>
          <div class="field full"><label>أو رابط صورة المقاسات</label><input id="productSizeImageUrl" placeholder="https://..."></div>
          <div class="field"><label>المقاسات</label><textarea id="productSizes" required placeholder="S, M, L, XL"></textarea></div>
          <div class="field full">
            <label>الألوان</label>
            <div class="color-builder">
              <div class="form-grid">
                <div class="field"><label>لون جاهز</label><select id="colorPreset">${COLOR_PRESETS.map(color => `<option value="${color.value}">${color.name}</option>`).join("")}</select></div>
                <div class="field"><label>اختيار لون مخصص</label><input id="customColorValue" type="color" value="#c9a34d"></div>
                <div class="field full"><label>اسم اللون المخصص</label><input id="customColorName" placeholder="مثال: ذهبي هادئ"></div>
              </div>
              <div class="actions-row">
                <button class="btn" id="addPresetColor" type="button">إضافة اللون الجاهز</button>
                <button class="btn" id="addCustomColor" type="button">إضافة لون مخصص</button>
              </div>
              <div class="color-token-list" id="productColorsList"></div>
            </div>
          </div>
          <label class="field full"><input id="productFeatured" type="checkbox"> منتج مميز</label>
        </div>
        <div class="actions-row" style="margin-top:14px"><button class="gold-btn" type="submit">حفظ المنتج</button><button class="btn" id="newProductBtn" type="button">منتج جديد</button></div>
      </form>
      <div class="admin-card"><h2>المنتجات</h2><div class="table-wrap"><table><thead><tr><th>المنتج</th><th>الجمهور</th><th>السعر</th><th>الإجراءات</th></tr></thead><tbody id="productsBody"></tbody></table></div></div>
    </div>`;
    bindProductForm();
    fillProduct();
    renderProductsTable();
  }

  function field(id, label, type = "text") {
    return `<div class="field"><label>${label}</label><input id="${id}" type="${type}" ${type === "number" ? "min='0' step='1'" : ""}></div>`;
  }

  function bindProductForm() {
    $("#productForm").addEventListener("submit", saveProduct);
    $("#newProductBtn").addEventListener("click", () => fillProduct());
    $("#productImageFile").addEventListener("change", event => loadFile(event.target.files[0], value => { $("#productImageValue").value = value; $("#productImageUrl").value = ""; }));
    $("#productSizeFile").addEventListener("change", event => loadFile(event.target.files[0], value => { $("#productSizeImageValue").value = value; $("#productSizeImageUrl").value = ""; }));
    $("#addPresetColor").addEventListener("click", () => {
      const preset = COLOR_PRESETS.find(color => color.value === $("#colorPreset").value) || COLOR_PRESETS[0];
      addWorkingColor(preset);
    });
    $("#addCustomColor").addEventListener("click", () => {
      const value = $("#customColorValue").value || "#c9a34d";
      const name = $("#customColorName").value.trim() || `لون مخصص ${workingColors.length + 1}`;
      addWorkingColor({ name, value });
      $("#customColorName").value = "";
    });
    renderWorkingColors();
  }

  function normalizeColorObject(color) {
    if (!color) return null;
    return {
      name: String(color.name || "لون").trim(),
      value: String(color.value || "#c9a34d").trim()
    };
  }

  function addWorkingColor(color) {
    const normalized = normalizeColorObject(color);
    if (!normalized) return;
    const exists = workingColors.some(item => item.name === normalized.name && item.value.toLowerCase() === normalized.value.toLowerCase());
    if (!exists) workingColors.push(normalized);
    renderWorkingColors();
  }

  function renderWorkingColors() {
    const input = $("#productColors");
    const list = $("#productColorsList");
    if (input) input.value = JSON.stringify(workingColors);
    if (!list) return;
    if (!workingColors.length) {
      list.innerHTML = `<div class="empty compact">لم يتم اختيار ألوان بعد.</div>`;
      return;
    }
    list.innerHTML = workingColors.map((color, index) => `<button class="color-token" type="button" data-remove-color="${index}" title="حذف ${escape(color.name)}"><span class="color-dot" style="background:${escape(color.value)}"></span><span>${escape(color.name)} <small>${escape(color.value)}</small></span></button>`).join("");
    document.querySelectorAll("[data-remove-color]").forEach(button => button.addEventListener("click", () => {
      workingColors.splice(Number(button.dataset.removeColor), 1);
      renderWorkingColors();
    }));
  }

  function loadFile(file, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.readAsDataURL(file);
  }

  function parseList(value) {
    return value.split(/[\n,،]+/).map(item => item.trim()).filter(Boolean);
  }

  function parseColors(value) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed) && parsed.length) return parsed.map(normalizeColorObject).filter(Boolean);
    } catch (error) {
      // Older admin forms stored colors as name:#hex lines.
    }
    return value.split(/\n+/).map(item => item.trim()).filter(Boolean).map(line => {
      const [name, color] = line.split(":");
      return normalizeColorObject({ name: (name || "لون").trim(), value: (color || "#c9a34d").trim() });
    }).filter(Boolean);
  }

  function fillProduct(product = null) {
    $("#productFormTitle").textContent = product ? "تعديل منتج" : "منتج جديد";
    $("#productId").value = product?.id || "";
    $("#productName").value = product?.name || "";
    $("#productCategory").value = product?.category || "";
    $("#productPrice").value = product?.price ?? "";
    $("#productOldPrice").value = product?.oldPrice ?? "";
    $("#productStock").value = product?.stock ?? "";
    $("#productBadge").value = product?.badge || "";
    $("#productFabric").value = product?.fabric || "";
    $("#productTone").value = product?.tone || "#d7bd78";
    $("#productImageValue").value = product?.image || "";
    $("#productImageUrl").value = product?.image && !product.image.startsWith("data:") ? product.image : "";
    $("#productDescription").value = product?.description || "";
    $("#productDetailsDescription").value = product?.detailsDescription || "";
    $("#productSizeImageValue").value = product?.sizeImage || "";
    $("#productSizeImageUrl").value = product?.sizeImage && !product.sizeImage.startsWith("data:") ? product.sizeImage : "";
    $("#productSizes").value = (product?.sizes || ["S", "M", "L", "XL"]).join(", ");
    workingColors = (product?.colors?.length ? product.colors : [{ name: "أسود", value: "#171513" }]).map(normalizeColorObject).filter(Boolean);
    renderWorkingColors();
    $("#productFeatured").checked = Boolean(product?.featured);
    document.querySelectorAll("input[name='audience']").forEach(input => input.checked = (product?.audiences || []).includes(input.value));
  }

  function saveProduct(event) {
    event.preventDefault();
    const id = $("#productId").value || `p-${Date.now()}`;
    const existing = products.find(product => product.id === id);
    const audiences = Array.from(document.querySelectorAll("input[name='audience']:checked")).map(input => input.value);
    if (!audiences.length) return toast("اختر جمهور واحد على الأقل.");
    const product = {
      id,
      name: $("#productName").value.trim(),
      category: $("#productCategory").value.trim(),
      audiences,
      price: Number($("#productPrice").value || 0),
      oldPrice: Number($("#productOldPrice").value || 0),
      stock: Number($("#productStock").value || 0),
      badge: $("#productBadge").value.trim(),
      fabric: $("#productFabric").value.trim(),
      tone: $("#productTone").value || "#d7bd78",
      image: $("#productImageUrl").value.trim() || $("#productImageValue").value.trim(),
      description: $("#productDescription").value.trim(),
      detailsDescription: $("#productDetailsDescription").value.trim(),
      sizeImage: $("#productSizeImageUrl").value.trim() || $("#productSizeImageValue").value.trim(),
      sizes: parseList($("#productSizes").value),
      colors: workingColors.length ? workingColors.map(normalizeColorObject).filter(Boolean) : parseColors($("#productColors").value),
      featured: $("#productFeatured").checked,
      createdAt: existing?.createdAt || new Date().toISOString()
    };
    products = existing ? products.map(item => item.id === id ? product : item) : [product, ...products];
    G.saveProducts(products);
    fillProduct();
    renderProductsTable();
    toast("تم حفظ المنتج.");
  }

  function renderProductsTable() {
    $("#productsBody").innerHTML = products.map(product => `<tr>
      <td><strong>${escape(product.name)}</strong><br><small>${escape(product.category)}</small></td>
      <td>${(product.audiences || []).join(", ")}</td>
      <td>${money(product.price)}</td>
      <td><div class="actions-row"><button class="btn" data-edit="${escape(product.id)}">تعديل</button><button class="btn" data-delete="${escape(product.id)}">حذف</button></div></td>
    </tr>`).join("");
    document.querySelectorAll("[data-edit]").forEach(button => button.addEventListener("click", () => fillProduct(products.find(product => product.id === button.dataset.edit))));
    document.querySelectorAll("[data-delete]").forEach(button => button.addEventListener("click", () => {
      if (!confirm("حذف المنتج؟")) return;
      products = products.filter(product => product.id !== button.dataset.delete);
      G.saveProducts(products);
      renderProductsTable();
    }));
  }

  function renderVisual() {
    $("#adminContent").innerHTML = `<div class="visual-editor">
      <div class="visual-preview">
        <div class="admin-toolbar" style="margin:0 0 12px">
          <div class="field"><label>الصفحة</label><select id="visualPageSelect">
            <option value="home">الرئيسية</option>
            <option value="men">رجال</option>
            <option value="women">نساء</option>
            <option value="kids">أطفال</option>
          </select></div>
        </div>
        <div class="mini-preview" id="visualPreview"></div>
      </div>
      <form class="form-panel" id="visualForm"><h2>المحرر</h2><div id="visualFields"></div><button class="gold-btn" type="submit">حفظ التعديل</button></form>
    </div>`;
    $("#visualPageSelect").value = visualSelection.page || "home";
    $("#visualPageSelect").addEventListener("change", event => {
      visualSelection = event.target.value === "home" ? { page: "home", type: "hero" } : { page: event.target.value, type: "sectionHero", id: event.target.value };
      renderVisualPreview();
      renderVisualFields();
    });
    renderVisualPreview();
    renderVisualFields();
    $("#visualForm").addEventListener("submit", saveVisualSelection);
  }

  function renderVisualPreview() {
    const visual = settings.visual;
    const page = visualSelection.page || "home";
    if (page !== "home") {
      renderSectionVisualPreview(page);
      return;
    }
    const order = visual.categoryOrder || ["women", "men", "kids"];
    $("#visualPreview").innerHTML = `<section class="home-title editable-block ${visualSelection.type === "hero" ? "selected" : ""}" data-visual="hero">
      <span class="eyebrow">اختر القسم</span><h1><span class="gold-text">${escape(visual.heroTitleAr)}</span></h1><p>${escape(visual.heroTextAr)}</p>
    </section>
    <div class="category-tiles" style="margin-top:18px">
      ${order.map(id => {
        const cat = visual.categories[id];
        return `<div class="category-tile editable-block ${visualSelection.type === "category" && visualSelection.id === id ? "selected" : ""}" data-visual="category" data-id="${id}" style="--tile-image:${cssImage(cat.image)}"><small>GO TO FASHION</small><strong>${escape(cat.ar)}</strong><span>${escape(cat.textAr)}</span></div>`;
      }).join("")}
    </div>
    <div class="info-grid">${(visual.benefits || []).map((item, index) => `<article class="panel info-card editable-block ${visualSelection.type === "benefit" && visualSelection.index === index ? "selected" : ""}" data-visual="benefit" data-index="${index}"><b>${String(index + 1).padStart(2, "0")}</b><h3>${escape(item.arTitle)}</h3><p>${escape(item.arText)}</p></article>`).join("")}</div>`;
    document.querySelectorAll("[data-visual]").forEach(block => block.addEventListener("click", () => {
      visualSelection = { type: block.dataset.visual, id: block.dataset.id, index: Number(block.dataset.index) };
      renderVisualPreview();
      renderVisualFields();
    }));
  }

  function renderSectionVisualPreview(pageId) {
    const visual = settings.visual;
    const meta = visual.categories[pageId] || visual.categories.men;
    const section = visual.sectionPage || {};
    const sectionProducts = products.filter(product => (product.audiences || []).includes(pageId)).slice(0, 6);
    $("#visualPreview").innerHTML = `<section class="page-hero">
      <div class="page-card page-title editable-block ${visualSelection.type === "sectionHero" ? "selected" : ""}" data-visual="sectionHero" data-id="${pageId}">
        <span class="eyebrow">${escape(section.eyebrowAr || "Glitter")}</span>
        <h1>${escape(meta.ar)}</h1>
        <p>${escape(meta.textAr)}</p>
      </div>
      <div class="page-photo editable-block ${visualSelection.type === "sectionHero" ? "selected" : ""}" data-visual="sectionHero" data-id="${pageId}" style="--tile-image:${cssImage(meta.image)}"></div>
    </section>
    <div class="toolbar editable-block ${visualSelection.type === "sectionControls" ? "selected" : ""}" data-visual="sectionControls" data-id="${pageId}">
      <div class="field"><label>${escape(section.searchLabelAr || "بحث")}</label><input disabled placeholder="${escape(section.searchPlaceholderAr || "ابحث باسم المنتج")}"></div>
      <div class="field"><label>${escape(section.filterLabelAr || "القسم")}</label><select disabled><option>الكل</option></select></div>
      <div class="field"><label>${escape(section.sortLabelAr || "الترتيب")}</label><select disabled><option>المميز</option></select></div>
    </div>
    <div class="product-grid editable-block ${visualSelection.type === "sectionProducts" ? "selected" : ""}" data-visual="sectionProducts" data-id="${pageId}">
      ${sectionProducts.map(product => `<article class="product-card in-view" style="--visual-tone:${escape(product.tone || "#d8c082")}"><div class="product-visual">${product.badge ? `<span class="badge">${escape(product.badge)}</span>` : ""}${product.image ? `<img src="${escape(product.image)}" alt="">` : ""}</div><div class="product-body"><div class="product-title"><h3>${escape(product.name)}</h3><small>${escape(product.fabric || "")}</small></div><p class="product-desc">${escape(product.description || "")}</p></div></article>`).join("") || `<div class="empty">${escape(section.emptyTextAr || "لا توجد منتجات في هذا القسم حاليا.")}</div>`}
    </div>`;
    document.querySelectorAll("[data-visual]").forEach(block => block.addEventListener("click", () => {
      visualSelection = { page: pageId, type: block.dataset.visual, id: block.dataset.id };
      renderVisualPreview();
      renderVisualFields();
    }));
  }

  function renderVisualFields() {
    const visual = settings.visual;
    const page = visualSelection.page || "home";
    if (visualSelection.type === "hero") {
      $("#visualFields").innerHTML = `${textField("heroTitleAr", "عنوان عربي", visual.heroTitleAr)}${textField("heroTitleEn", "عنوان إنجليزي", visual.heroTitleEn)}${areaField("heroTextAr", "وصف عربي", visual.heroTextAr)}${areaField("heroTextEn", "وصف إنجليزي", visual.heroTextEn)}`;
      return;
    }
    if (visualSelection.type === "category") {
      const cat = visual.categories[visualSelection.id];
      $("#visualFields").innerHTML = `${textField("catAr", "اسم عربي", cat.ar)}${textField("catEn", "اسم إنجليزي", cat.en)}${areaField("catTextAr", "وصف عربي", cat.textAr)}${areaField("catTextEn", "وصف إنجليزي", cat.textEn)}${textField("catImage", "رابط/صورة القسم", cat.image)}<div class="field"><label>رفع صورة للقسم</label><input id="catImageFile" type="file" accept="image/*"></div><div class="field"><label>ترتيب الأقسام</label><input id="categoryOrder" value="${visual.categoryOrder.join(", ")}"></div>`;
      $("#catImageFile").addEventListener("change", event => loadFile(event.target.files[0], value => $("#catImage").value = value));
      return;
    }
    if (visualSelection.type === "sectionHero") {
      const cat = visual.categories[page] || visual.categories.men;
      $("#visualFields").innerHTML = `<p class="empty compact">هذه البيانات تظهر داخل صفحة القسم نفسها، وتظهر أيضا على كارت القسم في الرئيسية.</p>${textField("catAr", "اسم القسم عربي", cat.ar)}${textField("catEn", "اسم القسم إنجليزي", cat.en)}${areaField("catTextAr", "وصف القسم عربي", cat.textAr)}${areaField("catTextEn", "وصف القسم إنجليزي", cat.textEn)}${textField("catImage", "رابط/صورة القسم", cat.image)}<div class="field"><label>رفع صورة للقسم</label><input id="catImageFile" type="file" accept="image/*"></div>`;
      $("#catImageFile").addEventListener("change", event => loadFile(event.target.files[0], value => $("#catImage").value = value));
      return;
    }
    if (visualSelection.type === "sectionControls") {
      const section = visual.sectionPage || {};
      $("#visualFields").innerHTML = `${textField("sectionEyebrowAr", "النص الصغير عربي", section.eyebrowAr || "Glitter")}${textField("sectionEyebrowEn", "النص الصغير إنجليزي", section.eyebrowEn || "Glitter")}${textField("searchLabelAr", "عنوان البحث عربي", section.searchLabelAr || "بحث")}${textField("searchLabelEn", "عنوان البحث إنجليزي", section.searchLabelEn || "Search")}${textField("searchPlaceholderAr", "Placeholder البحث عربي", section.searchPlaceholderAr || "ابحث باسم المنتج")}${textField("searchPlaceholderEn", "Placeholder البحث إنجليزي", section.searchPlaceholderEn || "Search product name")}${textField("filterLabelAr", "عنوان الفلتر عربي", section.filterLabelAr || "القسم")}${textField("filterLabelEn", "عنوان الفلتر إنجليزي", section.filterLabelEn || "Category")}${textField("sortLabelAr", "عنوان الترتيب عربي", section.sortLabelAr || "الترتيب")}${textField("sortLabelEn", "عنوان الترتيب إنجليزي", section.sortLabelEn || "Sort")}${areaField("emptyTextAr", "رسالة عدم وجود منتجات عربي", section.emptyTextAr || "لا توجد منتجات في هذا القسم حاليا.")}${areaField("emptyTextEn", "رسالة عدم وجود منتجات إنجليزي", section.emptyTextEn || "No products in this section yet.")}`;
      return;
    }
    if (visualSelection.type === "sectionProducts") {
      const sectionProducts = products.filter(product => (product.audiences || []).includes(page));
      $("#visualFields").innerHTML = `<p class="empty compact">اكتب IDs منتجات هذا القسم بالترتيب المطلوب. المنتجات غير المكتوبة ستظل بعد القائمة.</p><div class="field"><label>ترتيب منتجات هذا القسم</label><textarea id="sectionProductOrder">${sectionProducts.map(product => product.id).join("\n")}</textarea></div>`;
      return;
    }
    const benefit = visual.benefits[visualSelection.index];
    $("#visualFields").innerHTML = `${textField("benefitArTitle", "عنوان عربي", benefit.arTitle)}${textField("benefitEnTitle", "عنوان إنجليزي", benefit.enTitle)}${areaField("benefitArText", "وصف عربي", benefit.arText)}${areaField("benefitEnText", "وصف إنجليزي", benefit.enText)}<div class="field"><label>ترتيب المنتجات</label><textarea id="productOrder">${products.map(product => product.id).join("\n")}</textarea></div>`;
  }

  function textField(id, label, value) {
    return `<div class="field"><label>${label}</label><input id="${id}" value="${escape(value)}"></div>`;
  }

  function areaField(id, label, value) {
    return `<div class="field"><label>${label}</label><textarea id="${id}">${escape(value)}</textarea></div>`;
  }

  function saveVisualSelection(event) {
    event.preventDefault();
    const visual = settings.visual;
    const page = visualSelection.page || "home";
    if (visualSelection.type === "hero") {
      visual.heroTitleAr = $("#heroTitleAr").value;
      visual.heroTitleEn = $("#heroTitleEn").value;
      visual.heroTextAr = $("#heroTextAr").value;
      visual.heroTextEn = $("#heroTextEn").value;
    } else if (visualSelection.type === "category") {
      const cat = visual.categories[visualSelection.id];
      cat.ar = $("#catAr").value;
      cat.en = $("#catEn").value;
      cat.textAr = $("#catTextAr").value;
      cat.textEn = $("#catTextEn").value;
      cat.image = $("#catImage").value;
      visual.categoryOrder = $("#categoryOrder").value.split(/[\n,،]+/).map(item => item.trim()).filter(Boolean);
    } else if (visualSelection.type === "sectionHero") {
      const cat = visual.categories[page] || visual.categories.men;
      cat.ar = $("#catAr").value;
      cat.en = $("#catEn").value;
      cat.textAr = $("#catTextAr").value;
      cat.textEn = $("#catTextEn").value;
      cat.image = $("#catImage").value;
    } else if (visualSelection.type === "sectionControls") {
      visual.sectionPage = {
        ...(visual.sectionPage || {}),
        eyebrowAr: $("#sectionEyebrowAr").value,
        eyebrowEn: $("#sectionEyebrowEn").value,
        searchLabelAr: $("#searchLabelAr").value,
        searchLabelEn: $("#searchLabelEn").value,
        searchPlaceholderAr: $("#searchPlaceholderAr").value,
        searchPlaceholderEn: $("#searchPlaceholderEn").value,
        filterLabelAr: $("#filterLabelAr").value,
        filterLabelEn: $("#filterLabelEn").value,
        sortLabelAr: $("#sortLabelAr").value,
        sortLabelEn: $("#sortLabelEn").value,
        emptyTextAr: $("#emptyTextAr").value,
        emptyTextEn: $("#emptyTextEn").value
      };
    } else if (visualSelection.type === "sectionProducts") {
      const ids = $("#sectionProductOrder").value.split(/\n+/).map(id => id.trim()).filter(Boolean);
      const ranked = new Map(ids.map((id, index) => [id, index]));
      products.sort((a, b) => {
        const aInPage = (a.audiences || []).includes(page);
        const bInPage = (b.audiences || []).includes(page);
        if (!aInPage || !bInPage) return 0;
        const aRank = ranked.has(a.id) ? ranked.get(a.id) : Number.MAX_SAFE_INTEGER;
        const bRank = ranked.has(b.id) ? ranked.get(b.id) : Number.MAX_SAFE_INTEGER;
        return aRank - bRank;
      });
      G.saveProducts(products);
    } else {
      const benefit = visual.benefits[visualSelection.index];
      benefit.arTitle = $("#benefitArTitle").value;
      benefit.enTitle = $("#benefitEnTitle").value;
      benefit.arText = $("#benefitArText").value;
      benefit.enText = $("#benefitEnText").value;
      const ids = $("#productOrder").value.split(/\n+/).map(id => id.trim()).filter(Boolean);
      products.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
      G.saveProducts(products);
    }
    settings.visual = visual;
    G.saveSettings(settings);
    renderVisualPreview();
    renderVisualFields();
    toast("تم حفظ التعديل البصري.");
  }

  function renderOrders() {
    $("#adminContent").innerHTML = `<div class="admin-card">
      <div class="actions-row" style="justify-content:space-between;margin-bottom:12px">
        <h2>الطلبات</h2>
        <button class="btn" id="clearOrdersBtn" type="button" ${orders.length ? "" : "disabled"}>حذف كل الطلبات السابقة</button>
      </div>
      <div class="table-wrap"><table><thead><tr><th>الطلب</th><th>العميل</th><th>الإجمالي</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>${orders.map(order => `<tr><td>${escape(order.id)}</td><td>${escape(order.customer?.name || "-")}<br>${escape(order.customer?.phone || "")}</td><td>${money(order.total)}</td><td>${escape(order.status || "new")}</td><td><div class="actions-row"><button class="btn" data-confirm="${escape(order.id)}">تأكيد</button><button class="btn" data-delete-order="${escape(order.id)}">حذف</button></div></td></tr>`).join("") || `<tr><td colspan="5"><div class="empty">لا توجد طلبات.</div></td></tr>`}</tbody></table></div>
    </div>`;
    document.querySelectorAll("[data-confirm]").forEach(button => button.addEventListener("click", () => {
      orders = orders.map(order => order.id === button.dataset.confirm ? { ...order, status: "confirmed" } : order);
      G.saveOrders(orders);
      renderOrders();
    }));
    document.querySelectorAll("[data-delete-order]").forEach(button => button.addEventListener("click", () => {
      if (!confirm("حذف هذه الطلبية نهائيا؟")) return;
      orders = orders.filter(order => order.id !== button.dataset.deleteOrder);
      G.saveOrders(orders);
      renderOrders();
      toast("تم حذف الطلبية.");
    }));
    $("#clearOrdersBtn")?.addEventListener("click", () => {
      if (!orders.length) return;
      if (!confirm("سيتم حذف كل الطلبات السابقة من لوحة التحكم. هل أنت متأكد؟")) return;
      if (!confirm("تأكيد أخير: الحذف نهائي ولن يمكن استرجاع الطلبات من المتصفح.")) return;
      orders = [];
      G.saveOrders(orders);
      renderOrders();
      toast("تم حذف كل الطلبات.");
    });
  }

  function renderCoupons() {
    $("#adminContent").innerHTML = `<div class="admin-two">
      <form class="form-panel" id="couponForm"><h2>كوبون جديد</h2><div class="form-grid">${field("couponCode", "الكود")}${field("couponValue", "قيمة الخصم", "number")}<div class="field"><label>النوع</label><select id="couponType"><option value="percent">نسبة</option><option value="fixed">مبلغ ثابت</option></select></div>${field("couponMin", "حد أدنى", "number")}</div><button class="gold-btn">حفظ</button></form>
      <form class="form-panel" id="shippingRulesForm"><h2>الشحن</h2><div class="form-grid">${field("shippingFee", "تكلفة الشحن", "number")}${field("freeShippingFrom", "شحن مجاني بداية من", "number")}</div><button class="gold-btn">حفظ الشحن</button></form>
    </div>
    <div class="admin-card" style="margin-top:14px"><div class="table-wrap"><table><thead><tr><th>الكود</th><th>القيمة</th><th>الحالة</th></tr></thead><tbody>${coupons.map(c => `<tr><td>${escape(c.code)}</td><td>${c.type === "percent" ? c.value + "%" : money(c.value)}</td><td>${c.active ? "نشط" : "متوقف"}</td></tr>`).join("")}</tbody></table></div></div>`;
    $("#shippingFee").value = settings.shippingFee;
    $("#freeShippingFrom").value = settings.freeShippingFrom;
    $("#couponForm").addEventListener("submit", event => {
      event.preventDefault();
      coupons.unshift({ id: `c-${Date.now()}`, code: $("#couponCode").value.trim().toUpperCase(), type: $("#couponType").value, value: Number($("#couponValue").value || 0), minOrder: Number($("#couponMin").value || 0), maxDiscount: 0, expiresAt: "", active: true, usage: 0 });
      G.saveCoupons(coupons);
      renderCoupons();
    });
    $("#shippingRulesForm").addEventListener("submit", event => {
      event.preventDefault();
      settings = {
        ...settings,
        shippingFee: Number($("#shippingFee").value || 0),
        freeShippingFrom: Number($("#freeShippingFrom").value || 0)
      };
      G.saveSettings(settings);
      toast("تم حفظ إعدادات الشحن.");
    });
  }

  function renderMotion() {
    const promos = settings.motionPromos || [];
    $("#adminContent").innerHTML = `<form class="form-panel" id="motionForm"><h2>عنصر موشن</h2><div class="form-grid">${textField("motionUrl", "رابط صورة/فيديو", "")}<div class="field"><label>النوع</label><select id="motionType"><option value="image">صورة</option><option value="video">فيديو</option></select></div>${textField("motionKicker", "الكلمة الأولى", "SALE")}${textField("motionMain", "النص الرئيسي", "20% UP TO 50%")}</div><button class="gold-btn">حفظ</button></form><div class="admin-card" style="margin-top:14px">${promos.map(p => `<p>${escape(p.mediaType)} - ${escape(p.kicker)} ${escape(p.mainText)}</p>`).join("") || `<div class="empty">لا توجد عناصر موشن.</div>`}</div>`;
    $("#motionForm").addEventListener("submit", event => {
      event.preventDefault();
      settings.motionPromos = [{ id: `motion-${Date.now()}`, mediaUrl: $("#motionUrl").value, mediaType: $("#motionType").value, kicker: $("#motionKicker").value, mainText: $("#motionMain").value, active: true }, ...promos];
      G.saveSettings(settings);
      renderMotion();
    });
  }

  function renderSettings() {
    $("#adminContent").innerHTML = `<form class="form-panel" id="settingsForm">
      <div class="form-grid">
        ${textField("storeName", "اسم المتجر", settings.storeName)}
        ${textField("currency", "العملة", settings.currency)}
        ${textField("adminWhatsApp", "واتساب الأدمن", settings.adminWhatsApp)}
        ${textField("supportWhatsApp", "واتساب الدعم", settings.supportWhatsApp)}
        ${textField("supportEmail", "إيميل الدعم", settings.supportEmail)}
        <label class="field"><input id="emailjsEnabled" type="checkbox" ${settings.emailjsEnabled ? "checked" : ""}> تفعيل EmailJS</label>
        ${textField("emailjsServiceId", "EmailJS Service ID", settings.emailjsServiceId)}
        ${textField("emailjsTemplateId", "EmailJS Template ID", settings.emailjsTemplateId)}
        ${textField("emailjsPublicKey", "EmailJS Public Key", settings.emailjsPublicKey)}
      </div>
      <div class="actions-row" style="margin-top:14px">
        <button class="gold-btn" type="submit">حفظ الإعدادات</button>
        <button class="btn" id="testEmailjsBtn" type="button">اختبار EmailJS</button>
      </div>
    </form>`;
    $("#testEmailjsBtn").addEventListener("click", testEmailjsSettings);
    $("#settingsForm").addEventListener("submit", event => {
      event.preventDefault();
      settings = {
        ...settings,
        storeName: $("#storeName").value,
        currency: $("#currency").value,
        adminWhatsApp: $("#adminWhatsApp").value,
        supportWhatsApp: $("#supportWhatsApp").value,
        supportEmail: $("#supportEmail").value,
        emailjsEnabled: $("#emailjsEnabled").checked,
        emailjsServiceId: $("#emailjsServiceId").value,
        emailjsTemplateId: $("#emailjsTemplateId").value,
        emailjsPublicKey: $("#emailjsPublicKey").value
      };
      G.saveSettings(settings);
      toast("تم حفظ الإعدادات.");
    });
  }

  async function testEmailjsSettings() {
    const serviceId = $("#emailjsServiceId").value.trim();
    const templateId = $("#emailjsTemplateId").value.trim();
    const publicKey = $("#emailjsPublicKey").value.trim();
    const supportEmail = $("#supportEmail").value.trim() || "glitterstoreonline7@gmail.com";
    const missing = [];
    if (!window.emailjs) missing.push("EmailJS script");
    if (!serviceId) missing.push("Service ID");
    if (!templateId) missing.push("Template ID");
    if (!publicKey) missing.push("Public Key");
    if (missing.length) {
      toast(`بيانات ناقصة: ${missing.join(", ")}`);
      return;
    }
    try {
      window.emailjs.init({ publicKey });
      await sendEmailjs(serviceId, templateId, {
        name: "Glitter Test",
        email: supportEmail,
        reply_to: supportEmail,
        time: new Date().toLocaleString("ar-EG"),
        to_email: supportEmail,
        admin_email: supportEmail,
        store_name: $("#storeName").value || "Glitter",
        order_id: `TEST-${Date.now().toString().slice(-6)}`,
        customer_name: "Test Customer",
        customer_phone: "01000000000",
        customer_city: "Test City",
        customer_area: "Test Area",
        customer_address: "Test City - Test Area - Test Address",
        customer_notes: "EmailJS settings test from admin page.",
        order_items: "Test Product | Size: M | Color: Black | Qty: 1 | 100 ج.م",
        order_subtotal: "100 ج.م",
        order_shipping: "0 ج.م",
        order_total: "100 ج.م",
        payment_method: "Cash on delivery",
        message: "This is a test message from Glitter admin settings."
      });
      toast("تم إرسال اختبار EmailJS بنجاح.");
    } catch (error) {
      console.error("EmailJS test failed", error);
      toast(`فشل اختبار EmailJS: ${error?.text || error?.message || "راجع Console"}`);
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

  function renderInvoice() {
    $("#adminContent").innerHTML = `<form class="form-panel" id="invoiceForm">
      <div class="form-grid">
        ${textField("invoiceBusinessName", "اسم المتجر في الفاتورة", settings.invoiceBusinessName)}
        ${textField("invoiceTaxId", "الرقم التجاري/الضريبي", settings.invoiceTaxId)}
        ${textField("invoiceAddress", "عنوان المتجر", settings.invoiceAddress)}
        ${areaField("warrantyText", "الضمان", settings.warrantyText)}
        ${areaField("returnText", "الاستبدال والاسترجاع", settings.returnText)}
        ${areaField("invoiceFooter", "نص أسفل الفاتورة", settings.invoiceFooter)}
      </div>
      <button class="gold-btn">حفظ بيانات الفاتورة</button>
    </form>`;
    $("#invoiceForm").addEventListener("submit", event => {
      event.preventDefault();
      settings = {
        ...settings,
        invoiceBusinessName: $("#invoiceBusinessName").value,
        invoiceTaxId: $("#invoiceTaxId").value,
        invoiceAddress: $("#invoiceAddress").value,
        warrantyText: $("#warrantyText").value,
        returnText: $("#returnText").value,
        invoiceFooter: $("#invoiceFooter").value
      };
      G.saveSettings(settings);
      toast("تم حفظ بيانات الفاتورة.");
    });
  }

  function renderManagers() {
    $("#adminContent").innerHTML = `<div class="admin-two">
      <form class="form-panel" id="managerForm">
        <h2>مدير جديد</h2>
        <div class="form-grid">
          ${textField("managerName", "الاسم", "")}
          ${textField("managerUsername", "اسم المستخدم", "")}
          <div class="field"><label>كلمة السر</label><input id="managerPassword" type="password"></div>
          <div class="field"><label>الصلاحية</label><select id="managerRole"><option value="sub">مدير فرعي</option><option value="super">مدير رئيسي</option></select></div>
        </div>
        <button class="gold-btn">إضافة مدير</button>
      </form>
      <div class="admin-card"><h2>المديرين</h2><div class="table-wrap"><table><thead><tr><th>الاسم</th><th>المستخدم</th><th>الصلاحية</th><th>الحالة</th></tr></thead><tbody id="managersBody"></tbody></table></div></div>
    </div>`;
    renderManagersTable();
    $("#managerForm").addEventListener("submit", event => {
      event.preventDefault();
      admins.unshift({ id: `admin-${Date.now()}`, name: $("#managerName").value, username: $("#managerUsername").value, password: $("#managerPassword").value, role: $("#managerRole").value, active: true, createdAt: new Date().toISOString() });
      G.saveAdmins(admins);
      renderManagers();
    });
  }

  function renderManagersTable() {
    $("#managersBody").innerHTML = admins.map(admin => `<tr><td>${escape(admin.name)}</td><td>${escape(admin.username)}</td><td>${admin.role === "super" ? "رئيسي" : "فرعي"}</td><td>${admin.active ? "نشط" : "متوقف"}</td></tr>`).join("");
  }

  if (!requireAuth()) return;
  renderLogin();
  if (page !== "login") {
    renderShell();
    if (page === "dashboard") renderDashboard();
    if (page === "products") renderProducts();
    if (page === "visual") renderVisual();
    if (page === "orders") renderOrders();
    if (page === "coupons") renderCoupons();
    if (page === "motion") renderMotion();
    if (page === "invoice") renderInvoice();
    if (page === "managers") renderManagers();
    if (page === "settings") renderSettings();
  }
})();
