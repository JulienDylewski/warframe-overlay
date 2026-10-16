const CDN_BASE = 'https://cdn.warframestat.us/img/';
const PAGE_SIZE = 60;

let ALL_ITEMS = [];
let favorites = [];
let currentTab = 'all';
let visibleCount = PAGE_SIZE;

const searchInput = document.getElementById('search-input');
const resultsList = document.getElementById('results-list');
const detailPanel = document.getElementById('detail-panel');
const detailContent = document.getElementById('detail-content');
const backBtn = document.getElementById('back-btn');
const closeBtn = document.getElementById('close-btn');
const clickThroughBadge = document.getElementById('click-through-badge');
const tabButtons = document.querySelectorAll('.tab-btn');

function imageUrl(item) {
  if (!item.imageName) return '';
  return CDN_BASE + item.imageName;
}

function normalizeType(item) {
  const cat = (item.category || '').toLowerCase();
  if (cat.includes('warframe')) return 'warframes';
  if (cat.includes('mod')) return 'mods';
  if (cat.includes('primary') || cat.includes('secondary') || cat.includes('melee') || cat.includes('weapon')) return 'weapons';
  return 'other';
}

async function loadData() {
  try {
    const res = await fetch('../data/items.json');
    ALL_ITEMS = await res.json();
  } catch (err) {
    console.error('Impossible de charger data/items.json', err);
    ALL_ITEMS = [];
  }
  favorites = await window.overlayAPI.getFavorites();
  renderResults('');
}

function matchesTab(item) {
  if (currentTab === 'all') return true;
  if (currentTab === 'favorites') return favorites.includes(item.uniqueName);
  return normalizeType(item) === currentTab;
}

function renderResults(query, resetPage = true) {
  if (resetPage) visibleCount = PAGE_SIZE;

  const q = query.trim().toLowerCase();
  const filtered = ALL_ITEMS.filter((item) => {
    if (!matchesTab(item)) return false;
    if (!q) return true;
    return item.name.toLowerCase().includes(q);
  });

  resultsList.innerHTML = '';

  if (filtered.length === 0) {
    resultsList.innerHTML = '<div class="empty-state">Aucun resultat. Essaie un autre terme,<br/>ou lance <code>npm run build-data</code> pour<br/>charger la base complete.</div>';
    return;
  }

  const visible = filtered.slice(0, visibleCount);

  visible.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'item-row';

    const isFav = favorites.includes(item.uniqueName);

    row.innerHTML = `
      <img src="${imageUrl(item)}" onerror="this.style.visibility='hidden'" />
      <span class="item-name">${item.name}</span>
      <span class="item-type">${item.category || ''}</span>
      <button class="star-btn ${isFav ? 'active' : ''}" data-unique="${item.uniqueName}">★</button>
    `;

    row.querySelector('.item-name').addEventListener('click', () => showDetail(item));
    row.querySelector('img').addEventListener('click', () => showDetail(item));
    row.querySelector('.star-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      favorites = await window.overlayAPI.toggleFavorite(item.uniqueName);
      renderResults(searchInput.value, false);
    });

    resultsList.appendChild(row);
  });

  if (filtered.length > visible.length) {
    const remaining = filtered.length - visible.length;
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.className = 'load-more-btn';
    loadMoreBtn.textContent = `Afficher plus (${remaining} restants)`;
    loadMoreBtn.addEventListener('click', () => {
      visibleCount += PAGE_SIZE;
      renderResults(searchInput.value, false);
    });
    resultsList.appendChild(loadMoreBtn);
  } else {
    const countLabel = document.createElement('div');
    countLabel.className = 'result-count';
    countLabel.textContent = `${filtered.length} resultat${filtered.length > 1 ? 's' : ''}`;
    resultsList.appendChild(countLabel);
  }
}

function statBox(label, value) {
  if (value === undefined || value === null || value === '') return '';
  return `<div class="stat-box"><div class="label">${label}</div><div class="value">${value}</div></div>`;
}

function formatDrop(d) {
  const chance = typeof d.chance === 'number' ? `${d.chance}%` : '';
  const rarity = d.rarity ? ` · ${d.rarity}` : '';
  return `<div class="drop-row"><span class="drop-location">${d.location || '??'}</span><span class="drop-chance">${chance}${rarity}</span></div>`;
}

