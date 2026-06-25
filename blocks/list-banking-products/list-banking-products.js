const SAMPLE_DATA = [
  {
    name: 'PNC Cash Rewards Visa',
    description: 'Cash back credit card with category rewards on gas, dining, and groceries.',
    price: '$0 annual fee',
    category: 'Credit Card',
    image_url: 'https://www.pnc.com/en/personal-banking/banking/credit-cards/_jcr_content/main/pageBody/containergrid_copy_c_283020490/embeddedGrid/containergrid_copy_c_215278159/embeddedGrid/containergrid/embeddedGrid/image.coreimg.png/1778094519173/creditcard-cash-rewards-200-bonus-ribbon.png'
  },
  {
    name: 'PNC Cash Unlimited Visa Signature',
    description: 'Earn unlimited 2% cash back on every purchase with no category restrictions.',
    price: '$0 annual fee',
    category: 'Credit Card',
    image_url: 'https://www.pnc.com/en/personal-banking/banking/credit-cards/_jcr_content/main/pageBody/containergrid_197409_2030261130/embeddedGrid/containergrid_copy/embeddedGrid/containergrid/embeddedGrid/image.coreimg.png/1769797295149/pnc-cash-unlimited-signature.png'
  },
  {
    name: 'PNC Spend Wise Visa',
    description: 'Unlock a lower purchase APR over time as you build responsible credit habits.',
    category: 'Credit Card',
    image_url: 'https://www.pnc.com/en/personal-banking/banking/credit-cards/_jcr_content/main/pageBody/containergrid_1061138187/embeddedGrid/containergrid_copy/embeddedGrid/containergrid/embeddedGrid/image.coreimg.png/1724442792947/creditcard-spend-wise.png'
  },
  {
    name: 'PNC Secured Visa',
    description: 'Secured credit card to help establish and build your credit history.',
    category: 'Credit Card',
    image_url: 'https://www.pnc.com/en/personal-banking/banking/credit-cards/_jcr_content/main/pageBody/containergrid/embeddedGrid/containergrid_copy_c/embeddedGrid/containergrid_121507/embeddedGrid/image_copy.coreimg.png/1769797267110/creditcard-secured.png'
  }
];

const PALETTE = ['#2d3943', '#e1e5ea'];
const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (r, g, b) => 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}

const theme = getThemedCardBg(PALETTE);

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
      // structuredContent.products — derived from action name "list_banking_products" (bare array outputSchema rule)
      items = structuredContent?.products || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderProducts(block, items, bridge);

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

function renderProducts(block, items, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-wrapper';

  const scrollContainer = document.createElement('div');
  scrollContainer.className = 'carousel-scroll';

  items.slice(0, 4).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'product-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'card-image';

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
      img.onerror = () => {
        if (img.parentNode) {
          img.parentNode.replaceChild(colorDiv(), img);
        }
      };
      imageContainer.appendChild(img);
    } else {
      imageContainer.appendChild(colorDiv());
    }

    const ctaBtn = document.createElement('button');
    ctaBtn.className = 'cta-image-btn';
    ctaBtn.textContent = 'Explore Details';
    ctaBtn.setAttribute('aria-label', `Explore details for ${item.name || 'product'}`);
    if (bridge) {
      ctaBtn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    imageContainer.appendChild(ctaBtn);
    card.appendChild(imageContainer);

    const info = document.createElement('div');
    info.className = 'card-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

    const name = document.createElement('h3');
    name.className = 'card-name';
    name.textContent = item.name || '';
    info.appendChild(name);

    if (item.description) {
      const desc = document.createElement('p');
      desc.className = 'card-description';
      desc.textContent = item.description;
      info.appendChild(desc);
    }

    const footer = document.createElement('div');
    footer.className = 'card-footer';

    if (item.price) {
      const price = document.createElement('span');
      price.className = 'card-price';
      price.textContent = item.price;
      footer.appendChild(price);
    }

    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'card-badge';
      badge.textContent = item.category;
      footer.appendChild(badge);
    }

    info.appendChild(footer);
    card.appendChild(info);
    scrollContainer.appendChild(card);
  });

  wrapper.appendChild(scrollContainer);

  const leftArrow = document.createElement('button');
  leftArrow.className = 'carousel-arrow carousel-arrow-left';
  leftArrow.innerHTML = '&#9664;';
  leftArrow.setAttribute('aria-label', 'Scroll left');
  leftArrow.style.display = 'none';

  const rightArrow = document.createElement('button');
  rightArrow.className = 'carousel-arrow carousel-arrow-right';
  rightArrow.innerHTML = '&#9654;';
  rightArrow.setAttribute('aria-label', 'Scroll right');

  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  const fade = document.createElement('div');
  fade.className = 'carousel-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;
  wrapper.appendChild(fade);

  const updateArrows = () => {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    leftArrow.style.display = scrollLeft <= 1 ? 'none' : 'flex';
    rightArrow.style.display = scrollLeft + clientWidth >= scrollWidth - 1 ? 'none' : 'flex';
    fade.style.display = scrollLeft + clientWidth >= scrollWidth - 1 ? 'none' : 'block';
  };

  const scrollBy = (direction) => {
    const cardWidth = 210 + 16;
    scrollContainer.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
  };

  leftArrow.addEventListener('click', () => scrollBy(-1));
  rightArrow.addEventListener('click', () => scrollBy(1));

  leftArrow.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollBy(-1);
    }
  });

  rightArrow.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollBy(1);
    }
  });

  scrollContainer.addEventListener('scroll', updateArrows);
  updateArrows();

  block.appendChild(wrapper);
}
