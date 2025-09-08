const fs = require('fs');
const path = require('path');

// SVG логотипа с каплей воды
const logoSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Фон -->
  <circle cx="256" cy="256" r="256" fill="url(#bg)"/>
  
  <!-- Внутреннее кольцо -->
  <circle cx="256" cy="256" r="230" fill="none" stroke="#60a5fa" stroke-width="4"/>
  
  <!-- Центральный круг -->
  <circle cx="256" cy="256" r="180" fill="#93c5fd"/>
  
  <!-- Радиальные линии -->
  ${Array.from({length: 12}, (_, i) => {
    const angle = (i * 30) * Math.PI / 180;
    const x1 = 256 + Math.cos(angle) * 140;
    const y1 = 256 + Math.sin(angle) * 140;
    const x2 = 256 + Math.cos(angle) * 180;
    const y2 = 256 + Math.sin(angle) * 180;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="white" stroke-width="3"/>`;
  }).join('')}
  
  <!-- Капля воды -->
  <ellipse cx="256" cy="240" rx="25" ry="35" fill="#2563eb" transform="rotate(45 256 240)"/>
  
  <!-- Волна под каплей -->
  <path d="M 236 280 Q 256 290 276 280" stroke="#60a5fa" stroke-width="4" fill="none"/>
  
  <!-- Текст -->
  <text x="256" y="120" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">МПЧУЙ</text>
  <text x="256" y="400" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">ВОДОКАНАЛ</text>
</svg>
`;

// Размеры иконок
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Создаем HTML файл для генерации иконок
const iconGeneratorHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Icon Generator</title>
</head>
<body>
  <div id="icons"></div>
  <script>
    const svg = \`${logoSvg}\`;
    const sizes = [${sizes.join(', ')}];
    
    sizes.forEach(size => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      const img = new Image();
      img.onload = function() {
        ctx.drawImage(img, 0, 0, size, size);
        const link = document.createElement('a');
        link.download = \`icon-\${size}x\${size}.png\`;
        link.href = canvas.toDataURL();
        link.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svg);
    });
  </script>
</body>
</html>
`;

// Сохраняем HTML файл
fs.writeFileSync(path.join(__dirname, '../public/icon-generator.html'), iconGeneratorHtml);

console.log('Icon generator HTML created at public/icon-generator.html');
console.log('Open this file in browser to generate icons');
console.log('Then move the generated PNG files to public/icons/'); 