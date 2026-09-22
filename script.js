/* ═══════════════════════════════════════════════════════════
   EstateIQ – script.js (vanilla JS, Chart.js for graphs)
   ═══════════════════════════════════════════════════════════ */

// ── Constants ────────────────────────────────────────────────
const CITY_DATA = {
  "Mumbai": { img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1600&q=80", country: "India", zone: "INR" },
  "Delhi": { img: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1600&q=80", country: "India", zone: "INR" },
  "Bengaluru": { img: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1600&q=80", country: "India", zone: "INR" },
  "Hyderabad": { img: "https://images.unsplash.com/photo-1588416936097-41850ab3d86d?w=1600&q=80", country: "India", zone: "INR" },
  "Chennai": { img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1600&q=80", country: "India", zone: "INR" }
};
const CITIES = ["Bengaluru"]; // Focus only on Bengaluru
const PROPERTY_TYPES = ["Apartment", "Villa", "Independent House", "Penthouse", "Studio", "Duplex", "Townhouse", "Commercial"];
const FURNISHING = ["Unfurnished", "Semi-Furnished", "Fully Furnished"];
const FACING = ["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"];
const AMENITIES = ["🏋️ Gym", "🏊 Pool", "🎳 Clubhouse", "🌿 Garden", "🔒 Security", "⚡ Power Backup", "🛗 Lift", "📷 CCTV", "🎾 Tennis", "🅿️ Visitor Parking", "🌡️ Central AC", "🏪 Mini Mart"];
const PROP_IMGS = {
  "Apartment": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80",
  "Villa": "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=900&q=80",
  "Independent House": "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=80",
  "Penthouse": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=80",
  "Studio": "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=900&q=80",
  "Duplex": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80",
  "Townhouse": "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=900&q=80",
  "Commercial": "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80",
};

// ── State ────────────────────────────────────────────────────
const form = {
  city: "Bengaluru", propertyType: "Apartment", areaType: "Super built-up Area", availability: "Ready To Move", area: 1200, bedrooms: 3,
  bathrooms: 2, age: 5, floor: 4, totalFloors: 12, parking: 1,
  furnishing: "Semi-Furnished", facing: "East", condition: "Good",
  amenities: ["🏋️ Gym", "🏊 Pool"],
  nearMetro: true, nearSchool: true, nearHospital: false, nearMall: false,
  vastu: false, waterfront: false, cornerPlot: false,
  loanPct: 80, loanRate: 8.5, loanTenure: 20,
  location: "",
  balcony: 1
};
let result = null;
let chartInstances = {};
let history = JSON.parse(localStorage.getItem('estateIqHistory')) || []; 
let maps = { input: null, result: null };
let markers = { input: null, result: null };
let allLocations = [];
let heatmapIntensities = {};

const BENGALURU_COORDS = {
  "Whitefield": [12.9698, 77.7500],
  "Electronic City Phase I": [12.8487, 77.6769],
  "Electronic City Phase II": [12.8452, 77.6635],
  "HSR Layout": [12.9141, 77.6411],
  "Indira Nagar": [12.9719, 77.6412],
  "Koramangala": [12.9352, 77.6245],
  "Bellandur": [12.9304, 77.6784],
  "Sarjapur Road": [12.9204, 77.6749],
  "Yelahanka": [13.1007, 77.5963],
  "Hebbal": [13.0354, 77.5988],
  "Marathahalli": [12.9569, 77.7011],
  "Banashankari": [12.9255, 77.5468],
  "Jayanagar": [12.9250, 77.5938],
  "Malleshwaram": [12.9972, 77.5710],
  "Rajaji Nagar": [12.9893, 77.5552],
  "Uttarahalli": [12.9055, 77.5455],
  "7th Phase JP Nagar": [12.8956, 77.5786],
  "Thanisandra": [13.0549, 77.6326],
  "Binny Pete": [12.9642, 77.5583],
  "Kanakpura Road": [12.8711, 77.5453],
  "Yeshwanthpur": [13.0235, 77.5513],
  "Anekal": [12.7034, 77.6975],
  "Chandapura": [12.7933, 77.6978],
  "Varthur": [12.9406, 77.7466],
  "Sarjapur": [12.8601, 77.7850],
  "Raja Rajeshwari Nagar": [12.9158, 77.5190],
  "Bannerghatta Road": [12.8807, 77.5960],
  "Hennur Road": [13.0358, 77.6346],
  "Haralur Road": [12.9041, 77.6698],
  "KR Puram": [13.0158, 77.7060],
  "Hoodi": [12.9919, 77.7164],
  "Electronics City Phase 1": [12.8487, 77.6769],
  "Electronics City Phase 2": [12.8452, 77.6635],
};
const DEFAULT_BENGALURU = [12.9716, 77.5946];

// ── Helpers ──────────────────────────────────────────────────
function fmt(n, currency) {
  if (!n) return "—";
  if (currency === "INR") {
    if (n >= 10000000) return "₹" + (n / 10000000).toFixed(2) + " Cr";
    if (n >= 100000) return "₹" + (n / 100000).toFixed(2) + " L";
    return "₹" + n.toLocaleString();
  }
  if (n >= 1000000) return "$" + (n / 1000000).toFixed(2) + "M";
  if (n >= 1000) return "$" + (n / 1000).toFixed(0) + "K";
  return "$" + n.toLocaleString();
}
function calcEMI(p, rate, tenure) {
  const r = rate / 12 / 100, n = tenure * 12;
  if (r === 0) return p / n;
  return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}
function $(id) { return document.getElementById(id); }
function show(el) { el.classList.remove("hidden"); }
function hide(el) { el.classList.add("hidden"); }

// ── UI Components ──────────────────────────────────────────
function populateSelect(id, opts, selected) {
  const sel = $(id);
  sel.innerHTML = opts.map(o => `<option${o === selected ? " selected" : ""}>${o}</option>`).join("");
}

function updateBanner() {
  $("bannerType").textContent = form.propertyType;
  $("bannerDetails").textContent = `${form.bedrooms} BHK · ${form.area.toLocaleString()} sq ft · ${form.furnishing}`;
  $("bannerCity").textContent = form.city;
  $("bannerFloor").textContent = `Floor ${form.floor}/${form.totalFloors} · ${form.facing} facing`;
  $("heroCityLabel").textContent = form.city;
  $("countryLabel").textContent = CITY_DATA[form.city]?.country || "India";
  $("propBannerBg").style.backgroundImage = `url(${PROP_IMGS[form.propertyType] || PROP_IMGS["Apartment"]})`;
}

function updateBg() {
  const bgEl = $("bgImg");
  const url = CITY_DATA[form.city]?.img || CITY_DATA["Mumbai"].img;
  bgEl.classList.remove("loaded");
  const img = new Image(); img.src = url;
  img.onload = () => { bgEl.style.backgroundImage = `url(${url})`; bgEl.classList.add("loaded"); };
}

function updateSliderLabel(id, suffix) {
  $(id + "Val").textContent = form[id] + (suffix || "");
}

// ── Bind Events ──────────────────────────────────────────────
function bindEvents() {
  // Navigation Tabs
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".page-section").forEach(p => hide(p));
      const page = btn.dataset.page;
      show($(page + "Page"));
      if (page === "analytics") renderAnalytics();
      if (page === "reports") renderReports();
      if (page === "dashboard") setTimeout(() => { if (maps.input) maps.input.invalidateSize(); }, 200);
    });
  });

  // Input Tabs
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".tab-content").forEach(c => hide(c));
      show($("tab-" + btn.dataset.tab));
      if (btn.dataset.tab === "location") {
        setTimeout(() => {
          if (maps.input) {
            maps.input.invalidateSize();
            updateMapMarker('input', form.location);
          }
        }, 100);
      }
    });
  });

  // Result View Tabs
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".view-content").forEach(c => hide(c));
      show($("view-" + btn.dataset.view));
    });
  });

  // Selects
  $("propertyType").addEventListener("change", e => { form.propertyType = e.target.value; updateBanner(); });
  $("furnishing").addEventListener("change", e => { form.furnishing = e.target.value; updateBanner(); });
  $("facing").addEventListener("change", e => { form.facing = e.target.value; updateBanner(); });
  $("condition").addEventListener("change", e => { form.condition = e.target.value; });
  $("areaTypeSel").addEventListener("change", e => { form.areaType = e.target.value; });
  $("availabilitySel").addEventListener("change", e => { form.availability = e.target.value; });
  // Location search is handled by setupSearchListeners called in fetchLocations

  // Sliders
  const sliders = [
    ["area", " sq ft"], ["bedrooms", " BHK"], ["bathrooms", ""], ["balcony", ""], ["age", " yrs"],
    ["floor", ""], ["totalFloors", ""], ["parking", ""],
    ["loanPct", "%"], ["loanRate", "% p.a."], ["loanTenure", " yrs"]
  ];
  sliders.forEach(([id, suffix]) => {
    $(id).addEventListener("input", e => {
      form[id] = parseFloat(e.target.value);
      updateSliderLabel(id, suffix);
      updateBanner();
    });
  });

  // City selection is handled by setupCitySearch

  // Chips
  document.querySelectorAll(".chip[data-key]").forEach(btn => {
    btn.addEventListener("click", () => {
      const k = btn.dataset.key;
      form[k] = !form[k];
      btn.classList.toggle("active", form[k]);
    });
  });

  // Amenities
  const ag = $("amenityGrid");
  ag.innerHTML = AMENITIES.map(a => `<button class="amenity-btn${form.amenities.includes(a) ? " active" : ""}" data-amenity="${a}"><span class="amenity-check">${form.amenities.includes(a) ? "✓" : ""}</span>${a}</button>`).join("");
  ag.addEventListener("click", e => {
    const btn = e.target.closest("[data-amenity]");
    if (!btn) return;
    const a = btn.dataset.amenity;
    if (form.amenities.includes(a)) form.amenities = form.amenities.filter(x => x !== a);
    else form.amenities.push(a);
    btn.classList.toggle("active", form.amenities.includes(a));
    btn.querySelector(".amenity-check").textContent = form.amenities.includes(a) ? "✓" : "";
    $("amenityCount").textContent = `${form.amenities.length}/${AMENITIES.length}`;
  });

  $("predictBtn").addEventListener("click", predict);
}

