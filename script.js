// Configuration du canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;

// Paramètres des fractales
const DEPTH = 3;
const SIZE = 120;
const SHAPE_COUNT = 5;

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

            //Création des enfants de la forme fractale
            for (let i = 0; i < childCount; i++) {
                const angle = (i / childCount) * Math.PI * 2;
                const childX = x + Math.cos(angle) * distance;
                const childY = y + Math.sin(angle) * distance;
                const childHue = (hue + 30) % 360;
                const childRotation = rotation + angle;

                this.children.push(new Shape(childX, childY, childSize, depth - 1, childHue, childRotation));
            }
        }
    }

    //Dessine la forme fractale
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        //Calcul de l'opacité de la forme fractale
        const opacity = 0.4 + (this.depth / DEPTH) * 0.4;

        //Création du gradient de la forme fractale
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, `hsla(${this.hue}, 85%, 65%, ${opacity})`);
        gradient.addColorStop(0.7, `hsla(${this.hue + 20}, 80%, 55%, ${opacity * 0.7})`);
        gradient.addColorStop(1, `hsla(${this.hue + 40}, 75%, 45%, 0)`);

        ctx.fillStyle = gradient;
        ctx.strokeStyle = `hsla(${this.hue}, 90%, 75%, ${opacity * 0.8})`;
        ctx.lineWidth = 2;

        ctx.beginPath();
        //Dessine la forme fractale
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const radius = this.size * (1 + Math.sin(angle * 3) * 0.1);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        //Dessine le contour de la forme fractale
        ctx.stroke();

        ctx.restore();
        //Dessine les enfants de la forme fractale
        this.children.forEach(child => child.draw());
    }
}

//Dessine le fond du canvas
function drawBackground() {
    const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) * 0.7
    );

    gradient.addColorStop(0, 'hsl(240, 25%, 8%)');
    gradient.addColorStop(0.5, 'hsl(260, 20%, 5%)');
    gradient.addColorStop(1, 'hsl(0, 0%, 2%)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}

//Dessine les connexions entre les formes fractales
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

                const gradient = ctx.createLinearGradient(
                    shapes[i].x, shapes[i].y,
                    shapes[j].x, shapes[j].y
                );
                gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, ${opacity})`);
                gradient.addColorStop(0.5, `hsla(${hue + 30}, 85%, 65%, ${opacity * 1.5})`);
                gradient.addColorStop(1, `hsla(${hue + 60}, 80%, 60%, ${opacity})`);

                ctx.beginPath();
                ctx.moveTo(shapes[i].x, shapes[i].y);
                ctx.lineTo(shapes[j].x, shapes[j].y);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        }
    }
}

//Initialise le canvas et les formes fractales
function init() {
    // Récupération de la largeur et de la hauteur de la fenêtre
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Création des formes fractales
    const shapes = [];
    const spacing = Math.min(width, height) * 0.28;

    // Création des formes fractales
    for (let i = 0; i < SHAPE_COUNT; i++) {
        const angle = (i / SHAPE_COUNT) * Math.PI * 2;
        const x = width / 2 + Math.cos(angle) * spacing;
        const y = height / 2 + Math.sin(angle) * spacing;
        const hue = (i * 72) % 360;
        const rotation = angle + Math.PI / 4;

        shapes.push(new Shape(x, y, SIZE, DEPTH, hue, rotation));
    }

    // Affichage des formes fractales
    drawBackground();
    // Affichage des connexions entre les formes fractales
    drawConnections(shapes);
    // Affichage des formes fractales
    shapes.forEach(shape => shape.draw());
}

window.addEventListener('resize', init);
init({svg: true});
