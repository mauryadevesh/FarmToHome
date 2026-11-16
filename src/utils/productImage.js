const createSvgPlaceholder = (label = 'Fresh Harvest') => {
  const safeText = encodeURIComponent(label);
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23f7f4ec"/><circle cx="200" cy="170" r="64" fill="%23e9e3d3"/><path d="M200 130 C165 140 155 175 175 205 C185 185 200 170 200 130 Z M200 130 C235 140 245 175 225 205 C215 185 200 170 200 130 Z" fill="%23243324"/><text x="200" y="280" font-family="system-ui,-apple-system,sans-serif" font-size="20" font-weight="600" fill="%23172017" text-anchor="middle">${safeText}</text><text x="200" y="310" font-family="system-ui,-apple-system,sans-serif" font-size="13" fill="%23536853" text-anchor="middle">Village Farm Produce</text></svg>`;
};

const productImageMap = {
  tomato: 'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=600&auto=format&fit=crop&q=80',
  onion: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=600&auto=format&fit=crop&q=80',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
  carrot: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80',
  brinjal: 'https://images.unsplash.com/photo-1528826007177-f38517ce9a8a?w=600&auto=format&fit=crop&q=80',
  eggplant: 'https://images.unsplash.com/photo-1528826007177-f38517ce9a8a?w=600&auto=format&fit=crop&q=80',
  cabbage: 'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?w=600&auto=format&fit=crop&q=80',
  cauliflower: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&auto=format&fit=crop&q=80',
  'green chilli': 'https://images.unsplash.com/photo-1597115580039-b849ed2d6398?w=600&auto=format&fit=crop&q=80',
  'green chili': 'https://images.unsplash.com/photo-1597115580039-b849ed2d6398?w=600&auto=format&fit=crop&q=80',
  capsicum: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80',
  'bell pepper': 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80',
  'red chilli': 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80',
  'red chili': 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80',
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
  mango: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80',
  grapes: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&auto=format&fit=crop&q=80',
  pomegranate: 'https://images.unsplash.com/photo-1541344999736-83eca272f6fc?w=600&auto=format&fit=crop&q=80',
  watermelon: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
  rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
  wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
  maize: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80',
  corn: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80',
  sugarcane: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Sugarcane_stalks.jpg',
  groundnut: 'https://images.unsplash.com/photo-1546545584-c03ac781caaf?w=600&auto=format&fit=crop&q=80',
  peanut: 'https://images.unsplash.com/photo-1546545584-c03ac781caaf?w=600&auto=format&fit=crop&q=80',
  'tur dal': 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Split_pea.jpg',
  'toor dal': 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Split_pea.jpg',
  'arhar dal': 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Split_pea.jpg',
  'moong dal': 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Green_Gram_Dal_%28_%E0%A6%96%E0%A7%8B%E0%A6%B8%E0%A6%BE_%E0%A6%B8%E0%A6%B9_%E0%A6%8F%E0%A6%AC%E0%A6%82_%E0%A6%96%E0%A7%8B%E0%A6%B8%E0%A6%BE_%E0%A6%9B%E0%A6%BE%E0%A6%A1%E0%A6%BC%E0%A6%BE_%E0%A6%AE%E0%A7%81%E0%A6%97_%E0%A6%A1%E0%A6%BE%E0%A6%B2%29.JPG',
  'mung dal': 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Green_Gram_Dal_%28_%E0%A6%96%E0%A7%8B%E0%A6%B8%E0%A6%BE_%E0%A6%B8%E0%A6%B9_%E0%A6%8F%E0%A6%AC%E0%A6%82_%E0%A6%96%E0%A7%8B%E0%A6%B8%E0%A6%BE_%E0%A6%9B%E0%A6%BE%E0%A6%A1%E0%A6%BC%E0%A6%BE_%E0%A6%AE%E0%A7%81%E0%A6%97_%E0%A6%A1%E0%A6%BE%E0%A6%B2%29.JPG',
  'chana dal': 'https://images.unsplash.com/photo-1521763069287-579ca77694e8?w=600&auto=format&fit=crop&q=80',
  milk: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
  curd: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=600&auto=format&fit=crop&q=80',
  yogurt: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=600&auto=format&fit=crop&q=80',
  eggs: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80',
  egg: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80'
};

// Sort mapping entries by length descending to match composite names first
const sortedEntries = Object.entries(productImageMap).sort(
  ([a], [b]) => b.length - a.length
);

export const getProductImage = (imagePath, productName) => {
  const normalized = (productName || '').toLowerCase().trim();

  // 1. First priority: match produce name against verified photographic catalog
  if (normalized) {
    const matched = sortedEntries.find(([key]) => normalized.includes(key));
    if (matched) {
      return matched[1];
    }
  }

  // 2. Second priority: valid remote image URL (not broken known URLs)
  if (imagePath && /^https?:\/\//i.test(imagePath)) {
    const isBrokenKnown = Boolean(
      imagePath.includes('1567332766624') ||
      imagePath.includes('1615485290176') ||
      imagePath.includes('1585994192701-44755106e232') ||
      imagePath.includes('1598170845058-32b9d6a5c317')
    );
    if (!isBrokenKnown) {
      return imagePath;
    }
  }

  // 3. Fallback: clean Garden-themed SVG placeholder
  return createSvgPlaceholder(productName || 'Fresh Harvest');
};
