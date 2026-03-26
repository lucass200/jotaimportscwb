/* ============================================
   TECHOFERTAS — app.js
   ============================================

   CONFIGURAÇÃO DE AFILIADO
   ========================
   1. Acesse: https://www.mercadolivre.com.br/afiliados
   2. Crie sua conta e aguarde aprovação
   3. Substitua SEU_AFFILIATE_ID abaixo pelo seu ID real
      Ex: "techofertas123"
   ============================================ */

const CONFIG = {
  AFFILIATE_ID: "SEU_AFFILIATE_ID",   // ← TROQUE AQUI
  SITE_ID: "MLB",                      // Brasil = MLB
  RESULTS_PER_PAGE: 48,
  PROXY: "https://api.allorigins.win/get?url=",
};

// ============================================
// ESTADO DA APLICAÇÃO
// ============================================
let state = {
  query: "eletronicos promocao",
  label: "Destaques",
  sort: "relevance",
  produtos: [],
  loading: false,
};

// ============================================
// AFILIADO — gera link com tracking
// ============================================
function addAffiliateLink(url) {
  if (!url || CONFIG.AFFILIATE_ID === "SEU_AFFILIATE_ID") return url;
  try {
    const u = new URL(url);
    u.searchParams.set("matt_tool", "afiliados");
    u.searchParams.set("matt_word", CONFIG.AFFILIATE_ID);
    u.searchParams.set("matt_source", "techoferta_site");
    return u.toString();
  } catch {
    return url + `?matt_tool=afiliados&matt_word=${CONFIG.AFFILIATE_ID}`;
  }
}

// ============================================
// API MERCADO LIVRE
// ============================================
async function fetchML(query, sort = "relevance") {
  const sortMap = {
    relevance: "relevance",
    price_asc: "price_asc",
    price_desc: "price_desc",
  };

  const mlSort = sortMap[sort] || "relevance";
  const endpoint = `https://api.mercadolibre.com/sites/${CONFIG.SITE_ID}/search?q=${encodeURIComponent(query)}&limit=${CONFIG.RESULTS_PER_PAGE}&sort=${mlSort}`;
  const proxyUrl = CONFIG.PROXY + encodeURIComponent(endpoint);

  // Tenta via proxy (evita CORS em produção)
  try {
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
    const outer = await res.json();
    const data = JSON.parse(outer.contents);
    return data.results || [];
  } catch {
    // Fallback: tenta direto (funciona dependendo do browser/host)
    try {
      const res2 = await fetch(endpoint, { signal: AbortSignal.timeout(8000) });
      const data2 = await res2.json();
      return data2.results || [];
    } catch {
      return null; // erro real
    }
  }
}

// ============================================
// UTILITÁRIOS
// ============================================
function formatBRL(val) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function calcDiscount(original, sale) {
  if (!original || original <= sale) return null;
  return Math.round((1 - sale / original) * 100);
}

function sortProdutos(produtos, sort) {
  const arr = [...produtos];
  if (sort === "price_asc") return arr.sort((a, b) => a.price - b.price);
  if (sort === "price_desc") return arr.sort((a, b) => b.price - a.price);
  if (sort === "discount") {
    return arr.sort((a, b) => {
      const da = calcDiscount(a.original_price, a.price) || 0;
      const db = calcDiscount(b.original_price, b.price) || 0;
      return db - da;
    });
  }
  return arr; // relevance (ordem original da API)
}

function setUpdateTime() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, "0");
  const m = now.getMinutes().toString().padStart(2, "0");
  document.getElementById("updateTime").textContent = `Atualizado às ${h}:${m}`;
}

function updateStats(produtos) {
  const total = produtos.length;
  const withDiscount = produtos.filter(p => p.original_price && p.original_price > p.price).length;
  const freeShipping = produtos.filter(p => p.shipping?.free_shipping).length;

  animateCount("statTotal", total);
  animateCount("statDiscount", withDiscount);
  animateCount("statFree", freeShipping);
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = Math.ceil(target / 30);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(timer);
  }, 30);
}

