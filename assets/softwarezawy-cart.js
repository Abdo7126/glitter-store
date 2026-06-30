function szCartLines() {
  const products = szGetProducts();
  return szCart()
    .map((line) => {
      const product = products.find((item) => item.id === line.productId);
      if (!product) return null;
      const option = szProductOptions(product).find((item) => item.id === line.optionId) || szProductOptions(product)[0];
      const unitPrice = Number(option.price || product.price || 0);
      return { ...line, product, option, unitPrice, total: Number(line.qty || 1) * unitPrice };
    })
    .filter(Boolean);
}

function szCartSubtotal(lines) {
  return lines.reduce((sum, line) => sum + line.total, 0);
}

function szCouponDiscount(code, subtotal) {
  const coupon = szGetCoupons().find((item) => item.active && item.code.toLowerCase() === String(code || "").toLowerCase());
  if (!coupon) return { coupon: null, amount: 0 };
  const amount = coupon.type === "percent" ? subtotal * (Number(coupon.value) / 100) : Number(coupon.value);
  return { coupon, amount: Math.min(amount, subtotal) };
}

function szRenderCart() {
  const lines = szCartLines();
  const items = document.querySelector("[data-cart-items]");
  const summary = document.querySelector("[data-cart-summary]");
  if (!items || !summary) return;
  if (!lines.length) {
    items.innerHTML = `<div class="empty">السلة فارغة حاليا.</div>`;
    summary.innerHTML = `<p class="lead">أضف اشتراك AI من المتجر لإكمال الطلب.</p>`;
    return;
  }
  items.innerHTML = lines.map((line) => `
    <div class="cart-line">
      <div>
        <h3>${szText(line.product, "name")}</h3>
        <p>${line.product.provider} · ${szOptionName(line.product)}: ${szOptionLabel(line.option)}</p>
        <strong>${szMoney(line.unitPrice)}</strong>
      </div>
      <div class="stack">
        <input type="number" min="1" value="${line.qty}" data-cart-qty="${line.productId}" data-cart-option="${line.option.id}" aria-label="الكمية">
        <button class="btn ghost" type="button" data-cart-remove="${line.productId}" data-cart-option="${line.option.id}">حذف</button>
      </div>
    </div>
  `).join("");
  const subtotal = szCartSubtotal(lines);
  summary.innerHTML = `
    <div class="cart-row"><span>الإجمالي قبل الخصم</span><strong>${szMoney(subtotal)}</strong></div>
    <label class="field">كود الخصم<input data-coupon-code placeholder="AI10"></label>
    <div class="cart-row"><span>الخصم</span><strong data-discount>${szMoney(0)}</strong></div>
    <div class="cart-row"><span>الإجمالي النهائي</span><strong class="price" data-final-total>${szMoney(subtotal)}</strong></div>
  `;
}

function szBindCart() {
  document.addEventListener("input", (event) => {
    const qtyInput = event.target.closest("[data-cart-qty]");
    if (qtyInput) {
      const cart = szCart();
      const line = cart.find((item) => item.productId === qtyInput.dataset.cartQty && item.optionId === qtyInput.dataset.cartOption);
      if (line) line.qty = Math.max(1, Number(qtyInput.value || 1));
      szSaveCart(cart);
      szRenderCart();
    }
    const couponInput = event.target.closest("[data-coupon-code]");
    if (couponInput) szUpdateCouponTotals();
  });
  document.addEventListener("click", (event) => {
    const removeBtn = event.target.closest("[data-cart-remove]");
    if (removeBtn) {
      szSaveCart(szCart().filter((item) => !(item.productId === removeBtn.dataset.cartRemove && item.optionId === removeBtn.dataset.cartOption)));
      szRenderCart();
    }
  });
  document.querySelector("[data-order-form]")?.addEventListener("submit", szSubmitOrder);
}

function szUpdateCouponTotals() {
  const lines = szCartLines();
  const subtotal = szCartSubtotal(lines);
  const code = document.querySelector("[data-coupon-code]")?.value || "";
  const discount = szCouponDiscount(code, subtotal);
  document.querySelector("[data-discount]").textContent = szMoney(discount.amount);
  document.querySelector("[data-final-total]").textContent = szMoney(subtotal - discount.amount);
}

function szSubmitOrder(event) {
  event.preventDefault();
  const lines = szCartLines();
  if (!lines.length) {
    alert("السلة فارغة.");
    return;
  }
  const form = new FormData(event.currentTarget);
  const subtotal = szCartSubtotal(lines);
  const code = document.querySelector("[data-coupon-code]")?.value || "";
  const discount = szCouponDiscount(code, subtotal);
  const total = subtotal - discount.amount;
  const order = {
    id: `SZ-${Date.now()}`,
    createdAt: new Date().toISOString(),
    customer: {
      name: form.get("name"),
      phone: form.get("phone"),
      email: form.get("email"),
      notes: form.get("notes")
    },
    items: lines.map((line) => ({
      productId: line.productId,
      nameAr: line.product.nameAr,
      nameEn: line.product.nameEn,
      provider: line.product.provider,
      optionName: szOptionName(line.product),
      optionLabel: szOptionLabel(line.option),
      qty: line.qty,
      price: line.unitPrice,
      total: line.total
    })),
    coupon: discount.coupon?.code || "",
    subtotal,
    discount: discount.amount,
    total,
    status: "new"
  };
  const orders = szGetOrders();
  orders.unshift(order);
  szWrite(SZ_KEYS.orders, orders);
  szTrackMeta("Lead", {
    content_name: "AI subscription order",
    value: Number(order.total || 0),
    currency: "EGP"
  });
  szSaveCart([]);
  const message = [
    `طلب جديد ${order.id}`,
    `الاسم: ${order.customer.name}`,
    `الهاتف: ${order.customer.phone}`,
    `البريد: ${order.customer.email || "-"}`,
    `ملاحظات: ${order.customer.notes || "-"}`,
    "",
    "الاشتراكات:",
    ...order.items.map((item) => `- ${item.nameAr} (${item.provider}) - ${item.optionName}: ${item.optionLabel} × ${item.qty}: ${szMoney(item.total)}`),
    "",
    `الخصم: ${szMoney(order.discount)} ${order.coupon ? `(${order.coupon})` : ""}`,
    `الإجمالي: ${szMoney(order.total)}`
  ].join("\n");
  window.open(szWhatsAppLink(message), "_blank", "noopener");
  alert("تم حفظ الطلب وفتح واتساب لإرساله.");
  location.href = "softwarezawy-store.html";
}

document.addEventListener("DOMContentLoaded", () => {
  szRenderCart();
  szBindCart();
});
