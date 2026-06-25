const SAMPLE_DATA = [
  {
    "name": "PNC Cash Rewards Visa",
    "description": "Cash back credit card with category rewards on gas, dining, and groceries.",
    "price": "$0 annual fee",
    "category": "Credit Card",
    "image_url": "https://www.pnc.com/en/personal-banking/banking/credit-cards/_jcr_content/main/pageBody/containergrid_copy_c_283020490/embeddedGrid/containergrid_copy_c_215278159/embeddedGrid/containergrid/embeddedGrid/image.coreimg.png/1778094519173/creditcard-cash-rewards-200-bonus-ribbon.png"
  },
  {
    "name": "PNC Cash Unlimited Visa Signature",
    "description": "Earn unlimited 2% cash back on every purchase with no category restrictions.",
    "price": "$0 annual fee",
    "category": "Credit Card",
    "image_url": "https://www.pnc.com/en/personal-banking/banking/credit-cards/_jcr_content/main/pageBody/containergrid_197409_2030261130/embeddedGrid/containergrid_copy/embeddedGrid/containergrid/embeddedGrid/image.coreimg.png/1769797295149/pnc-cash-unlimited-signature.png"
  },
  {
    "name": "PNC Spend Wise Visa",
    "description": "Unlock a lower purchase APR over time as you build responsible credit habits.",
    "category": "Credit Card",
    "image_url": "https://www.pnc.com/en/personal-banking/banking/credit-cards/_jcr_content/main/pageBody/containergrid_1061138187/embeddedGrid/containergrid_copy/embeddedGrid/containergrid/embeddedGrid/image.coreimg.png/1724442792947/creditcard-spend-wise.png"
  },
  {
    "name": "PNC Secured Visa",
    "description": "Secured credit card to help establish and build your credit history.",
    "category": "Credit Card",
    "image_url": "https://www.pnc.com/en/personal-banking/banking/credit-cards/_jcr_content/main/pageBody/containergrid/embeddedGrid/containergrid_copy_c/embeddedGrid/containergrid_121507/embeddedGrid/image_copy.coreimg.png/1769797267110/creditcard-secured.png"
  }
];

const PALETTE = ['#2d3943', '#e1e5ea'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s=c/255; return s<=0.03928?s/12.92:Math.pow((s+0.055)/1.055,2.4); };
  const relLum = (r,g,b) => 0.2126*lum(r)+0.7152*lum(g)+0.0722*lum(b);
  if (relLum(r,g,b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo=0, hi=1;
  for (let i=0; i<20; i++) {
    const mid=(lo+hi)/2;
    if (relLum(Math.round(r*mid),Math.round(g*mid),Math.round(b*mid)) > 0.12) hi=mid; else lo=mid;
  }
  const dr=Math.round(r*lo), dg=Math.round(g*lo), db=Math.round(b*lo);
  return { bg:`#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`, fg:'#ffffff' };
}

const theme = getThemedCardBg(PALETTE);
const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA[0];
    } else {
      const _result = await bridge.toolResult;
      item = (_result?.structuredContent || _result) || {};
    }
  } else {
    item = SAMPLE_DATA[0];
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
  const card = document.createElement('div');
  card.className = 'detail-card';

  const imageSection = document.createElement('div');
  imageSection.className = 'detail-image';

  const fallbackColor = CARD_COLORS[0];
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
    return d;
  };

  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || 'Product image';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
    imageSection.appendChild(img);
  } else {
    imageSection.appendChild(colorDiv());
  }

  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'image-cta';
  ctaBtn.textContent = 'Learn More & Apply';
  ctaBtn.style.cssText = `background:${PALETTE[0]};color:#fff;`;
  if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`Tell me more about ${item.name || 'this product'}`);
    });
  }
  imageSection.appendChild(ctaBtn);

  const contentSection = document.createElement('div');
  contentSection.className = 'detail-content';
  contentSection.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

  if (item.name) {
    const title = document.createElement('h2');
    title.textContent = item.name;
    contentSection.appendChild(title);
  }

  if (item.description) {
    const desc = document.createElement('p');
    desc.className = 'description';
    desc.textContent = item.description;
    contentSection.appendChild(desc);
  }

  if (item.price) {
    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = item.price;
    contentSection.appendChild(price);
  }

  if (item.category) {
    const badge = document.createElement('span');
    badge.className = 'category-badge';
    badge.textContent = item.category;
    contentSection.appendChild(badge);
  }

  card.appendChild(imageSection);
  card.appendChild(contentSection);
  block.appendChild(card);
}