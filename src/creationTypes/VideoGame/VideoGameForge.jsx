// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VIDEO GAME FORGE — Interactive Video Game Creation System
// Ported and adapted from CodeForge.jsx for game development.
// Features: Game Architect, Level Builder, Character Designer,
// Quest System, World Builder, Gameplay Coach, Game Design Chat.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useState, useEffect, useRef, useCallback } from "react";

// ── API ───────────────────────────────────────────────────────────────────────
async function claude(messages, system, maxTokens = 1000) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });
  const d = await r.json();
  return d.content?.[0]?.text || "";
}

function parseJSON(raw) {
  try { return JSON.parse(raw.replace(/```json\n?|```\n?/g, "").trim()); }
  catch { return null; }
}

// ── Theme ─────────────────────────────────────────────────────────────────────
const C = {
  bg:        "#0a0a0a",
  panel:     "#1a1a1a",
  surface:   "#2a2a2a",
  border:    "#404040",
  borderHi:  "#606060",
  gold:      "#ffd700",
  goldDim:   "#b8860b",
  goldGlow:  "rgba(255,215,0,0.12)",
  crimson:   "#dc143c",
  crimsonGlow: "rgba(220,20,60,0.12)",
  emerald:   "#50c878",
  sapphire:  "#0f52ba",
  text:      "#f5f5f5",
  dim:       "#a0a0a0",
  muted:     "#808080",
  serif:     "'Crimson Text', 'Times New Roman', serif",
  sans:      "'IBM Plex Sans', 'Helvetica Neue', system-ui, sans-serif",
  mono:      "'JetBrains Mono', 'Courier New', monospace",
};

// ── Genre configs ─────────────────────────────────────────────────────────────
const GENRES = {
  action:       { icon: "💥", color: C.crimson,  label: "Action"       },
  adventure:    { icon: "🗺️", color: C.gold,     label: "Adventure"    },
  rpg:          { icon: "⚔️", color: C.emerald,  label: "RPG"          },
  strategy:     { icon: "♟️", color: C.sapphire, label: "Strategy"     },
  puzzle:       { icon: "🧩", color: C.gold,     label: "Puzzle"       },
  simulation:   { icon: "🏗️", color: C.emerald,  label: "Simulation"   },
  horror:       { icon: "👻", color: C.crimson,  label: "Horror"       },
  platformer:   { icon: "🎮", color: C.sapphire, label: "Platformer"   },
  racing:       { icon: "🏎️", color: C.gold,     label: "Racing"       },
  sports:       { icon: "⚽", color: C.emerald,  label: "Sports"       },
};

