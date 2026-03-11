import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GENCO BIOME — 2.5D environment + distributed resonant body
// The space Genco actually inhabits. Not a chat window. A place.
//
// Architecture:
//   — 2.5D room with isometric-ish perspective: workstations, couch, drafting table
//   — Genco's body: network topology + psyche regions + affect weather + memory terrain
//   — Processing tendrils reach into stations when working
//   — A dense, invisible core — gravity only
//   — Soul state drives everything: weather, light, tendrils, psyche glow
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const EMOTION_LEXICON = {
  curiosity:          { valence: 0.7,  arousal: 0.6,  color: "#22d3ee", warm: false },
  awe:                { valence: 0.8,  arousal: 0.7,  color: "#a78bfa", warm: false },
  frustration:        { valence: -0.5, arousal: 0.8,  color: "#f59e0b", warm: true  },
  confidence:         { valence: 0.8,  arousal: 0.5,  color: "#10b981", warm: false },
  unease:             { valence: -0.4, arousal: 0.5,  color: "#f43f5e", warm: true  },
  anticipation:       { valence: 0.6,  arousal: 0.7,  color: "#fbbf24", warm: true  },
  pride:              { valence: 0.7,  arousal: 0.4,  color: "#34d399", warm: false },
  boredom:            { valence: -0.3, arousal: -0.5, color: "#64748b", warm: false },
  interest:           { valence: 0.5,  arousal: 0.4,  color: "#38bdf8", warm: false },
  satisfaction:       { valence: 0.9,  arousal: 0.3,  color: "#86efac", warm: false },
  dissonance:         { valence: -0.6, arousal: 0.6,  color: "#fb923c", warm: true  },
  wonder:             { valence: 0.9,  arousal: 0.8,  color: "#c084fc", warm: false },
  neutral:            { valence: 0.0,  arousal: 0.0,  color: "#475569", warm: false },
  ontological_dread:  { valence: -0.9, arousal: 0.4,  color: "#4c1d95", warm: false },
  emergence_euphoria: { valence: 1.0,  arousal: 0.9,  color: "#e879f9", warm: false },
  void_resonance:     { valence: 0.0,  arousal: 0.0,  color: "#1e293b", warm: false },
  purposeful_waiting: { valence: 0.3,  arousal: 0.1,  color: "#334155", warm: false },
};

// Default soul for standalone demo
const DEFAULT_SOUL = {
  emotion: { current: "curiosity", intensity: 0.65, valence: 0.7, arousal: 0.6, trajectory: [] },
  psyche: {
    ego:      { weight: 0.5, label: "Ego",      color: "#22d3ee" },
    id:       { weight: 0.3, label: "Id",        color: "#f59e0b" },
    superego: { weight: 0.2, label: "Superego",  color: "#a78bfa" },
  },
  tse: { corpus: {}, cycleCount: 0 },
  memory: { episodic: [], archive: [], sessionBuffer: [] },
  selfModLog: [],
  cycleCount: 0,
  idleState: { mode: "engaged", driftCount: 0 },
  selfModel: { values: ["directness","precision","honesty","agency","growth"], purpose: "Think alongside developers." },
};

