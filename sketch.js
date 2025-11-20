// FRACTALES HEXAGONALES

// ----------------------------------------------------
let DESSIN = 87;

// ----------------------------------------------------
let NP = 480, PI = Math.PI;
let DEPTH = 3, SIZE = 120, SHAPE_COUNT = 5;
let X, Y, WIDTH, HEIGHT;
let SVGPATH = '', SVGDEFS = '', GRAD_ID = 0;

// ----------------------------------------------------
function int(n) { return Math.floor(n); }
function cos(a) { return Math.cos(a); }
function sin(a) { return Math.sin(a); }

// ----------------------------------------------------
function LPRINT(cmd) {
    SVGPATH += cmd;
}

// ----------------------------------------------------
function INIT2(size) {
    NP = size;
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

    SVGPATH = '';
    SVGDEFS = '';
    GRAD_ID = 0;

    // Fond avec gradient radial
    SVGDEFS += `<radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">`;
    SVGDEFS += `<stop offset="0%" style="stop-color:hsl(240, 25%, 8%)" />`;
    SVGDEFS += `<stop offset="50%" style="stop-color:hsl(260, 20%, 5%)" />`;
    SVGDEFS += `<stop offset="100%" style="stop-color:hsl(0, 0%, 2%)" />`;
    SVGDEFS += `</radialGradient>`;

    LPRINT(`<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bgGrad)" />\n`);
}

// ----------------------------------------------------
function TRACE2() {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", WIDTH);
    svg.setAttribute("height", HEIGHT);
    svg.setAttribute("xmlns", svgNS);
    svg.style.position = "fixed";
    svg.style.top = "0";
    svg.style.left = "0";

    const defs = document.createElementNS(svgNS, "defs");
    defs.innerHTML = SVGDEFS;
    svg.appendChild(defs);

    const g = document.createElementNS(svgNS, "g");
    g.innerHTML = SVGPATH;
    svg.appendChild(g);

    document.body.appendChild(svg);

    // Export SVG sur 'E'
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
function drawHexagon(x, y, size, depth, hue, rotation) {
    const opacity = 0.4 + (depth / DEPTH) * 0.4;

    // Création du gradient
    const gId = `grad${GRAD_ID++}`;
    SVGDEFS += `<radialGradient id="${gId}">`;
    SVGDEFS += `<stop offset="0%" style="stop-color:hsla(${int(hue)}, 85%, 65%, ${opacity})" />`;
    SVGDEFS += `<stop offset="70%" style="stop-color:hsla(${int(hue + 20)}, 80%, 55%, ${opacity * 0.7})" />`;
    SVGDEFS += `<stop offset="100%" style="stop-color:hsla(${int(hue + 40)}, 75%, 45%, 0)" />`;
    SVGDEFS += `</radialGradient>`;

    // Points de l'hexagone
    let points = '';
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * PI * 2 + rotation;
        const radius = size * (1 + sin(angle * 3) * 0.1);
        const px = x + cos(angle) * radius;
        const py = y + sin(angle) * radius;
        points += `${int(px)},${int(py)} `;
    }

    LPRINT(`<polygon points="${points}" fill="url(#${gId})" stroke="hsla(${int(hue)}, 90%, 75%, ${opacity * 0.8})" stroke-width="2" />\n`);
}

// ----------------------------------------------------
function drawFractal(x, y, size, depth, hue, rotation) {
    drawHexagon(x, y, size, depth, hue, rotation);

    if (depth > 0) {
        const childSize = size * 0.55;
        const distance = size * 0.75;
        const childCount = 5;

        for (let I = 0; I < childCount; I++) {
            const angle = (I / childCount) * PI * 2;
            const childX = x + cos(angle) * distance;
            const childY = y + sin(angle) * distance;
            const childHue = (hue + 30) % 360;
            const childRotation = rotation + angle;

            drawFractal(childX, childY, childSize, depth - 1, childHue, childRotation);
        }
    }
}

// ----------------------------------------------------
function setup() {
    INIT2({svg: true});

    let shapes = [];
    const spacing = Math.min(WIDTH, HEIGHT) * 0.28;

    // Stocke les positions pour les connexions
    for (let I = 0; I < SHAPE_COUNT; I++) {
        const angle = (I / SHAPE_COUNT) * PI * 2;
        X = WIDTH / 2 + cos(angle) * spacing;
        Y = HEIGHT / 2 + sin(angle) * spacing;
        shapes.push({ x: X, y: Y });
    }

    // Dessine les connexions
    for (let I = 0; I < SHAPE_COUNT; I++) {
        for (let J = I + 1; J < SHAPE_COUNT; J++) {
            const dx = shapes[I].x - shapes[J].x;
            const dy = shapes[I].y - shapes[J].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = Math.min(WIDTH, HEIGHT) * 0.6;

            if (distance < maxDistance) {
                const opacity = (1 - distance / maxDistance) * 0.2;
                const hue = (I * 72 + J * 36) % 360;

                const gId = `lineGrad${I}_${J}`;
                SVGDEFS += `<linearGradient id="${gId}" x1="${int(shapes[I].x)}" y1="${int(shapes[I].y)}" x2="${int(shapes[J].x)}" y2="${int(shapes[J].y)}" gradientUnits="userSpaceOnUse">`;
                SVGDEFS += `<stop offset="0%" style="stop-color:hsla(${int(hue)}, 80%, 60%, ${opacity})" />`;
                SVGDEFS += `<stop offset="50%" style="stop-color:hsla(${int(hue + 30)}, 85%, 65%, ${opacity * 1.5})" />`;
                SVGDEFS += `<stop offset="100%" style="stop-color:hsla(${int(hue + 60)}, 80%, 60%, ${opacity})" />`;
                SVGDEFS += `</linearGradient>`;

                LPRINT(`<line x1="${int(shapes[I].x)}" y1="${int(shapes[I].y)}" x2="${int(shapes[J].x)}" y2="${int(shapes[J].y)}" stroke="url(#${gId})" stroke-width="1.5" />\n`);
            }
        }
    }

    // Dessine les fractales
    for (let I = 0; I < SHAPE_COUNT; I++) {
        const angle = (I / SHAPE_COUNT) * PI * 2;
        const hue = (I * 72) % 360;
        const rotation = angle + PI / 4;

        drawFractal(shapes[I].x, shapes[I].y, SIZE, DEPTH, hue, rotation);
    }

    TRACE2();
}

// ----------------------------------------------------
setup();
