lucide.createIcons();

const board = document.getElementById("board");
penBtn.onclick = () => board.classList.add("open");
closeBoard.onclick = () => board.classList.remove("open");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let tool = "pen";

function applyTool() {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000";
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    ctx.lineWidth = tool === "eraser" ? 40 : 3;
}

function resize() {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    applyTool();
}

new ResizeObserver(resize).observe(canvas);

let drawing = false;

let prev, lastMid;
const pos = e => {
  const r = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  return {
    x: (e.clientX - r.left) * (canvas.width / dpr / r.width),
    y: (e.clientY - r.top) * (canvas.height / dpr / r.height),
  };
};

canvas.addEventListener("pointerdown", e => {
    drawing = true;
    canvas.setPointerCapture(e.pointerId);
    prev = lastMid = pos(e);
});

canvas.addEventListener("pointermove", e => {
    if (!drawing) return;
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of events) {
        const p = pos(ev);
        const mid = { x: (prev.x + p.x) / 2, y: (prev.y + p.y) / 2 };
        ctx.beginPath();
        ctx.moveTo(lastMid.x, lastMid.y);
        ctx.quadraticCurveTo(prev.x, prev.y, mid.x, mid.y);
        ctx.stroke();
        prev = p;
        lastMid = mid;
  }
});

window.addEventListener("pointerup", () => drawing = false);

const toolBtns = document.querySelectorAll("[data-tool]");

toolBtns.forEach(b => {
    b.onclick = () => {
        tool = b.dataset.tool;
        toolBtns.forEach(x => x.classList.toggle("active", x === b));
        applyTool();
  };
});