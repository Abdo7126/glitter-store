const GLITTER_SYNC_TOKEN = "Aa01000706717@";
const GLITTER_STORE_KEY = "glitter_store_v1";
const GLITTER_STORE_CHUNK_SIZE = 8000;
const GLITTER_PUBLIC_KEYS = ["settings", "products", "coupons"];
const GLITTER_ADMIN_KEYS = ["settings", "products", "coupons", "orders", "admins"];

function doGet(event) {
  const params = event.parameter || {};
  const scope = params.scope === "admin" ? "admin" : "public";
  const data = glitterReadStore();

  if (scope === "admin" && params.token !== GLITTER_SYNC_TOKEN) {
    return glitterJson({ ok: false, error: "Invalid sync token." }, params.callback);
  }

  return glitterJson({
    ok: true,
    data: glitterPick(data, scope === "admin" ? GLITTER_ADMIN_KEYS : GLITTER_PUBLIC_KEYS),
    updatedAt: data.updatedAt || ""
  }, params.callback);
}

function doPost(event) {
  let body = {};
  try {
    body = JSON.parse((event.postData && event.postData.contents) || "{}");
  } catch (error) {
    return glitterJson({ ok: false, error: "Invalid JSON body." });
  }

  const data = glitterReadStore();

  if (body.action === "createOrder") {
    const order = body.order;
    if (!order || !order.id) return glitterJson({ ok: false, error: "Missing order." });
    const orders = Array.isArray(data.orders) ? data.orders : [];
    data.orders = [order].concat(orders.filter((item) => item.id !== order.id)).slice(0, 500);
    data.updatedAt = new Date().toISOString();
    glitterWriteStore(data);
    return glitterJson({ ok: true });
  }

  if (body.token !== GLITTER_SYNC_TOKEN) {
    return glitterJson({ ok: false, error: "Invalid sync token." });
  }

  if (body.action === "write" && GLITTER_ADMIN_KEYS.indexOf(body.key) >= 0) {
    data[body.key] = body.value;
    data.updatedAt = new Date().toISOString();
    glitterWriteStore(data);
    return glitterJson({ ok: true });
  }

  if (body.action === "writeSnapshot") {
    const next = body.data || {};
    GLITTER_ADMIN_KEYS.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(next, key)) data[key] = next[key];
    });
    data.updatedAt = new Date().toISOString();
    glitterWriteStore(data);
    return glitterJson({ ok: true });
  }

  return glitterJson({ ok: false, error: "Unknown sync action." });
}

function glitterReadStore() {
  const props = PropertiesService.getScriptProperties();
  const chunkCount = Number(props.getProperty(`${GLITTER_STORE_KEY}_chunks`) || 0);
  if (chunkCount > 0) {
    let raw = "";
    for (let index = 0; index < chunkCount; index += 1) {
      raw += props.getProperty(`${GLITTER_STORE_KEY}_${index}`) || "";
    }
    return raw ? JSON.parse(raw) : {};
  }
  const raw = props.getProperty(GLITTER_STORE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function glitterWriteStore(data) {
  const props = PropertiesService.getScriptProperties();
  const raw = JSON.stringify(data);
  const chunkCount = Math.ceil(raw.length / GLITTER_STORE_CHUNK_SIZE);
  const oldChunkCount = Number(props.getProperty(`${GLITTER_STORE_KEY}_chunks`) || 0);

  for (let index = 0; index < chunkCount; index += 1) {
    props.setProperty(
      `${GLITTER_STORE_KEY}_${index}`,
      raw.slice(index * GLITTER_STORE_CHUNK_SIZE, (index + 1) * GLITTER_STORE_CHUNK_SIZE)
    );
  }

  for (let index = chunkCount; index < oldChunkCount; index += 1) {
    props.deleteProperty(`${GLITTER_STORE_KEY}_${index}`);
  }

  props.setProperty(`${GLITTER_STORE_KEY}_chunks`, String(chunkCount));
  props.deleteProperty(GLITTER_STORE_KEY);
}

function glitterPick(data, keys) {
  const output = {};
  keys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(data, key)) output[key] = data[key];
  });
  return output;
}

function glitterJson(payload, callback) {
  if (callback && /^[A-Za-z_$][\w.$]*$/.test(callback)) {
    return ContentService
      .createTextOutput(`${callback}(${JSON.stringify(payload)});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
