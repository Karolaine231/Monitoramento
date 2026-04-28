// =========================
// CONFIG
// =========================
const API_BASE = "http://127.0.0.1:8000";

// =========================
// STATE
// =========================
const state = {
  products: [],
  monitoringSummary: {
    weeklyMonitored: 0,
    alerts: 0,
    reports: 0
  },
  reportSettings: {
    email: "",
    day: "Segunda-feira"
  },
  reportLogs: []
};

const RETAILERS = ["Mercado Livre", "Amazon BR", "Ri Happy"];

// fallback temporario caso backend ainda nao esteja pronto
const fallbackData = {
  products: [
    {
      id: 1,
      name: "Nerf Elite 2.0 Commander RD-6",
      ean: "195166190230",
      sku: "F2358",
      code: "F2358B009",
      map_price: 159.9,
      date: "15/05/2025 09:15",
      thumb: "nerf",
      results: {
        "Mercado Livre": [
          {
            name: "Nerf Elite 2.0 Commander RD-6 Original",
            price: 139.9,
            seller: "Loja Brinquedos Max",
            url: "https://exemplo.com/ml-nerf-1"
          },
          {
            name: "Lançador Nerf Elite Commander RD-6",
            price: 152.5,
            seller: "BrincaMais",
            url: "https://exemplo.com/ml-nerf-2"
          }
        ],
        "Amazon BR": [
          {
            name: "Nerf Elite 2.0 Commander RD-6",
            price: 159.9,
            seller: "Amazon.com.br",
            url: "https://exemplo.com/amz-nerf-1"
          }
        ],
        "Ri Happy": []
      },
      history: {
        labels: ["Qui", "Sex", "Sáb", "Dom", "Seg", "Ter", "Qua"],
        series: {
          "Mercado Livre": [149.9, 145.9, 143.9, 141.9, 139.9, 142.9, 139.9],
          "Amazon BR": [159.9, 158.9, 157.9, 159.9, 156.9, 155.9, 159.9],
          "Ri Happy": [0, 0, 0, 0, 0, 0, 0]
        }
      }
    },
    {
      id: 2,
      name: "Monopoly Edição Clássica",
      ean: "5010996306401",
      sku: "G0720",
      code: "G0720B071",
      map_price: 99.9,
      date: "14/05/2025 16:45",
      thumb: "mono",
      results: {
        "Mercado Livre": [
          {
            name: "Monopoly Edição Clássica Hasbro",
            price: 89.9,
            seller: "Mundo dos Jogos",
            url: "https://exemplo.com/ml-mono-1"
          }
        ],
        "Amazon BR": [
          {
            name: "Jogo Monopoly Clássico",
            price: 96.9,
            seller: "Amazon.com.br",
            url: "https://exemplo.com/amz-mono-1"
          },
          {
            name: "Monopoly Clássico Original",
            price: 99.9,
            seller: "Seller Premium",
            url: "https://exemplo.com/amz-mono-2"
          }
        ],
        "Ri Happy": [
          {
            name: "Monopoly Edição Clássica",
            price: 104.9,
            seller: "Ri Happy",
            url: "https://exemplo.com/ri-mono-1"
          }
        ]
      },
      history: {
        labels: ["Qui", "Sex", "Sáb", "Dom", "Seg", "Ter", "Qua"],
        series: {
          "Mercado Livre": [94.9, 93.9, 91.9, 89.9, 92.9, 90.9, 89.9],
          "Amazon BR": [99.9, 98.9, 98.9, 97.9, 96.9, 96.9, 99.9],
          "Ri Happy": [109.9, 108.9, 107.9, 106.9, 105.9, 104.9, 104.9]
        }
      }
    }
  ],
  monitoringSummary: {
    weeklyMonitored: 18,
    alerts: 4,
    reports: 2
  },
  reportSettings: {
    email: "pricing@empresa.com",
    day: "Segunda-feira"
  },
  reportLogs: [
    "Relatório semanal enviado para pricing@empresa.com",
    "Resumo de MAP consolidado com sucesso"
  ]
};

// =========================
// DOM
// =========================
const navButtons = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".content-section");

