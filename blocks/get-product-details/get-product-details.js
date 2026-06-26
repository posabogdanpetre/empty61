// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from the bridge as a single flat item.
const SAMPLE_DATA = [
  {
    name: 'Pantofi alergare barbati Puma x Hyrox Deviate Nitro Elite 4 SS 2026',
    description: "Men's road running shoes from the Puma x Hyrox collection.",
    image_url: 'https://media.sportguru.ro/media/catalog/product/p/u/puma-x-hyrox-deviate-nitro_-elit.jpg?width=304&height=219&store=default&image-type=small_image',
    price: '1.000,00 Lei',
    category: 'Running Shoes',
    is_deal: true,
    original_price: '1.249,00 Lei',
    discount_percentage: '20% OFF',
  },
  {
    name: 'Pantofi alergare Hoka Cielo X1 3.0',
    description: 'Hoka Cielo X1 3.0 performance road running shoes.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/1/1/1171927-nyz_1.jpg?width=304&height=219&store=default&image-type=small_image',
    price: '1.215,50 Lei',
    category: 'Running Shoes',
    is_deal: true,
    original_price: '1.430,00 Lei',
    discount_percentage: '15% OFF',
  },
];

// Brand palette from BuildWidgetRequest.
// getThemedCardBg() darkens palette[0] to luminance <= 0.12 so white text has WCAG AA contrast.
const PALETTE = ['#6100a2', '#3de525'];
function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  const [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0; let hi = 1;
  for (let i = 0; i < 20; i += 1) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);
const ACCENT = PALETTE[0] || '#6100a2';
const CARD_COLORS = ['#6100a2', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      [item] = SAMPLE_DATA;
    } else {
      // Detail concept — structuredContent IS the item (flat). No wrapper key.
      const _result = await bridge.toolResult;
      item = (_result?.structuredContent || _result) || {};
    }
  } else {
    [item] = SAMPLE_DATA;
  }

  block.textContent = '';
  renderDetail(block, item, bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}

function renderDetail(block, item, bridge) {
  if (!item || !item.name) return;

  const card = document.createElement('div');
  card.className = 'detail-card';

  // Image (left)
  const imageWrap = document.createElement('div');
  imageWrap.className = 'detail-image';
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${CARD_COLORS[0]};`;
    return d;
  };
  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => img.parentNode && img.parentNode.replaceChild(colorDiv(), img);
    imageWrap.appendChild(img);
  } else {
    imageWrap.appendChild(colorDiv());
  }
  card.appendChild(imageWrap);

  // Content (right)
  const content = document.createElement('div');
  content.className = 'detail-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const title = document.createElement('h3');
  title.className = 'detail-name';
  title.textContent = item.name;
  content.appendChild(title);

  if (item.description) {
    const desc = document.createElement('p');
    desc.className = 'detail-desc';
    desc.textContent = item.description;
    content.appendChild(desc);
  }

  const priceRow = document.createElement('div');
  priceRow.className = 'detail-price-row';
  const price = document.createElement('span');
  price.className = 'detail-price';
  price.textContent = item.price || '';
  priceRow.appendChild(price);
  if (item.original_price && item.original_price !== item.price) {
    const orig = document.createElement('span');
    orig.className = 'detail-orig-price';
    orig.textContent = item.original_price;
    priceRow.appendChild(orig);
  }
  if (item.discount_percentage) {
    const disc = document.createElement('span');
    disc.className = 'detail-discount';
    disc.textContent = item.discount_percentage;
    priceRow.appendChild(disc);
  }
  content.appendChild(priceRow);

  if (item.category) {
    const cat = document.createElement('span');
    cat.className = 'detail-category';
    cat.textContent = item.category;
    content.appendChild(cat);
  }

  const btn = document.createElement('button');
  btn.className = 'detail-cta';
  btn.type = 'button';
  btn.textContent = 'More Details';
  btn.style.background = ACCENT;
  if (bridge) {
    btn.addEventListener('click', () => {
      bridge.sendMessage(`Tell me more about ${item.name}`);
    });
  }
  content.appendChild(btn);

  card.appendChild(content);
  block.appendChild(card);
}
