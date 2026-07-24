import { SUPABASE_URL, SUPABASE_ANON_KEY, WHATSAPP_NUMBER } from './config.js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- Fallback demo data (Supabase जोड्नु अघि पनि पेज ठीकसँग देखियोस् भनेर) ----
const FALLBACK_PRODUCTS = [
  { id: 'd1', name_np: 'बासमती चामल', name_en: 'Basmati Rice', category: 'grain', price: 165, unit: 'प्रति के.जी.', image_url: null, in_stock: true, is_featured: true },
  { id: 'd2', name_np: 'मुसुरो दाल', name_en: 'Red Lentils', category: 'grain', price: 195, unit: 'प्रति के.जी.', image_url: null, in_stock: true, is_featured: true },
  { id: 'd3', name_np: 'तोरीको तेल', name_en: 'Mustard Oil', category: 'oil', price: 320, unit: 'प्रति लिटर', image_url: null, in_stock: true, is_featured: true },
  { id: 'd4', name_np: 'चिनी', name_en: 'Sugar', category: 'grain', price: 105, unit: 'प्रति के.जी.', image_url: null, in_stock: true, is_featured: true },
  { id: 'd5', name_np: 'दूध', name_en: 'Fresh Milk', category: 'dairy', price: 85, unit: 'प्रति लिटर', image_url: null, in_stock: true, is_featured: true },
  { id: 'd6', name_np: 'जीरा मसला', name_en: 'Cumin Spice', category: 'spice', price: 40, unit: 'प्रति १०० ग्राम', image_url: null, in_stock: true, is_featured: false },
  { id: 'd7', name_np: 'आलु', name_en: 'Potato', category: 'veg', price: 55, unit: 'प्रति के.जी.', image_url: null, in_stock: true, is_featured: false },
  { id: 'd8', name_np: 'बिस्कुट प्याकेट', name_en: 'Biscuit Pack', category: 'snack', price: 30, unit: 'प्रति प्याकेट', image_url: null, in_stock: false, is_featured: false },
];

const CATEGORY_ICON = {
  grain: `<svg viewBox="0 0 40 40" fill="none"><path d="M10 14 C10 9 15 6 20 6 C25 6 30 9 30 14 V30 C30 32.2 28.2 34 26 34 H14 C11.8 34 10 32.2 10 30 Z" stroke="currentColor" stroke-width="2"/></svg>`,
  oil: `<svg viewBox="0 0 40 40" fill="none"><path d="M16 8 H24 V13 L27 17 V32 C27 33.7 25.7 35 24 35 H16 C14.3 35 13 33.7 13 32 V17 L16 13 Z" stroke="currentColor" stroke-width="2"/></svg>`,
  spice: `<svg viewBox="0 0 40 40" fill="none"><path d="M13 12 C13 9 16 7 20 7 C24 7 27 9 27 12 C27 15 24 15 24 18 V30 C24 33 22 35 20 35 C18 35 16 33 16 30 V18 C16 15 13 15 13 12 Z" stroke="currentColor" stroke-width="2"/></svg>`,
  dairy: `<svg viewBox="0 0 40 40" fill="none"><path d="M16 6 H24 V12 L27 16 V32 C27 33.7 25.7 35 24 35 H16 C14.3 35 13 33.7 13 32 V16 L16 12 Z" stroke="currentColor" stroke-width="2"/></svg>`,
  veg: `<svg viewBox="0 0 40 40" fill="none"><path d="M20 8 C25 8 29 12 29 18 C29 26 25 33 20 33 C15 33 11 26 11 18 C11 12 15 8 20 8 Z" stroke="currentColor" stroke-width="2"/></svg>`,
  snack: `<svg viewBox="0 0 40 40" fill="none"><path d="M11 15 H29 L26 33 H14 Z" stroke="currentColor" stroke-width="2"/></svg>`,
};

let allProducts = [];
let activeCategory = 'all';
let searchTerm = '';

// ---- Header nav toggle (mobile) ----
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
navToggle?.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});
mainNav?.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => mainNav.classList.remove('open'))
);