const productForm = document.getElementById("productForm");
const clearFormBtn = document.getElementById("clearFormBtn");
const reportForm = document.getElementById("reportForm");
const searchInput = document.getElementById("searchInput");

const historyProductSelect = document.getElementById("historyProductSelect");
const historyPeriodSelect = document.getElementById("historyPeriodSelect");
const toggleMapLine = document.getElementById("toggleMapLine");

// =========================
// HELPERS
// =========================
function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function nowAsBrDateTime() {
  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function ensureProductResults(product) {
  if (!product.results) {
    product.results = {};
  }

  RETAILERS.forEach(retailer => {
    if (!Array.isArray(product.results[retailer])) {
      product.results[retailer] = [];
    }
  });

  return product;
}

function ensureProductHistory(product) {
  if (!product.history) {
    product.history = {
      labels: ["Qui", "Sex", "Sáb", "Dom", "Seg", "Ter", "Qua"],
      series: {}
    };
  }

  if (!Array.isArray(product.history.labels)) {
    product.history.labels = ["Qui", "Sex", "Sáb", "Dom", "Seg", "Ter", "Qua"];
  }

  if (!product.history.series) {
    product.history.series = {};
  }

  RETAILERS.forEach(retailer => {
    if (!Array.isArray(product.history.series[retailer])) {
      product.history.series[retailer] = new Array(product.history.labels.length).fill(0);
    }
  });

  return product;
}

function normalizeProduct(product) {
  ensureProductResults(product);
  ensureProductHistory(product);
  return product;
}

function getTotalVariants(product) {
  normalizeProduct(product);
  return RETAILERS.reduce((acc, retailer) => acc + product.results[retailer].length, 0);
}

function getSelectedHistoryRetailers() {
  return Array.from(document.querySelectorAll(".historyRetailer:checked")).map(input => input.value);
}

function showToast(message) {
  console.log(message);
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let errorText = `Erro ${response.status}`;
    try {
      const data = await response.json();
      errorText = data.detail || data.message || errorText;
    } catch {
      // ignore
    }
    throw new Error(errorText);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

// =========================
// BACKEND LOADERS
// =========================
async function loadProductsFromApi() {
  try {
    const products = await apiFetch("/products");
    state.products = (products || []).map(normalizeProduct);
  } catch (error) {
    console.warn("Usando produtos fallback:", error.message);
    state.products = fallbackData.products.map(normalizeProduct);
  }
}

async function loadDashboardSummaryFromApi() {
  try {
    const summary = await apiFetch("/dashboard/summary");
    state.monitoringSummary = {
      weeklyMonitored: summary.weeklyMonitored ?? 0,
      alerts: summary.alerts ?? 0,
      reports: summary.reports ?? 0
    };
  } catch (error) {
    console.warn("Usando summary fallback:", error.message);
    state.monitoringSummary = { ...fallbackData.monitoringSummary };
  }
}

async function loadReportSettingsFromApi() {
  try {
    const settings = await apiFetch("/reports/settings");
    state.reportSettings = {
      email: settings.email || "",
      day: settings.day || "Segunda-feira"
    };
  } catch (error) {
    console.warn("Usando report settings fallback:", error.message);
    state.reportSettings = { ...fallbackData.reportSettings };
  }
}

async function loadReportLogsFromApi() {
  try {
    const logs = await apiFetch("/reports/logs");
    state.reportLogs = Array.isArray(logs) ? logs : [];
  } catch (error) {
    console.warn("Usando report logs fallback:", error.message);
    state.reportLogs = [...fallbackData.reportLogs];
  }
}

async function loadHistoryForProduct(productId) {
  try {
    const history = await apiFetch(`/history/${productId}`);
    const product = state.products.find(item => item.id === productId);
    if (product && history) {
      product.history = history.history || product.history;
      if (history.results) {
        product.results = history.results;
      }
      normalizeProduct(product);
    }
  } catch (error) {
    console.warn(`Historico fallback para produto ${productId}:`, error.message);
  }
}

async function loadAllInitialData() {
  await Promise.all([
    loadProductsFromApi(),
    loadDashboardSummaryFromApi(),
    loadReportSettingsFromApi(),
    loadReportLogsFromApi()
  ]);

  await Promise.all(state.products.map(product => loadHistoryForProduct(product.id)));
}

// =========================
// NAV
// =========================
function switchSection(sectionId) {
  navButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.section === sectionId);
  });

  sections.forEach(section => {
    section.classList.toggle("active", section.id === sectionId);
  });
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => switchSection(btn.dataset.section));
});

