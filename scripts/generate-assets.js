import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const width = 1000;
const height = 1000;
const cx = 500;
const cy = 500;

// Generate Sunburst rays (28 alternating yellow and black triangles)
const rayCount = 28;
const outerR = 490;
const innerR = 420;

let rayPaths = '';
for (let i = 0; i < rayCount; i++) {
  const angle1 = (i * 2 * Math.PI) / rayCount;
  const angleMid = ((i + 0.5) * 2 * Math.PI) / rayCount;
  const angle2 = ((i + 1) * 2 * Math.PI) / rayCount;

  const x1 = cx + innerR * Math.cos(angle1);
  const y1 = cy + innerR * Math.sin(angle1);
  const xMid = cx + outerR * Math.cos(angleMid);
  const yMid = cy + outerR * Math.sin(angleMid);
  const x2 = cx + innerR * Math.cos(angle2);
  const y2 = cy + innerR * Math.sin(angle2);

  const fill = i % 2 === 0 ? '#FFE000' : '#111111';
  rayPaths += `<polygon points="${x1.toFixed(2)},${y1.toFixed(2)} ${xMid.toFixed(2)},${yMid.toFixed(2)} ${x2.toFixed(2)},${y2.toFixed(2)}" fill="${fill}" />\n`;
}

// 5-point star generator
function generateStar(x, y, rOuter, rInner, fill) {
  let points = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    points.push(`${(x + r * Math.cos(angle)).toFixed(2)},${(y + r * Math.sin(angle)).toFixed(2)}`);
  }
  return `<polygon points="${points.join(' ')}" fill="${fill}" />`;
}

