(() => {
  const canvas = document.getElementById("board");
  const wrap = document.getElementById("canvasWrap");
  const dropHint = document.getElementById("dropHint");

  const statusEl = document.getElementById("status");
  const toastEl = document.getElementById("toast");

  const sidebar = document.getElementById("sidebar");
  const btnSidebarOpen = document.getElementById("btn-sidebar-open");
  const btnSidebarClose = document.getElementById("btn-sidebar-close");

  const btnClear = document.getElementById("btn-clear");
  const btnHandbook = document.getElementById("btn-handbook");
  const btnHandbookClose = document.getElementById("btn-handbook-close");
  const modalHandbook = document.getElementById("modal-handbook");
  const hbNav = document.getElementById("hb-nav");
  const hbContent = document.getElementById("hb-content");

  const btnHelp = document.getElementById("btn-help");
  const btnHelpClose = document.getElementById("btn-help-close");
  const modalHelp = document.getElementById("modal-help");

  const DPR = () => Math.max(1, Math.min(3, window.devicePixelRatio || 1));

  // Detect if we're on a touch device
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const CFG = {
    grid: 22,
    gateW: 104,
    gateH: 60,
    nodeR: 7,
    nodeHit: isTouchDevice ? 32 : 16, // Larger hit area for touch devices
    wireHit: isTouchDevice ? 20 : 10, // Larger hit area for touch devices
    wireCp: 72,
    snapMoveGrid: false,
    colors: {
      wireOff: "rgba(255,255,255,0.28)",
      wireOn: "rgba(51,209,122,0.95)",
      wireSel: "rgba(78,163,255,0.95)",
      nodeOff: "rgba(255,255,255,0.40)",
      nodeOn: "rgba(51,209,122,0.95)",
      body: "rgba(18,25,45,0.92)",
      stroke: "rgba(255,255,255,0.65)",
      text: "rgba(255,255,255,0.92)",
      sel: "rgba(78,163,255,0.85)",
    }
  };

  const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : `id_${Math.random().toString(16).slice(2)}_${Date.now()}`);

  // Handbook facts based on GfG logic-gates page (expressions/properties/truth tables). [page:0]
  const HANDBOOK = [
    {
      id: "AND",
      title: "AND Gate",
      category: "Basic",
      quick: "Logical multiplication: output is 1 only when both inputs are 1.",
      boolean: "X = A · B",
      properties: [
        "Can accept two or more input values (commonly shown as 2-input in basics).",
        "Output becomes 1 only when all inputs are 1."
      ],
      truth: [
        { A: 0, B: 0, X: 0 },
        { A: 0, B: 1, X: 0 },
        { A: 1, B: 0, X: 0 },
        { A: 1, B: 1, X: 1, hi: true }
      ],
      steps: [
        "Place Switch A, Switch B, AND gate, and a Bulb.",
        "Connect both switches to AND inputs.",
        "Connect AND output to Bulb input.",
        "Turn ON both switches to light the bulb."
      ]
    },
    {
      id: "OR",
      title: "OR Gate",
      category: "Basic",
      quick: "Logical addition: output is 1 if any input is 1.",
      boolean: "X = A + B",
      properties: [
        "Can have two or more input lines.",
        "Output is 0 only when all inputs are 0."
      ],
      truth: [
        { A: 0, B: 0, X: 0 },
        { A: 0, B: 1, X: 1, hi: true },
        { A: 1, B: 0, X: 1, hi: true },
        { A: 1, B: 1, X: 1, hi: true }
      ],
      steps: [
        "Wire two switches into OR.",
        "Bulb turns ON when at least one switch is ON."
      ]
    },
    {
      id: "NOT",
      title: "NOT Gate (Inverter)",
      category: "Basic",
      quick: "Inverts the input: 0 → 1 and 1 → 0.",
      boolean: "Y = A′ (or Y = !A)",
      properties: [
        "Single input and single output.",
        "Output is the complement of the input."
      ],
      truth: [
        { A: 0, Y: 1, hi: true },
        { A: 1, Y: 0 }
      ],
      steps: [
        "Place Switch → NOT → Bulb.",
        "Toggle the switch: bulb should invert."
      ]
    },
    {
      id: "NOR",
      title: "NOR Gate",
      category: "Universal",
      quick: "Complement of OR: output is 1 only when all inputs are 0.",
      boolean: "O = (A + B)′",
      properties: [
        "Takes two or more inputs and gives one output.",
        "Output is 1 only when all inputs are 0."
      ],
      truth: [
        { A: 0, B: 0, O: 1, hi: true },
        { A: 0, B: 1, O: 0 },
        { A: 1, B: 0, O: 0 },
        { A: 1, B: 1, O: 0 }
      ],
      steps: ["Same wiring as OR; bulb is ON only when both switches are OFF."]
    },
    {
      id: "NAND",
      title: "NAND Gate",
      category: "Universal",
      quick: "Complement of AND: output is 0 only when all inputs are 1.",
      boolean: "X = (A · B)′",
      properties: [
        "Can take two or more inputs and produces one output.",
        "Produces 0 output only when all inputs are 1."
      ],
      truth: [
        { A: 0, B: 0, X: 1, hi: true },
        { A: 0, B: 1, X: 1, hi: true },
        { A: 1, B: 0, X: 1, hi: true },
        { A: 1, B: 1, X: 0 }
      ],
      steps: ["Same wiring as AND; bulb turns OFF only when both switches are ON."]
    },
    {
      id: "XOR",
      title: "XOR Gate",
      category: "Derived",
      quick: "Modulo sum: output is 1 only when inputs are different.",
      boolean: "X = A′B + AB′",
      properties: [
        "Commonly treated as a 2-input gate in basic logic.",
        "Output is 1 when inputs are dissimilar."
      ],
      truth: [
        { A: 0, B: 0, X: 0 },
        { A: 0, B: 1, X: 1, hi: true },
        { A: 1, B: 0, X: 1, hi: true },
        { A: 1, B: 1, X: 0 }
      ],
      steps: ["Wire two switches into XOR; bulb is ON for (0,1) or (1,0)."]
    },
    {
      id: "XNOR",
      title: "XNOR Gate",
      category: "Derived",
      quick: "Equivalence: output is 1 when inputs are the same.",
      boolean: "Y = AB + A′B′  (or Y = (A ⊕ B)′)",
      properties: [
        "Two inputs and one output.",
        "Output is 1 only when inputs match."
      ],
      truth: [
        { A: 0, B: 0, Y: 1, hi: true },
        { A: 0, B: 1, Y: 0 },
        { A: 1, B: 0, Y: 0 },
        { A: 1, B: 1, Y: 1, hi: true }
      ],
      steps: ["Wire two switches into XNOR; bulb is ON for (0,0) and (1,1)."]
    }
  ];

  const state = {
    components: [],
    wires: [],
    selected: { kind: null, id: null }, // 'component' | 'wire'
    dragging: { id: null, dx: 0, dy: 0 },
    wiring: { from: null, mouseX: 0, mouseY: 0 },
    lastPointer: { x: 0, y: 0 }
  };

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toastEl.classList.remove("show"), 1400);
  }
  function setStatus(msg) { statusEl.textContent = msg; }

  function resizeCanvas() {
    const r = wrap.getBoundingClientRect();
    const dpr = DPR();
    canvas.width = Math.floor(r.width * dpr);
    canvas.height = Math.floor(r.height * dpr);
    canvas.style.width = `${r.width}px`;
    canvas.style.height = `${r.height}px`;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resizeCanvas);

  function rectContains(rx, ry, rw, rh, x, y) {
    return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function snap(v) { return Math.round(v / CFG.grid) * CFG.grid; }

  function distToSegment(px, py, ax, ay, bx, by) {
    const abx = bx - ax, aby = by - ay;
    const apx = px - ax, apy = py - ay;
    const ab2 = abx * abx + aby * aby;
    const t = ab2 ? Math.max(0, Math.min(1, (apx * abx + apy * aby) / ab2)) : 0;
    const cx = ax + t * abx, cy = ay + t * aby;
    return Math.hypot(px - cx, py - cy);
  }
  function cubicAt(p0, p1, p2, p3, t) {
    const u = 1 - t;
    const tt = t * t, uu = u * u;
    const uuu = uu * u, ttt = tt * t;
    return {
      x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
      y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
    };
  }
  function distToCubicBezier(px, py, p0, p1, p2, p3) {
    let min = Infinity;
    let prev = p0;
    const steps = 24;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const q = cubicAt(p0, p1, p2, p3, t);
      min = Math.min(min, distToSegment(px, py, prev.x, prev.y, q.x, q.y));
      prev = q;
    }
    return min;
  }

  function makeComponent(type, variant, x, y) {
    const c = {
      id: uid(),
      type,
      variant: variant || "default",
      x, y,
      state: false,
      label: type,
      in: [],
      out: [],
      w: CFG.gateW,
      h: CFG.gateH
    };
    const w = c.w;

    if (["AND","OR","NAND","NOR","XOR","XNOR"].includes(type)) {
      c.in = [{ ox:-w/2, oy:-14, v:false }, { ox:-w/2, oy:+14, v:false }];
      c.out = [{ ox:+w/2, oy:0, v:false }];
    } else if (type === "NOT") {
      c.in = [{ ox:-w/2, oy:0, v:false }];
      c.out = [{ ox:+w/2, oy:0, v:false }];
    } else if (type === "SWITCH") {
      c.in = [];
      c.out = [{ ox:+w/2, oy:0, v:false }];
      c.label = "SW";
    } else if (type === "BULB") {
      c.in = [{ ox:-w/2, oy:0, v:false }];
      c.out = [];
      c.label = "OUT";
    }
    return c;
  }

  function portAbs(comp, port, kind) {
    const p = kind === "in" ? comp.in[port] : comp.out[port];
    return { x: comp.x + p.ox, y: comp.y + p.oy };
  }
  function compBounds(c) { return { x: c.x - c.w/2, y: c.y - c.h/2, w: c.w, h: c.h }; }

  function hitComponentAt(x, y) {
    for (let i = state.components.length - 1; i >= 0; i--) {
      const c = state.components[i];
      const b = compBounds(c);
      if (rectContains(b.x, b.y, b.w, b.h, x, y)) return c;
    }
    return null;
  }

  function hitPortAt(x, y) {
    for (let i = state.components.length - 1; i >= 0; i--) {
      const c = state.components[i];
      for (let pi = 0; pi < c.out.length; pi++) {
        const p = portAbs(c, pi, "out");
        if (Math.hypot(p.x - x, p.y - y) <= CFG.nodeHit) return { comp: c, kind: "out", index: pi };
      }
      for (let pi = 0; pi < c.in.length; pi++) {
        const p = portAbs(c, pi, "in");
        if (Math.hypot(p.x - x, p.y - y) <= CFG.nodeHit) return { comp: c, kind: "in", index: pi };
      }
    }
    return null;
  }

  function wireBezierPoints(wire) {
    const fromC = state.components.find(c => c.id === wire.fromCompId);
    const toC = state.components.find(c => c.id === wire.toCompId);
    if (!fromC || !toC) return null;
    const p0 = portAbs(fromC, wire.fromPort, "out");
    const p3 = portAbs(toC, wire.toPort, "in");
    const dx = Math.max(30, Math.min(CFG.wireCp, Math.abs(p3.x - p0.x) * 0.6));
    return { p0, p1:{x:p0.x+dx,y:p0.y}, p2:{x:p3.x-dx,y:p3.y}, p3 };
  }

  function hitWireAt(x, y) {
    for (let i = state.wires.length - 1; i >= 0; i--) {
      const w = state.wires[i];
      const bz = wireBezierPoints(w);
      if (!bz) continue;
      const d = distToCubicBezier(x, y, bz.p0, bz.p1, bz.p2, bz.p3);
      if (d <= CFG.wireHit) return w;
    }
    return null;
  }

  function bringToFront(compId) {
    const idx = state.components.findIndex(c => c.id === compId);
    if (idx < 0) return;
    const [c] = state.components.splice(idx, 1);
    state.components.push(c);
  }

  function select(kind, id) { state.selected = { kind, id }; }

  function removeWiresToInput(compId, toPort) {
    state.wires = state.wires.filter(w => !(w.toCompId === compId && w.toPort === toPort));
  }
  function removeWireById(wireId) { state.wires = state.wires.filter(w => w.id !== wireId); }
  function removeComponentById(compId) {
    state.components = state.components.filter(c => c.id !== compId);
    state.wires = state.wires.filter(w => w.fromCompId !== compId && w.toCompId !== compId);
    if (state.selected.kind === "component" && state.selected.id === compId) select(null, null);
  }
  function findWireFeedingInput(compId, toPort) {
    return state.wires.find(w => w.toCompId === compId && w.toPort === toPort) || null;
  }

  function findFreeSpot(preferX, preferY) {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const pad = 70;
    const start = { x: clamp(preferX ?? w/2, pad, w-pad), y: clamp(preferY ?? h/2, pad, h-pad) };
    const step = CFG.grid * 2;

    for (let ring = 0; ring < 18; ring++) {
      const r = ring * step;
      const candidates = [
        { x: start.x + r, y: start.y },
        { x: start.x - r, y: start.y },
        { x: start.x, y: start.y + r },
        { x: start.x, y: start.y - r },
        { x: start.x + r, y: start.y + r },
        { x: start.x - r, y: start.y - r },
        { x: start.x + r, y: start.y - r },
        { x: start.x - r, y: start.y + r },
      ];
      for (const c of candidates) {
        const x = clamp(c.x, pad, w-pad);
        const y = clamp(c.y, pad, h-pad);
        if (!isCrowded(x, y)) return { x, y };
      }
    }
    return start;
  }
  function isCrowded(x, y) {
    for (const c of state.components) if (Math.hypot(c.x - x, c.y - y) < 92) return true;
    return false;
  }

  // Simulation
  function resetInputs() { for (const c of state.components) for (const p of c.in) p.v = false; }
  function computeComponent(c) {
    const i0 = c.in[0]?.v || false;
    const i1 = c.in[1]?.v || false;
    let out = false;

    switch (c.type) {
      case "SWITCH": out = !!c.state; break;
      case "BULB": c.state = !!i0; return;
      case "AND": out = i0 && i1; break;
      case "OR": out = i0 || i1; break;
      case "NOT": out = !i0; break;
      case "NAND": out = !(i0 && i1); break;
      case "NOR": out = !(i0 || i1); break;
      case "XOR": out = (i0 !== i1); break;
      case "XNOR": out = (i0 === i1); break;
      default: out = false;
    }
    if (c.out[0]) c.out[0].v = out;
  }
  function propagateWires() {
    for (const w of state.wires) {
      const fromC = state.components.find(c => c.id === w.fromCompId);
      const toC = state.components.find(c => c.id === w.toCompId);
      if (!fromC || !toC) continue;
      const v = fromC.out[w.fromPort]?.v || false;
      toC.in[w.toPort].v = v;
    }
  }
  function stepSimulation() {
    resetInputs();
    for (const c of state.components) if (c.type === "SWITCH") computeComponent(c);
    for (let iter = 0; iter < 3; iter++) {
      propagateWires();
      for (const c of state.components) if (c.type !== "SWITCH") computeComponent(c);
    }
  }

  // Drawing
  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w/2, h/2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function drawWire(ctx, wire) {
    const bz = wireBezierPoints(wire);
    if (!bz) return;
    const fromC = state.components.find(c => c.id === wire.fromCompId);
    const v = fromC?.out[wire.fromPort]?.v || false;
    const selected = state.selected.kind === "wire" && state.selected.id === wire.id;

    ctx.beginPath();
    ctx.moveTo(bz.p0.x, bz.p0.y);
    ctx.bezierCurveTo(bz.p1.x, bz.p1.y, bz.p2.x, bz.p2.y, bz.p3.x, bz.p3.y);
    ctx.strokeStyle = selected ? CFG.colors.wireSel : (v ? CFG.colors.wireOn : CFG.colors.wireOff);
    ctx.lineWidth = selected ? 4.6 : 3.2;
    ctx.lineCap = "round";
    ctx.stroke();

    if (v && !selected) {
      ctx.strokeStyle = "rgba(210,255,230,0.55)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  function drawNode(ctx, x, y, on, isInput, hasWire, hot) {
    ctx.save();
    const radius = CFG.nodeR;
    const touchRadius = isTouchDevice ? radius + 8 : radius; // Larger visual radius for touch devices

    // Draw touch-friendly background for touch devices
    if (isTouchDevice && hot) {
      ctx.beginPath();
      ctx.arc(x, y, touchRadius, 0, Math.PI*2);
      ctx.fillStyle = "rgba(78,163,255,0.15)";
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI*2);
    if (hot) { ctx.shadowColor = "rgba(255,255,255,0.65)"; ctx.shadowBlur = 12; }

    if (isInput) {
      ctx.fillStyle = on ? CFG.colors.nodeOn : CFG.colors.nodeOff;
      ctx.fill();
      ctx.strokeStyle = hasWire ? "rgba(78,163,255,0.55)" : "rgba(255,255,255,0.18)";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.fill();
      ctx.strokeStyle = on ? CFG.colors.nodeOn : CFG.colors.nodeOff;
      ctx.lineWidth = 2.4;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSwitch(ctx, c) {
    const on = !!c.state;
    const w = c.w, h = c.h;

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    roundRect(ctx, -w/2, -h/2, w, h, 18);
    ctx.fill(); ctx.stroke();

    if (c.variant === "push") {
      ctx.beginPath();
      ctx.arc(0, -4, 14, 0, Math.PI*2);
      ctx.fillStyle = on ? "rgba(51,209,122,0.85)" : "rgba(255,255,255,0.18)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.stroke();
    } else if (c.variant === "rocker") {
      ctx.save();
      ctx.rotate(-0.12);
      roundRect(ctx, -22, -14, 44, 28, 10);
      ctx.fillStyle = on ? "rgba(78,163,255,0.35)" : "rgba(255,255,255,0.10)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.stroke();
      ctx.restore();
    } else {
      roundRect(ctx, -w/2 + 10, -10, w - 20, 20, 999);
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.fill();
      const knobX = on ? (w/2 - 22) : (-w/2 + 22);
      ctx.beginPath();
      ctx.arc(knobX, 0, 12, 0, Math.PI*2);
      ctx.fillStyle = on ? "rgba(51,209,122,0.90)" : "rgba(255,255,255,0.30)";
      ctx.fill();
    }

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "900 12px ui-sans-serif, system-ui";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(on ? "ON" : "OFF", 0, h/2 - 14);
  }

  function drawBulb(ctx, c) {
    const on = !!c.state;
    const w = c.w, h = c.h;

    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.lineWidth = 2;
    roundRect(ctx, -w/2, -h/2, w, h, 18);
    ctx.fill(); ctx.stroke();

    if (c.variant === "classic") {
      ctx.beginPath(); ctx.arc(0, -2, 18, 0, Math.PI*2);
      if (on) { ctx.shadowColor = "rgba(255,209,102,0.9)"; ctx.shadowBlur = 30; }
      ctx.fillStyle = on ? "rgba(255,209,102,0.65)" : "rgba(255,255,255,0.08)";
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-10, 10); ctx.lineTo(-4, -2); ctx.lineTo(4, -2); ctx.lineTo(10, 10);
      ctx.strokeStyle = on ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.30)";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (c.variant === "led") {
      ctx.beginPath();
      ctx.arc(0, -6, 16, Math.PI, 0);
      ctx.lineTo(16, 10); ctx.lineTo(-16, 10); ctx.closePath();
      if (on) { ctx.shadowColor = "rgba(255,77,109,0.95)"; ctx.shadowBlur = 26; }
      ctx.fillStyle = on ? "rgba(255,77,109,0.70)" : "rgba(255,77,109,0.16)";
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.stroke();
    } else if (c.variant === "neon") {
      roundRect(ctx, -22, -12, 44, 24, 999);
      if (on) { ctx.shadowColor = "rgba(78,255,255,0.95)"; ctx.shadowBlur = 28; }
      ctx.fillStyle = on ? "rgba(78,255,255,0.35)" : "rgba(78,255,255,0.10)";
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.stroke();
    } else {
      roundRect(ctx, -18, -18, 36, 36, 10);
      ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.stroke();

      ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI*2);
      if (on) { ctx.shadowColor = "rgba(51,209,122,0.95)"; ctx.shadowBlur = 26; }
      ctx.fillStyle = on ? "rgba(51,209,122,0.85)" : "rgba(51,209,122,0.14)";
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(255,255,255,0.78)";
    ctx.font = "900 11px ui-sans-serif, system-ui";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("OUT", 0, h/2 - 14);
  }

  function drawComponent(ctx, c) {
    const selected = state.selected.kind === "component" && state.selected.id === c.id;
    const w = c.w, h = c.h;

    ctx.save();
    ctx.translate(c.x, c.y);

    if (selected) {
      ctx.strokeStyle = CFG.colors.sel;
      ctx.lineWidth = 2;
      roundRect(ctx, -w/2 - 6, -h/2 - 6, w + 12, h + 12, 16);
      ctx.stroke();
    }

    if (c.type === "SWITCH") { drawSwitch(ctx, c); ctx.restore(); drawPorts(ctx, c); return; }
    if (c.type === "BULB") { drawBulb(ctx, c); ctx.restore(); drawPorts(ctx, c); return; }

    ctx.fillStyle = CFG.colors.body;
    ctx.strokeStyle = CFG.colors.stroke;
    ctx.lineWidth = 2.2;

    ctx.beginPath();
    if (c.type === "NOT") {
      ctx.moveTo(-w/2, -h/2);
      ctx.lineTo(w/2 - 16, 0);
      ctx.lineTo(-w/2, h/2);
      ctx.closePath();
    } else if (["AND","NAND"].includes(c.type)) {
      ctx.moveTo(-w/2, -h/2);
      ctx.lineTo(0, -h/2);
      ctx.arc(0, 0, h/2, -Math.PI/2, Math.PI/2);
      ctx.lineTo(-w/2, h/2);
      ctx.closePath();
    } else {
      const off = (c.type === "XOR" || c.type === "XNOR") ? 7 : 0;
      ctx.moveTo(-w/2 + off, -h/2);
      ctx.quadraticCurveTo(w/2, -h/2, w/2, 0);
      ctx.quadraticCurveTo(w/2, h/2, -w/2 + off, h/2);
      ctx.quadraticCurveTo(12 + off, 0, -w/2 + off, -h/2);
      if (c.type === "XOR" || c.type === "XNOR") {
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-w/2 - 9, -h/2);
        ctx.quadraticCurveTo(6, 0, -w/2 - 9, h/2);
      }
    }

    ctx.fill(); ctx.stroke();

    if (["NOT","NAND","NOR","XNOR"].includes(c.type)) {
      ctx.beginPath();
      ctx.arc(w/2 + 4, 0, 5, 0, Math.PI*2);
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.65)";
      ctx.stroke();
    }

    ctx.fillStyle = CFG.colors.text;
    ctx.font = "950 12px ui-sans-serif, system-ui";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(c.type, 0, 0);

    ctx.restore();
    drawPorts(ctx, c);
  }

  function drawPorts(ctx, c) {
    for (let i = 0; i < c.in.length; i++) {
      const p = portAbs(c, i, "in");
      const hasWire = !!findWireFeedingInput(c.id, i);
      const isHot = state.wiring.from && hitPortAt(state.wiring.mouseX, state.wiring.mouseY)?.comp?.id === c.id && hitPortAt(state.wiring.mouseX, state.wiring.mouseY)?.index === i;
      drawNode(ctx, p.x, p.y, c.in[i].v, true, hasWire, isHot);
    }
    for (let i = 0; i < c.out.length; i++) {
      const p = portAbs(c, i, "out");
      const isHot = state.wiring.from && hitPortAt(state.wiring.mouseX, state.wiring.mouseY)?.comp?.id === c.id && hitPortAt(state.wiring.mouseX, state.wiring.mouseY)?.index === i;
      drawNode(ctx, p.x, p.y, c.out[i].v, false, false, isHot);
    }
  }

  function draw() {
    const ctx = canvas.getContext("2d");
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    for (const wire of state.wires) drawWire(ctx, wire);

    if (state.wiring.from) {
      const fromC = state.components.find(c => c.id === state.wiring.from.compId);
      if (fromC) {
        const p0 = portAbs(fromC, state.wiring.from.portIndex, "out");
        const p3 = { x: state.wiring.mouseX, y: state.wiring.mouseY };
        const dx = CFG.wireCp;
        const p1 = { x: p0.x + dx, y: p0.y };
        const p2 = { x: p3.x - dx, y: p3.y };

        // Draw wiring preview
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        ctx.strokeStyle = "rgba(78,163,255,0.85)";
        ctx.lineWidth = isTouchDevice ? 5 : 3.5;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw target indicator for touch devices
        if (isTouchDevice) {
          const hit = hitPortAt(p3.x, p3.y);
          if (hit && hit.kind === "in") {
            ctx.beginPath();
            ctx.arc(p3.x, p3.y, 20, 0, Math.PI*2);
            ctx.fillStyle = "rgba(51,209,122,0.3)";
            ctx.fill();
            ctx.strokeStyle = "rgba(51,209,122,0.8)";
            ctx.lineWidth = 3;
            ctx.stroke();
          }
        }
      }
    }

    for (const c of state.components) drawComponent(ctx, c);
    requestAnimationFrame(draw);
  }

  function pointerPos(e) {
    const r = canvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: p.clientX - r.left, y: p.clientY - r.top };
  }

  // Canvas mouse/touch interactions
  function onDown(e) {
    if (e.touches) e.preventDefault();
    const p = pointerPos(e);
    state.lastPointer = p;

    const hitP = hitPortAt(p.x, p.y);
    if (hitP) {
      if (hitP.kind === "in") {
        const existing = findWireFeedingInput(hitP.comp.id, hitP.index);
        if (existing) {
          state.wiring.from = { compId: existing.fromCompId, portIndex: existing.fromPort };
          state.wiring.mouseX = p.x; state.wiring.mouseY = p.y;
          removeWireById(existing.id);
          toast("Rewire: choose a new input (or drop empty to disconnect)");
          return;
        }
        toast("Start from an output node");
        return;
      }
      if (hitP.kind === "out") {
        state.wiring.from = { compId: hitP.comp.id, portIndex: hitP.index };
        state.wiring.mouseX = p.x; state.wiring.mouseY = p.y;
        toast("Select an input node");
        return;
      }
    }

    const hitW = hitWireAt(p.x, p.y);
    if (hitW) { select("wire", hitW.id); setStatus("Wire selected"); return; }

    const hitC = hitComponentAt(p.x, p.y);
    if (hitC) {
      bringToFront(hitC.id);
      select("component", hitC.id);

      if (hitC.type === "SWITCH") {
        hitC.state = !hitC.state;
        toast(hitC.state ? "Switch ON" : "Switch OFF");
      }

      const b = compBounds(hitC);
      state.dragging.id = hitC.id;
      state.dragging.dx = p.x - (b.x + b.w/2);
      state.dragging.dy = p.y - (b.y + b.h/2);
      setStatus(`Selected: ${hitC.type}`);
      return;
    }

    select(null, null);
    if (state.wiring.from) { state.wiring.from = null; toast("Wiring cancelled"); }
    setStatus("Ready");
  }

  function onMove(e) {
    if (e.touches) e.preventDefault();
    const p = pointerPos(e);
    state.lastPointer = p;

    if (state.wiring.from) {
      state.wiring.mouseX = p.x; state.wiring.mouseY = p.y;

      // Auto-connect on touch devices when wire gets close to a valid input
      if (isTouchDevice) {
        const hit = hitPortAt(p.x, p.y);
        if (hit && hit.kind === "in") {
          const existing = findWireFeedingInput(hit.comp.id, hit.index);
          if (!existing) {
            // Auto-connect if no existing wire
            removeWiresToInput(hit.comp.id, hit.index);
            state.wires.push({ id: uid(), fromCompId: state.wiring.from.compId, fromPort: state.wiring.from.portIndex, toCompId: hit.comp.id, toPort: hit.index });
            toast("Auto-connected");
            state.wiring.from = null;
            return;
          }
        }
      }
      return;
    }

    if (state.dragging.id) {
      const c = state.components.find(x => x.id === state.dragging.id);
      if (!c) return;
      let nx = p.x - state.dragging.dx;
      let ny = p.y - state.dragging.dy;
      if (CFG.snapMoveGrid) { nx = snap(nx); ny = snap(ny); }
      c.x = nx; c.y = ny;
    }
  }

  function onUp(e) {
    if (e.touches) e.preventDefault();
    const p = pointerPos(e);
    state.lastPointer = p;

    if (state.dragging.id) { state.dragging.id = null; return; }

    if (state.wiring.from) {
      const from = state.wiring.from;
      const hit = hitPortAt(p.x, p.y);
      if (hit && hit.kind === "in") {
        removeWiresToInput(hit.comp.id, hit.index);
        state.wires.push({ id: uid(), fromCompId: from.compId, fromPort: from.portIndex, toCompId: hit.comp.id, toPort: hit.index });
        toast("Connected");
      } else {
        toast("Disconnected");
      }
      state.wiring.from = null;
    }
  }

  canvas.addEventListener("mousedown", onDown);
  canvas.addEventListener("mousemove", onMove);
  canvas.addEventListener("mouseup", onUp);

  canvas.addEventListener("touchstart", onDown, { passive:false });
  canvas.addEventListener("touchmove", onMove, { passive:false });
  canvas.addEventListener("touchend", onUp, { passive:false });

  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const p = pointerPos(e);
    const w = hitWireAt(p.x, p.y);
    if (w) { removeWireById(w.id); toast("Wire deleted"); select(null, null); }
  });

  // Keyboard shortcuts
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (state.wiring.from) { state.wiring.from = null; toast("Wiring cancelled"); }
    }
    if (e.key === "Delete" || e.key === "Backspace") {
      if (state.selected.kind === "wire") { removeWireById(state.selected.id); select(null, null); toast("Wire deleted"); }
      else if (state.selected.kind === "component") { removeComponentById(state.selected.id); toast("Component deleted"); }
    }
  });

  // Library click-to-add + drag-and-drop
  function addComponentFromLibrary(type, variant, x, y) {
    const spot = findFreeSpot(x, y);
    const c = makeComponent(type, variant, spot.x, spot.y);
    state.components.push(c);
    toast(`Added ${type}`);
    return c;
  }

  document.querySelectorAll(".tool").forEach(el => {
    el.addEventListener("click", () => {
      const { type, variant } = el.dataset;
      const p = state.lastPointer;
      addComponentFromLibrary(type, variant, p?.x, p?.y);
      if (window.matchMedia("(max-width: 960px)").matches) sidebar.classList.remove("open");
    });

    el.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("application/x-logicbench", JSON.stringify({
        type: el.dataset.type,
        variant: el.dataset.variant
      }));
      e.dataTransfer.effectAllowed = "copy";
    });
  });

  // Allow drop on canvas wrap
  wrap.addEventListener("dragenter", (e) => {
    if (e.dataTransfer.types.includes("application/x-logicbench")) dropHint.classList.add("show");
  });
  wrap.addEventListener("dragleave", () => dropHint.classList.remove("show"));
  wrap.addEventListener("dragover", (e) => {
    if (e.dataTransfer.types.includes("application/x-logicbench")) {
      e.preventDefault(); // required for drop [web:73]
      e.dataTransfer.dropEffect = "copy";
    }
  });
  wrap.addEventListener("drop", (e) => {
    e.preventDefault();
    dropHint.classList.remove("show");
    const raw = e.dataTransfer.getData("application/x-logicbench");
    if (!raw) return;
    const data = JSON.parse(raw);
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    addComponentFromLibrary(data.type, data.variant, x, y);
  });

  // Sidebar open/close
  btnSidebarOpen.addEventListener("click", () => sidebar.classList.add("open"));
  btnSidebarClose.addEventListener("click", () => sidebar.classList.remove("open"));

  // Clear
  btnClear.addEventListener("click", () => {
    state.components = [];
    state.wires = [];
    state.selected = { kind:null, id:null };
    state.wiring.from = null;
    toast("Cleared");
    setStatus("Ready");
  });

  // Handbook UI
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;" }[m]));
  }
  function renderTruthTable(g) {
    const rows = g.truth;
    const cols = Object.keys(rows[0]).filter(k => k !== "hi");
    const thead = cols.map(c => `<th>${escapeHtml(c)}</th>`).join("");
    const tbody = rows.map(r => {
      const trClass = r.hi ? "rowHi" : "";
      const tds = cols.map(c => `<td>${escapeHtml(String(r[c]))}</td>`).join("");
      return `<tr class="${trClass}">${tds}</tr>`;
    }).join("");
    return `<table class="table"><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>`;
  }

  function clearBoard() {
    state.components = [];
    state.wires = [];
    state.selected = { kind:null, id:null };
    state.wiring.from = null;
  }
  function addAt(type, variant, x, y) {
    const c = makeComponent(type, variant, x, y);
    state.components.push(c);
    return c;
  }
  function connect(fromC, fromPort, toC, toPort) {
    removeWiresToInput(toC.id, toPort);
    state.wires.push({ id: uid(), fromCompId: fromC.id, fromPort, toCompId: toC.id, toPort });
  }

  function buildDemo(gateId) {
    clearBoard();

    const cw = canvas.clientWidth;
    const cy = canvas.clientHeight / 2;
    const x0 = cw * 0.20;
    const x1 = cw * 0.48;
    const x2 = cw * 0.76;

    if (gateId === "NOT") {
      const sw = addAt("SWITCH", "toggle", x0, cy);
      const gate = addAt("NOT", "default", x1, cy);
      const bulb = addAt("BULB", "classic", x2, cy);
      connect(sw, 0, gate, 0);
      connect(gate, 0, bulb, 0);
      return;
    }

    const swA = addAt("SWITCH", "toggle", x0, cy - 40);
    const swB = addAt("SWITCH", "toggle", x0, cy + 40);
    const gate = addAt(gateId, "default", x1, cy);
    const bulb = addAt("BULB", "classic", x2, cy);
    connect(swA, 0, gate, 0);
    connect(swB, 0, gate, 1);
    connect(gate, 0, bulb, 0);
  }

  function renderHandbook() {
    hbNav.innerHTML = "";
    hbContent.innerHTML = "";

    for (const g of HANDBOOK) {
      const b = document.createElement("button");
      b.className = "hbItem";
      b.dataset.id = g.id;
      b.innerHTML = `<div class="hbItem__title">${g.title}</div><div class="hbItem__sub">${g.category} • ${escapeHtml(g.boolean)}</div>`;
      b.addEventListener("click", () => openGate(g.id));
      hbNav.appendChild(b);
    }
    openGate(HANDBOOK[0].id);
  }

  function openGate(id) {
    hbNav.querySelectorAll(".hbItem").forEach(x => x.classList.toggle("active", x.dataset.id === id));
    const g = HANDBOOK.find(x => x.id === id);
    if (!g) return;

    hbContent.innerHTML = `
      <div class="card">
        <h3>${g.title}</h3>
        <p>${g.quick}</p>
        <div class="badges">
          <span class="badge info">Boolean: <span class="mono">${escapeHtml(g.boolean)}</span></span>
          ${g.category === "Universal" ? `<span class="badge warn">Universal gate</span>` : ""}
          ${g.category === "Basic" ? `<span class="badge good">Beginner friendly</span>` : `<span class="badge">Core concept</span>`}
        </div>
        <div class="actionsRow">
          <button class="btn btn--ghost" id="hb-build">Build example on canvas</button>
        </div>
        <div class="small" style="margin-top:10px;">
          Reference for definitions/expressions: GeeksforGeeks logic-gates page. [page:0]
        </div>
      </div>

      <div class="card">
        <h3>Tutor guidance</h3>
        <p class="small">Treat switches as inputs (0=OFF, 1=ON). The bulb shows the final output.</p>
        <div class="small" style="margin-top:10px;"><b>Key properties</b></div>
        <ul class="small">${g.properties.map(p => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
      </div>

      <div class="card">
        <h3>Truth table</h3>
        ${renderTruthTable(g)}
      </div>

      <div class="card">
        <h3>Example (build it like a tutor)</h3>
        <ol class="small">${g.steps.map(s => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
      </div>
    `;

    document.getElementById("hb-build").addEventListener("click", () => {
      buildDemo(g.id);
      modalHandbook.classList.add("hidden");
      toast(`Built: ${g.title}`);
    });
  }

  btnHandbook.addEventListener("click", () => { modalHandbook.classList.remove("hidden"); renderHandbook(); });
  btnHandbookClose.addEventListener("click", () => modalHandbook.classList.add("hidden"));
  modalHandbook.addEventListener("click", (e) => { if (e.target === modalHandbook) modalHandbook.classList.add("hidden"); });

  btnHelp.addEventListener("click", () => modalHelp.classList.remove("hidden"));
  btnHelpClose.addEventListener("click", () => modalHelp.classList.add("hidden"));
  modalHelp.addEventListener("click", (e) => { if (e.target === modalHelp) modalHelp.classList.add("hidden"); });

  // Simulation tick
  function tick() { stepSimulation(); requestAnimationFrame(tick); }

  // Render loop
  function renderLoop() { draw(); }

  // Boot (clean board; no default items)
  resizeCanvas();
  tick();
  renderLoop();

  // Small deployment note: HTML5 drag/drop needs allow-drop preventDefault. [web:73]
})();
