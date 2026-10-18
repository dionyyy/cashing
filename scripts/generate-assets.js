/* eslint-disable */
// One-time asset generator for the Cashing visual identity.
// Produces app icon, adaptive icon layers, splash mark, and favicon
// from inline SVG definitions. Run: node scripts/generate-assets.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGES = path.join(__dirname, '..', 'assets', 'images');

const GREEN = '#107A57';
const GREEN_DARK = '#0B5E43';
const CREAM = '#F4F1E9';

// A coin-like "C" with an upward trend line — calm, financial, distinctive.
function iconSvg({ bg, mark, size = 1024, inset = 0 }) {
  const c = size / 2;
  const r = size * 0.3;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bg ? `<rect width="${size}" height="${size}" rx="${size * 0.22}" fill="${bg}"/>` : ''}
  <g transform="translate(${inset}, ${inset})">
    <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${mark}" stroke-width="${size * 0.075}"
      stroke-linecap="round" stroke-dasharray="${2 * Math.PI * r * 0.78} ${2 * Math.PI * r}"
      transform="rotate(35 ${c} ${c})"/>
    <polyline points="${c - r * 0.55},${c + r * 0.35} ${c - r * 0.15},${c - r * 0.08} ${c + r * 0.15},${c + r * 0.1} ${c + r * 0.6},${c - r * 0.45}"
      fill="none" stroke="${mark}" stroke-width="${size * 0.06}" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${c + r * 0.6}" cy="${c - r * 0.45}" r="${size * 0.045}" fill="${mark}"/>
  </g>
</svg>`;
}

async function write(name, svg, w, h) {
  const out = path.join(IMAGES, name);
  await sharp(Buffer.from(svg)).resize(w, h).png().toFile(out);
  console.log('wrote', name);
}

async function main() {
  // Main app icon: green rounded square + cream mark.
  await write('icon.png', iconSvg({ bg: GREEN, mark: CREAM }), 1024, 1024);
  await write('favicon.png', iconSvg({ bg: GREEN, mark: CREAM }), 48, 48);

  // Android adaptive: transparent foreground mark + solid bg layer.
  await write(
    'android-icon-foreground.png',
    iconSvg({ bg: null, mark: CREAM, inset: 170 }),
    1024,
    1024,
  );
  await write(
    'android-icon-background.png',
    `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="${GREEN}"/></svg>`,
    1024,
    1024,
  );
  await write(
    'android-icon-monochrome.png',
    iconSvg({ bg: null, mark: '#000000', inset: 170 }),
    1024,
    1024,
  );

  // Splash mark: just the symbol in brand green, transparent bg.
  await write('splash-icon.png', iconSvg({ bg: null, mark: GREEN }), 512, 512);

  console.log('Done. Suppress GREEN_DARK unused:', !!GREEN_DARK);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
