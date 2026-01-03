// Generate PWA icons for Badger
// Run with: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// SVG icon template (badger emoji as placeholder)
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const createSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#7FC8A9" rx="${size * 0.15}"/>

  <!-- Badger emoji representation -->
  <text
    x="50%"
    y="50%"
    font-size="${size * 0.6}"
    text-anchor="middle"
    dominant-baseline="central"
    font-family="Arial, sans-serif"
  >
    🦡
  </text>
</svg>`;

// Generate SVG icons
sizes.forEach(size => {
  const svg = createSVG(size);
  const filename = path.join(publicDir, `icon-${size}x${size}.png.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`Created ${filename}`);
});

// Create the two main sizes referenced in manifest
const mainSizes = [192, 512];
mainSizes.forEach(size => {
  const svg = createSVG(size);
  const filename = path.join(publicDir, `icon-${size}.png`);
  // For now, we'll use SVG with .png extension as placeholder
  // In production, convert these to actual PNG files
  fs.writeFileSync(filename, svg);
  console.log(`Created ${filename}`);
});

console.log('\n✅ Icon generation complete!');
console.log('\nNote: These are SVG placeholders with .png extension.');
console.log('For production, use a tool like sharp or imagemagick to convert to PNG:');
console.log('  npm install sharp');
console.log('  node scripts/convert-icons.js');