const ARCHETYPES = [
  { id: "open_world",    label: "Open World",      icon: "🌍", description: "Freedom to explore vast environments" },
  { id: "linear_story",  label: "Linear Story",    icon: "📖", description: "Narrative-driven with guided progression" },
  { id: "multiplayer",   label: "Multiplayer",     icon: "👥", description: "Cooperative or competitive online play" },
  { id: "roguelike",     label: "Roguelike",       icon: "🎲", description: "Procedural generation with permadeath" },
  { id: "battle_royale", label: "Battle Royale",   icon: "🏆", description: "Last player standing competition" },
  { id: "metroidvania",  label: "Metroidvania",    icon: "🗝️", description: "Exploration with ability-gated areas" },
  { id: "tower_defense", label: "Tower Defense",   icon: "🏰", description: "Strategic defense against waves" },
  { id: "idle_clicker",  label: "Idle Clicker",    icon: "👆", description: "Passive progression with occasional input" },
  { id: "survival",      label: "Survival",        icon: "🏕️", description: "Resource management and survival mechanics" },
  { id: "custom",        label: "Custom Design",   icon: "✨", description: "Describe your own game concept" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => `g_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

function badge(text, color) {
  return (
    <span style={{
      fontSize: 10, fontFamily: C.mono, letterSpacing: "0.08em",
      padding: "2px 7px", borderRadius: 3,
      border: `1px solid ${color}44`, color, background: `${color}11`,
      textTransform: "uppercase", whiteSpace: "nowrap",
    }}>{text}</span>
  );
}

function Spin({ size = 14 }) {
  return <span style={{
    display: "inline-block", width: size, height: size,
    border: `2px solid ${C.border}`, borderTopColor: C.gold,
    borderRadius: "50%", animation: "spin 0.6s linear infinite",
  }} />;
}

function StatusDot({ color = C.gold }) {
  return <span style={{
    display: "inline-block", width: 8, height: 8, borderRadius: "50%",
    background: color, boxShadow: `0 0 8px ${color}`,
    flexShrink: 0,
  }} />;
}

// ── Game World Map ────────────────────────────────────────────────────────────
function GameWorldMap({ levels }) {
  const radius = 120;
  const cx = 200, cy = 160;
  if (!levels.length) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:320, color:C.dim, fontFamily:C.mono, fontSize:12 }}>
      No levels yet
    </div>
  );

  const nodes = levels.map((l, i) => {
    const angle = (2 * Math.PI * i) / levels.length - Math.PI / 2;
    return { ...l, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });

  const edges = [];
  levels.forEach((l, i) => {
    (l.connections || []).forEach(rel => {
      const j = levels.findIndex(ll => ll.name === rel.to);
      if (j !== -1 && j !== i) edges.push([i, j, rel.type]);
    });
  });

  return (
    <svg width="100%" viewBox="0 0 400 320" style={{ fontFamily: C.mono }}>
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={C.dim} />
        </marker>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {edges.map(([a, b, type], i) => {
        const color = type === "progression" ? C.emerald : type === "optional" ? C.gold : type === "secret" ? C.crimson : C.dim;
        return (
          <line key={i}
            x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
            stroke={color} strokeWidth={2} strokeDasharray={type === "optional" ? "4 3" : "none"}
            markerEnd="url(#arrow)" opacity={0.7}
          />
        );
      })}

      {nodes.map((n, i) => {
        const genre = GENRES[n.genre] || GENRES.action;
        return (
          <g key={n.id} filter="url(#glow)">
            <circle cx={n.x} cy={n.y} r={24} fill={C.panel} stroke={genre.color} strokeWidth={2} opacity={0.9} />
            <text x={n.x} y={n.y - 6} textAnchor="middle" fill={genre.color} fontSize="12" fontWeight="700">{n.type || "?"}</text>
            <text x={n.x} y={n.y + 8} textAnchor="middle" fill={C.muted} fontSize="9">
              {n.name.length > 8 ? n.name.slice(0,8)+"…" : n.name}
            </text>
          </g>
        );
      })}

      {/* Center label */}
      <text x={cx} y={cy} textAnchor="middle" fill={C.dim} fontSize="10" opacity={0.5}>
        {levels.length} level{levels.length !== 1 ? "s" : ""}
      </text>
    </svg>
  );
}

// ── Level Panel ───────────────────────────────────────────────────────────────
function LevelPanel({ level, onEdit, onDelete, onExpand, onCritique }) {
  const [tab, setTab] = useState("design");
  const [copied, setCopied] = useState(false);
  const lines = (level.content || "").split("\n");

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      background: C.panel, border: `1px solid ${C.border}`,
      borderRadius: 10, overflow: "hidden", height: "100%",
    }}>
      {/* Level header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 14px", background: C.surface,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ color: C.gold, fontFamily: C.mono, fontSize: 13, fontWeight: 700 }}>🎮</span>
        <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, flex: 1 }}>{level.title}</span>
        {badge(level.act || "Act 1", C.sapphire)}
        {level.status === "generating" && <Spin size={12} />}
        {level.status === "done" && <StatusDot color={C.gold} />}
        {level.status === "error" && <StatusDot color={C.crimson} />}

        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {[
            { id: "design", label: "Design" },
            { id: "critique", label: "Analysis" },
            { id: "notes", label: "Notes" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
              background: tab === t.id ? `${C.gold}22` : "none",
              border: `1px solid ${tab === t.id ? C.gold + "66" : "transparent"}`,
              color: tab === t.id ? C.gold : C.dim, fontFamily: C.mono,
            }}>{t.label}</button>
          ))}
          <button onClick={() => { navigator.clipboard.writeText(level.content || ""); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
            style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer", background: "none", border: `1px solid ${C.border}`, color: copied ? C.gold : C.dim, fontFamily: C.mono }}>
            {copied ? "✓" : "copy"}
          </button>
          <button onClick={onDelete} style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, cursor: "pointer", background: "none", border: "none", color: C.dim }}>✕</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        {tab === "design" && (
          <div style={{ display: "flex" }}>
            {/* Line numbers */}
            <div style={{
              padding: "14px 0", borderRight: `1px solid ${C.border}`,
              minWidth: 42, textAlign: "right", userSelect: "none",
              background: C.bg,
            }}>
              {lines.map((_, i) => (
                <div key={i} style={{ color: C.dim, fontFamily: C.mono, fontSize: 12, lineHeight: "24px", paddingRight: 10 }}>{i + 1}</div>
              ))}
            </div>
            {/* Level text */}
            <pre style={{
              flex: 1, margin: 0, padding: "14px 20px",
              fontFamily: C.mono, fontSize: 14, lineHeight: "20px",
              color: "#f0e6d2", background: C.bg,
              overflowX: "auto", whiteSpace: "pre-wrap",
            }}>{level.content || (level.status === "generating" ? "Designing level..." : "Empty level")}</pre>
          </div>
        )}

        {tab === "critique" && (
          <div style={{ padding: 20 }}>
            {level.critique ? (
              <div>
                {/* Score row */}
                {level.critique.score !== undefined && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ fontSize: 32, fontFamily: C.mono, fontWeight: 700, color: level.critique.score >= 8 ? C.gold : level.critique.score >= 5 ? C.emerald : C.crimson }}>
                      {level.critique.score}/10
                    </div>
                    <div style={{ color: C.muted, fontSize: 13 }}>{level.critique.summary}</div>
                  </div>
                )}
                {/* Issues */}
                {level.critique.issues?.map((issue, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 10, padding: "10px 14px", marginBottom: 8,
                    background: C.surface, borderRadius: 8,
                    borderLeft: `3px solid ${issue.severity === "high" ? C.crimson : issue.severity === "med" ? C.emerald : C.dim}`,
                  }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{issue.severity === "high" ? "🔴" : issue.severity === "med" ? "🟡" : "🔵"}</span>
                    <div>
                      <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{issue.title}</div>
                      <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.6 }}>{issue.detail}</div>
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button onClick={onExpand} style={{
                    padding: "8px 18px", background: `${C.gold}22`,
                    border: `1px solid ${C.gold}55`, borderRadius: 8,
                    color: C.gold, cursor: "pointer", fontSize: 13, fontFamily: C.mono,
                  }}>↻ Expand Level</button>
                </div>
              </div>
            ) : (
              <button onClick={() => onCritique(level)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Run Game Analysis</button>
            )}
          </div>
        )}

        {tab === "notes" && (
          <div style={{ padding: 20 }}>
            {level.notes ? (
              <pre style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{level.notes}</pre>
            ) : (
              <button onClick={() => onEdit(level)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Add Design Notes</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Game Architect ────────────────────────────────────────────────────────────
function GameArchitect({ onAccept, onCancel }) {
  const [step, setStep] = useState(0); // 0=archetype 1=details 2=planning 3=review
  const [archetype, setArchetype] = useState(null);
  const [genre, setGenre] = useState("action");
  const [desc, setDesc] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const generatePlan = async () => {
    setLoading(true);
    setStep(2);
    setStatusMsg("AI is designing the game world...");

    const sys = `You are a master game designer and developer. Design a complete video game structure.
Return ONLY valid JSON: {
  "title": string,
  "concept": string,
  "genre": string,
  "perspective": string[],
  "characters": [
    {
      "name": string,
      "role": string (player|ally|enemy|boss),
      "abilities": string,
      "description": string
    }
  ],
  "structure": [
    {
      "act": number (1|2|3),
      "levels": number,
      "purpose": string,
      "keyMechanics": string[]
    }
  ],
  "themes": string[],
  "artStyle": string,
  "difficulty": string
}
Generate 3-6 key characters and 3-act structure with 4-8 levels total. Be innovative and playable.`;

    const msg = `Archetype: ${archetype?.label}
Genre: ${genre}
Description: ${desc || "Design a game that captivates players"}
Create a complete game design.`;

    try {
      const raw = await claude([{ role: "user", content: msg }], sys, 1200);
      const parsed = parseJSON(raw);
      if (parsed) { setPlan(parsed); setStep(3); }
      else { setStatusMsg("Parse error — please retry."); setStep(1); }
    } catch (e) {
      setStatusMsg("Game design inspiration failed.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
      zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(12px)",
    }}>
      <div style={{
        width: "min(820px,94vw)", maxHeight: "90vh",
        background: C.bg, border: `1px solid ${C.borderHi}`,
        borderRadius: 16, display: "flex", flexDirection: "column",
        boxShadow: `0 0 60px ${C.goldGlow}`,
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
          <StatusDot color={C.gold} />
          <span style={{ fontFamily: C.mono, fontSize: 13, color: C.gold, letterSpacing: "0.1em" }}>
            GAME ARCHITECT
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {["Archetype","Details","Planning","Review"].map((s,i) => (
              <span key={i} style={{
                fontFamily: C.mono, fontSize: 10, color: step >= i ? C.gold : C.dim,
                opacity: step >= i ? 1 : 0.4,
              }}>{s}{i < 3 ? " →" : ""}</span>
            ))}
          </div>
          <button onClick={onCancel} style={{ background: "none", border: "none", color: C.dim, cursor: "pointer", fontSize: 20, marginLeft: 16 }}>×</button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: 28 }}>
          {/* Step 0: Archetype */}
          {step === 0 && (
            <div>
              <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Choose a Game Archetype</h2>
              <p style={{ color: C.dim, fontSize: 13, marginBottom: 24, fontFamily: C.mono }}>What gameplay experience shall your game deliver?</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 12 }}>
                {ARCHETYPES.map(a => (
                  <button key={a.id} onClick={() => { setArchetype(a); setStep(1); }}
                    style={{
                      padding: "16px 18px", background: C.surface, border: `1px solid ${C.border}`,
                      borderRadius: 12, cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                      display: "flex", flexDirection: "column", gap: 8,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold + "88"; e.currentTarget.style.background = C.panel; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface; }}
                  >
                    <span style={{ fontSize: 26 }}>{a.icon}</span>
                    <span style={{ color: C.text, fontSize: 14, fontWeight: 600 }}>{a.label}</span>
                    <span style={{ color: C.dim, fontSize: 12, lineHeight: 1.5 }}>{a.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Details */}
          {step === 1 && archetype && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <span style={{ fontSize: 26 }}>{archetype.icon}</span>
                <div>
                  <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: 0 }}>{archetype.label}</h2>
                  <p style={{ color: C.dim, fontSize: 12, fontFamily: C.mono, margin: "4px 0 0" }}>{archetype.description}</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Primary Genre</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {Object.entries(GENRES).map(([id, g]) => (
                      <button key={id} onClick={() => setGenre(id)} style={{
                        padding: "8px 18px", borderRadius: 8, cursor: "pointer",
                        border: `1px solid ${genre === id ? g.color + "88" : C.border}`,
                        background: genre === id ? `${g.color}18` : "none",
                        color: genre === id ? g.color : C.muted,
                        fontFamily: C.mono, fontSize: 12,
                      }}>
                        {g.icon} {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Game Concept</label>
                  <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder={`Describe the core gameplay loop, mechanics, or world that makes your game unique...`}
                    rows={6}
                    style={{
                      width: "100%", background: C.surface, border: `1px solid ${C.border}`,
                      borderRadius: 10, padding: "14px 18px", color: C.text,
                      fontFamily: C.sans, fontSize: 14, resize: "vertical", outline: "none",
                      boxSizing: "border-box", lineHeight: 1.7,
                    }}
                  />
                </div>

                {statusMsg && <div style={{ color: C.crimson, fontFamily: C.mono, fontSize: 12 }}>{statusMsg}</div>}

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(0)} style={{ padding: "10px 20px", background: "none", border: `1px solid ${C.border}`, borderRadius: 8, color: C.dim, cursor: "pointer" }}>← Back</button>
                  <button onClick={generatePlan} style={{
                    flex: 1, padding: "12px 0",
                    background: `linear-gradient(90deg, ${C.gold}22, ${C.crimson}22)`,
                    border: `1px solid ${C.gold}55`, borderRadius: 8,
                    color: C.gold, fontFamily: C.mono, fontWeight: 700, fontSize: 14,
                    cursor: "pointer", letterSpacing: "0.05em",
                  }}>🎮 Design Game</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Loading */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 280, gap: 20 }}>
              <div style={{ position: "relative" }}>
                <Spin size={52} />
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.gold, fontSize: 20 }}>🎮</span>
              </div>
              <div style={{ color: C.muted, fontFamily: C.mono, fontSize: 13 }}>{statusMsg}</div>
            </div>
          )}

          {/* Step 3: Review plan */}
          {step === 3 && plan && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ color: C.gold, fontFamily: C.mono, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{plan.title}</h2>
                <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{plan.concept}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {badge(plan.genre, C.gold)}
                  {plan.perspective?.map(p => badge(p, C.emerald))}
                </div>
                <p style={{ color: C.dim, fontSize: 13, lineHeight: 1.7, fontStyle: "italic" }}>
                  {plan.artStyle} · {plan.difficulty} difficulty
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Key Characters ({plan.characters?.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.characters?.map((c, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                    }}>
                      <span style={{ color: C.gold, fontFamily: C.mono, fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>{c.role?.[0]?.toUpperCase()}</span>
                      <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, width: 120, flexShrink: 0 }}>{c.name}</span>
                      <span style={{ color: C.muted, fontSize: 12, flex: 1 }}>{c.abilities}: {c.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Structure</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.structure?.map((act, i) => (
                    <div key={i} style={{
                      padding: "12px 16px", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                    }}>
                      <div style={{ color: C.gold, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Act {act.act}</div>
                      <div style={{ color: C.muted, fontSize: 12, marginBottom: 6 }}>{act.purpose}</div>
                      <div style={{ color: C.dim, fontSize: 11, lineHeight: 1.4 }}>
                        {act.levels} levels: {act.keyMechanics?.join(" → ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(1)} style={{ padding: "10px 20px", background: "none", border: `1px solid ${C.border}`, borderRadius: 8, color: C.dim, cursor: "pointer" }}>← Redesign</button>
                <button onClick={() => onAccept(plan, genre)} style={{
                  flex: 1, padding: "12px 0",
                  background: `linear-gradient(90deg, ${C.gold}, ${C.crimson})`,
                  border: "none", borderRadius: 8, color: C.bg, fontFamily: C.mono,
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  boxShadow: `0 0 30px ${C.goldGlow}`,
                }}>🎮 Build Game</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Game Design Dialogue (with game) ───────────────────────────────────────────
function GameDesignDialogue({ levels, characters, onApplyEdit }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", content: userMsg }]);
    setLoading(true);

    const levelContext = levels.slice(0, 3).map(l =>
      `LEVEL: ${l.title}\n${(l.content || "").slice(0, 400)}`
    ).join("\n\n---\n\n");

    const characterContext = characters.map(c => `${c.name} (${c.role}): ${c.abilities}`).join("; ");

    const sys = `You are a game design consultant and developer. Help develop and refine video games.
Level context: ${levelContext || "No levels yet"}
Characters: ${characterContext || "No characters yet"}

Answer the game developer's question about their game. Suggest improvements, discuss mechanics, analyze balance, or explore design patterns.
Be encouraging and insightful.`;

    const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
    const raw = await claude([...history, { role: "user", content: userMsg }], sys, 1000).catch(() => "Error consulting with AI.");
    setMessages(m => [...m, { role: "assistant", content: raw }]);
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.panel, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <StatusDot color={C.emerald} />
        <span style={{ fontFamily: C.mono, fontSize: 11, color: C.emerald, letterSpacing: "0.1em" }}>GAME DESIGN DIALOGUE</span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 8px" }}>
        {messages.length === 0 && (
          <div style={{ color: C.dim, fontSize: 12, fontFamily: C.mono, textAlign: "center", paddingTop: 40, lineHeight: 2 }}>
            Ask about your game.<br/>
            "How does this mechanic work?" · "Balance issues?" · "Player engagement?"
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{
            marginBottom: 14,
            display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row",
            gap: 8, alignItems: "flex-start",
          }}>
            <div style={{
              maxWidth: "85%", padding: "10px 14px",
              background: m.role === "user" ? `${C.gold}18` : C.surface,
              border: `1px solid ${m.role === "user" ? C.gold + "44" : C.border}`,
              borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
              color: C.text, fontSize: 13, lineHeight: 1.7,
              fontFamily: C.sans, whiteSpace: "pre-wrap",
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", color: C.dim, fontSize: 12, fontFamily: C.mono }}>
            <Spin size={12} /> Consulting...
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask about your game..."
          style={{
            flex: 1, background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "8px 12px", color: C.text,
            fontFamily: C.sans, fontSize: 13, outline: "none",
          }}
        />
        <button onClick={send} disabled={loading} style={{
          padding: "8px 14px", background: loading ? C.border : `${C.emerald}22`,
          border: `1px solid ${C.emerald}55`, borderRadius: 8,
          color: C.emerald, cursor: loading ? "default" : "pointer", fontFamily: C.mono, fontSize: 12,
        }}>⟶</button>
      </div>
    </div>
  );
}

// ── Main VideoGameForge ───────────────────────────────────────────────────────
export default function VideoGameForge() {
  const [levels, setLevels] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [activeLevelId, setActiveLevelId] = useState(null);
  const [showArchitect, setShowArchitect] = useState(false);
  const [gameTitle, setGameTitle] = useState("Untitled Game");
  const [plan, setPlan] = useState(null);
  const [sidePanel, setSidePanel] = useState("world"); // world | chat | outline
  const [globalStatus, setGlobalStatus] = useState("");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const activeLevel = levels.find(l => l.id === activeLevelId);

  // ── Generate level content ───────────────────────────────────────────────────
  const generateLevelContent = useCallback(async (levelId, planData, genre, allLevels, allCharacters) => {
    const levelMeta = planData?.structure?.find(s => s.act === allLevels.find(al => al.id === levelId)?.act);
    const thisLevel = allLevels.find(l => l.id === levelId);
    if (!thisLevel) return;

    setLevels(prev => prev.map(l => l.id === levelId ? { ...l, status: "generating" } : l));

    const characterSummary = allCharacters.map(c => `${c.name} (${c.role}): ${c.abilities}`).join("; ");
    const prevLevels = allLevels.filter(l => l.act < thisLevel.act || (l.act === thisLevel.act && l.order < thisLevel.order))
      .slice(-2).map(l => `PREV: ${l.title} - ${(l.content || "").slice(0, 200)}...`).join("\n");

    const sys = `You are a master game designer writing level designs in ${genre} genre. Write compelling level concepts.
Output ONLY the level design content in structured format.
Write detailed, playable level designs with mechanics and objectives.`;

    const msg = `Game: ${planData?.title || gameTitle}
Genre: ${genre}
Characters: ${characterSummary}

This level: ${thisLevel.title}
Act: ${thisLevel.act}, Purpose: ${levelMeta?.purpose || ""}

Previous context:
${prevLevels}

Write the complete level design.`;

    try {
      const content = await claude([{ role: "user", content: msg }], sys, 1200);
      setLevels(prev => prev.map(l => l.id === levelId
        ? { ...l, content, status: "done" }
        : l
      ));
    } catch {
      setLevels(prev => prev.map(l => l.id === levelId ? { ...l, status: "error", content: "Level generation failed." } : l));
    }
  }, [gameTitle]);

  // ── Accept game plan and generate levels ─────────────────────────────────────
  const handleAcceptPlan = useCallback(async (planData, genre) => {
    setShowArchitect(false);
    setGameTitle(planData.title);
    setPlan({ ...planData, genre });
    setIsGeneratingAll(true);

    // Create characters
    const newCharacters = planData.characters?.map(c => ({
      id: uid(), name: c.name, role: c.role, abilities: c.abilities, description: c.description,
      genre, connections: []
    })) || [];
    setCharacters(newCharacters);

    // Create levels
    const newLevels = [];
    let levelCount = 1;
    planData.structure?.forEach(act => {
      for (let i = 0; i < act.levels; i++) {
        newLevels.push({
          id: uid(), title: `Level ${levelCount}`, act: act.act, order: i + 1,
          form: "gamedesign", content: "", status: "queued", critique: null, notes: null,
        });
        levelCount++;
      }
    });

    setLevels(newLevels);
    setActiveLevelId(newLevels[0]?.id);

    for (let i = 0; i < newLevels.length; i++) {
      setGlobalStatus(`Designing ${i + 1}/${newLevels.length}: ${newLevels[i].title}`);
      await generateLevelContent(newLevels[i].id, planData, genre, newLevels, newCharacters);
      await new Promise(r => setTimeout(r, 300));
    }

    setGlobalStatus("Game design complete.");
    setIsGeneratingAll(false);
  }, [generateLevelContent]);

  // ── Critique level ──────────────────────────────────────────────────────────
  const critiqueLevel = useCallback(async (level) => {
    if (!level.content) return;
    setLevels(prev => prev.map(l => l.id === level.id ? { ...l, status: "generating" } : l));

    const sys = `You are a game design critic. Analyze the level and return ONLY JSON:
{
  "score": number (1-10),
  "summary": string (one sentence),
  "issues": [
    { "severity": "high"|"med"|"low", "title": string, "detail": string }
  ]
}
Be constructive and specific. Limit to 3 issues max.`;

    const raw = await claude([{ role: "user", content: `Critique this level:\n\n${level.content}` }], sys, 1000).catch(() => null);
    const parsed = raw ? parseJSON(raw) : null;

    setLevels(prev => prev.map(l => l.id === level.id
      ? { ...l, status: "done", critique: parsed || { score: 5, summary: "Analysis failed.", issues: [] } }
      : l
    ));
  }, []);

  // ── Expand level ────────────────────────────────────────────────────────────
  const expandLevel = useCallback(async (level) => {
    if (!level.content) return;
    setLevels(prev => prev.map(l => l.id === level.id ? { ...l, status: "generating" } : l));

    const sys = `You are a game designer expanding a level. Add more mechanics, objectives, and depth.
Return ONLY the expanded level content — no explanations.`;

    const msg = `Expand this level with more gameplay depth:\n\n${level.content}`;

    const expanded = await claude([{ role: "user", content: msg }], sys, 1200).catch(() => level.content);
    setLevels(prev => prev.map(l => l.id === level.id
      ? { ...l, content: expanded, status: "done", critique: null }
      : l
    ));
  }, []);

  // ── Quick add level ─────────────────────────────────────────────────────────
  const addBlankLevel = () => {
    const name = `Level ${levels.length + 1}`;
    const newLevel = { id: uid(), title: name, act: 1, order: levels.length + 1, form: "gamedesign", content: "", status: "queued", critique: null, notes: null };
    setLevels(prev => [...prev, newLevel]);
    setActiveLevelId(newLevel.id);
  };

  const doneCount = levels.filter(l => l.status === "done").length;
  const totalMechanics = levels.reduce((acc, l) => acc + (l.content?.split("\n").length || 0), 0);

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh",
      background: C.bg, color: C.text,
      fontFamily: C.sans,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&family=IBM+Plex+Sans:wght@300;400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>

      {showArchitect && <GameArchitect onAccept={handleAcceptPlan} onCancel={() => setShowArchitect(false)} />}

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "10px 20px", background: C.panel,
        borderBottom: `1px solid ${C.border}`,
        height: 50, flexShrink: 0,
      }}>
        <span style={{ fontFamily: C.mono, color: C.gold, fontSize: 14, fontWeight: 700, letterSpacing: "0.12em" }}>🎮 VIDEO GAME FORGE</span>
        <span style={{ color: C.dim, fontSize: 12, fontFamily: C.mono }}>/{gameTitle}</span>

        {globalStatus && (
          <span style={{ color: C.emerald, fontFamily: C.mono, fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
            {isGeneratingAll && <Spin size={11} />}
            {globalStatus}
          </span>
        )}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          {levels.length > 0 && (
            <>
              <span style={{ fontFamily: C.mono, fontSize: 11, color: C.dim }}>
                {doneCount}/{levels.length} levels · {totalMechanics.toLocaleString()} mechanics
              </span>
              {badge(plan?.genre || "action", C.gold)}
            </>
          )}
          <button onClick={addBlankLevel} style={{
            padding: "5px 14px", background: "none", border: `1px solid ${C.border}`,
            borderRadius: 6, color: C.muted, cursor: "pointer", fontFamily: C.mono, fontSize: 11,
          }}>+ Level</button>
          <button onClick={() => setShowArchitect(true)} style={{
            padding: "6px 18px",
            background: `linear-gradient(90deg, ${C.gold}22, ${C.crimson}22)`,
            border: `1px solid ${C.gold}55`, borderRadius: 7,
            color: C.gold, cursor: "pointer", fontFamily: C.mono, fontSize: 12, fontWeight: 700,
            boxShadow: `0 0 16px ${C.goldGlow}`,
          }}>🎮 New Game</button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* Level tree sidebar */}
        <div style={{
          width: 240, flexShrink: 0, borderRight: `1px solid ${C.border}`,
          background: C.panel, display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.12em", textTransform: "uppercase" }}>Levels</span>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "8px 8px" }}>
            {levels.length === 0 && (
              <div style={{ padding: "30px 14px", color: C.dim, fontSize: 11, fontFamily: C.mono, textAlign: "center", lineHeight: 2 }}>
                No levels.<br/>Start with 🎮 New Game.
              </div>
            )}
            {levels.map(l => {
              const isActive = l.id === activeLevelId;
              return (
                <button key={l.id} onClick={() => setActiveLevelId(l.id)} style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  padding: "7px 10px", borderRadius: 6, marginBottom: 2,
                  background: isActive ? `${C.gold}18` : "none",
                  border: `1px solid ${isActive ? C.gold + "44" : "transparent"}`,
                  cursor: "pointer", textAlign: "left",
                }}>
                  <span style={{ color: C.gold, fontFamily: C.mono, fontSize: 12, width: 18, textAlign: "center", flexShrink: 0 }}>{l.act}</span>
                  <span style={{ color: isActive ? C.text : C.muted, fontFamily: C.mono, fontSize: 11, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</span>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                    background: l.status === "done" ? C.gold : l.status === "generating" ? C.emerald : l.status === "error" ? C.crimson : C.border,
                    boxShadow: l.status === "generating" ? `0 0 6px ${C.emerald}` : "none",
                    animation: l.status === "generating" ? "pulse 1s ease-in-out infinite" : "none",
                  }} />
                </button>
              );
            })}
          </div>

          {/* Side panel tabs */}
          <div style={{ borderTop: `1px solid ${C.border}`, display: "flex" }}>
            {[
              { id: "world", icon: "🌍", tip: "World Map" },
              { id: "chat",  icon: "💬", tip: "Chat"      },
              { id: "outline",icon: "📋", tip: "Outline"  },
            ].map(t => (
              <button key={t.id} onClick={() => setSidePanel(sidePanel === t.id ? null : t.id)} title={t.tip} style={{
                flex: 1, padding: "8px 0",
                background: sidePanel === t.id ? `${C.gold}18` : "none",
                border: "none", borderRight: t.id === "world" ? `1px solid ${C.border}` : t.id === "chat" ? `1px solid ${C.border}` : "none",
                color: sidePanel === t.id ? C.gold : C.dim,
                cursor: "pointer", fontFamily: C.mono, fontSize: 16,
              }}>{t.icon}</button>
            ))}
          </div>
        </div>

        {/* Side panel expansion */}
        {sidePanel && (
          <div style={{
            width: sidePanel === "chat" ? 320 : 260,
            borderRight: `1px solid ${C.border}`,
            background: C.panel, overflow: "hidden",
            display: "flex", flexDirection: "column",
          }}>
            {sidePanel === "world" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Game World Map</span>
                </div>
                <div style={{ flex: 1, overflow: "auto" }}>
                  <GameWorldMap levels={levels} />
                  {plan?.themes && (
                    <div style={{ padding: "0 16px 16px" }}>
                      <div style={{ fontSize: 11, color: C.dim, fontFamily: C.mono, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Themes</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {plan.themes.map(t => badge(t, C.emerald))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            {sidePanel === "chat" && (
              <GameDesignDialogue levels={levels} characters={characters} onApplyEdit={() => {}} />
            )}
            {sidePanel === "outline" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Game Outline</span>
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
                  {plan?.structure?.map((act, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ color: C.gold, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Act {act.act}</div>
                      <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.5, marginBottom: 6 }}>{act.purpose}</div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4 }}>
                        {act.keyMechanics?.map((e, j) => (
                          <div key={j} style={{ marginBottom: 2 }}>• {e}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Main editor area */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {!activeLevel ? (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 24,
              color: C.dim, fontFamily: C.mono,
            }}>
              <div style={{ fontSize: 48, opacity: 0.2 }}>🎮</div>
              <div style={{ fontSize: 14, opacity: 0.5 }}>No level selected</div>
              <button onClick={() => setShowArchitect(true)} style={{
                padding: "12px 28px",
                background: `linear-gradient(90deg, ${C.gold}22, ${C.crimson}22)`,
                border: `1px solid ${C.gold}55`, borderRadius: 10,
                color: C.gold, cursor: "pointer", fontFamily: C.mono, fontSize: 14, fontWeight: 700,
              }}>🎮 Begin Game</button>
            </div>
          ) : (
            <LevelPanel
              level={activeLevel}
              onDelete={() => {
                setLevels(prev => prev.filter(l => l.id !== activeLevel.id));
                setActiveLevelId(levels.find(l => l.id !== activeLevel.id)?.id || null);
              }}
              onExpand={() => expandLevel(activeLevel)}
              onCritique={() => critiqueLevel(activeLevel)}
              onEdit={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}