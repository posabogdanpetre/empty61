// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'Pantofi alergare barbati Puma x Hyrox Deviate Nitro Elite 4 SS 2026', image_url: 'https://media.sportguru.ro/media/catalog/product/p/u/puma-x-hyrox-deviate-nitro_-elit.jpg?width=304&height=219&store=default&image-type=small_image', price: '1.000,00 Lei', original_price: '1.249,00 Lei', discount_percentage: '20% OFF', category: 'Running Shoes' },
  { name: 'Pantofi alergare Hoka Cielo X1 3.0', image_url: 'https://media.sportguru.ro/media/catalog/product/1/1/1171927-nyz_1.jpg?width=304&height=219&store=default&image-type=small_image', price: '1.215,50 Lei', original_price: '1.430,00 Lei', discount_percentage: '15% OFF', category: 'Running Shoes' },
  { name: 'Pantofi trekking dama La Sportiva TX5 Low GTX', image_url: 'https://media.sportguru.ro/media/catalog/product/z/f/zfhs042_g09p02_02_zfhs042g09p0236-photoroom_7.jpg?width=304&height=219&store=default&image-type=small_image', price: '753,00 Lei', original_price: '1.075,00 Lei', discount_percentage: '30% OFF', category: 'Outdoor Footwear' },
  { name: 'Ceas Garmin Quatix 8 Pro AMOLED - 47 mm', image_url: 'https://media.sportguru.ro/media/catalog/product/c/1/c18cd661-b6b1-4283-9792-5512d4e8b8b7.jpg?width=304&height=219&store=default&image-type=small_image', price: '5.899,00 Lei', original_price: '6.539,00 Lei', discount_percentage: '10% OFF', category: 'Sport Watches' },
  { name: 'Casca ciclism POC Cytal', image_url: 'https://media.sportguru.ro/media/catalog/product/p/o/poc_10814_cytal_1231-4-photoroom.jpg?width=304&height=219&store=default&image-type=small_image', price: '960,00 Lei', original_price: '1.599,75 Lei', discount_percentage: '40% OFF', category: 'Cycling Accessories' },
  { name: 'Casti audio Shokz OpenDots One', image_url: 'https://media.sportguru.ro/media/catalog/product/o/p/opendos-one-black.jpg?width=304&height=219&store=default&image-type=small_image', price: '980,87 Lei', original_price: '1.055,00 Lei', discount_percentage: '7% OFF', category: 'Audio' },
];

// Brand palette from BuildWidgetRequest. getThemedCardBg() darkens palette[0]
// to luminance <= 0.12 so white text has WCAG AA contrast.
const PALETTE = ['#6100a2', '#3de525'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.deals — bare array outputSchema; key derived from actionName "get_current_deals"
      items = structuredContent?.deals || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderDeals(block, items, bridge);

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

function renderDeals(block, items, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'deals-wrapper';

  const track = document.createElement('div');
  track.className = 'deals-track';

  items.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'deal-card';

    const imageBox = document.createElement('div');
    imageBox.className = 'deal-image';

    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => img.parentNode && img.parentNode.replaceChild(colorDiv(), img);
      imageBox.appendChild(img);
    } else {
      imageBox.appendChild(colorDiv());
    }

    if (item.discount_percentage) {
      const badge = document.createElement('span');
      badge.className = 'deal-badge';
      badge.textContent = item.discount_percentage;
      imageBox.appendChild(badge);
    }
    card.appendChild(imageBox);

    const info = document.createElement('div');
    info.className = 'deal-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const name = document.createElement('h3');
    name.className = 'deal-name';
    name.textContent = item.name || '';
    info.appendChild(name);

    const priceRow = document.createElement('div');
    priceRow.className = 'deal-price-row';

    const sale = document.createElement('span');
    sale.className = 'deal-price';
    sale.textContent = item.price || '';
    priceRow.appendChild(sale);

    if (item.original_price) {
      const orig = document.createElement('span');
      orig.className = 'deal-original';
      orig.textContent = item.original_price;
      priceRow.appendChild(orig);
    }
    info.appendChild(priceRow);

    const btn = document.createElement('button');
    btn.className = 'deal-cta';
    btn.type = 'button';
    btn.textContent = 'View Deal';
    if (bridge) {
      btn.addEventListener('click', () => bridge.sendMessage(`Tell me more about ${item.name}`));
    }
    info.appendChild(btn);

    card.appendChild(info);
    track.appendChild(card);
  });

  wrapper.appendChild(track);

  const fade = document.createElement('div');
  fade.className = 'deals-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;
  wrapper.appendChild(fade);

  const mkArrow = (dir) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `deals-arrow deals-arrow-${dir}`;
    b.setAttribute('aria-label', dir === 'left' ? 'Scroll left' : 'Scroll right');
    b.textContent = dir === 'left' ? '◀' : '▶';
    b.addEventListener('click', () => {
      const cardW = track.querySelector('.deal-card');
      const delta = (cardW ? cardW.offsetWidth + 16 : 236) * (dir === 'left' ? -1 : 1);
      track.scrollBy({ left: delta, behavior: 'smooth' });
    });
    return b;
  };
  const leftArrow = mkArrow('left');
  const rightArrow = mkArrow('right');
  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  const updateArrows = () => {
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    leftArrow.style.display = atStart ? 'none' : 'flex';
    rightArrow.style.display = atEnd ? 'none' : 'flex';
    fade.style.display = atEnd ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateArrows);
  requestAnimationFrame(updateArrows);

  block.appendChild(wrapper);
}
