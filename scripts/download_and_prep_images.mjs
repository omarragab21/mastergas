import { mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const outDir = '/Users/omarragab/.gemini/antigravity-ide/brain/d0368e90-5821-4b09-8796-e6ac58bddb3e/catalog_images';
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const geminiSourceDir = '/Users/omarragab/.gemini/antigravity-ide/brain/d0368e90-5821-4b09-8796-e6ac58bddb3e';

// Mapping of local Gemini generated images
const geminiImages = {
  'prod_143.jpg': 'gas_cylinder_domestic_1788774652387.jpg',
  'cat_51.jpg': 'gas_cylinder_domestic_1788774652387.jpg',
  'prod_144.jpg': 'composite_cylinder_1788774714054.jpg',
  'prod_145.jpg': 'commercial_cylinder_1788774776486.jpg',
  'cat_52.jpg': 'gas_regulator_italian_1788774796073.jpg',
  'prod_146.jpg': 'gas_regulator_italian_1788774796073.jpg',
  'prod_147.jpg': 'regulator_high_pressure_1788774813340.jpg',
  'prod_148.jpg': 'safety_valve_gauge_1788774843220.jpg',
  'cat_53.jpg': 'ceramic_gas_heater_1788774854596.jpg',
  'prod_149.jpg': 'ceramic_gas_heater_1788774854596.jpg',
  'prod_150.jpg': 'decorative_gas_heater_1788774868721.jpg',
  'prod_151.jpg': 'infrared_heater_fan_1788774883588.jpg',
  'cat_54.jpg': 'portable_camping_stove_1788774899638.jpg',
  'prod_152.jpg': 'portable_camping_stove_1788774899638.jpg',
  'prod_153.jpg': 'camping_gas_cartridge_1788774911637.jpg',
  'prod_154.jpg': 'outdoor_gas_lantern_1788774925087.jpg',
  'cat_55.jpg': 'reinforced_gas_hose_1788774939984.jpg',
  'prod_155.jpg': 'reinforced_gas_hose_1788774939984.jpg'
};

for (const [targetName, srcFile] of Object.entries(geminiImages)) {
  const srcPath = path.join(geminiSourceDir, srcFile);
  const destPath = path.join(outDir, targetName);
  copyFileSync(srcPath, destPath);
  console.log(`Copied Gemini image: ${srcFile} -> ${targetName}`);
}

// Unsplash high quality product photos for the remaining items
const externalImages = {
  'prod_156.jpg': 'photo-1607400201515-c2c41c07d307',
  'prod_157.jpg': 'photo-1572981779307-38b8cabb2407',
  'cat_56.jpg': 'photo-1558002038-1055907df827',
  'prod_158.jpg': 'photo-1558002038-1055907df827',
  'prod_159.jpg': 'photo-1581092160607-ee22621dd758',
  'prod_160.jpg': 'photo-1563770660941-20978e870e26',
  'cat_57.jpg': 'photo-1556911220-e15b29be8c8f',
  'prod_161.jpg': 'photo-1556911220-e15b29be8c8f',
  'prod_162.jpg': 'photo-1588854337236-6889d631faa8',
  'prod_163.jpg': 'photo-1507089947368-19c1da9775ae',
  'cat_58.jpg': 'photo-1584622650111-993a426fbf0a',
  'prod_164.jpg': 'photo-1584622650111-993a426fbf0a',
  'prod_165.jpg': 'photo-1585338107529-13afc5f02586',
  'prod_166.jpg': 'photo-1585338107529-13afc5f02586',
  'cat_59.jpg': 'photo-1555396273-367ea4eb4db5',
  'prod_167.jpg': 'photo-1555396273-367ea4eb4db5',
  'prod_168.jpg': 'photo-1529193591184-b1d58069ecdd',
  'prod_169.jpg': 'photo-1544025162-d76694265947',
  'cat_60.jpg': 'photo-1581783898377-1c85bf937427',
  'prod_170.jpg': 'photo-1581783898377-1c85bf937427',
  'prod_171.jpg': 'photo-1504148455328-c376907d081c',
  'prod_172.jpg': 'photo-1530124566582-a618bc2615dc'
};

async function downloadExternal() {
  for (const [targetName, photoId] of Object.entries(externalImages)) {
    const destPath = path.join(outDir, targetName);
    const url = `https://images.unsplash.com/${photoId}?w=800&h=800&auto=format&fit=crop&q=85`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const { writeFileSync } = await import('node:fs');
    writeFileSync(destPath, buf);
    console.log(`Downloaded photo for ${targetName} (${photoId})`);
  }
}

downloadExternal().then(() => {
  console.log('All catalog images prepared in:', outDir);
}).catch(err => {
  console.error('Download error:', err);
  process.exit(1);
});
