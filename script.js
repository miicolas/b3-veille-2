

// FRACTALES HEXAGONALES
// ----------------------------------------------------
let DESSIN = 87;

// ----------------------------------------------------
const PI = Math.PI;
const DEPTH = 3;
const SIZE = 120;
const SHAPE_COUNT = 5;

let width, height;
let svgPath = '';
let svgDefs = '';
let gradientId = 0;

// ----------------------------------------------------
// Classe représentant une forme fractale avec ses enfants
class Shape {
    constructor(x, y, size, depth, hue, rotation) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.depth = depth;
        this.hue = hue;
        this.rotation = rotation;
        this.children = [];

        // Création récursive des formes enfants
        if (depth > 0) {
            const childSize = size * 0.55;
            const distance = size * 0.75;
            const childCount = 5;

            for (let i = 0; i < childCount; i++) {
                const angle = (i / childCount) * PI * 2;
                const childX = x + Math.cos(angle) * distance;
                const childY = y + Math.sin(angle) * distance;
                const childHue = (hue + 30) % 360;
                const childRotation = rotation + angle;

                this.children.push(new Shape(childX, childY, childSize, depth - 1, childHue, childRotation));
            }
        }
    }

    // Génère le path SVG pour cette forme
    toSVG() {
        const opacity = 0.4 + (this.depth / DEPTH) * 0.4;

        // Création du gradient
        const gId = `grad${gradientId++}`;
        svgDefs += `<radialGradient id="${gId}">`;
        svgDefs += `<stop offset="0%" style="stop-color:hsla(${this.hue}, 85%, 65%, ${opacity})" />`;
        svgDefs += `<stop offset="70%" style="stop-color:hsla(${this.hue + 20}, 80%, 55%, ${opacity * 0.7})" />`;
        svgDefs += `<stop offset="100%" style="stop-color:hsla(${this.hue + 40}, 75%, 45%, 0)" />`;
        svgDefs += `</radialGradient>`;

        // Points de l'hexagone
        let points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * PI * 2 + this.rotation;
            const radius = this.size * (1 + Math.sin(angle * 3) * 0.1);
            const x = this.x + Math.cos(angle) * radius;
            const y = this.y + Math.sin(angle) * radius;
            points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
        }

        svgPath += `<polygon points="${points.join(' ')}" `;
        svgPath += `fill="url(#${gId})" `;
        svgPath += `stroke="hsla(${this.hue}, 90%, 75%, ${opacity * 0.8})" `;
        svgPath += `stroke-width="2" />\n`;

        // Dessine récursivement les enfants
        this.children.forEach(child => child.toSVG());
    }
}

// ----------------------------------------------------
// Fonction LPRINT pour construire le SVG
function LPRINT(cmd) {
    svgPath += cmd;
}

// ----------------------------------------------------
// Fonction INIT pour initialiser le SVG
function INIT(options = {}) {
    width = window.innerWidth;
    height = window.innerHeight;

    svgPath = '';
    svgDefs = '';
    gradientId = 0;

    // Fond avec gradient radial
    const bgGradId = 'bgGrad';
    svgDefs += `<radialGradient id="${bgGradId}" cx="50%" cy="50%" r="70%">`;
    svgDefs += `<stop offset="0%" style="stop-color:hsl(240, 25%, 8%)" />`;
    svgDefs += `<stop offset="50%" style="stop-color:hsl(260, 20%, 5%)" />`;
    svgDefs += `<stop offset="100%" style="stop-color:hsl(0, 0%, 2%)" />`;
    svgDefs += `</radialGradient>`;

    svgPath += `<rect width="${width}" height="${height}" fill="url(#${bgGradId})" />\n`;
}

// ----------------------------------------------------
// Fonction TRACE2 pour finaliser et afficher le SVG
function TRACE2() {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("xmlns", svgNS);
    svg.style.position = "fixed";
    svg.style.top = "0";
    svg.style.left = "0";

    // Ajoute les définitions
    const defs = document.createElementNS(svgNS, "defs");
    defs.innerHTML = svgDefs;
    svg.appendChild(defs);

    // Ajoute le contenu
    const g = document.createElementNS(svgNS, "g");
    g.innerHTML = svgPath;
    svg.appendChild(g);

    // Remplace le canvas par le SVG
    const canvas = document.getElementById('canvas');
    if (canvas && canvas.parentNode) {
        canvas.parentNode.replaceChild(svg, canvas);
    } else {
        document.body.appendChild(svg);
    }

    // Export SVG au clic sur 'E'
    window.addEventListener('keydown', (e) => {
        if (e.key === 'e' || e.key === 'E') {
            const svgData = svg.outerHTML;
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `fractal_${DESSIN}.svg`;
            link.click();
            URL.revokeObjectURL(url);
        }
    });
}

// ----------------------------------------------------
// Fonction de dessin des connexions
function drawConnections(shapes) {
    for (let i = 0; i < shapes.length; i++) {
        for (let j = i + 1; j < shapes.length; j++) {
            const dx = shapes[i].x - shapes[j].x;
            const dy = shapes[i].y - shapes[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = Math.min(width, height) * 0.6;

            if (distance < maxDistance) {
                const opacity = (1 - distance / maxDistance) * 0.2;
                const hue = (i * 72 + j * 36) % 360;

                const gId = `lineGrad${i}_${j}`;
                svgDefs += `<linearGradient id="${gId}" x1="${shapes[i].x}" y1="${shapes[i].y}" x2="${shapes[j].x}" y2="${shapes[j].y}" gradientUnits="userSpaceOnUse">`;
                svgDefs += `<stop offset="0%" style="stop-color:hsla(${hue}, 80%, 60%, ${opacity})" />`;
                svgDefs += `<stop offset="50%" style="stop-color:hsla(${hue + 30}, 85%, 65%, ${opacity * 1.5})" />`;
                svgDefs += `<stop offset="100%" style="stop-color:hsla(${hue + 60}, 80%, 60%, ${opacity})" />`;
                svgDefs += `</linearGradient>`;

                svgPath += `<line x1="${shapes[i].x}" y1="${shapes[i].y}" x2="${shapes[j].x}" y2="${shapes[j].y}" `;
                svgPath += `stroke="url(#${gId})" stroke-width="1.5" />\n`;
            }
        }
    }
}

// ----------------------------------------------------
function setup() {
    INIT({ svg: true });

    const shapes = [];
    const spacing = Math.min(width, height) * 0.28;

    // Création des formes fractales
    for (let i = 0; i < SHAPE_COUNT; i++) {
        const angle = (i / SHAPE_COUNT) * PI * 2;
        const x = width / 2 + Math.cos(angle) * spacing;
        const y = height / 2 + Math.sin(angle) * spacing;
        const hue = (i * 72) % 360;
        const rotation = angle + PI / 4;

        shapes.push(new Shape(x, y, SIZE, DEPTH, hue, rotation));
    }

    // Génération des connexions
    drawConnections(shapes);

    // Génération des formes
    shapes.forEach(shape => shape.toSVG());

    TRACE2();
}

function keyPressed() {
    if (key === " " || key === "Spacebar") {
      // Save as SVG
      saveCanvas("mon_fractal", "svg");
    }
    if (key.toLowerCase() === "f") {
      saveCanvas("mon_fractal", "png");
    }
    // Show instructions again after saving
    showInstructions = true;
  }

// ----------------------------------------------------
setup();