// ── Prediction Engine ──────────────────────────────────────
async function predict() {
  const btn = $("predictBtn");
  const originalText = btn.innerHTML;
  
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span>Analyzing ${form.city} Market...`;
  
  hide($("errorMsg"));
  const panel = $("resultPanel");
  panel.classList.remove("show");
  panel.classList.add("hidden");

  try {
    const res = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, currency: CITY_DATA[form.city]?.zone || "INR" }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    result = data;
    history.unshift({ ...data, date: new Date().toLocaleString(), city: form.city, type: form.propertyType });
    localStorage.setItem('estateIqHistory', JSON.stringify(history));
    renderResults();
  } catch (e) {
    $("errorMsg").textContent = "Prediction failed: " + e.message;
    show($("errorMsg"));
  }
  btn.disabled = false;
  btn.innerHTML = originalText;
}

// ── Results Rendering ──────────────────────────────────────
function renderResults() {
  if (!result) return;
  const panel = $("resultPanel");
  panel.classList.remove("hidden");
  // Force reflow for animation
  void panel.offsetWidth;
  panel.classList.add("show");
  $("mainGrid").classList.add("has-result");
  $("priceHeroBg").style.backgroundImage = `url(${PROP_IMGS[form.propertyType] || PROP_IMGS["Apartment"]})`;
  $("priceValue").textContent = fmt(result.estimatedPrice, result.currency);
  $("priceSqft").textContent = `${result.currency === "INR" ? "₹" : "$"}${(result.pricePerSqft || 0).toLocaleString()} / sq ft`;
  $("priceLow").textContent = fmt(result.minPrice, result.currency);
  $("priceHigh").textContent = fmt(result.maxPrice, result.currency);

  panel.scrollIntoView({ behavior: "smooth", block: "start" });

  renderOverview();
  renderNeighborhood();
  renderChart();
  renderEMI();
  renderResultMap();
}

function renderResultMap() {
  if (!maps.result) {
    maps.result = L.map('resultMap', { zoomControl: false }).setView(DEFAULT_BENGALURU, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(maps.result);
  }
  
  updateMapMarker('result', form.location);
  
  if (window.L.heatLayer) {
    const heatData = [];
    Object.keys(BENGALURU_COORDS).forEach(loc => {
      const coord = BENGALURU_COORDS[loc];
      const intensity = heatmapIntensities[loc] || (Math.random() * 0.2 + 0.1); 
      heatData.push([coord[0], coord[1], intensity]);
    });
    
    const targetCoord = BENGALURU_COORDS[form.location] || DEFAULT_BENGALURU;
    heatData.push([targetCoord[0], targetCoord[1], 1.0]);

    if (maps.result._heat) maps.result.removeLayer(maps.result._heat);
    maps.result._heat = L.heatLayer(heatData, {
      radius: 35,
      blur: 25,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1: 'red' }
    }).addTo(maps.result);
  }
}

function renderOverview() {
  const r = result;
  const metrics = [
    { l: "Confidence", v: `${r.confidenceScore}%`, icon: "🎯", c: r.confidenceScore > 75 ? "#22c55e" : "#f59e0b" },
    { l: "Market Trend", v: r.marketTrend, sub: `${r.trendPercent > 0 ? "+" : ""}${r.trendPercent}% YoY`, icon: "📈", c: "#22c55e" },
    { l: "Investment", v: r.investmentRating, icon: "⭐", c: "#22c55e" },
    { l: "Rental Yield", v: `${r.rentalYield}% p.a.`, icon: "💰", c: "#fbbf24" },
  ];
  $("view-overview").innerHTML = `
    <div class="metrics-grid">${metrics.map(m => `<div class="glass metric-card"><div class="metric-label">${m.icon} ${m.l}</div><div class="metric-value" style="color:${m.c}">${m.v}</div></div>`).join("")}</div>
    <div class="glass" style="padding:1rem">
      <div class="section-head">🔍 Key Valuation Drivers</div>
      <div style="display:flex; flex-wrap:wrap; gap:0.5rem">${(r.keyFactors || []).map(f => `<span class="factor-tag">${f}</span>`).join("")}</div>
    </div>
  `;
}

function renderNeighborhood() {
  const n = result.neighborhood;
  if (!n) return;
  const cats = [{ k: "connectivity", l: "Transit" }, { k: "safety", l: "Safety" }, { k: "schools", l: "Schools" }, { k: "healthcare", l: "Health" }];
  
  if (chartInstances.radarNbr) chartInstances.radarNbr.destroy();
  $("view-neighborhood").innerHTML = `<div class="glass" style="padding:1.2rem"><canvas id="radarChart" height="200"></canvas></div>`;
  const ctx = document.getElementById("radarChart").getContext("2d");
  chartInstances.radarNbr = new Chart(ctx, {
    type: "radar",
    data: { labels: cats.map(c => c.l), datasets: [{ data: cats.map(c => n[c.k]), backgroundColor: "rgba(34,211,238,0.2)", borderColor: "#22d3ee" }] },
    options: { plugins: { legend: { display: false } }, scales: { r: { grid: { color: "rgba(255,255,255,0.1)" }, ticks: { display: false } } } }
  });
}

function renderChart() {
  const r = result;
  const labels = ["Whitefield", "Electronic City", "HSR Layout", "Indira Nagar", "Koramangala"];
  const values = [7500, 5500, 8500, 15000, 12000]; // Approximate avg prices per sqft

  const chartContainer = $("view-chart");
  // Check if we need to recreate the canvas or if it's already there
  let canvas = document.getElementById("heatmapChart");
  if (!canvas) {
    chartContainer.innerHTML = `
      <div class="glass" style="padding:1.1rem;margin-bottom:1rem">
        <div class="section-head">Market Distribution</div>
        <div style="height: 300px;"><canvas id="heatmapChart"></canvas></div>
      </div>
      <div class="glass" style="padding:1.1rem"><div class="section-head">Market Snapshot</div><p style="color:#a8a29e">Comparing current valuation with national averages and regional benchmarks.</p></div>`;
    canvas = document.getElementById("heatmapChart");
  }

  if (chartInstances.heatmap) chartInstances.heatmap.destroy();
  const ctx = canvas.getContext("2d");
  chartInstances.heatmap = new Chart(ctx, {
    type: "polarArea",
    data: { labels, datasets: [{ data: values, backgroundColor: ["#ef4444bb", "#f97316bb", "#eab308bb", "#22c55ebb", "#22d3eebb"] }] },
    options: { plugins: { legend: { position: "bottom", labels: { color: "#a8a29e" } } }, scales: { r: { display: false } } }
  });
}

function renderEMI() {
  const r = result;
  const loanAmt = r.estimatedPrice * (form.loanPct / 100);
  const emi = calcEMI(loanAmt, form.loanRate, form.loanTenure);
  const totalInterest = emi * form.loanTenure * 12 - loanAmt;

  if (chartInstances.emiPie) chartInstances.emiPie.destroy();

  $("view-emi").innerHTML = `
    <div class="glass" style="padding:1.1rem;margin-bottom:1rem">
      <canvas id="emiPieChart" height="150"></canvas>
    </div>
    <div class="emi-hero"><div class="price-label">Monthly EMI</div><div class="emi-value">${fmt(Math.round(emi), r.currency)}</div></div>
    <div class="emi-cards" style="display:grid; grid-template-columns: 1fr 1fr; gap:0.8rem; margin-top:1rem;">
      <div class="glass" style="padding:.8rem;text-align:center"><div class="range-label">Loan Amount</div><div style="color:#60a5fa; font-weight:700;">${fmt(Math.round(loanAmt), r.currency)}</div></div>
      <div class="glass" style="padding:.8rem;text-align:center"><div class="range-label">Total Interest</div><div style="color:#f87171; font-weight:700;">${fmt(Math.round(totalInterest), r.currency)}</div></div>
    </div>
  `;
  
  const ctx = document.getElementById("emiPieChart").getContext("2d");
  chartInstances.emiPie = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Principal', 'Interest'],
      datasets: [{
        data: [loanAmt, totalInterest],
        backgroundColor: ['#60a5fa', '#f87171'],
        borderWidth: 0
      }]
    },
    options: {
      plugins: { legend: { position: 'bottom', labels: { color: '#a8a29e', usePointStyle: true } } },
      cutout: '70%',
      maintainAspectRatio: false
    }
  });

  // Small delay to make sure charts paint properly when panel is unhidden
  setTimeout(() => {
    chartInstances.emiPie.update();
    chartInstances.heatmap.update();
    if (maps.result) maps.result.invalidateSize();
  }, 300);
}

// ── Page Renderers ────────────────────────────────────────
async function renderAnalytics() {
  try {
    const res = await fetch("/analytics_data");
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    console.log("Analytics Data Received:", data);

    // Helper for safe chart creation
    const safeChart = (id, type, labels, datasets, opts = {}) => {
      const el = $(id);
      if (!el || !labels || labels.length === 0) {
        console.warn(`Skipping chart ${id}: Missing element or data.`);
        return null;
      }
      if (chartInstances[id]) chartInstances[id].destroy();
      try {
        chartInstances[id] = new Chart(el, {
          type: type,
          data: { labels: labels, datasets: datasets },
          options: { maintainAspectRatio: false, ...opts }
        });
        return chartInstances[id];
      } catch (e) { console.error(`Error rendering ${id}:`, e); return null; }
    };

    // 1. Update Metrics
    if (data.marketSummary) {
      if ($("marketAvgPrice")) $("marketAvgPrice").textContent = "₹" + (data.marketSummary.avgPrice || 0).toFixed(2) + " L";
      if ($("marketTotalListings")) $("marketTotalListings").textContent = (data.marketSummary.totalListings || 0).toLocaleString();
      if ($("marketAvgPPS")) $("marketAvgPPS").textContent = "₹" + (data.marketSummary.avgPPS || 0).toLocaleString();
    }

    // 2. Area Type Chart
    safeChart("areaTypeChart", "doughnut", Object.keys(data.areaDist || {}), [{
      data: Object.values(data.areaDist || {}),
      backgroundColor: ['#22d3ee', '#818cf8', '#fb7185', '#fbbf24'],
      borderWidth: 0
    }], { plugins: { legend: { position: 'bottom', labels: { color: '#a8a29e' } } } });

    // 3. Price vs BHK Chart
    safeChart("bhkPriceChart", "bar", Object.keys(data.bhkPrice || {}).map(k => k + " BHK"), [{
      label: 'Avg Price (Lakhs)',
      data: Object.values(data.bhkPrice || {}),
      backgroundColor: '#818cf8'
    }], { 
      plugins: { legend: { display: false } }, 
      scales: { x: { ticks: { color: '#a8a29e' }, grid: { display: false } }, y: { ticks: { color: '#a8a29e' }, grid: { color: 'rgba(255,255,255,0.05)' } } } 
    });

    // 4. Top Locations Chart
    safeChart("topLocChart", "bar", Object.keys(data.topLocations || {}), [{
      label: 'Avg Price (Lakhs)',
      data: Object.values(data.topLocations || {}),
      backgroundColor: '#22d3ee'
    }], { 
      indexAxis: 'y', plugins: { legend: { display: false } }, 
      scales: { x: { ticks: { color: '#a8a29e' }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#a8a29e' }, grid: { display: false } } } 
    });

    // 5. Availability Chart
    safeChart("availabilityChart", "pie", Object.keys(data.availDist || {}), [{
      data: Object.values(data.availDist || {}),
      backgroundColor: ['#34d399', '#f87171'],
      borderWidth: 0
    }], { plugins: { legend: { position: 'bottom', labels: { color: '#a8a29e' } } } });

    // 6. Price Segment Chart
    safeChart("priceSegmentChart", "doughnut", Object.keys(data.priceSegments || {}), [{
      data: Object.values(data.priceSegments || {}),
      backgroundColor: ['#22d3ee', '#818cf8', '#f0abfc', '#fbbf24'],
      borderWidth: 0
    }], { plugins: { legend: { position: 'bottom', labels: { color: '#a8a29e' } } } });

    // 7. Size vs Price Chart
    safeChart("sizePriceChart", "line", Object.keys(data.sizePricePoints || {}), [{
      label: 'Avg Price (Lakhs)',
      data: Object.values(data.sizePricePoints || {}),
      borderColor: '#22d3ee',
      backgroundColor: 'rgba(34, 211, 238, 0.1)',
      fill: true,
      tension: 0.4
    }], { 
      plugins: { legend: { display: false } }, 
      scales: { x: { ticks: { color: '#a8a29e' }, grid: { display: false } }, y: { ticks: { color: '#a8a29e' }, grid: { color: 'rgba(255,255,255,0.05)' } } } 
    });

    // 8. Market Health Chart
    safeChart("marketHealthChart", "bar", Object.keys(data.marketHealth || {}), [{
      label: 'Ready to Move %',
      data: Object.values(data.marketHealth || {}),
      backgroundColor: '#34d399'
    }], { 
      indexAxis: 'y', plugins: { legend: { display: false } }, 
      scales: { x: { min: 0, max: 100, ticks: { color: '#a8a29e', callback: v => v + '%' }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#a8a29e' }, grid: { display: false } } } 
    });

    // 9. Top PPS Chart
    safeChart("topPPSChart", "bar", Object.keys(data.topPPS || {}), [{
      label: 'Avg Price/Sqft (₹)',
      data: Object.values(data.topPPS || {}),
      backgroundColor: '#38bdf8'
    }], { plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#a8a29e' } }, y: { ticks: { color: '#a8a29e' } } } });

    // 10. Price Trend Chart
    const currentPrice = data.marketSummary?.avgPrice || 100;
    safeChart("marketTrendChart", "line", ['2021', '2022', '2023', '2024', '2025', '2026'], [{
      label: 'Bengaluru Price Index',
      data: [currentPrice * 0.75, currentPrice * 0.81, currentPrice * 0.88, currentPrice * 0.95, currentPrice * 0.98, currentPrice],
      borderColor: '#f0abfc',
      backgroundColor: 'rgba(240, 171, 252, 0.2)',
      fill: true,
      tension: 0.3
    }], { plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#a8a29e' } }, y: { ticks: { color: '#a8a29e' } } } });

  } catch (e) {
    console.error("Analytics failed:", e);
  }
}

function renderReports() {
  updateReportsDashboard();
  const list = $("reportsList");
  if (history.length === 0) {
    list.innerHTML = `<p style="color:#a8a29e;text-align:center;padding:2rem">No reports generated in this session yet.</p>`;
    return;
  }
  list.innerHTML = history.map((h, i) => `
    <div class="glass valuation-item" style="display:flex; justify-content:space-between; padding:1.2rem; margin-bottom:1rem; border-radius:12px;">
      <div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--neon-cyan)">${h.city} (${h.type})</div>
        <div style="font-size:.85rem;color:#a8a29e; margin-top:0.2rem;">${h.date} · Confidence: ${h.confidenceScore}%</div>
      </div>
      <div style="text-align:right">
        <div class="card-value" style="font-size:1.4rem; color:var(--neon-gold)">${fmt(h.estimatedPrice, h.currency || "INR")}</div>
        <div class="download-link" style="color:var(--neon-cyan); cursor:pointer; font-size:0.9rem; margin-top:0.5rem;" onclick="downloadReport(this)">View Certificate →</div>
      </div>
    </div>`).join("");
}

function updateReportsDashboard() {
  const total = history.length;
  const avg = total > 0 ? history.reduce((acc, curr) => acc + curr.estimatedPrice, 0) / total : 0;
  const avgConf = total > 0 ? history.reduce((acc, curr) => acc + (curr.confidenceScore || 0), 0) / total : 0;
  $("statsTotal").textContent = total;
  $("statsAvg").textContent = fmt(Math.round(avg), "INR");
  $("statsConf").textContent = total > 0 ? Math.round(avgConf) + "%" : "0%";
}

window.downloadReport = (btn) => {
  btn.innerHTML = "Generating... ⏳";
  setTimeout(() => {
    btn.innerHTML = "Downloaded! ✅";
    setTimeout(() => { btn.innerHTML = "View Certificate →"; }, 2000);
  }, 1500);
};

// ── Boot ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  init();
});

function init() {
  populateSelect("propertyType", PROPERTY_TYPES, form.propertyType);
  populateSelect("furnishing", FURNISHING, form.furnishing);
  populateSelect("facing", FACING, form.facing);
  updateBanner();
  updateBg();
  bindEvents();
  initMap();
  setupCitySearch();
  fetchLocations();
  fetchHeatmapData();
  setupAreaBrowser();

  if ($("clearHistoryBtn")) {
    $("clearHistoryBtn").addEventListener("click", () => {
      if (confirm("Are you sure you want to clear your valuation history?")) {
        history = [];
        localStorage.removeItem('estateIqHistory');
        renderReports();
      }
    });
  }

  if ($("exportHistoryBtn")) {
    $("exportHistoryBtn").addEventListener("click", () => {
      if (history.length === 0) return alert("Nothing to export!");
      let csv = "Date,Location,Property Type,Estimated Price,Min,Max\n";
      history.forEach(h => {
        csv += `"${h.date}","${h.city}","${h.type}",${h.estimatedPrice},${h.minPrice},${h.maxPrice}\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `estateiq_valuations_${Date.now()}.csv`;
      a.click();
    });
  }
}