function renderAcquisition(item) {
  const parts = [];

  if (item.marketCost) {
    parts.push(`<div class="stat-box"><div class="label">Marché</div><div class="value">${item.marketCost} Platine</div></div>`);
  }
  if (item.bpCost) {
    parts.push(`<div class="stat-box"><div class="label">Blueprint (marché)</div><div class="value">${item.bpCost} Platine</div></div>`);
  }
  if (item.buildPrice) {
    parts.push(`<div class="stat-box"><div class="label">Fabrication</div><div class="value">${item.buildPrice} Credits</div></div>`);
  }
  if (item.buildTime) {
    const hours = Math.round(item.buildTime / 3600);
    parts.push(`<div class="stat-box"><div class="label">Temps fonderie</div><div class="value">${hours}h</div></div>`);
  }

  if (parts.length === 0) return '';

  return `
    <div class="section-title">Où l'obtenir</div>
    <div class="stats-grid">${parts.join('')}</div>
  `;
}

function renderTopDrops(item) {
  const drops = item.drops || [];
  if (drops.length === 0) return '';

  return `
    <div class="section-title">Où le farmer</div>
    <div class="drop-list-static">${drops.map(formatDrop).join('')}</div>
  `;
}

function renderComponents(item) {
  const components = item.components || [];
  if (components.length === 0) return '';

  const rows = components.map((c, idx) => {
    const hasDrops = c.drops && c.drops.length > 0;
    const dropsHtml = hasDrops
      ? `<div class="drop-list hidden" id="drops-${idx}">${c.drops.map(formatDrop).join('')}</div>`
      : '';

    return `
      <div class="component-row ${hasDrops ? 'has-drops' : ''}" data-target="drops-${idx}">
        <span class="component-name">${c.name}${c.itemCount > 1 ? ` x${c.itemCount}` : ''}</span>
        ${hasDrops ? '<span class="component-toggle">▾ farm</span>' : ''}
      </div>
      ${dropsHtml}
    `;
  }).join('');

  return `
    <div class="section-title">Composants nécessaires</div>
    <div class="components-list">${rows}</div>
  `;
}

function showDetail(item) {
  document.getElementById('search-bar').classList.add('hidden');
  document.getElementById('tabs').classList.add('hidden');
  resultsList.classList.add('hidden');
  detailPanel.classList.remove('hidden');

  detailContent.innerHTML = `
    <div class="detail-header">
      <img src="${imageUrl(item)}" onerror="this.style.visibility='hidden'" />
      <div>
        <h2>${item.name}</h2>
        <div class="subtype">${item.category || ''} ${item.type ? '• ' + item.type : ''}</div>
      </div>
    </div>
    <div class="stats-grid">
      ${statBox('Mastery Rank', item.masteryReq)}
      ${statBox('Santé', item.health)}
      ${statBox('Bouclier', item.shield)}
      ${statBox('Armure', item.armor)}
      ${statBox('Dégâts', item.damagePerShot || item.totalDamage)}
      ${statBox('Cadence de tir', item.fireRate)}
      ${statBox('Critique %', item.criticalChance)}
      ${statBox('Statut %', item.procChance)}
      ${statBox('Polarités', (item.polarities || []).join(', '))}
      ${statBox('Compatibilité (mod)', item.compatName)}
      ${statBox('Polarité (mod)', item.polarity)}
      ${statBox('Drain', item.baseDrain)}
      ${statBox('Niveau max fusion', item.fusionLimit)}
    </div>
    ${item.description ? `<div class="description">${item.description}</div>` : ''}
    ${renderAcquisition(item)}
    ${renderComponents(item)}
    ${renderTopDrops(item)}
    ${item.wikiaUrl ? `<button class="wiki-link-btn" id="wiki-link-btn">Voir la fiche complète sur le Wiki ↗</button>` : ''}
  `;

  detailContent.querySelectorAll('.component-row.has-drops').forEach((row) => {
    row.addEventListener('click', () => {
      const target = document.getElementById(row.dataset.target);
      if (target) target.classList.toggle('hidden');
    });
  });

  const wikiBtn = document.getElementById('wiki-link-btn');
  if (wikiBtn) {
    wikiBtn.addEventListener('click', () => window.overlayAPI.openExternal(item.wikiaUrl));
  }
}

backBtn.addEventListener('click', () => {
  detailPanel.classList.add('hidden');
  document.getElementById('search-bar').classList.remove('hidden');
  document.getElementById('tabs').classList.remove('hidden');
  resultsList.classList.remove('hidden');
});

searchInput.addEventListener('input', (e) => renderResults(e.target.value));

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.dataset.type;
    renderResults(searchInput.value);
  });
});

closeBtn.addEventListener('click', () => window.overlayAPI.closeOverlay());

window.overlayAPI.onClickThroughChanged((enabled) => {
  clickThroughBadge.classList.toggle('hidden', !enabled);
});

loadData();