const leftStar = generateStar(170, 580, 24, 10, '#E52525');
const rightStar = generateStar(830, 580, 24, 10, '#E52525');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <defs>
    <!-- Circular Path for Top Text: SUPER CONCEPT CLASSES -->
    <path id="topTextArc" d="M 130 500 A 370 370 0 0 1 870 500" fill="none" />
    <!-- Circular Path for Bottom Text: JHARKHAND BOARD -->
    <path id="bottomTextArc" d="M 870 500 A 370 370 0 0 1 130 500" fill="none" />
    
    <!-- Inner Council Text Top Arc -->
    <path id="innerCouncilArc" d="M 230 500 A 270 270 0 0 1 770 500" fill="none" />
    <!-- Inner Council Text Bottom Arc (Motto) -->
    <path id="innerMottoArc" d="M 770 500 A 270 270 0 0 1 230 500" fill="none" />

    <clipPath id="innerCircleClip">
      <circle cx="500" cy="500" r="235" />
    </clipPath>

    <radialGradient id="torchGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFF9C4" />
      <stop offset="60%" stop-color="#FFB300" />
      <stop offset="100%" stop-color="#D32F2F" />
    </radialGradient>
  </defs>

  <!-- Background Base -->
  <circle cx="500" cy="500" r="495" fill="#FFFFFF" />

  <!-- Outer Sunburst Triangular Rays -->
  <g id="sunburst-rays">
    ${rayPaths}
  </g>

  <!-- Outer Black Ring Border -->
  <circle cx="500" cy="500" r="422" fill="#FFFFFF" stroke="#111111" stroke-width="12" />

  <!-- Middle White Text Track Ring -->
  <circle cx="500" cy="500" r="338" fill="#FFFDF8" stroke="#111111" stroke-width="8" />

  <!-- Top Text: SUPER CONCEPT CLASSES -->
  <text fill="#111111" font-family="'Arial Black', 'Impact', sans-serif" font-weight="900" font-size="52" letter-spacing="7">
    <textPath href="#topTextArc" startOffset="50%" text-anchor="middle">
      SUPER CONCEPT CLASSES
    </textPath>
  </text>

  <!-- Bottom Text: JHARKHAND BOARD -->
  <text fill="#111111" font-family="'Arial Black', 'Impact', sans-serif" font-weight="900" font-size="52" letter-spacing="8">
    <textPath href="#bottomTextArc" startOffset="50%" text-anchor="middle">
      JHARKHAND BOARD
    </textPath>
  </text>

  <!-- Red Decorative Stars -->
  ${leftStar}
  ${rightStar}

  <!-- Inner Seal Crimson Outer Ring -->
  <circle cx="500" cy="500" r="330" fill="#FFFFFF" stroke="#881515" stroke-width="14" />
  
  <!-- Decorative Beaded Outer Border -->
  <circle cx="500" cy="500" r="318" fill="none" stroke="#881515" stroke-width="4" stroke-dasharray="6,6" />

  <!-- Council Header Text: JHARKHAND ACADEMIC COUNCIL, RANCHI -->
  <text fill="#881515" font-family="'Arial Black', sans-serif" font-weight="900" font-size="25" letter-spacing="3.5">
    <textPath href="#innerCouncilArc" startOffset="50%" text-anchor="middle">
      ★ JHARKHAND ACADEMIC COUNCIL, RANCHI ★
    </textPath>
  </text>

  <!-- Sanskrit Motto: तमसो मा ज्योतिर्गमयः -->
  <text fill="#881515" font-family="'Mukta', 'Noto Sans Devanagari', 'Arial', sans-serif" font-weight="900" font-size="32" letter-spacing="5">
    <textPath href="#innerMottoArc" startOffset="50%" text-anchor="middle">
      तमसो मा ज्योतिर्गमयः
    </textPath>
  </text>

  <!-- Inner Emblem Center Circle -->
  <circle cx="500" cy="500" r="236" fill="#FFFDF8" stroke="#881515" stroke-width="10" />

  <!-- Quadrant Content (Clipped) -->
  <g clip-path="url(#innerCircleClip)">
    
    <!-- Quadrant 1: Top-Left (Mountains, Sun, Trees & Road) -->
    <g id="quadrant-top-left">
      <!-- Sky -->
      <rect x="260" y="260" width="240" height="240" fill="#FFF8E7" />
      <!-- Sun -->
      <circle cx="440" cy="340" r="22" fill="#FFA000" />
      <!-- Mountain 1 -->
      <polygon points="260,420 340,330 420,420" fill="#881515" opacity="0.85" />
      <!-- Mountain 2 -->
      <polygon points="340,430 420,320 500,430" fill="#6A1010" />
      <!-- Winding Road -->
      <path d="M 330 500 Q 380 430 430 420 L 460 420 Q 420 450 380 500 Z" fill="#E0D7C6" stroke="#881515" stroke-width="2" />
      <!-- Trees on Mountain -->
      <polygon points="300,450 310,410 320,450" fill="#881515" />
      <polygon points="320,460 330,420 340,460" fill="#881515" />
    </g>

    <!-- Quadrant 2: Top-Right (Flaming Torch / Mashal) -->
    <g id="quadrant-top-right">
      <rect x="500" y="260" width="240" height="240" fill="#FFFDF8" />
      <!-- Torch Rays -->
      <path d="M 620 330 L 580 290 M 620 330 L 620 275 M 620 330 L 660 290 M 620 330 L 680 320 M 620 330 L 560 320" stroke="#E53935" stroke-width="4" stroke-linecap="round" />
      <!-- Flame outer -->
      <path d="M 620 310 C 600 340 590 380 620 400 C 650 380 640 340 620 310 Z" fill="#881515" />
      <!-- Flame inner -->
      <path d="M 620 335 C 610 355 605 375 620 390 C 635 375 630 355 620 335 Z" fill="#FFA000" />
      <!-- Torch Handle / Holder -->
      <polygon points="605,400 635,400 625,480 615,480" fill="#881515" />
      <rect x="600" y="395" width="40" height="10" rx="3" fill="#6A1010" />
    </g>

    <!-- Quadrant 3: Bottom-Left (Dharti Aaba Birsa Munda) -->
    <g id="quadrant-bottom-left">
      <rect x="260" y="500" width="240" height="240" fill="#FFFDF8" />
      <!-- Turban / Pagdi -->
      <ellipse cx="400" cy="545" rx="26" ry="18" fill="#881515" />
      <path d="M 370 545 Q 400 520 430 545 Z" fill="#6A1010" />
      <!-- Face & Neck -->
      <circle cx="400" cy="565" r="14" fill="#881515" />
      <rect x="395" y="575" width="10" height="15" fill="#881515" />
      <!-- Torso / Shoulders -->
      <path d="M 360 630 C 360 595 440 595 440 630 Z" fill="#881515" />
      <rect x="350" y="630" width="100" height="40" fill="#881515" />
      <text x="400" y="685" fill="#881515" font-family="sans-serif" font-weight="bold" font-size="13" text-anchor="middle">BIRSA MUNDA</text>
    </g>

    <!-- Quadrant 4: Bottom-Right (Open Book with Knowledge Rays) -->
    <g id="quadrant-bottom-right">
      <rect x="500" y="500" width="240" height="240" fill="#FFFDF8" />
      <!-- Radiating knowledge rays -->
      <path d="M 620 560 L 570 530 M 620 560 L 620 520 M 620 560 L 670 530" stroke="#FFA000" stroke-width="3" />
      <!-- Open Book Outer Binding -->
      <path d="M 620 570 Q 580 560 550 575 L 550 635 Q 580 620 620 635 Q 660 620 690 635 L 690 575 Q 660 560 620 570 Z" fill="#881515" />
      <!-- Open Book Pages Left & Right -->
      <path d="M 618 575 Q 582 567 555 580 L 555 628 Q 582 616 618 628 Z" fill="#FFFFFF" />
      <path d="M 622 575 Q 658 567 685 580 L 685 628 Q 658 616 622 628 Z" fill="#FFFFFF" />
      <!-- Text lines inside book -->
      <line x1="565" y1="590" x2="608" y2="588" stroke="#881515" stroke-width="2" />
      <line x1="565" y1="600" x2="608" y2="598" stroke="#881515" stroke-width="2" />
      <line x1="565" y1="610" x2="608" y2="608" stroke="#881515" stroke-width="2" />
      <line x1="632" y1="588" x2="675" y2="590" stroke="#881515" stroke-width="2" />
      <line x1="632" y1="598" x2="675" y2="600" stroke="#881515" stroke-width="2" />
      <line x1="632" y1="608" x2="675" y2="610" stroke="#881515" stroke-width="2" />
    </g>

    <!-- Quadrant Dividing Cross (+) -->
    <line x1="500" y1="260" x2="500" y2="740" stroke="#881515" stroke-width="12" />
    <line x1="260" y1="500" x2="740" y2="500" stroke="#881515" stroke-width="12" />
  </g>