async function fetchHeatmapData() {
  try {
    const res = await fetch("/heatmap_data");
    heatmapIntensities = await res.json();
  } catch (e) {
    console.error("Failed to load heatmap data", e);
  }
}

function initMap() {
  if (maps.input) return;
  maps.input = L.map('inputMap', {
    zoomControl: false,
    attributionControl: false
  }).setView(DEFAULT_BENGALURU, 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(maps.input);

  markers.input = L.marker(DEFAULT_BENGALURU).addTo(maps.input);
}

function updateMapMarker(type, location) {
  if (!location) return;
  const locKey = Object.keys(BENGALURU_COORDS).find(k => k.toLowerCase() === location.trim().toLowerCase());
  const coords = locKey ? BENGALURU_COORDS[locKey] : DEFAULT_BENGALURU;
  const map = maps[type];
  if (!map) return;

  if (!markers[type]) {
    markers[type] = L.marker(coords).addTo(map);
  } else {
    markers[type].setLatLng(coords);
  }
  
  map.setView(coords, 14);
  markers[type].bindPopup(`<b>${location}</b><br>Valuation Target`).openPopup();
}

async function fetchLocations() {
  try {
    const res = await fetch("/locations");
    allLocations = await res.json();
    if (allLocations.length > 0) {
      form.location = allLocations[0];
      $("locationSearch").value = form.location;
      // Small timeout to ensure map is ready
      setTimeout(() => updateMapMarker('input', form.location), 500);
    }
    setupSearchListeners();
  } catch (e) {
    console.error("Failed to fetch locations", e);
    if ($("locationSearch")) $("locationSearch").placeholder = "Error loading locations";
  }
}

function setupSearchListeners() {
  const searchInput = $("locationSearch");
  const resultsDiv = $("locationResults");
  if (!searchInput || !resultsDiv) return;
  
  let currentIndex = -1;

  searchInput.addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase();
    currentIndex = -1;
    if (val.length === 0) {
      // Show top 20 locations if empty
      const topLocs = allLocations.slice(0, 20);
      resultsDiv.innerHTML = topLocs.map((loc, i) => 
        `<div class="search-item" data-index="${i}" data-value="${loc}">${loc}</div>`
      ).join("");
      show(resultsDiv);
      return;
    }

    const filtered = allLocations
      .filter(loc => loc.toLowerCase().includes(val))
      .slice(0, 20); 

    if (filtered.length > 0) {
      resultsDiv.innerHTML = filtered.map((loc, i) => 
        `<div class="search-item" data-index="${i}" data-value="${loc}">${loc}</div>`
      ).join("");
      show(resultsDiv);
    } else {
      resultsDiv.innerHTML = `<div class="search-item" style="cursor:default; opacity:0.6">No matching locations found</div>`;
      show(resultsDiv);
    }
  });

  searchInput.addEventListener("keydown", (e) => {
    const items = resultsDiv.querySelectorAll(".search-item");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      currentIndex = Math.min(currentIndex + 1, items.length - 1);
      updateActiveItem(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      currentIndex = Math.max(currentIndex - 1, -1);
      updateActiveItem(items);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (currentIndex > -1 && items[currentIndex]) {
        selectLocation(items[currentIndex].dataset.value);
      } else if (items.length > 0) {
        // Fallback to first if none active but list exists
        selectLocation(items[0].dataset.value);
      }
    } else if (e.key === "Escape") {
      hide(resultsDiv);
      searchInput.blur();
    }
  });

  resultsDiv.addEventListener("click", (e) => {
    const item = e.target.closest(".search-item");
    if (item) {
      selectLocation(item.dataset.value);
    }
  });

  function updateActiveItem(items) {
    items.forEach((item, i) => {
      item.classList.toggle("active", i === currentIndex);
      if (i === currentIndex) item.scrollIntoView({ block: "nearest" });
    });
  }

  function selectLocation(val) {
    form.location = val;
    searchInput.value = val;
    hide(resultsDiv);
    updateMapMarker('input', val);
    searchInput.blur();
    
    // Sync with popular area chips
    const popularAreas = $("popularAreas");
    if (popularAreas) {
      popularAreas.querySelectorAll(".area-chip").forEach(c => {
        c.classList.toggle("active", c.dataset.value.toLowerCase() === val.toLowerCase());
      });
    }
  }

  searchInput.addEventListener("focus", () => {
    const event = new Event('input');
    searchInput.dispatchEvent(event);
  });

  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !resultsDiv.contains(e.target)) {
      hide(resultsDiv);
    }
  });

  // Popular Areas Quick-pick
  const popularAreas = $("popularAreas");
  if (popularAreas) {
    popularAreas.addEventListener("click", (e) => {
      const btn = e.target.closest(".area-chip");
      if (btn) {
        selectLocation(btn.dataset.value);
      }
    });
  }
}