// ============================================
// RENDER CARD
// ============================================
function renderCard(item, index) {
  const price = item.price;
  const original = item.original_price;
  const discount = calcDiscount(original, price);
  const imgSrc = item.thumbnail?.replace("I.jpg", "O.jpg") || "";
  const link = addAffiliateLink(item.permalink);
  const installments = item.installments;
  const freeShip = item.shipping?.free_shipping;
  const seller = item.seller?.nickname || "Vendedor";
  const delay = (index % 24) * 35;

  return `
    <a class="card" href="${link}" target="_blank" rel="noopener sponsored"
       style="animation-delay:${delay}ms"
       title="${item.title}">
      <div class="card-thumb">
        <img src="${imgSrc}" alt="${item.title}" loading="lazy"
             onerror="this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;font-size:3rem;background:#1a1a2e\\'>📦</div>'" />
        ${discount ? `<span class="badge-discount">-${discount}%</span>` : ""}
        ${freeShip ? `<span class="badge-free">FRETE GRÁTIS</span>` : ""}
      </div>
      <div class="card-body">
        <div class="card-title">${item.title}</div>
        <div class="card-seller">🏪 ${seller}</div>
        <div class="card-prices">
          ${original ? `<div class="card-original">${formatBRL(original)}</div>` : ""}
          <div class="card-price">${formatBRL(price)}</div>
          ${installments && installments.quantity > 1
            ? `<div class="card-installments">${installments.quantity}x de ${formatBRL(installments.amount)}${installments.rate === 0 ? " sem juros" : ""}</div>`
            : ""}
        </div>
      </div>
      <div class="card-footer">
        <span class="card-source">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8l4 4-4 4"/>
          </svg>
          Mercado Livre
        </span>
        <button class="btn-comprar" onclick="event.preventDefault();window.open('${link}','_blank')">
          VER OFERTA
        </button>
      </div>
    </a>
  `;
}

// ============================================
// RENDER GRID
// ============================================
function renderGrid(produtos) {
  const grid = document.getElementById("grid");
  const sortBar = document.getElementById("sortBar");
  const resultCount = document.getElementById("resultCount");

  if (!produtos || produtos.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <span>🔍</span>
        <strong>Nenhum produto encontrado</strong>
        <span>Tente uma busca diferente</span>
      </div>`;
    sortBar.style.display = "none";
    return;
  }

  const sorted = sortProdutos(produtos, state.sort);
  grid.innerHTML = sorted.map((p, i) => renderCard(p, i)).join("");

  sortBar.style.display = "flex";
  resultCount.textContent = `${sorted.length} produtos encontrados`;
  updateStats(sorted);
  setUpdateTime();
}

function showLoading(label) {
  const grid = document.getElementById("grid");
  const sortBar = document.getElementById("sortBar");
  sortBar.style.display = "none";
  grid.innerHTML = `
    <div class="loader-wrap">
      <div class="loader"></div>
      <p>Buscando ofertas em <strong>${label}</strong>…</p>
    </div>`;
}

function showError() {
  const grid = document.getElementById("grid");
  grid.innerHTML = `
    <div class="empty-state">
      <span>⚠️</span>
      <strong>Não foi possível carregar os produtos</strong>
      <span>Verifique sua conexão e tente novamente</span>
      <button class="btn-comprar" style="margin-top:0.5rem"
        onclick="loadProdutos(state.query, state.label)">
        Tentar novamente
      </button>
    </div>`;
}

// ============================================
// CARREGAR PRODUTOS
// ============================================
async function loadProdutos(query, label) {
  if (state.loading) return;
  state.loading = true;
  state.query = query;
  state.label = label;
  state.produtos = [];

  showLoading(label);

  const results = await fetchML(query, state.sort);

  state.loading = false;

  if (results === null) {
    showError();
    return;
  }

  state.produtos = results;
  renderGrid(results);
}

// ============================================
// EVENTOS — CHIPS DE CATEGORIA
// ============================================
document.querySelectorAll(".chip").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("searchInput").value = "";
    loadProdutos(btn.dataset.query, btn.dataset.label);
  });
});

// ============================================
// EVENTOS — BUSCA
// ============================================
document.getElementById("searchBtn").addEventListener("click", () => {
  const val = document.getElementById("searchInput").value.trim();
  if (!val) return;
  document.querySelectorAll(".chip").forEach(b => b.classList.remove("active"));
  loadProdutos(val, `"${val}"`);
});

document.getElementById("searchInput").addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("searchBtn").click();
});

// ============================================
// EVENTOS — ORDENAÇÃO
// ============================================
document.querySelectorAll(".sort-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sort-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.sort = btn.dataset.sort;

    if (state.sort === "relevance" || state.sort === "price_asc" || state.sort === "price_desc") {
      // Re-busca da API com sort nativo
      loadProdutos(state.query, state.label);
    } else {
      // Ordena localmente (ex: maior desconto)
      renderGrid(state.produtos);
    }
  });
});

// ============================================
// INIT
// ============================================
loadProdutos("eletronicos promocao", "Destaques");