// ---- Footer year ----
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---- Today's date (Nepali locale label, Gregorian date) ----
const dateEl = document.getElementById('todayDate');
if (dateEl) {
  try {
    dateEl.textContent = new Intl.DateTimeFormat('ne-NP', { day: 'numeric', month: 'long' }).format(new Date());
  } catch {
    dateEl.textContent = new Date().toLocaleDateString();
  }
}

// ---- Category filter buttons ----
document.getElementById('catGrid')?.addEventListener('click', (e) => {
  const btn = e.target.closest('.cat-card');
  if (!btn) return;
  activeCategory = btn.dataset.cat;
  document.querySelectorAll('.cat-card').forEach(c => c.setAttribute('aria-pressed', String(c === btn)));
  renderProducts();
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ---- Search ----
document.getElementById('searchInput')?.addEventListener('input', (e) => {
  searchTerm = e.target.value.trim().toLowerCase();
  renderProducts();
});

function whatsappOrderLink(product) {
  const msg = `नमस्ते मान ट्रेडर्स, मलाई "${product.name_np}" (${product.unit}) को बारेमा जान्न मन छ।`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function productCard(p) {
  const thumb = p.image_url
    ? `<img src="${p.image_url}" alt="${p.name_np}" loading="lazy">`
    : (CATEGORY_ICON[p.category] || CATEGORY_ICON.grain);

  return `
    <div class="product-card ${p.in_stock ? '' : 'out-of-stock'}">
      ${p.is_featured ? '<span class="badge-fresh">आजको छनोट</span>' : ''}
      <div class="product-thumb">${thumb}</div>
      <div>
        <div class="product-name-np">${p.name_np}</div>
        <div class="product-name-en">${p.name_en || ''}</div>
      </div>
      <div class="product-meta">
        <div>
          <div class="product-price">रु. ${p.price}</div>
          <div class="product-unit">${p.unit}</div>
        </div>
        ${p.in_stock ? `
        <a class="product-order" href="${whatsappOrderLink(p)}" target="_blank" rel="noopener" aria-label="अर्डर गर्नुहोस्">
          <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>` : `<span class="product-unit">स्टकमा छैन</span>`}
      </div>
    </div>`;
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  const status = document.getElementById('productStatus');
  if (!grid) return;

  let list = allProducts;
  if (activeCategory !== 'all') list = list.filter(p => p.category === activeCategory);
  if (searchTerm) {
    list = list.filter(p =>
      p.name_np?.toLowerCase().includes(searchTerm) ||
      p.name_en?.toLowerCase().includes(searchTerm)
    );
  }

  grid.innerHTML = list.map(productCard).join('');
  status.textContent = list.length
    ? ''
    : 'कुनै सामान फेला परेन। अर्को शब्दले खोज्नुहोस् वा श्रेणी बदल्नुहोस्।';
}

function renderRateBoard() {
  const rateList = document.getElementById('rateList');
  if (!rateList) return;
  const featured = allProducts.filter(p => p.is_featured).slice(0, 5);
  if (!featured.length) return;
  rateList.innerHTML = featured.map(p => `<li><span>${p.name_np}</span><em>रु.${p.price}</em></li>`).join('');
}

async function loadProducts() {
  const status = document.getElementById('productStatus');
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('is_featured', { ascending: false });

    if (error) throw error;

    allProducts = (data && data.length) ? data : FALLBACK_PRODUCTS;
    if (!data || !data.length) {
      console.info('Supabase मा अझै उत्पादन थपिएको छैन — demo सामान देखाइँदैछ। supabase-schema.sql हेर्नुहोस्।');
    }
  } catch (err) {
    console.warn('Supabase बाट लोड गर्न सकिएन, demo सामान देखाइँदैछ:', err.message);
    allProducts = FALLBACK_PRODUCTS;
    if (status) status.textContent = '';
  } finally {
    renderProducts();
    renderRateBoard();
  }
}

loadProducts();