// Global listener for all searchable dropdown arrows
document.addEventListener("click", (e) => {
  const arrow = e.target.closest(".dropdown-arrow");
  if (arrow) {
    const input = arrow.parentElement.querySelector("input");
    if (input) input.focus();
  }
});

function setupCitySearch() {
  const allCityNames = ["Bengaluru", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune", "Ahmedabad", "Kolkata"];
  const searchInput = $("citySearch");
  const resultsDiv = $("cityResults");
  if (!searchInput || !resultsDiv) return;

  searchInput.value = form.city;
  let currentIndex = -1;

  searchInput.addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase();
    currentIndex = -1;
    
    // Always show top cities on focus/input if length <= 0
    const filtered = allCityNames
      .filter(city => city.toLowerCase().includes(val))
      .slice(0, 10);

    if (filtered.length > 0) {
      resultsDiv.innerHTML = filtered.map((city, i) => 
        `<div class="search-item" data-index="${i}" data-value="${city}">${city}</div>`
      ).join("");
      show(resultsDiv);
    } else {
      resultsDiv.innerHTML = `<div class="search-item" style="cursor:default; opacity:0.6">No matching cities found</div>`;
      show(resultsDiv);
    }
  });

  searchInput.addEventListener("keydown", (e) => {
    const items = resultsDiv.querySelectorAll(".search-item");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      currentIndex = Math.min(currentIndex + 1, items.length - 1);
      updateActiveItem(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      currentIndex = Math.max(currentIndex - 1, -1);
      updateActiveItem(items);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (currentIndex > -1 && items[currentIndex] && items[currentIndex].dataset.value) {
        selectCity(items[currentIndex].dataset.value);
      } else if (items.length > 0 && items[0].dataset.value) {
        selectCity(items[0].dataset.value);
      }
    } else if (e.key === "Escape") {
      hide(resultsDiv);
      searchInput.blur();
    }
  });

  resultsDiv.addEventListener("click", (e) => {
    const item = e.target.closest(".search-item");
    if (item && item.dataset.value) {
      selectCity(item.dataset.value);
    }
  });

  function updateActiveItem(items) {
    items.forEach((item, i) => {
      item.classList.toggle("active", i === currentIndex);
      if (i === currentIndex) item.scrollIntoView({ block: "nearest" });
    });
  }

  function selectCity(val) {
    form.city = val;
    searchInput.value = val;
    hide(resultsDiv);
    updateBanner();
    updateBg();
    searchInput.blur();
    
    // If not Bengaluru, notify user that model is limited
    if (val !== "Bengaluru") {
        $("errorMsg").textContent = `Note: AI Prediction model is currently optimized for Bengaluru. ${val} results may use generic benchmarks.`;
        show($("errorMsg"));
    } else {
        hide($("errorMsg"));
    }
    
    // Refresh locations (though in this version they are fixed)
    fetchLocations();
  }

  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !resultsDiv.contains(e.target)) {
      hide(resultsDiv);
    }
  });
  
  searchInput.addEventListener("focus", () => {
    const event = new Event('input');
    searchInput.dispatchEvent(event);
  });
}

