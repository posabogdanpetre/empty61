// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Pantofi alergare barbati Puma x Hyrox Deviate Nitro Elite 4 SS 2026',
    description: "Men's road running shoes from the Puma x Hyrox collection.",
    image_url: 'https://media.sportguru.ro/media/catalog/product/p/u/puma-x-hyrox-deviate-nitro_-elit.jpg?width=304&height=219&store=default&image-type=small_image',
    price: '1.000,00 Lei',
    category: 'Running Shoes',
  },
  {
    name: 'Bicicleta sosea Cube Attain Pro 28" 2026',
    description: 'Cube Attain Pro 28-inch road bike for road and track riding.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/b/i/bicicleta-cube-attain-pro-nautica-prism-2026-50-cm_362415_1_1756962404.jpg?width=304&height=219&store=default&image-type=small_image',
    price: '5.150,00 Lei',
    category: 'Bikes',
  },
  {
    name: 'Pantofi alergare Hoka Cielo X1 3.0',
    description: 'Hoka Cielo X1 3.0 performance road running shoes.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/1/1/1171927-nyz_1.jpg?width=304&height=219&store=default&image-type=small_image',
    price: '1.215,50 Lei',
    category: 'Running Shoes',
  },
  {
    name: 'Pantofi trekking dama La Sportiva TX5 Low GTX',
    description: "Women's La Sportiva TX5 Low GTX waterproof trekking shoes.",
    image_url: 'https://media.sportguru.ro/media/catalog/product/z/f/zfhs042_g09p02_02_zfhs042g09p0236-photoroom_7.jpg?width=304&height=219&store=default&image-type=small_image',
    price: '753,00 Lei',
    category: 'Outdoor Footwear',
  },
  {
    name: 'Ceas Garmin Quatix 8 Pro AMOLED - 47 mm',
    description: 'Garmin Quatix 8 Pro AMOLED 47 mm multisport and marine GPS watch.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/c/1/c18cd661-b6b1-4283-9792-5512d4e8b8b7.jpg?width=304&height=219&store=default&image-type=small_image',
    price: '5.899,00 Lei',
    category: 'Sport Watches',
  },
  {
    name: 'Casca ciclism POC Cytal',
    description: 'POC Cytal road cycling helmet.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/p/o/poc_10814_cytal_1231-4-photoroom.jpg?width=304&height=219&store=default&image-type=small_image',
    price: '960,00 Lei',
    category: 'Cycling Accessories',
  },
  {
    name: 'Casti audio Shokz OpenDots One',
    description: 'Shokz OpenDots One open-ear sport audio headphones.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/o/p/opendos-one-black.jpg?width=304&height=219&store=default&image-type=small_image',
    price: '980,87 Lei',
    category: 'Audio',
  },
];

// Brand palette from BuildWidgetRequest — used to derive card info-strip background.
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
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (relLum(Math.round(r * mid), Math.round(g * mid), Math.round(b * mid)) > 0.12) hi = mid; else lo = mid;
  }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const ACCENT = PALETTE[0] || '#6100a2';
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
      // structuredContent.products — bare array outputSchema; key derived from actionName "search_products"
      items = structuredContent?.products || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderItems(block, items, bridge);

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

function renderItems(block, items, bridge) {
  const list = (items || []).slice(0, 6);

  const wrapper = document.createElement('div');
  wrapper.className = 'search-products-wrapper';

  const track = document.createElement('div');
  track.className = 'search-products-track';

  list.forEach((item, i) => {
    const card = document.createElement('article');
    card.className = 'search-products-card';

    const imageBox = document.createElement('div');
    imageBox.className = 'search-products-image';
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
      img.loading = 'lazy';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => { if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img); };
      imageBox.appendChild(img);
    } else {
      imageBox.appendChild(colorDiv());
    }
    card.appendChild(imageBox);

    const info = document.createElement('div');
    info.className = 'search-products-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const title = document.createElement('h3');
    title.className = 'search-products-name';
    title.textContent = item.name || '';
    info.appendChild(title);

    if (item.description) {
      const desc = document.createElement('p');
      desc.className = 'search-products-desc';
      desc.textContent = item.description;
      info.appendChild(desc);
    }

    const meta = document.createElement('div');
    meta.className = 'search-products-meta';
    const price = document.createElement('span');
    price.className = 'search-products-price';
    price.textContent = item.price || '';
    meta.appendChild(price);
    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'search-products-badge';
      badge.textContent = item.category;
      badge.style.background = ACCENT;
      meta.appendChild(badge);
    }
    info.appendChild(meta);

    const cta = document.createElement('button');
    cta.type = 'button';
    cta.className = 'search-products-cta';
    cta.textContent = 'View Details';
    cta.style.background = ACCENT;
    if (bridge) {
      cta.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    info.appendChild(cta);

    card.appendChild(info);
    track.appendChild(card);
  });

  const fade = document.createElement('div');
  fade.className = 'search-products-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;

  const mkArrow = (dir) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `search-products-arrow search-products-arrow-${dir}`;
    b.textContent = dir === 'left' ? '◀' : '▶';
    b.setAttribute('aria-label', dir === 'left' ? 'Scroll left' : 'Scroll right');
    const scroll = () => {
      const card = track.querySelector('.search-products-card');
      const amount = card ? card.offsetWidth + 16 : 236;
      track.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    };
    b.addEventListener('click', scroll);
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scroll(); }
    });
    return b;
  };
  const leftArrow = mkArrow('left');
  const rightArrow = mkArrow('right');

  const updateArrows = () => {
    const maxScroll = track.scrollWidth - track.clientWidth - 1;
    leftArrow.style.display = track.scrollLeft <= 1 ? 'none' : 'flex';
    rightArrow.style.display = track.scrollLeft >= maxScroll ? 'none' : 'flex';
    fade.style.display = track.scrollLeft >= maxScroll ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateArrows);

  wrapper.appendChild(track);
  wrapper.appendChild(fade);
  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);
  block.appendChild(wrapper);

  requestAnimationFrame(updateArrows);
}
