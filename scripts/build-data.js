/**
 * Genere data/items.json a partir du package "@wfcd/items" (WFCD).
 * Ce package scrape/parse la Public Export de Digital Extremes et fournit
 * une base complete et a jour (armes, warframes, mods, compagnons, etc.)
 *
 * Usage :
 *   npm install @wfcd/items
 *   npm run build-data
 */

const fs = require('fs');
const path = require('path');
const PACKAGE_NAME = '@wfcd/items';

function pickDrops(drops) {
  return (drops || [])
    .slice()
    .sort((a, b) => (b.chance || 0) - (a.chance || 0))
    .slice(0, 10)
    .map((d) => ({ location: d.location, chance: d.chance, rarity: d.rarity }));
}

function pickComponent(c) {
  return {
    name: c.name,
    itemCount: c.itemCount,
    imageName: c.imageName,
    description: c.description,
    drops: pickDrops(c.drops),
  };
}

function pickFields(item) {
  return {
    uniqueName: item.uniqueName,
    name: item.name,
    category: item.category,
    type: item.type,
    description: item.description,
    imageName: item.imageName,
    masteryReq: item.masteryReq,
    wikiaUrl: item.wikiaUrl,
    marketCost: item.marketCost,
    bpCost: item.bpCost,
    buildPrice: item.buildPrice,
    buildTime: item.buildTime,
    components: (item.components || []).map(pickComponent),
    drops: pickDrops(item.drops),
    health: item.health,
    shield: item.shield,
    armor: item.armor,
    damagePerShot: item.damagePerShot,
    totalDamage: item.totalDamage,
    fireRate: item.fireRate,
    criticalChance: item.criticalChance,
    criticalMultiplier: item.criticalMultiplier,
    procChance: item.procChance,
    polarities: item.polarities,
    compatName: item.compatName,
    rarity: item.rarity,
    polarity: item.polarity,
    baseDrain: item.baseDrain,
    fusionLimit: item.fusionLimit,
    levelStats: item.levelStats,
  };
}

function main() {
  let ItemsModule;
  try {
    ItemsModule = require(PACKAGE_NAME);
  } catch (err) {
    console.error(`\nLe package "${PACKAGE_NAME}" n'est pas installe.`);
    console.error(`Lance d'abord : npm install ${PACKAGE_NAME}\n`);
    process.exit(1);
  }

  const Items = typeof ItemsModule === 'function' ? ItemsModule : ItemsModule.default;

  if (typeof Items !== 'function') {
    console.error(`\nImpossible de trouver le constructeur dans "${PACKAGE_NAME}".`);
    console.error('Structure recue :', Object.keys(ItemsModule));
    process.exit(1);
  }

  const rawItems = new Items({ category: ['All'] });

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    console.error('\nLe module a repondu mais sans donnees exploitables.');
    process.exit(1);
  }

  const cleaned = rawItems
    .filter((i) => i && i.name && i.uniqueName)
    .map(pickFields);

  const outPath = path.join(__dirname, '..', 'data', 'items.json');
  fs.writeFileSync(outPath, JSON.stringify(cleaned, null, 0));

  console.log(`OK : ${cleaned.length} items ecrits dans data/items.json`);
}

main();