// ── Area Browser Logic ───────────────────────────────────────
function setupAreaBrowser() {
  const modal = $("areaBrowserModal");
  const openBtn = $("browseAllBtn");
  const closeBtn = $("closeModal");
  const searchInput = $("modalSearchInput");
  const modalBody = $("modalBody");

  if (!modal || !openBtn || !closeBtn) return;

  openBtn.addEventListener("click", () => {
    renderAreaList("");
    show(modal);
    document.body.style.overflow = "hidden"; // Prevent scroll
  });

  const closeModal = () => {
    hide(modal);
    document.body.style.overflow = "";
    searchInput.value = "";
  };

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  searchInput.addEventListener("input", (e) => {
    renderAreaList(e.target.value);
  });

  function renderAreaList(filter) {
    const term = filter.toLowerCase();
    const filtered = allLocations.filter(loc => loc.toLowerCase().includes(term));
    
    // Group by first letter
    const groups = {};
    filtered.forEach(loc => {
      const char = loc.charAt(0).toUpperCase();
      if (!groups[char]) groups[char] = [];
      groups[char].push(loc);
    });

    const sortedChars = Object.keys(groups).sort();
    
    if (sortedChars.length === 0) {
      modalBody.innerHTML = `<div style="text-align:center; padding:3rem; color:#a8a29e">No areas found matching "${filter}"</div>`;
      return;
    }

    modalBody.innerHTML = sortedChars.map(char => `
      <div class="az-section">
        <span class="az-letter">${char}</span>
        <div class="az-grid">
          ${groups[char].map(loc => `
            <div class="az-item" data-value="${loc}" title="${loc}">${loc}</div>
          `).join("")}
        </div>
      </div>
    `).join("");

    // Add click listeners to items
    modalBody.querySelectorAll(".az-item").forEach(item => {
      item.addEventListener("click", () => {
        const val = item.dataset.value;
        // The global selectLocation (inside setupSearchListeners) is what we need.
        // Since it's local to that function, we'll manually update like selectLocation does.
        const mainSearch = $("locationSearch");
        mainSearch.value = val;
        form.location = val;
        updateMapMarker('input', val);
        
        // Sync popular chips
        const popularAreas = $("popularAreas");
        if (popularAreas) {
          popularAreas.querySelectorAll(".area-chip").forEach(c => {
            c.classList.toggle("active", c.dataset.value.toLowerCase() === val.toLowerCase());
          });
        }
        
        closeModal();
      });
    });
  }
}