// =========================
// DASHBOARD
// =========================
function renderDashboard() {
  const metricProducts = document.getElementById("metricProducts");
  const metricMonitoring = document.getElementById("metricMonitoring");
  const metricAlerts = document.getElementById("metricAlerts");
  const metricReports = document.getElementById("metricReports");

  if (metricProducts) metricProducts.textContent = state.products.length;
  if (metricMonitoring) metricMonitoring.textContent = state.monitoringSummary.weeklyMonitored;
  if (metricAlerts) metricAlerts.textContent = state.monitoringSummary.alerts;
  if (metricReports) metricReports.textContent = state.monitoringSummary.reports;
}

function renderRecentProducts() {
  const tbody = document.getElementById("recentProductsTable");
  if (!tbody) return;

  const products = [...state.products].reverse();

  if (!products.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Nenhum item cadastrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(product => `
    <tr>
      <td>
        <span class="product-thumb ${product.thumb || ""}"></span>
        ${product.name}
      </td>
      <td>${product.ean || "-"}</td>
      <td>${product.sku || "-"}</td>
      <td>${formatCurrency(product.map_price)}</td>
      <td>${product.date || "-"}</td>
      <td>
        <button class="icon-btn" title="Ver histórico" onclick="viewHistory(${product.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      </td>
    </tr>
  `).join("");
}

// =========================
// MONITORAMENTO
// =========================
function renderMonitoringList(filter = "") {
  const container = document.getElementById("monitoringList");
  if (!container) return;

  const term = filter.trim().toLowerCase();

  const filteredProducts = state.products
    .map(normalizeProduct)
    .filter(product =>
      `${product.name} ${product.ean} ${product.sku} ${product.code}`.toLowerCase().includes(term)
    );

  if (!filteredProducts.length) {
    container.innerHTML = `<div class="empty-state">Nenhum produto encontrado.</div>`;
    return;
  }

  container.innerHTML = filteredProducts.map(product => {
    const totalVariants = getTotalVariants(product);

    return `
      <div class="monitoring-item" data-id="${product.id}">
        <button class="monitoring-header" type="button" onclick="toggleMonitoringItem(${product.id})">
          <div class="monitoring-left">
            <div class="monitoring-title">${product.name}</div>
            <div class="monitoring-sub">
              <span><strong>SKU:</strong> ${product.sku || "-"}</span>
              <span><strong>EAN:</strong> ${product.ean || "-"}</span>
              <span><strong>MAP:</strong> ${formatCurrency(product.map_price)}</span>
            </div>
          </div>

          <div class="monitoring-right">
            <span class="monitoring-badge">${RETAILERS.length} varejistas</span>
            <span class="monitoring-badge">${totalVariants} variantes</span>
            <span class="monitoring-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
          </div>
        </button>

        <div class="monitoring-body">
          ${renderRetailerGroups(product)}
        </div>
      </div>
    `;
  }).join("");
}

function renderRetailerGroups(product) {
  return RETAILERS.map(retailer => {
    const variants = product.results[retailer] || [];

    return `
      <div class="retailer-group">
        <div class="retailer-header">
          <div class="retailer-name">${retailer}</div>
          <div class="retailer-count">
            ${variants.length} ${variants.length === 1 ? "variante" : "variantes"}
          </div>
        </div>

        ${
          variants.length
            ? variants.map(variant => `
              <div class="variant-row">
                <div class="variant-name">
                  <strong>${variant.name || "-"}</strong>
                  <span>${variant.url || "-"}</span>
                </div>

                <div class="variant-col">
                  <strong>Preço</strong>
                  ${formatCurrency(variant.price)}
                </div>

                <div class="variant-col">
                  <strong>Vendedor</strong>
                  ${variant.seller || "-"}
                </div>

                <div class="variant-link">
                  <a href="${variant.url}" target="_blank" rel="noopener noreferrer">Abrir</a>
                </div>
              </div>
            `).join("")
            : `<div class="variant-empty">Nenhum resultado encontrado nesse varejista.</div>`
        }
      </div>
    `;
  }).join("");
}

function toggleMonitoringItem(id) {
  const item = document.querySelector(`.monitoring-item[data-id="${id}"]`);
  if (!item) return;
  item.classList.toggle("open");
}

// =========================
// RELATÓRIOS
// =========================
function renderReportLogs() {
  const reportLog = document.getElementById("reportLog");
  if (!reportLog) return;

  if (!state.reportLogs.length) {
    reportLog.innerHTML = `<li class="empty-state">Nenhum relatório registrado.</li>`;
    return;
  }

  reportLog.innerHTML = state.reportLogs.map(item => `<li>${item}</li>`).join("");
}

function renderReportSettings() {
  const reportEmail = document.getElementById("reportEmail");
  const reportDay = document.getElementById("reportDay");

  if (reportEmail) reportEmail.value = state.reportSettings.email;
  if (reportDay) reportDay.value = state.reportSettings.day;
}

// =========================
// HISTÓRICO
// =========================
function renderHistoryProductOptions() {
  if (!historyProductSelect) return;

  const currentValue = historyProductSelect.value;

  historyProductSelect.innerHTML = state.products.map(product => `
    <option value="${product.id}">${product.name}</option>
  `).join("");

  const exists = state.products.some(product => String(product.id) === String(currentValue));
  if (exists) {
    historyProductSelect.value = currentValue;
  } else if (state.products.length) {
    historyProductSelect.value = String(state.products[0].id);
  }
}

function getSelectedHistoryProduct() {
  if (!historyProductSelect) return state.products[0] || null;
  const id = Number(historyProductSelect.value);
  return state.products.find(product => product.id === id) || state.products[0] || null;
}

function renderHistorySummary(product, retailers) {
  const lowestEl = document.getElementById("historyLowestPrice");
  const highestEl = document.getElementById("historyHighestPrice");
  const mapEl = document.getElementById("historyMapPrice");
  const bestRetailerEl = document.getElementById("historyBestRetailer");

  if (!product) return;

  const values = [];
  let bestRetailer = "-";
  let bestRetailerPrice = Infinity;

  retailers.forEach(retailer => {
    const series = product.history?.series?.[retailer] || [];
    const valid = series.filter(value => value > 0);

    valid.forEach(value => values.push(value));

    if (valid.length) {
      const minRetailer = Math.min(...valid);
      if (minRetailer < bestRetailerPrice) {
        bestRetailerPrice = minRetailer;
        bestRetailer = retailer;
      }
    }
  });

  const lowest = values.length ? Math.min(...values) : 0;
  const highest = values.length ? Math.max(...values) : 0;

  if (lowestEl) lowestEl.textContent = values.length ? formatCurrency(lowest) : "-";
  if (highestEl) highestEl.textContent = values.length ? formatCurrency(highest) : "-";
  if (mapEl) mapEl.textContent = formatCurrency(product.map_price || 0);
  if (bestRetailerEl) bestRetailerEl.textContent = bestRetailer;
}

function renderHistoryRetailerTable(product, retailers) {
  const tbody = document.getElementById("historyRetailerTable");
  if (!tbody || !product) return;

  tbody.innerHTML = retailers.map(retailer => {
    const series = product.history?.series?.[retailer] || [];
    const valid = series.filter(value => value > 0);
    const variants = (product.results?.[retailer] || []).length;

    const min = valid.length ? Math.min(...valid) : 0;
    const max = valid.length ? Math.max(...valid) : 0;
    const current = valid.length ? valid[valid.length - 1] : 0;
    const belowMap = current > 0 && current < (product.map_price || 0);

    return `
      <tr>
        <td>${retailer}</td>
        <td>${valid.length ? formatCurrency(min) : "-"}</td>
        <td>${valid.length ? formatCurrency(max) : "-"}</td>
        <td>${valid.length ? formatCurrency(current) : "-"}</td>
        <td>${variants}</td>
        <td class="${belowMap ? "map-alert" : "map-ok"}">
          ${valid.length ? (belowMap ? "Abaixo do MAP" : "Dentro do MAP") : "-"}
        </td>
      </tr>
    `;
  }).join("");
}

function drawHistoryChart(product, retailers, showMap = true) {
  const canvas = document.getElementById("historyChart");
  if (!canvas || !product) return;

  const ctx = canvas.getContext("2d");
  const W = canvas.offsetWidth || 900;
  const H = 280;
  canvas.width = W;
  canvas.height = H;

  const labels = product.history?.labels || [];
  const seriesByRetailer = product.history?.series || {};

  const palette = {
    "Mercado Livre": "#2563eb",
    "Amazon BR": "#f59e0b",
    "Ri Happy": "#8b5cf6"
  };

  const values = [];

  retailers.forEach(retailer => {
    (seriesByRetailer[retailer] || []).forEach(value => {
      if (value > 0) values.push(value);
    });
  });

  if (showMap && product.map_price) {
    values.push(product.map_price);
  }

  if (!values.length || !labels.length) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#9ba8c0";
    ctx.font = "14px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Sem dados suficientes para exibir o gráfico.", W / 2, H / 2);
    return;
  }

  const padL = 52;
  const padR = 20;
  const padT = 20;
  const padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const minV = Math.min(...values) - 10;
  const maxV = Math.max(...values) + 10;

  function xAt(i) {
    return padL + (i / Math.max(labels.length - 1, 1)) * chartW;
  }

  function yAt(v) {
    return padT + chartH - ((v - minV) / (maxV - minV || 1)) * chartH;
  }

  ctx.clearRect(0, 0, W, H);

  ctx.strokeStyle = "#e8ecf4";
  ctx.lineWidth = 1;

  const gridCount = 4;
  for (let i = 0; i <= gridCount; i += 1) {
    const v = minV + ((maxV - minV) * i / gridCount);
    const y = yAt(v);

    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(W - padR, y);
    ctx.stroke();

    ctx.fillStyle = "#9ba8c0";
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`R$ ${Math.round(v)}`, padL - 6, y + 4);
  }

  ctx.fillStyle = "#9ba8c0";
  ctx.textAlign = "center";
  ctx.font = "11px Inter, sans-serif";

  labels.forEach((label, i) => {
    ctx.fillText(label, xAt(i), H - 8);
  });

  if (showMap && product.map_price) {
    ctx.beginPath();
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;

    labels.forEach((_, i) => {
      const x = xAt(i);
      const y = yAt(product.map_price);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
    ctx.setLineDash([]);
  }

  retailers.forEach(retailer => {
    const series = seriesByRetailer[retailer] || [];
    const validPoints = series
      .map((value, index) => ({ value, index }))
      .filter(point => point.value > 0);

    if (!validPoints.length) return;

    ctx.beginPath();
    ctx.strokeStyle = palette[retailer] || "#2563eb";
    ctx.lineWidth = 2.5;

    validPoints.forEach((point, idx) => {
      const x = xAt(point.index);
      const y = yAt(point.value);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    validPoints.forEach(point => {
      ctx.beginPath();
      ctx.arc(xAt(point.index), yAt(point.value), 4, 0, Math.PI * 2);
      ctx.fillStyle = palette[retailer] || "#2563eb";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  });
}

function renderHistorySection() {
  const product = getSelectedHistoryProduct();
  const retailers = getSelectedHistoryRetailers();
  const showMap = toggleMapLine ? toggleMapLine.checked : true;

  if (!product) return;

  normalizeProduct(product);
  renderHistorySummary(product, retailers);
  renderHistoryRetailerTable(product, retailers);
  drawHistoryChart(product, retailers, showMap);
}

// =========================
// CHART DASHBOARD
// =========================
function drawChart() {
  const canvas = document.getElementById("priceChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const W = canvas.offsetWidth || 560;
  const H = 200;
  canvas.width = W;
  canvas.height = H;

  const days = ["Qui", "Sex", "Sáb", "Dom", "Seg", "Ter", "Qua"];
  const priceData = [130, 105, 125, 145, 135, 145, 150];
  const mapData = [195, 180, 200, 210, 205, 220, 225];

  const padL = 52;
  const padR = 20;
  const padT = 16;
  const padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const allVals = [...priceData, ...mapData];
  const minV = Math.min(...allVals) - 20;
  const maxV = Math.max(...allVals) + 20;

  function xAt(i) {
    return padL + (i / (days.length - 1)) * chartW;
  }

  function yAt(v) {
    return padT + chartH - ((v - minV) / (maxV - minV)) * chartH;
  }

  ctx.strokeStyle = "#e8ecf4";
  ctx.lineWidth = 1;

  const gridCount = 4;
  for (let i = 0; i <= gridCount; i += 1) {
    const v = minV + ((maxV - minV) * i / gridCount);
    const y = yAt(v);

    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(W - padR, y);
    ctx.stroke();

    ctx.fillStyle = "#9ba8c0";
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`R$ ${Math.round(v)}`, padL - 6, y + 4);
  }

  ctx.fillStyle = "#9ba8c0";
  ctx.textAlign = "center";
  ctx.font = "11px Inter, sans-serif";

  days.forEach((day, i) => {
    ctx.fillText(day, xAt(i), H - 8);
  });

  ctx.beginPath();
  ctx.setLineDash([6, 5]);
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2;
  mapData.forEach((v, i) => {
    if (i === 0) ctx.moveTo(xAt(i), yAt(v));
    else ctx.lineTo(xAt(i), yAt(v));
  });
  ctx.stroke();
  ctx.setLineDash([]);

  const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
  grad.addColorStop(0, "rgba(37, 99, 235, 0.18)");
  grad.addColorStop(1, "rgba(37, 99, 235, 0)");

  ctx.beginPath();
  priceData.forEach((v, i) => {
    if (i === 0) ctx.moveTo(xAt(i), yAt(v));
    else ctx.lineTo(xAt(i), yAt(v));
  });
  ctx.lineTo(xAt(priceData.length - 1), padT + chartH);
  ctx.lineTo(xAt(0), padT + chartH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 2.5;
  priceData.forEach((v, i) => {
    if (i === 0) ctx.moveTo(xAt(i), yAt(v));
    else ctx.lineTo(xAt(i), yAt(v));
  });
  ctx.stroke();

  priceData.forEach((v, i) => {
    ctx.beginPath();
    ctx.arc(xAt(i), yAt(v), 4.5, 0, Math.PI * 2);
    ctx.fillStyle = "#2563eb";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

// =========================
// AÇÕES
// =========================
async function collectProduct(id) {
  const product = state.products.find(p => p.id === id);
  if (!product) return;

  try {
    await apiFetch(`/collect/${id}`, { method: "POST" });
    showToast(`Coleta executada para: ${product.name}`);

    await loadDashboardSummaryFromApi();
    await loadHistoryForProduct(id);
    await loadProductsFromApi();
    renderAll();
  } catch (error) {
    console.warn("Falha ao coletar no backend, usando simulacao:", error.message);

    state.monitoringSummary.weeklyMonitored += 1;
    if (Math.random() > 0.5) {
      state.monitoringSummary.alerts += 1;
      state.reportLogs.unshift(`Alerta de MAP detectado para ${product.name}`);
    } else {
      state.reportLogs.unshift(`Coleta realizada para ${product.name}`);
    }

    renderAll();
    alert(`Coleta simulada para: ${product.name}`);
  }
}

async function viewHistory(id) {
  const product = state.products.find(p => p.id === id);
  if (!product) return;

  if (historyProductSelect) {
    historyProductSelect.value = String(id);
  }

  await loadHistoryForProduct(id);
  renderHistorySection();
  switchSection("historico");
}

// =========================
// FORMULÁRIOS
// =========================
if (productForm) {
  productForm.addEventListener("submit", async event => {
    event.preventDefault();

    const payload = {
      name: document.getElementById("name").value.trim(),
      ean: document.getElementById("ean").value.trim(),
      sku: document.getElementById("sku").value.trim(),
      code: document.getElementById("code").value.trim(),
      map_price: parseFloat(document.getElementById("map_price").value || "0")
    };

    if (!payload.name) {
      alert("Preencha o nome do produto.");
      return;
    }

    try {
      await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      productForm.reset();
      await loadProductsFromApi();
      renderAll();
      switchSection("monitoramento");
      showToast("Produto cadastrado com sucesso.");
    } catch (error) {
      console.warn("Cadastro backend indisponivel, salvando local:", error.message);

      const newProduct = normalizeProduct({
        id: state.products.length ? Math.max(...state.products.map(p => p.id)) + 1 : 1,
        name: payload.name,
        ean: payload.ean,
        sku: payload.sku,
        code: payload.code,
        map_price: payload.map_price,
        date: nowAsBrDateTime(),
        thumb: "",
        history: {
          labels: ["Qui", "Sex", "Sáb", "Dom", "Seg", "Ter", "Qua"],
          series: {
            "Mercado Livre": [0, 0, 0, 0, 0, 0, 0],
            "Amazon BR": [0, 0, 0, 0, 0, 0, 0],
            "Ri Happy": [0, 0, 0, 0, 0, 0, 0]
          }
        }
      });

      state.products.push(newProduct);
      productForm.reset();
      renderAll();
      switchSection("monitoramento");
    }
  });
}

if (clearFormBtn) {
  clearFormBtn.addEventListener("click", () => {
    if (productForm) productForm.reset();
  });
}

if (reportForm) {
  reportForm.addEventListener("submit", async event => {
    event.preventDefault();

    const email = document.getElementById("reportEmail")?.value.trim() || "";
    const day = document.getElementById("reportDay")?.value || "";

    try {
      await apiFetch("/reports/settings", {
        method: "POST",
        body: JSON.stringify({ email, day })
      });

      state.reportSettings.email = email;
      state.reportSettings.day = day;
      state.reportLogs.unshift(`Configuração salva: relatório para ${email} em ${day}`);
      renderReportLogs();
      showToast("Configuração salva com sucesso.");
    } catch (error) {
      console.warn("Config backend indisponivel, salvando local:", error.message);

      state.reportSettings.email = email;
      state.reportSettings.day = day;
      state.reportLogs.unshift(`Configuração salva: relatório para ${email} em ${day}`);
      renderReportLogs();
      alert("Configuração salva localmente.");
    }
  });
}

if (searchInput) {
  searchInput.addEventListener("input", event => {
    renderMonitoringList(event.target.value);
  });
}

if (historyProductSelect) {
  historyProductSelect.addEventListener("change", async () => {
    const product = getSelectedHistoryProduct();
    if (product) {
      await loadHistoryForProduct(product.id);
    }
    renderHistorySection();
  });
}

if (historyPeriodSelect) {
  historyPeriodSelect.addEventListener("change", async () => {
    const product = getSelectedHistoryProduct();
    if (product) {
      await loadHistoryForProduct(product.id);
    }
    renderHistorySection();
  });
}

document.querySelectorAll(".historyRetailer").forEach(input => {
  input.addEventListener("change", renderHistorySection);
});

if (toggleMapLine) {
  toggleMapLine.addEventListener("change", renderHistorySection);
}

// =========================
// RENDER GERAL
// =========================
function renderAll() {
  renderDashboard();
  renderRecentProducts();
  renderMonitoringList(searchInput ? searchInput.value : "");
  renderReportSettings();
  renderReportLogs();
  renderHistoryProductOptions();
  renderHistorySection();
  drawChart();
}

// =========================
// WINDOW
// =========================
window.collectProduct = collectProduct;
window.viewHistory = viewHistory;
window.switchSection = switchSection;
window.toggleMonitoringItem = toggleMonitoringItem;

// =========================
// INIT
// =========================
async function initApp() {
  await loadAllInitialData();
  state.products = state.products.map(normalizeProduct);
  renderAll();
}

initApp();
window.addEventListener("resize", () => {
  drawChart();
  renderHistorySection();
});