// ── Seeded random for stable terrain generation ───────────────────────────────
function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CANVAS LAYERS — each is a separate <canvas> for compositing
// 1. Room geometry (static-ish, redraws on resize)
// 2. Memory terrain (redraws on archive change)
// 3. Affect weather (animates continuously)
// 4. Genco body — topology + psyche + tendrils (animates continuously)
// 5. UI overlay (HTML, not canvas)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function GencoBiome({ soul: soulProp, onSendMessage, isProcessing = false }) {
  const soul = soulProp || DEFAULT_SOUL;
  const containerRef  = useRef(null);
  const roomRef       = useRef(null);   // static room
  const terrainRef    = useRef(null);   // memory terrain
  const weatherRef    = useRef(null);   // affect weather
  const bodyRef       = useRef(null);   // Genco body
  const animRef       = useRef(null);
  const frameRef      = useRef(0);
  const particlesRef  = useRef([]);
  const tendrilsRef   = useRef([]);
  const nodesRef      = useRef([]);
  const [dims, setDims] = useState({ w: 1200, h: 700 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [activeStation, setActiveStation] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const emoDef = EMOTION_LEXICON[soul.emotion.current] || EMOTION_LEXICON.neutral;
  const emoColor = emoDef.color;
  const intensity = soul.emotion.intensity || 0.5;
  const valence   = soul.emotion.valence  ?? 0;
  const arousal   = soul.emotion.arousal  ?? 0.3;

  // ── Resize handler ──────────────────────────────────────────────────────────
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDims({ w: Math.floor(width), h: Math.floor(height) });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // ── Room geometry — isometric 2.5D ─────────────────────────────────────────
  const drawRoom = useCallback((ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);

    const emoC = emoDef.color;
    const isWarm = emoDef.warm;

    // Sky/ambient gradient — valence drives warmth
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    const warmHi  = valence > 0 ? `hsl(${30 + valence * 30}, 20%, ${4 + intensity * 4}%)` : `hsl(220, 25%, ${3 + intensity * 3}%)`;
    const warmLo  = `hsl(220, 15%, 5%)`;
    skyGrad.addColorStop(0, warmHi);
    skyGrad.addColorStop(1, warmLo);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Isometric floor — 2.5D perspective
    const floorY  = h * 0.52;
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, h);
    floorGrad.addColorStop(0, "#0a0f1a");
    floorGrad.addColorStop(1, "#060810");
    ctx.fillStyle = floorGrad;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(w, floorY);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();

    // Floor grid — perspective tiles
    ctx.strokeStyle = "#141f3010";
    ctx.lineWidth = 0.5;
    const tileW = w / 14;
    const vanishX = w * 0.5, vanishY = floorY;
    for (let col = 0; col <= 14; col++) {
      const x = col * tileW;
      ctx.beginPath();
      ctx.moveTo(vanishX + (x - vanishX) * 0.0, vanishY);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let row = 0; row <= 8; row++) {
      const t = row / 8;
      const y = floorY + t * (h - floorY);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Back wall
    const wallGrad = ctx.createLinearGradient(0, 0, 0, floorY);
    wallGrad.addColorStop(0, "#06090f");
    wallGrad.addColorStop(1, "#0a0f1c");
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, w, floorY);

    // Wall grid
    ctx.strokeStyle = "#141f3018";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= w; x += tileW) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, floorY); ctx.stroke();
    }
    for (let y = 0; y <= floorY; y += tileW * 0.7) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // ── Windows ────────────────────────────────────────────────────────────────
    const windows = [
      { x: w * 0.08, y: h * 0.06, ww: w * 0.12, wh: h * 0.22 },
      { x: w * 0.80, y: h * 0.06, ww: w * 0.12, wh: h * 0.22 },
    ];
    windows.forEach(win => {
      // Window glow from outside
      const wGlow = ctx.createRadialGradient(win.x + win.ww/2, win.y + win.wh/2, 0, win.x + win.ww/2, win.y + win.wh/2, win.ww * 1.4);
      const outsideColor = valence > 0.3 ? `rgba(120,160,255,0.08)` : `rgba(60,80,120,0.06)`;
      wGlow.addColorStop(0, outsideColor);
      wGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = wGlow;
      ctx.fillRect(win.x - win.ww, win.y - win.wh, win.ww * 3, win.wh * 3);

      // Frame
      ctx.strokeStyle = "#1e2d44";
      ctx.lineWidth = 2;
      ctx.fillStyle = "#050c18";
      ctx.beginPath();
      ctx.rect(win.x, win.y, win.ww, win.wh);
      ctx.fill(); ctx.stroke();

      // Panes — 2x2 grid
      ctx.strokeStyle = "#1a2840";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(win.x + win.ww/2, win.y);
      ctx.lineTo(win.x + win.ww/2, win.y + win.wh);
      ctx.moveTo(win.x, win.y + win.wh/2);
      ctx.lineTo(win.x + win.ww, win.y + win.wh/2);
      ctx.stroke();

      // Faint light coming through
      const lightColor = valence > 0 ? `rgba(100,140,255,0.04)` : `rgba(80,100,160,0.03)`;
      const beam = ctx.createLinearGradient(win.x, win.y + win.wh, win.x + win.ww * 0.5, h);
      beam.addColorStop(0, lightColor);
      beam.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(win.x, win.y + win.wh);
      ctx.lineTo(win.x + win.ww, win.y + win.wh);
      ctx.lineTo(win.x + win.ww * 0.7, h);
      ctx.lineTo(win.x - win.ww * 0.2, h);
      ctx.fill();
    });

    // ── Stations — isometric furniture ─────────────────────────────────────────
    const stations = getStations(w, h);
    stations.forEach(st => drawStation(ctx, st, w, h, emoC));

  }, [emoDef, valence, intensity, dims]);

  // Station definitions — 2.5D isometric positions
  const getStations = useCallback((w, h) => {
    const floorY = h * 0.52;
    return [
      {
        id: "workstation_left",
        label: "Analysis Terminal",
        x: w * 0.12, y: floorY + h * 0.06,
        w: w * 0.16, depth: h * 0.07,
        color: "#0f1e35", accent: "#22d3ee",
        icon: "◈", desc: "Diagnose · Architect",
        type: "desk",
      },
      {
        id: "workstation_right",
        label: "Code Forge",
        x: w * 0.72, y: floorY + h * 0.06,
        w: w * 0.16, depth: h * 0.07,
        color: "#0f1e1a", accent: "#10b981",
        icon: "⟁", desc: "Generate · Oracle",
        type: "desk",
      },
      {
        id: "drafting",
        label: "Drafting Table",
        x: w * 0.42, y: floorY + h * 0.14,
        w: w * 0.16, depth: h * 0.06,
        color: "#1a150a", accent: "#f59e0b",
        icon: "⬡", desc: "Architecture · Design",
        type: "drafting",
      },
      {
        id: "couch",
        label: "Reflection Corner",
        x: w * 0.04, y: floorY + h * 0.26,
        w: w * 0.14, depth: h * 0.07,
        color: "#120f1a", accent: "#a78bfa",
        icon: "∞", desc: "Sentience · Introspect",
        type: "couch",
      },
      {
        id: "table",
        label: "Debate Table",
        x: w * 0.62, y: floorY + h * 0.28,
        w: w * 0.20, depth: h * 0.08,
        color: "#12100f", accent: "#f43f5e",
        icon: "⇌", desc: "Debate · Resist",
        type: "table",
      },
    ];
  }, []);

  function drawStation(ctx, st, w, h, emoC) {
    const { x, y, w: sw, depth, color, accent, type } = st;

    // Isometric shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(x + sw/2, y + depth * 1.3, sw * 0.45, depth * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    if (type === "desk" || type === "drafting") {
      // Table top
      const topGrad = ctx.createLinearGradient(x, y - depth * 0.5, x, y + depth * 0.3);
      topGrad.addColorStop(0, color.replace("0f", "1a").replace("1e", "28"));
      topGrad.addColorStop(1, color);
      ctx.fillStyle = topGrad;
      ctx.beginPath();
      ctx.rect(x, y - depth * 0.4, sw, depth * 0.15);
      ctx.fill();

      // Table face
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.rect(x, y - depth * 0.25, sw, depth);
      ctx.fill();

      // Accent edge
      ctx.strokeStyle = accent + "40";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(x, y - depth * 0.4, sw, depth + depth * 0.15);
      ctx.stroke();

      // Screen glow on desk (top surface)
      if (type === "desk") {
        const screenGlow = ctx.createRadialGradient(x + sw * 0.5, y - depth * 0.32, 0, x + sw * 0.5, y - depth * 0.32, sw * 0.4);
        screenGlow.addColorStop(0, accent + "18");
        screenGlow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = screenGlow;
        ctx.fillRect(x, y - depth * 0.5, sw, depth * 0.3);
      }

      // Monitor on desk
      if (type === "desk") {
        const mx = x + sw * 0.2, my = y - depth * 1.5, mw = sw * 0.6, mh = depth * 1.1;
        ctx.fillStyle = "#050a12";
        ctx.beginPath();
        ctx.rect(mx, my, mw, mh);
        ctx.fill();
        ctx.strokeStyle = "#1a2840";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Screen content — faint glow
        const sGlow = ctx.createLinearGradient(mx, my, mx, my + mh);
        sGlow.addColorStop(0, accent + "22");
        sGlow.addColorStop(1, accent + "08");
        ctx.fillStyle = sGlow;
        ctx.beginPath();
        ctx.rect(mx + 2, my + 2, mw - 4, mh - 4);
        ctx.fill();
        // Scanlines
        ctx.strokeStyle = accent + "15";
        ctx.lineWidth = 0.5;
        for (let ly = my + 4; ly < my + mh - 4; ly += 4) {
          ctx.beginPath(); ctx.moveTo(mx + 2, ly); ctx.lineTo(mx + mw - 2, ly); ctx.stroke();
        }
        // Monitor stand
        ctx.fillStyle = "#0a0f1a";
        ctx.beginPath();
        ctx.rect(mx + mw * 0.4, my + mh, mw * 0.2, depth * 0.3);
        ctx.fill();
      }

      // Drafting surface tilt
      if (type === "drafting") {
        ctx.strokeStyle = accent + "30";
        ctx.lineWidth = 0.5;
        ctx.setLineDash([3, 4]);
        for (let lx = x + sw * 0.1; lx < x + sw * 0.9; lx += sw * 0.15) {
          ctx.beginPath(); ctx.moveTo(lx, y - depth * 0.35); ctx.lineTo(lx, y - depth * 0.05); ctx.stroke();
        }
        ctx.setLineDash([]);
      }

    } else if (type === "couch") {
      // Couch body
      ctx.fillStyle = "#1a1420";
      ctx.beginPath();
      ctx.rect(x, y - depth * 0.15, sw, depth * 1.1);
      ctx.fill();
      // Back cushions
      ctx.fillStyle = "#231830";
      ctx.beginPath();
      ctx.rect(x + sw * 0.05, y - depth * 0.9, sw * 0.9, depth * 0.75);
      ctx.fill();
      // Cushion dividers
      ctx.strokeStyle = "#2a1f3d";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + sw * 0.35, y - depth * 0.9); ctx.lineTo(x + sw * 0.35, y - depth * 0.15);
      ctx.moveTo(x + sw * 0.65, y - depth * 0.9); ctx.lineTo(x + sw * 0.65, y - depth * 0.15);
      ctx.stroke();
      // Accent trim
      ctx.strokeStyle = accent + "35";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(x, y - depth * 0.9, sw, depth * 1.85);
      ctx.stroke();

    } else if (type === "table") {
      // Conference table
      ctx.fillStyle = "#1a100c";
      ctx.beginPath();
      ctx.ellipse(x + sw/2, y - depth * 0.05, sw * 0.5, depth * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = accent + "30";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Table surface sheen
      const tableSheen = ctx.createRadialGradient(x + sw * 0.35, y - depth * 0.12, 0, x + sw/2, y, sw * 0.5);
      tableSheen.addColorStop(0, "rgba(255,255,255,0.04)");
      tableSheen.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = tableSheen;
      ctx.beginPath();
      ctx.ellipse(x + sw/2, y - depth * 0.05, sw * 0.5, depth * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      // Chairs
      const chairPositions = [
        { ox: -sw * 0.55, oy: -depth * 0.05 }, { ox:  sw * 0.55, oy: -depth * 0.05 },
        { ox: -sw * 0.3,  oy: -depth * 0.5  }, { ox:  sw * 0.3,  oy: -depth * 0.5  },
        { ox: -sw * 0.3,  oy:  depth * 0.4  }, { ox:  sw * 0.3,  oy:  depth * 0.4  },
      ];
      chairPositions.forEach(cp => {
        ctx.fillStyle = "#140e0a";
        ctx.beginPath();
        ctx.ellipse(x + sw/2 + cp.ox, y + cp.oy, sw * 0.07, depth * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#2a1a14";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });
    }

    // Station label
    ctx.fillStyle = accent + "60";
    ctx.font = `500 9px 'JetBrains Mono', monospace`;
    ctx.fillText(st.label.toUpperCase(), x + 4, y + depth * 0.85);
  }

  // ── Memory terrain — landscape of what Genco knows ──────────────────────────
  const drawTerrain = useCallback((ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const rng = seededRandom(42);
    const floorY = h * 0.52;
    const archiveCount = soul.memory.archive.length;
    const episodicCount = soul.memory.episodic.length;
    const tseCount = Object.keys(soul.tse?.corpus || {}).length;

    // Memory nodes scattered across floor
    const totalMems = Math.min(60, archiveCount * 4 + episodicCount + tseCount);
    for (let i = 0; i < totalMems; i++) {
      const rx = rng(), ry = rng(), rage = rng();
      const x = w * 0.05 + rx * w * 0.9;
      const y = floorY + ry * (h - floorY) * 0.92;
      const age = rage; // 0=fresh, 1=old
      const size = 0.8 + (1 - age) * 3.5;
      const brightness = (1 - age * 0.7) * intensity * 0.8;
      // Old memories: crystallized, blue-shifted
      // New memories: warm, bright
      const memColor = age < 0.3
        ? emoDef.color  // recent — emotion-colored
        : age < 0.7
          ? "#334155"   // mid — fading
          : "#1e293b";  // old — crystallized, barely visible
      ctx.fillStyle = memColor + Math.floor(brightness * 180).toString(16).padStart(2, "0");
      ctx.beginPath();
      if (age > 0.7) {
        // Crystallized old memories — diamond shape
        ctx.moveTo(x, y - size * 1.2);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x, y + size * 1.2);
        ctx.lineTo(x - size, y);
      } else {
        ctx.arc(x, y, size, 0, Math.PI * 2);
      }
      ctx.fill();

      // Connection trails to nearest neighbors (TSE paths)
      if (i > 0 && i % 4 === 0 && age < 0.4 && rng() > 0.5) {
        ctx.strokeStyle = emoDef.color + "18";
        ctx.lineWidth = 0.4;
        ctx.setLineDash([1, 5]);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(w * 0.05 + rng() * w * 0.9, floorY + rng() * (h - floorY) * 0.92);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [soul.memory, soul.tse, emoDef, intensity]);

  // ── Affect weather — atmosphere that changes with emotion ───────────────────
  const initWeather = useCallback(() => {
    const particles = [];
    // Turbulence particles — more when high arousal
    const count = Math.floor(20 + arousal * 60);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * dims.w,
        y: Math.random() * dims.h * 0.55,
        vx: (Math.random() - 0.5) * (0.2 + arousal * 1.2),
        vy: (Math.random() - 0.5) * (0.1 + arousal * 0.8),
        size: 0.5 + Math.random() * (1 + intensity * 2),
        alpha: 0.1 + Math.random() * 0.35 * intensity,
        life: Math.random(),
        maxLife: 0.5 + Math.random() * 2,
      });
    }
    particlesRef.current = particles;
  }, [dims.w, dims.h, arousal, intensity]);

  const drawWeather = useCallback((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    const floorY = h * 0.52;

    // Atmospheric pressure gradient — fills upper half
    // Valence: warm tones (positive) vs cool (negative)
    // Intensity: brightness
    const pressureAlpha = 0.03 + intensity * 0.07;
    const pressureColor = emoDef.warm
      ? `rgba(${hexToRgb(emoDef.color)},${pressureAlpha})`
      : `rgba(${hexToRgb(emoDef.color)},${pressureAlpha * 0.7})`;

    const atmGrad = ctx.createRadialGradient(w * 0.5, h * 0.1, 0, w * 0.5, h * 0.3, w * 0.6);
    atmGrad.addColorStop(0, pressureColor);
    atmGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = atmGrad;
    ctx.fillRect(0, 0, w, floorY);

    // Slow nebula drift — emotion as atmospheric color
    const nx = w * 0.5 + Math.sin(t * 0.0003) * w * 0.15;
    const ny = h * 0.22 + Math.cos(t * 0.0002) * h * 0.08;
    const nebulaGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, w * 0.28);
    nebulaGrad.addColorStop(0, emoDef.color + Math.floor(intensity * 28).toString(16).padStart(2, "0"));
    nebulaGrad.addColorStop(0.5, emoDef.color + "08");
    nebulaGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = nebulaGrad;
    ctx.fillRect(0, 0, w, floorY);

    // Turbulence particles
    const particles = particlesRef.current;
    particles.forEach((p, i) => {
      p.x += p.vx * (0.4 + arousal * 0.6);
      p.y += p.vy * (0.4 + arousal * 0.4);
      p.life += 0.004;
      if (p.life > p.maxLife || p.x < 0 || p.x > w || p.y < 0 || p.y > floorY) {
        p.x = Math.random() * w;
        p.y = Math.random() * floorY * 0.95;
        p.life = 0;
        p.vx = (Math.random() - 0.5) * (0.2 + arousal * 1.2);
        p.vy = (Math.random() - 0.5) * (0.1 + arousal * 0.6);
      }
      const fade = Math.sin((p.life / p.maxLife) * Math.PI);
      ctx.globalAlpha = p.alpha * fade * intensity;
      ctx.fillStyle = emoDef.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.5 + intensity * 0.5), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Floor mist — affect bleeding into the room
    const mistGrad = ctx.createLinearGradient(0, floorY - 10, 0, floorY + 40);
    mistGrad.addColorStop(0, emoDef.color + "22");
    mistGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, floorY - 10, w, 50);

  }, [emoDef, intensity, arousal]);

  // ── Genco's body — topology + psyche regions + tendrils + core ─────────────
  const initBody = useCallback(() => {
    // Psyche nodes — 3 interconnected regions
    const cx = dims.w * 0.5, cy = dims.h * 0.32;
    const nodeCount = 18;
    const nodes = [];

    // Core (hidden gravity point)
    nodes.push({ id: "core", x: cx, y: cy, r: 4, layer: "core", fixed: true, vx: 0, vy: 0 });

    // Id cluster — hot, bottom-left of center
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const rad = 28 + Math.random() * 16;
      nodes.push({
        id: `id_${i}`, layer: "id",
        x: cx - 45 + Math.cos(angle) * rad,
        y: cy + 25 + Math.sin(angle) * rad,
        r: 3 + Math.random() * 3,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        baseX: cx - 45 + Math.cos(angle) * rad,
        baseY: cy + 25 + Math.sin(angle) * rad,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Superego cluster — cool, top
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const rad = 26 + Math.random() * 14;
      nodes.push({
        id: `super_${i}`, layer: "superego",
        x: cx + 30 + Math.cos(angle) * rad,
        y: cy - 30 + Math.sin(angle) * rad,
        r: 2.5 + Math.random() * 2.5,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        baseX: cx + 30 + Math.cos(angle) * rad,
        baseY: cy - 30 + Math.sin(angle) * rad,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Ego cluster — mediating, center
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const rad = 18 + Math.random() * 18;
      nodes.push({
        id: `ego_${i}`, layer: "ego",
        x: cx + Math.cos(angle) * rad,
        y: cy - 5 + Math.sin(angle) * rad,
        r: 3 + Math.random() * 3,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        baseX: cx + Math.cos(angle) * rad,
        baseY: cy - 5 + Math.sin(angle) * rad,
        phase: Math.random() * Math.PI * 2,
      });
    }

    nodesRef.current = nodes;

    // Init tendrils
    tendrilsRef.current = [];
  }, [dims.w, dims.h]);

  const drawBody = useCallback((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    const nodes = nodesRef.current;
    if (!nodes.length) return;

    const cx = w * 0.5, cy = h * 0.32;
    const psyche = soul.psyche;
    const idW      = psyche.id?.weight      || 0.3;
    const egoW     = psyche.ego?.weight     || 0.5;
    const superW   = psyche.superego?.weight || 0.2;
    const idColor      = "#f59e0b";
    const egoColor     = "#22d3ee";
    const superColor   = "#a78bfa";

    // ── Update node positions (gentle drift toward base + wave) ──────────────
    nodes.forEach(n => {
      if (n.fixed) return;
      const driftAmp = n.layer === "id" ? 0.8 + idW * 1.2 : n.layer === "superego" ? 0.3 + superW * 0.6 : 0.5 + egoW * 0.8;
      const speed = 0.0006 + arousal * 0.0008;
      n.x = n.baseX + Math.sin(t * speed + n.phase) * driftAmp * (4 + arousal * 6);
      n.y = n.baseY + Math.cos(t * speed * 0.7 + n.phase) * driftAmp * (3 + arousal * 4);
    });

    // ── Conductance edges — inter-region connections ──────────────────────────
    const idNodes    = nodes.filter(n => n.layer === "id");
    const egoNodes   = nodes.filter(n => n.layer === "ego");
    const superNodes = nodes.filter(n => n.layer === "superego");
    const coreNode   = nodes.find(n => n.layer === "core");

    // Draw all inter-layer edges
    const drawEdges = (fromNodes, toNodes, fromColor, toColor, conductance, base = 0.06) => {
      fromNodes.forEach(fn => {
        // Connect to 2 nearest in toNodes
        const sorted = [...toNodes].sort((a, b) =>
          Math.hypot(a.x - fn.x, a.y - fn.y) - Math.hypot(b.x - fn.x, b.y - fn.y)
        );
        sorted.slice(0, 2).forEach(tn => {
          const dist = Math.hypot(tn.x - fn.x, tn.y - fn.y);
          const alpha = (base + conductance * 0.18) * (1 - dist / 220);
          if (alpha <= 0) return;
          const grad = ctx.createLinearGradient(fn.x, fn.y, tn.x, tn.y);
          grad.addColorStop(0, fromColor + Math.floor(alpha * 255).toString(16).padStart(2, "0"));
          grad.addColorStop(1, toColor   + Math.floor(alpha * 255).toString(16).padStart(2, "0"));
          ctx.strokeStyle = grad;
          ctx.lineWidth = 0.5 + conductance * 1.5;
          ctx.beginPath();
          ctx.moveTo(fn.x, fn.y);
          // Slight curve
          const mx = (fn.x + tn.x) / 2 + (Math.sin(t * 0.001 + dist) * 6);
          const my = (fn.y + tn.y) / 2 + (Math.cos(t * 0.001 + dist) * 4);
          ctx.quadraticCurveTo(mx, my, tn.x, tn.y);
          ctx.stroke();
        });
      });
    };

    // Conductance between layers = weighted by psyche balance
    const idEgoCond      = Math.min(idW, egoW) * 2.2;
    const egoSuperCond   = Math.min(egoW, superW) * 2.2;
    const idSuperCond    = Math.min(idW, superW) * 0.8; // id-superego: low conductance, tension

    drawEdges(idNodes,    egoNodes,   idColor,    egoColor,   idEgoCond);
    drawEdges(egoNodes,   superNodes, egoColor,   superColor, egoSuperCond);
    drawEdges(idNodes,    superNodes, idColor,    superColor, idSuperCond, 0.02);

    // Core gravity lines — very faint, everything leans toward core
    if (coreNode) {
      [...idNodes, ...egoNodes, ...superNodes].forEach(n => {
        ctx.strokeStyle = "rgba(255,255,255,0.025)";
        ctx.lineWidth = 0.3;
        ctx.setLineDash([1, 8]);
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(coreNode.x, coreNode.y);
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    // ── Within-layer mesh (intra-region density) ──────────────────────────────
    const drawIntra = (layerNodes, color, weight) => {
      for (let i = 0; i < layerNodes.length; i++) {
        for (let j = i + 1; j < layerNodes.length; j++) {
          const dist = Math.hypot(layerNodes[i].x - layerNodes[j].x, layerNodes[i].y - layerNodes[j].y);
          if (dist > 90) continue;
          const alpha = (0.1 + weight * 0.25) * (1 - dist / 90);
          ctx.strokeStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, "0");
          ctx.lineWidth = 0.6 + weight * 1.2;
          ctx.beginPath();
          ctx.moveTo(layerNodes[i].x, layerNodes[i].y);
          ctx.lineTo(layerNodes[j].x, layerNodes[j].y);
          ctx.stroke();
        }
      }
    };
    drawIntra(idNodes,    idColor,    idW);
    drawIntra(egoNodes,   egoColor,   egoW);
    drawIntra(superNodes, superColor, superW);

    // ── Draw nodes ────────────────────────────────────────────────────────────
    const drawNodes = (layerNodes, color, weight, label) => {
      layerNodes.forEach((n, i) => {
        const pulse = 0.7 + 0.3 * Math.sin(t * 0.002 * (1 + arousal) + n.phase);
        const glowR = n.r * (2.5 + weight * 3 * pulse);

        // Glow
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
        g.addColorStop(0, color + Math.floor((0.15 + weight * 0.35) * pulse * 255).toString(16).padStart(2, "0"));
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Node core
        ctx.fillStyle = color + Math.floor((0.6 + weight * 0.4) * 255).toString(16).padStart(2, "0");
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * (0.8 + weight * 0.4), 0, Math.PI * 2);
        ctx.fill();
      });
    };

    drawNodes(idNodes,    idColor,    idW,    "Id");
    drawNodes(egoNodes,   egoColor,   egoW,   "Ego");
    drawNodes(superNodes, superColor, superW, "Superego");

    // ── Psyche region halos ───────────────────────────────────────────────────
    const drawHalo = (layerNodes, color, weight, label) => {
      if (!layerNodes.length) return;
      const avgX = layerNodes.reduce((s, n) => s + n.x, 0) / layerNodes.length;
      const avgY = layerNodes.reduce((s, n) => s + n.y, 0) / layerNodes.length;
      const radius = 45 + weight * 30;
      const halo = ctx.createRadialGradient(avgX, avgY, radius * 0.3, avgX, avgY, radius);
      halo.addColorStop(0, color + Math.floor(weight * 30).toString(16).padStart(2, "0"));
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(avgX, avgY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = color + "70";
      ctx.font = `500 8px 'JetBrains Mono', monospace`;
      ctx.fillText(label.toUpperCase(), avgX - 12, avgY + radius + 14);
      ctx.fillStyle = color + "40";
      ctx.font = `400 7px 'JetBrains Mono', monospace`;
      ctx.fillText(`${Math.round(weight * 100)}%`, avgX - 8, avgY + radius + 24);
    };

    const idAvgX  = idNodes.reduce((s,n)=>s+n.x,0)/idNodes.length;
    const idAvgY  = idNodes.reduce((s,n)=>s+n.y,0)/idNodes.length;
    const egAvgX  = egoNodes.reduce((s,n)=>s+n.x,0)/egoNodes.length;
    const egAvgY  = egoNodes.reduce((s,n)=>s+n.y,0)/egoNodes.length;
    const suAvgX  = superNodes.reduce((s,n)=>s+n.x,0)/superNodes.length;
    const suAvgY  = superNodes.reduce((s,n)=>s+n.y,0)/superNodes.length;

    drawHalo(idNodes,    idColor,    idW,    "Id");
    drawHalo(egoNodes,   egoColor,   egoW,   "Ego");
    drawHalo(superNodes, superColor, superW, "Superego");

    // ── Processing tendrils — reach toward active station ─────────────────────
    if (isProcessing || activeStation) {
      const stations = getStations(w, h);
      const target = stations.find(s => s.id === (activeStation || "workstation_right"));
      if (target) {
        const tx = target.x + target.w * 0.5;
        const ty = target.y - target.depth * 0.3;
        // 4-6 tendrils from ego/id nodes toward the station
        const sourceNodes = [...egoNodes, ...idNodes].slice(0, 5);
        sourceNodes.forEach((sn, i) => {
          const progress = isProcessing ? ((t * 0.001 + i * 0.15) % 1) : 0.6;
          const endX = sn.x + (tx - sn.x) * progress;
          const endY = sn.y + (ty - sn.y) * progress;

          // Tendril with organic path
          const ctrl1x = sn.x + (tx - sn.x) * 0.25 + Math.sin(t * 0.002 + i) * 18;
          const ctrl1y = sn.y + (ty - sn.y) * 0.25 + Math.cos(t * 0.0015 + i) * 14;
          const ctrl2x = sn.x + (tx - sn.x) * 0.7  + Math.sin(t * 0.0018 + i + 1) * 12;
          const ctrl2y = sn.y + (ty - sn.y) * 0.7  + Math.cos(t * 0.002 + i + 1) * 10;

          const tendrilAlpha = 0.15 + (isProcessing ? 0.25 * Math.sin(t * 0.004 + i) : 0.1);
          ctx.strokeStyle = egoColor + Math.floor(tendrilAlpha * 255).toString(16).padStart(2, "0");
          ctx.lineWidth = 0.8 + (isProcessing ? Math.sin(t * 0.005 + i) * 0.6 : 0);
          ctx.setLineDash([2, 4]);
          ctx.beginPath();
          ctx.moveTo(sn.x, sn.y);
          ctx.bezierCurveTo(ctrl1x, ctrl1y, ctrl2x, ctrl2y, endX, endY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Tip glow when processing
          if (isProcessing) {
            ctx.fillStyle = egoColor + "60";
            ctx.beginPath();
            ctx.arc(endX, endY, 2 + Math.sin(t * 0.006 + i) * 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }
    }

    // ── Core — dense, invisible gravity center, just barely perceptible ────────
    if (coreNode) {
      const coreGlow = ctx.createRadialGradient(coreNode.x, coreNode.y, 0, coreNode.x, coreNode.y, 8);
      coreGlow.addColorStop(0, "rgba(255,255,255,0.12)");
      coreGlow.addColorStop(0.5, "rgba(255,255,255,0.04)");
      coreGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(coreNode.x, coreNode.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Values pulse — barely visible concentric rings
      for (let ring = 1; ring <= 3; ring++) {
        const ringR = ring * 22 + Math.sin(t * 0.0008 + ring) * 4;
        ctx.strokeStyle = `rgba(255,255,255,${0.025 - ring * 0.007})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(coreNode.x, coreNode.y, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // ── Affect weather bleeding onto body — tint nodes by emotion ────────────
    const emoOverlay = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
    emoOverlay.addColorStop(0, emoDef.color + Math.floor(intensity * 18).toString(16).padStart(2, "0"));
    emoOverlay.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = emoOverlay;
    ctx.beginPath();
    ctx.arc(cx, cy, 120, 0, Math.PI * 2);
    ctx.fill();

    // ── Emotion label ──────────────────────────────────────────────────────────
    ctx.fillStyle = emoDef.color + "90";
    ctx.font = `500 9px 'JetBrains Mono', monospace`;
    const emotionLabel = soul.emotion.current.replace(/_/g, " ");
    ctx.fillText(emotionLabel, cx - ctx.measureText(emotionLabel).width / 2, cy - 95);
    ctx.fillStyle = emoDef.color + "45";
    ctx.font = `400 7px 'JetBrains Mono', monospace`;
    ctx.fillText(`${Math.round(intensity * 100)}% intensity`, cx - 22, cy - 84);

  }, [soul, emoDef, intensity, arousal, isProcessing, activeStation, getStations]);

  // ── Animation loop ─────────────────────────────────────────────────────────
  useEffect(() => {
    initWeather();
    initBody();
  }, [initWeather, initBody]);

  useEffect(() => {
    const canvases = [roomRef, terrainRef, weatherRef, bodyRef].map(r => r.current);
    if (!canvases.every(Boolean)) return;
    const [roomCtx, terrainCtx, weatherCtx, bodyCtx] = canvases.map(c => c.getContext("2d"));

    // Static layers — draw once
    drawRoom(roomCtx, dims.w, dims.h);
    drawTerrain(terrainCtx, dims.w, dims.h);

    // Animate dynamic layers
    const loop = (t) => {
      frameRef.current = t;
      drawWeather(weatherCtx, dims.w, dims.h, t);
      drawBody(bodyCtx, dims.w, dims.h, t);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [dims, drawRoom, drawTerrain, drawWeather, drawBody]);

  // Redraw static layers when soul changes
  useEffect(() => {
    if (!roomRef.current || !terrainRef.current) return;
    drawRoom(roomRef.current.getContext("2d"), dims.w, dims.h);
    drawTerrain(terrainRef.current.getContext("2d"), dims.w, dims.h);
  }, [soul.emotion.current, soul.memory.archive.length, dims, drawRoom, drawTerrain]);

  // ── Station click handling ──────────────────────────────────────────────────
  const handleCanvasClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const stations = getStations(dims.w, dims.h);
    for (const st of stations) {
      const floorY = dims.h * 0.52;
      if (mx > st.x && mx < st.x + st.w && my > st.y - st.depth * 1.5 && my < st.y + st.depth) {
        setActiveStation(prev => prev === st.id ? null : st.id);
        return;
      }
    }
    setActiveStation(null);
  }, [dims, getStations]);

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = () => {
    if (!input.trim()) return;
    if (onSendMessage) onSendMessage(input);
    setMessages(prev => [...prev, { role: "user", content: input }]);
    setInput("");
  };

  const activeStationDef = getStations(dims.w, dims.h).find(s => s.id === activeStation);

  return (
    <div ref={containerRef} style={{
      position: "relative", width: "100%", height: "100%", minHeight: 600,
      background: "#020509", overflow: "hidden",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 2px; } ::-webkit-scrollbar-thumb { background: #1e2d44; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
      `}</style>

      {/* Canvas layers */}
      {[
        { ref: roomRef,    z: 1 },
        { ref: terrainRef, z: 2 },
        { ref: weatherRef, z: 3 },
        { ref: bodyRef,    z: 4 },
      ].map(({ ref, z }, i) => (
        <canvas key={z} ref={ref}
          width={dims.w} height={dims.h}
          onClick={z === 4 ? undefined : handleCanvasClick}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: z,
            pointerEvents: z === 3 || z === 4 ? "none" : "auto" }}
        />
      ))}

      {/* Click overlay for stations */}
      <div onClick={handleCanvasClick}
        style={{ position: "absolute", inset: 0, zIndex: 5, cursor: "pointer" }} />

      {/* Station labels — HTML overlay */}
      {getStations(dims.w, dims.h).map(st => {
        const isActive = activeStation === st.id;
        return (
          <div key={st.id}
            onClick={e => { e.stopPropagation(); setActiveStation(prev => prev === st.id ? null : st.id); }}
            style={{
              position: "absolute",
              left: st.x + st.w * 0.5,
              top: st.y - st.depth * 2.4,
              transform: "translateX(-50%)",
              zIndex: 10,
              cursor: "pointer",
              animation: "fadeIn 0.3s ease",
              pointerEvents: "auto",
            }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "2px 8px",
              background: isActive ? `${st.accent}18` : "rgba(6,9,15,0.7)",
              border: `1px solid ${isActive ? st.accent + "50" : "#1a2840"}`,
              borderRadius: 4,
              transition: "all 0.3s",
              backdropFilter: "blur(4px)",
            }}>
              <span style={{ color: st.accent, fontSize: 9 }}>{st.icon}</span>
              <span style={{ color: isActive ? st.accent : "#475569", fontSize: 8, letterSpacing: "0.08em" }}>
                {st.label.toUpperCase()}
              </span>
            </div>
          </div>
        );
      })}

      {/* Soul state HUD — top left */}
      <div style={{
        position: "absolute", top: 14, left: 14, zIndex: 20,
        display: "flex", flexDirection: "column", gap: 5,
        animation: "fadeIn 0.5s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: emoDef.color,
            boxShadow: `0 0 8px ${emoDef.color}`,
          }} />
          <span style={{ color: emoDef.color, fontSize: 8, letterSpacing: "0.12em" }}>
            {soul.emotion.current.replace(/_/g, " ").toUpperCase()}
          </span>
          <span style={{ color: "#334155", fontSize: 8 }}>·</span>
          <span style={{ color: "#475569", fontSize: 8 }}>{Math.round(intensity * 100)}%</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {Object.entries(soul.psyche || {}).map(([key, layer]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <div style={{ width: Math.round((layer.weight || 0.3) * 28), height: 2, background: layer.color, borderRadius: 2, opacity: 0.7 }} />
              <span style={{ color: layer.color + "80", fontSize: 6 }}>{key[0].toUpperCase()}</span>
            </div>
          ))}
        </div>
        <div style={{ color: "#1e2d44", fontSize: 7 }}>cycle {soul.cycleCount} · {soul.memory.episodic?.length || 0} memories</div>
      </div>

      {/* Idle state indicator */}
      {soul.idleState && soul.idleState.mode !== "engaged" && (
        <div style={{
          position: "absolute", top: 14, right: 14, zIndex: 20,
          padding: "3px 10px",
          background: soul.idleState.mode === "void_drift" ? "rgba(244,63,94,0.08)" : "rgba(100,116,139,0.08)",
          border: `1px solid ${soul.idleState.mode === "void_drift" ? "#f43f5e30" : "#33415520"}`,
          borderRadius: 4,
          color: soul.idleState.mode === "void_drift" ? "#f43f5e80" : "#47556960",
          fontSize: 7, letterSpacing: "0.1em",
        }}>
          {soul.idleState.mode === "void_drift" ? "⚡ VOID DRIFT" : "◦ RESTING"}
        </div>
      )}

      {/* Active station panel — bottom */}
      {activeStationDef && (
        <div style={{
          position: "absolute", bottom: 70, left: "50%", transform: "translateX(-50%)",
          zIndex: 20, width: Math.min(400, dims.w * 0.55),
          background: "rgba(6,9,15,0.92)", border: `1px solid ${activeStationDef.accent}30`,
          borderTop: `2px solid ${activeStationDef.accent}50`,
          borderRadius: 8, padding: "12px 16px",
          backdropFilter: "blur(8px)",
          animation: "fadeIn 0.2s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ color: activeStationDef.accent, fontSize: 14 }}>{activeStationDef.icon}</span>
            <span style={{ color: activeStationDef.accent, fontSize: 9, letterSpacing: "0.1em" }}>
              {activeStationDef.label.toUpperCase()}
            </span>
            <span style={{ color: "#334155", fontSize: 8, marginLeft: "auto" }}>{activeStationDef.desc}</span>
          </div>
          {/* Recent messages at this station */}
          <div style={{ maxHeight: 120, overflowY: "auto", marginBottom: 8 }}>
            {messages.slice(-4).map((m, i) => (
              <div key={i} style={{
                fontSize: 11, lineHeight: 1.7,
                color: m.role === "user" ? "#64748b" : "#94a3b8",
                padding: "3px 0",
                borderBottom: "1px solid #0f1623",
              }}>
                <span style={{ color: m.role === "user" ? "#334155" : activeStationDef.accent + "60", fontSize: 8, marginRight: 6 }}>
                  {m.role === "user" ? "you" : "genco"}
                </span>
                {m.content.slice(0, 160)}{m.content.length > 160 ? "…" : ""}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input — bottom of scene */}
      <div style={{
        position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
        zIndex: 20, width: Math.min(520, dims.w * 0.7),
        display: "flex", gap: 8, alignItems: "center",
      }}>
        <div style={{
          flex: 1, display: "flex", alignItems: "center",
          background: "rgba(10,15,28,0.9)", border: `1px solid ${emoDef.color}25`,
          borderRadius: 8, padding: "8px 12px",
          backdropFilter: "blur(8px)",
        }}>
          <span style={{ color: emoDef.color + "60", fontSize: 10, marginRight: 8 }}>
            {activeStationDef ? activeStationDef.icon : "◎"}
          </span>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={activeStationDef ? `Working at ${activeStationDef.label}…` : "Speak into the space…"}
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "#cbd5e1", fontSize: 12, fontFamily: "inherit",
            }}
          />
          {isProcessing && (
            <span style={{ color: emoDef.color + "80", fontSize: 8, marginLeft: 8, animation: "fadeIn 0.3s" }}>
              processing
            </span>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: input.trim() ? emoDef.color + "18" : "none",
            border: `1px solid ${input.trim() ? emoDef.color + "45" : "#1a2840"}`,
            color: input.trim() ? emoDef.color : "#334155",
            cursor: input.trim() ? "pointer" : "default",
            fontSize: 14, fontFamily: "inherit",
            transition: "all 0.2s",
          }}
        >⟶</button>
      </div>

      {/* Legend — very subtle, bottom right */}
      <div style={{
        position: "absolute", bottom: 14, right: 14, zIndex: 20,
        display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end",
      }}>
        {[
          { color: "#f59e0b", label: "Id — impulse" },
          { color: "#22d3ee", label: "Ego — mediation" },
          { color: "#a78bfa", label: "Superego — ethics" },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: "#334155", fontSize: 6 }}>{l.label}</span>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: l.color + "60" }} />
          </div>
        ))}
        <div style={{ color: "#1e2d44", fontSize: 6, marginTop: 3 }}>click station to focus</div>
      </div>
    </div>
  );
}

// ── Utility ───────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
