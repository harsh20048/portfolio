const header = document.querySelector("[data-header]");

const syncHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 20);
};

window.addEventListener("scroll", syncHeader, { passive: true });
syncHeader();

const canvas = document.getElementById("signal-canvas");
const context = canvas ? canvas.getContext("2d") : null;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let width = 0;
let height = 0;
let nodes = [];
let animationFrame = 0;

function resizeCanvas() {
  if (!canvas || !context) return;

  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = rect.width;
  height = rect.height;
  canvas.width = Math.max(1, Math.floor(width * ratio));
  canvas.height = Math.max(1, Math.floor(height * ratio));
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = width < 760 ? 34 : 58;
  nodes = Array.from({ length: count }, (_, index) => ({
    x: (index * 97) % Math.max(width, 1),
    y: (index * 53) % Math.max(height, 1),
    vx: ((index % 5) - 2) * 0.12,
    vy: ((index % 7) - 3) * 0.1,
    r: 2 + (index % 4) * 0.55,
    tone: index % 3,
  }));
}

function paintBackground() {
  if (!context) return;
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#101820";
  context.fillRect(0, 0, width, height);

  context.globalAlpha = 0.22;
  context.strokeStyle = "#d7d2c8";
  context.lineWidth = 1;
  const rowGap = 56;
  const colGap = 72;
  for (let y = 0; y < height + rowGap; y += rowGap) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y + 22);
    context.stroke();
  }
  for (let x = 0; x < width + colGap; x += colGap) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x - 26, height);
    context.stroke();
  }
  context.globalAlpha = 1;
}

function paintNodes() {
  if (!context) return;

  const maxDistance = width < 760 ? 112 : 150;
  for (let i = 0; i < nodes.length; i += 1) {
    const a = nodes[i];
    for (let j = i + 1; j < nodes.length; j += 1) {
      const b = nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < maxDistance) {
        context.globalAlpha = (1 - distance / maxDistance) * 0.45;
        context.strokeStyle = a.tone === 0 ? "#75d5c9" : a.tone === 1 ? "#f7c76f" : "#ef8b7b";
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }
    }
  }

  context.globalAlpha = 1;
  for (const node of nodes) {
    context.fillStyle = node.tone === 0 ? "#75d5c9" : node.tone === 1 ? "#f7c76f" : "#ef8b7b";
    context.beginPath();
    context.arc(node.x, node.y, node.r, 0, Math.PI * 2);
    context.fill();
  }
}

function updateNodes() {
  for (const node of nodes) {
    node.x += node.vx;
    node.y += node.vy;

    if (node.x < -20) node.x = width + 20;
    if (node.x > width + 20) node.x = -20;
    if (node.y < -20) node.y = height + 20;
    if (node.y > height + 20) node.y = -20;
  }
}

function draw() {
  paintBackground();
  paintNodes();
  if (!prefersReducedMotion) {
    updateNodes();
    animationFrame = window.requestAnimationFrame(draw);
  }
}

if (canvas && context) {
  resizeCanvas();
  draw();
  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(animationFrame);
    resizeCanvas();
    draw();
  });
}