</svg>`;

async function generate() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Save logo.svg
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), svgContent, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf-8');
  console.log('Saved logo.svg and favicon.svg');

  const svgBuffer = Buffer.from(svgContent);

  // 2. Generate crisp PNG versions
  const sizes = [
    { name: 'logo.png', size: 512 },
    { name: 'favicon-512x512.png', size: 512 },
    { name: 'favicon-192x192.png', size: 192 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-96x96.png', size: 96 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 },
  ];

  for (const item of sizes) {
    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png({ quality: 100 })
      .toFile(path.join(publicDir, item.name));
    console.log(`Generated ${item.name}`);
  }

  // Generate favicon.ico (using 48x48 PNG buffer)
  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Generated favicon.ico');

  // 3. Generate OG Image (1200x630) for Google Rich Card, WhatsApp, Facebook, Twitter
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0F172A" />
        <stop offset="60%" stop-color="#1E293B" />
        <stop offset="100%" stop-color="#0284C7" />
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bgGrad)" />
    
    <!-- Accent Circles -->
    <circle cx="100" cy="100" r="300" fill="#3B82F6" opacity="0.08" />
    <circle cx="1100" cy="500" r="350" fill="#6366F1" opacity="0.1" />

    <!-- Left Badge & Text -->
    <g transform="translate(100, 140)">
      <rect x="0" y="0" width="220" height="38" rx="19" fill="#2563EB" fill-opacity="0.3" stroke="#60A5FA" stroke-width="1.5" />
      <text x="110" y="24" fill="#93C5FD" font-family="'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="14" text-anchor="middle" letter-spacing="1.5">★ OFFICIAL CBT PORTAL</text>

      <text x="0" y="90" fill="#FFFFFF" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="44">Super Concept Classes</text>
      <text x="0" y="145" fill="#38BDF8" font-family="'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="34">Smart Online Mock Test &amp; CBT Portal</text>
      <text x="0" y="200" fill="#94A3B8" font-family="'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="20">JAC Board • Class 8th, 9th, 10th, 11th, 12th &amp; Competitive Exams</text>
      
      <!-- Feature Pills -->
      <g transform="translate(0, 240)">
        <rect x="0" y="0" width="160" height="42" rx="8" fill="#1E293B" stroke="#334155" />
        <text x="80" y="26" fill="#38BDF8" font-family="sans-serif" font-weight="700" font-size="15" text-anchor="middle">✓ Free CBT Tests</text>

        <rect x="180" y="0" width="180" height="42" rx="8" fill="#1E293B" stroke="#334155" />
        <text x="270" y="26" fill="#34D399" font-family="sans-serif" font-weight="700" font-size="15" text-anchor="middle">✓ Instant Scorecard</text>

        <rect x="380" y="0" width="180" height="42" rx="8" fill="#1E293B" stroke="#334155" />
        <text x="470" y="26" fill="#FBBF24" font-family="sans-serif" font-weight="700" font-size="15" text-anchor="middle">✓ Live Leaderboard</text>
      </g>
    </g>

    <!-- Logo on the Right -->
    <g transform="translate(780, 115)">
      <circle cx="200" cy="200" r="205" fill="#FFFFFF" opacity="0.1" />
      <g transform="translate(0, 0) scale(0.4)">
        ${svgContent}
      </g>
    </g>
  </svg>`;

  await sharp(Buffer.from(ogSvg))
    .resize(1200, 630)
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('Generated og-image.png');

  // 4. Create site.webmanifest
  const manifest = {
    name: 'Super Concept Classes Exam Portal',
    short_name: 'Super Concept',
    description: 'Official Online CBT Mock Test Portal for JAC Board, Class 8th to 12th Exams',
    start_url: '/',
    display: 'standalone',
    background_color: '#0F172A',
    theme_color: '#2563EB',
    icons: [
      {
        src: '/favicon-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/favicon-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml'
      }
    ]
  };

  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2), 'utf-8');
  console.log('Saved site.webmanifest');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
