// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MYTHOLOGY CREATION FORGE — Interactive Mythological Narrative Creation System
// Ported and adapted from CodeForge.jsx for epic mythological storytelling.
// Features: Myth Architect, Saga Builder, Archetype Weaver, Lore Analyzer,
// Tradition Keeper, Myth Polisher, Epic Dialogue.
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
  greek:         { icon: "🏛️", color: C.gold,     label: "Greek"         },
  norse:         { icon: "⚔️", color: C.sapphire, label: "Norse"         },
  egyptian:      { icon: "🐍", color: C.emerald,  label: "Egyptian"      },
  hindu:         { icon: "🕉️", color: C.crimson,  label: "Hindu"         },
  celtic:        { icon: "🍀", color: C.emerald,  label: "Celtic"        },
  african:       { icon: "🦁", color: C.gold,     label: "African"       },
  native_american:{ icon: "🪶", color: C.sapphire, label: "Native American" },
  chinese:       { icon: "🐉", color: C.emerald,  label: "Chinese"       },
  japanese:      { icon: "🌸", color: C.crimson,  label: "Japanese"      },
  original:      { icon: "✨", color: C.gold,     label: "Original"      },
};

const ARCHETYPES = [
  { id: "creation_myth",   label: "Creation Myth",     icon: "🌟", description: "Origins of the world and cosmos" },
  { id: "hero_journey",    label: "Hero's Journey",    icon: "⚔️", description: "Epic quests and heroic deeds" },
  { id: "gods_and_goddesses", label: "Gods & Goddesses", icon: "👑", description: "Divine beings and their domains" },
  { id: "trickster_tales", label: "Trickster Tales",   icon: "🦊", description: "Clever deception and transformation" },
  { id: "flood_deluge",    label: "Flood/Deluge",      icon: "🌊", description: "Cataclysmic events and renewal" },
  { id: "afterlife_journey", label: "Afterlife Journey", icon: "👻", description: "Journeys beyond death" },
  { id: "love_and_betrayal", label: "Love & Betrayal",  icon: "💔", description: "Romantic tragedies and passions" },
  { id: "monster_slayer",  label: "Monster Slayer",    icon: "🐉", description: "Battles against monstrous foes" },
  { id: "cultural_hero",   label: "Cultural Hero",     icon: "🌱", description: "Bringers of civilization and knowledge" },
  { id: "custom",          label: "Custom Myth",       icon: "✨", description: "Describe your own mythological approach" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => `mc_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

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

// ── Archetype Constellation ────────────────────────────────────────────────────
function ArchetypeConstellation({ sagas }) {
  const width = 380, height = 200;
  if (!sagas.length) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, color:C.dim, fontFamily:C.mono, fontSize:12 }}>
      No sagas yet
    </div>
  );

  const archetypes = {};
  sagas.forEach(s => {
    if (s.archetypes) s.archetypes.forEach(a => {
      archetypes[a] = (archetypes[a] || 0) + 1;
    });
  });

  const nodes = Object.entries(archetypes).map(([archetype, count], i) => ({
    archetype, count,
    x: 40 + (i / Math.max(Object.keys(archetypes).length - 1, 1)) * (width - 80),
    y: height / 2 + (Math.sin(i * 0.8) * 60), // Orbital pattern
  }));

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height + 40}`} style={{ fontFamily: C.mono }}>
      <defs>
        <radialGradient id="mythGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={C.crimson} />
          <stop offset="50%" stopColor={C.gold} />
          <stop offset="100%" stopColor={C.emerald} />
        </radialGradient>
      </defs>

      {/* Orbital rings */}
      {[40, 80, 120].map(radius => (
        <circle key={radius} cx={width/2} cy={height/2} r={radius}
          fill="none" stroke={C.border} strokeWidth={1} opacity={0.3} />
      ))}

      {/* Archetype nodes */}
      {nodes.map((node, i) => (
        <g key={node.archetype}>
          <circle cx={node.x} cy={node.y} r={Math.max(8, node.count * 3)} fill="url(#mythGradient)" stroke={C.bg} strokeWidth={2} />
          <text x={node.x} y={node.y - 15} textAnchor="middle" fill={C.text} fontSize="10" fontWeight="600">
            {node.archetype.length > 10 ? node.archetype.slice(0,10)+"…" : node.archetype}
          </text>
          <text x={node.x} y={node.y + 18} textAnchor="middle" fill={C.dim} fontSize="9">{node.count}</text>
        </g>
      ))}

      {/* Connecting lines */}
      {nodes.length > 1 && nodes.map((node, i) => {
        if (i < nodes.length - 1) {
          const next = nodes[i + 1];
          return (
            <line key={`line-${i}`} x1={node.x} y1={node.y} x2={next.x} y2={next.y}
              stroke={C.gold} strokeWidth={2} opacity={0.6} />
          );
        }
        return null;
      })}

      {/* Labels */}
      <text x={0} y={height + 20} fill={C.dim} fontSize="10">Mythic Archetypes</text>
      <text x={width} y={height + 20} fill={C.dim} fontSize="10" textAnchor="end">Archetype Constellation</text>
      <text x={width/2} y={height + 35} fill={C.dim} fontSize="9" textAnchor="middle">Frequency & Mythic Patterns</text>
    </svg>
  );
}

// ── Saga Panel ────────────────────────────────────────────────────────────────
function SagaPanel({ saga, onEdit, onDelete, onExpand, onLoreAnalyze }) {
  const [tab, setTab] = useState("narrative");
  const [copied, setCopied] = useState(false);
  const lines = (saga.content || "").split("\n");

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      background: C.panel, border: `1px solid ${C.border}`,
      borderRadius: 10, overflow: "hidden", height: "100%",
    }}>
      {/* Saga header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 14px", background: C.surface,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ color: C.crimson, fontFamily: C.mono, fontSize: 13, fontWeight: 700 }}>🏛️</span>
        <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, flex: 1 }}>{saga.title}</span>
        {badge(saga.cycle || "Cycle 1", C.sapphire)}
        {saga.status === "generating" && <Spin size={12} />}
        {saga.status === "done" && <StatusDot color={C.crimson} />}
        {saga.status === "error" && <StatusDot color={C.crimson} />}

        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {[
            { id: "narrative", label: "Narrative" },
            { id: "lore", label: "Lore" },
            { id: "notes", label: "Notes" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
              background: tab === t.id ? `${C.crimson}22` : "none",
              border: `1px solid ${tab === t.id ? C.crimson + "66" : "transparent"}`,
              color: tab === t.id ? C.crimson : C.dim, fontFamily: C.mono,
            }}>{t.label}</button>
          ))}
          <button onClick={() => { navigator.clipboard.writeText(saga.content || ""); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
            style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer", background: "none", border: `1px solid ${C.border}`, color: copied ? C.crimson : C.dim, fontFamily: C.mono }}>
            {copied ? "✓" : "copy"}
          </button>
          <button onClick={onDelete} style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, cursor: "pointer", background: "none", border: "none", color: C.dim }}>✕</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        {tab === "narrative" && (
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
            {/* Saga text */}
            <pre style={{
              flex: 1, margin: 0, padding: "14px 20px",
              fontFamily: C.serif, fontSize: 16, lineHeight: "24px",
              color: "#f0e6d2", background: C.bg,
              overflowX: "auto", whiteSpace: "pre-wrap",
            }}>{saga.content || (saga.status === "generating" ? "Weaving mythological narrative..." : "Empty saga")}</pre>
          </div>
        )}

        {tab === "lore" && (
          <div style={{ padding: 20 }}>
            {saga.lore ? (
              <div>
                {/* Score row */}
                {saga.lore.authenticity !== undefined && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ fontSize: 32, fontFamily: C.mono, fontWeight: 700, color: saga.lore.authenticity >= 8 ? C.crimson : saga.lore.authenticity >= 5 ? C.gold : C.emerald }}>
                      {saga.lore.authenticity}/10
                    </div>
                    <div style={{ color: C.muted, fontSize: 13 }}>{saga.lore.summary}</div>
                  </div>
                )}
                {/* Lore elements */}
                {saga.lore.elements?.map((element, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 10, padding: "10px 14px", marginBottom: 8,
                    background: C.surface, borderRadius: 8,
                    borderLeft: `3px solid ${element.significance === "high" ? C.crimson : element.significance === "med" ? C.gold : C.emerald}`,
                  }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{element.significance === "high" ? "🏛️" : element.significance === "med" ? "⚔️" : "🌙"}</span>
                    <div>
                      <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{element.title}</div>
                      <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.6 }}>{element.detail}</div>
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button onClick={onExpand} style={{
                    padding: "8px 18px", background: `${C.crimson}22`,
                    border: `1px solid ${C.crimson}55`, borderRadius: 8,
                    color: C.crimson, cursor: "pointer", fontSize: 13, fontFamily: C.mono,
                  }}>↻ Expand Saga</button>
                </div>
              </div>
            ) : (
              <button onClick={() => onLoreAnalyze(saga)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Analyze Mythic Lore</button>
            )}
          </div>
        )}

        {tab === "notes" && (
          <div style={{ padding: 20 }}>
            {saga.notes ? (
              <pre style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{saga.notes}</pre>
            ) : (
              <button onClick={() => onEdit(saga)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Add Mythic Notes</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Myth Architect ────────────────────────────────────────────────────────────
function MythArchitect({ onAccept, onCancel }) {
  const [step, setStep] = useState(0); // 0=archetype 1=details 2=planning 3=review
  const [archetype, setArchetype] = useState(null);
  const [genre, setGenre] = useState("greek");
  const [desc, setDesc] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const generatePlan = async () => {
    setLoading(true);
    setStep(2);
    setStatusMsg("AI is crafting the mythological framework...");

    const sys = `You are a master mythologist and storyteller. Design a complete mythological narrative.
Return ONLY valid JSON: {
  "title": string,
  "epithet": string,
  "genre": string,
  "tone": string[],
  "deities": [
    {
      "name": string,
      "domain": string,
      "symbol": string,
      "description": string
    }
  ],
  "structure": [
    {
      "cycle": number (1|2|3),
      "purpose": string,
      "sagaCount": number,
      "archetypes": string[]
    }
  ],
  "mythicStyle": string,
  "themes": string[],
  "sagaCount": string
}
Generate 2-4 key deities and 3-cycle structure with 3-5 sagas per cycle. Be mythically authentic.`;

    const msg = `Archetype: ${archetype?.label}
Genre: ${genre}
Description: ${desc || "Craft a mythological narrative that resonates with ancient wisdom"}
Design a complete mythological structure.`;

    try {
      const raw = await claude([{ role: "user", content: msg }], sys, 1200);
      const parsed = parseJSON(raw);
      if (parsed) { setPlan(parsed); setStep(3); }
      else { setStatusMsg("Parse error — please retry."); setStep(1); }
    } catch (e) {
      setStatusMsg("Mythic inspiration failed.");
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
        boxShadow: `0 0 60px ${C.crimsonGlow}`,
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
          <StatusDot color={C.crimson} />
          <span style={{ fontFamily: C.mono, fontSize: 13, color: C.crimson, letterSpacing: "0.1em" }}>
            MYTH ARCHITECT
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {["Archetype","Details","Planning","Review"].map((s,i) => (
              <span key={i} style={{
                fontFamily: C.mono, fontSize: 10, color: step >= i ? C.crimson : C.dim,
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
              <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Choose a Mythological Archetype</h2>
              <p style={{ color: C.dim, fontSize: 13, marginBottom: 24, fontFamily: C.mono }}>What ancient story shall your mythology tell?</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 12 }}>
                {ARCHETYPES.map(a => (
                  <button key={a.id} onClick={() => { setArchetype(a); setStep(1); }}
                    style={{
                      padding: "16px 18px", background: C.surface, border: `1px solid ${C.border}`,
                      borderRadius: 12, cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                      display: "flex", flexDirection: "column", gap: 8,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.crimson + "88"; e.currentTarget.style.background = C.panel; }}
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
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Mythological Tradition</label>
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
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Mythic Concept</label>
                  <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder={`Describe the mythological world, deities, and epic events that drive your ancient narrative...`}
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
                    background: `linear-gradient(90deg, ${C.crimson}22, ${C.gold}22)`,
                    border: `1px solid ${C.crimson}55`, borderRadius: 8,
                    color: C.crimson, fontFamily: C.mono, fontWeight: 700, fontSize: 14,
                    cursor: "pointer", letterSpacing: "0.05em",
                  }}>🏛️ Forge Mythology</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Loading */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 280, gap: 20 }}>
              <div style={{ position: "relative" }}>
                <Spin size={52} />
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.crimson, fontSize: 20 }}>🏛️</span>
              </div>
              <div style={{ color: C.muted, fontFamily: C.mono, fontSize: 13 }}>{statusMsg}</div>
            </div>
          )}

          {/* Step 3: Review plan */}
          {step === 3 && plan && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ color: C.crimson, fontFamily: C.mono, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{plan.title}</h2>
                <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{plan.epithet}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {badge(plan.genre, C.crimson)}
                  {plan.tone?.map(t => badge(t, C.gold))}
                </div>
                <p style={{ color: C.dim, fontSize: 13, lineHeight: 1.7, fontStyle: "italic" }}>
                  {plan.mythicStyle} · {plan.sagaCount} sagas
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Divine Pantheon ({plan.deities?.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.deities?.map((d, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                    }}>
                      <span style={{ color: C.crimson, fontFamily: C.mono, fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>{d.symbol}</span>
                      <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, width: 120, flexShrink: 0 }}>{d.name}</span>
                      <span style={{ color: C.muted, fontSize: 12, flex: 1 }}>{d.domain}: {d.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Mythic Cycles</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.structure?.map((cycle, i) => (
                    <div key={i} style={{
                      padding: "12px 16px", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                    }}>
                      <div style={{ color: C.crimson, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Cycle {cycle.cycle}</div>
                      <div style={{ color: C.muted, fontSize: 12, marginBottom: 6 }}>{cycle.purpose}</div>
                      <div style={{ color: C.dim, fontSize: 11, lineHeight: 1.4 }}>
                        {cycle.sagaCount} sagas
                      </div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4, marginTop: 4 }}>
                        {cycle.archetypes?.join(" → ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(1)} style={{ padding: "10px 20px", background: "none", border: `1px solid ${C.border}`, borderRadius: 8, color: C.dim, cursor: "pointer" }}>← Recraft</button>
                <button onClick={() => onAccept(plan, genre)} style={{
                  flex: 1, padding: "12px 0",
                  background: `linear-gradient(90deg, ${C.crimson}, ${C.gold})`,
                  border: "none", borderRadius: 8, color: C.bg, fontFamily: C.mono,
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  boxShadow: `0 0 30px ${C.crimsonGlow}`,
                }}>🏛️ Begin Mythology</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Epic Dialogue (with mythological storytelling) ────────────────────────────
function EpicDialogue({ sagas, deities, onApplyEdit }) {
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

    const mythicContext = sagas.slice(0, 3).map(s =>
      `SAGA: ${s.title}\n${(s.content || "").slice(0, 400)}`
    ).join("\n\n---\n\n");

    const deityContext = deities.map(d => `${d.name} (${d.domain}): ${d.symbol}`).join("; ");

    const sys = `You are a mythological scholar and epic storyteller. Help develop and refine mythological narratives.
Mythic context: ${mythicContext || "No sagas yet"}
Deities: ${deityContext || "No deities yet"}

Answer the storyteller's question about their mythology. Suggest plot developments, character arcs, symbolic elements, or cultural authenticity.
Be knowledgeable about world mythologies and epic storytelling.`;

    const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
    const raw = await claude([...history, { role: "user", content: userMsg }], sys, 1000).catch(() => "Error consulting with AI.");
    setMessages(m => [...m, { role: "assistant", content: raw }]);
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.panel, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <StatusDot color={C.gold} />
        <span style={{ fontFamily: C.mono, fontSize: 11, color: C.gold, letterSpacing: "0.1em" }}>EPIC DIALOGUE</span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 8px" }}>
        {messages.length === 0 && (
          <div style={{ color: C.dim, fontSize: 12, fontFamily: C.mono, textAlign: "center", paddingTop: 40, lineHeight: 2 }}>
            Ask about your mythology.<br/>
            "How authentic is this deity?" · "What symbols should I use?" · "Mythic plot development?"
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
              background: m.role === "user" ? `${C.crimson}18` : C.surface,
              border: `1px solid ${m.role === "user" ? C.crimson + "44" : C.border}`,
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
          placeholder="Ask about your mythology..."
          style={{
            flex: 1, background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "8px 12px", color: C.text,
            fontFamily: C.sans, fontSize: 13, outline: "none",
          }}
        />
        <button onClick={send} disabled={loading} style={{
          padding: "8px 14px", background: loading ? C.border : `${C.gold}22`,
          border: `1px solid ${C.gold}55`, borderRadius: 8,
          color: C.gold, cursor: loading ? "default" : "pointer", fontFamily: C.mono, fontSize: 12,
        }}>⟶</button>
      </div>
    </div>
  );
}

// ── Main MythologyCreationForge ───────────────────────────────────────────────
export default function MythologyCreationForge() {
  const [sagas, setSagas] = useState([]);
  const [activeSagaId, setActiveSagaId] = useState(null);
  const [showArchitect, setShowArchitect] = useState(false);
  const [mythologyTitle, setMythologyTitle] = useState("Untitled Mythology");
  const [plan, setPlan] = useState(null);
  const [sidePanel, setSidePanel] = useState("constellation"); // constellation | chat | outline
  const [globalStatus, setGlobalStatus] = useState("");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const activeSaga = sagas.find(s => s.id === activeSagaId);

  // ── Generate saga content ────────────────────────────────────────────────────
  const generateSagaContent = useCallback(async (sagaId, planData, genre, allSagas, allDeities) => {
    const cycleMeta = planData?.structure?.find(s => s.cycle === allSagas.find(as => as.id === sagaId)?.cycle);
    const thisSaga = allSagas.find(s => s.id === sagaId);
    if (!thisSaga) return;

    setSagas(prev => prev.map(s => s.id === sagaId ? { ...s, status: "generating" } : s));

    const deitySummary = allDeities.map(d => `${d.name} (${d.domain}): ${d.symbol}`).join("; ");
    const prevSagas = allSagas.filter(s => s.cycle < thisSaga.cycle || (s.cycle === thisSaga.cycle && s.order < thisSaga.order))
      .slice(-2).map(s => `PREV: ${s.title} - ${(s.content || "").slice(0, 200)}...`).join("\n");

    const sys = `You are a master mythologist writing in ${genre} tradition. Write epic mythological narratives.
Output ONLY the saga content — no titles, no explanations.
Write grand, symbolic storytelling with divine interventions, heroic deeds, and cosmic significance.`;

    const msg = `Mythology: ${planData?.title || mythologyTitle}
Genre: ${genre}
Cycle: ${thisSaga.cycle}, Purpose: ${cycleMeta?.purpose || ""}

Deities: ${deitySummary}

This saga: ${thisSaga.title}

Previous context:
${prevSagas}

Write the complete mythological saga.`;

    try {
      const content = await claude([{ role: "user", content: msg }], sys, 1200);
      setSagas(prev => prev.map(s => s.id === sagaId
        ? { ...s, content, status: "done", archetypes: cycleMeta?.archetypes || [] }
        : e
      ));
    } catch {
      setSagas(prev => prev.map(s => s.id === sagaId ? { ...s, status: "error", content: "Saga generation failed." } : s));
    }
  }, [mythologyTitle]);

  // ── Accept mythology plan and generate sagas ────────────────────────────────
  const handleAcceptPlan = useCallback(async (planData, genre) => {
    setShowArchitect(false);
    setMythologyTitle(planData.title);
    setPlan({ ...planData, genre });
    setIsGeneratingAll(true);

    // Create deities
    const newDeities = planData.deities?.map(d => ({
      id: uid(), name: d.name, domain: d.domain, symbol: d.symbol, description: d.description,
      genre, connections: []
    })) || [];
    setDeities(newDeities);

    // Create sagas
    const newSagas = [];
    let sagaCount = 1;
    planData.structure?.forEach(cycle => {
      for (let i = 0; i < cycle.sagaCount; i++) {
        newSagas.push({
          id: uid(), title: `Saga ${sagaCount}`, cycle: cycle.cycle, order: i + 1,
          form: "mythologycreation", content: "", status: "queued", lore: null, notes: null,
          archetypes: cycle.archetypes || [],
        });
        sagaCount++;
      }
    });

    setSagas(newSagas);
    setActiveSagaId(newSagas[0]?.id);

    for (let i = 0; i < newSagas.length; i++) {
      setGlobalStatus(`Weaving ${i + 1}/${newSagas.length}: ${newSagas[i].title}`);
      await generateSagaContent(newSagas[i].id, planData, genre, newSagas, newDeities);
      await new Promise(r => setTimeout(r, 300));
    }

    setGlobalStatus("Mythological narrative complete.");
    setIsGeneratingAll(false);
  }, [generateSagaContent]);

  // ── Lore analyze saga ────────────────────────────────────────────────────────
  const loreAnalyzeSaga = useCallback(async (saga) => {
    if (!saga.content) return;
    setSagas(prev => prev.map(s => s.id === saga.id ? { ...s, status: "generating" } : s));

    const sys = `You are a mythological scholar analyzing lore authenticity. Analyze the saga and return ONLY JSON:
{
  "authenticity": number (1-10),
  "summary": string (one sentence),
  "elements": [
    { "significance": "high"|"med"|"low", "title": string, "detail": string }
  ]
}
Be knowledgeable about mythological traditions, symbols, and narrative patterns. Limit to 3 elements max.`;

    const raw = await claude([{ role: "user", content: `Analyze mythological lore in this saga:\n\n${saga.content}` }], sys, 1000).catch(() => null);
    const parsed = raw ? parseJSON(raw) : null;

    setSagas(prev => prev.map(s => s.id === saga.id
      ? { ...s, status: "done", lore: parsed || { authenticity: 5, summary: "Lore analysis failed.", elements: [] } }
      : s
    ));
  }, []);

  // ── Expand saga ──────────────────────────────────────────────────────────────
  const expandSaga = useCallback(async (saga) => {
    if (!saga.content) return;
    setSagas(prev => prev.map(s => s.id === saga.id ? { ...s, status: "generating" } : s));

    const sys = `You are a mythologist expanding a saga. Add more epic scope, symbolic depth, and mythological richness.
Return ONLY the expanded saga — no explanations.`;

    const msg = `Expand this mythological saga with greater epic scope:\n\n${saga.content}`;

    const expanded = await claude([{ role: "user", content: msg }], sys, 1200).catch(() => saga.content);
    setSagas(prev => prev.map(s => s.id === saga.id
      ? { ...s, content: expanded, status: "done", lore: null }
      : s
    ));
  }, []);

  // ── Quick add saga ───────────────────────────────────────────────────────────
  const addBlankSaga = () => {
    const name = `Saga ${sagas.length + 1}`;
    const newSaga = { id: uid(), title: name, cycle: 1, order: sagas.length + 1, form: "mythologycreation", content: "", status: "queued", lore: null, notes: null, archetypes: [] };
    setSagas(prev => [...prev, newSaga]);
    setActiveSagaId(newSaga.id);
  };

  const doneCount = sagas.filter(s => s.status === "done").length;
  const totalWords = sagas.reduce((acc, s) => acc + (s.content?.split(/\s+/).length || 0), 0);

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

      {showArchitect && <MythArchitect onAccept={handleAcceptPlan} onCancel={() => setShowArchitect(false)} />}

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "10px 20px", background: C.panel,
        borderBottom: `1px solid ${C.border}`,
        height: 50, flexShrink: 0,
      }}>
        <span style={{ fontFamily: C.mono, color: C.crimson, fontSize: 14, fontWeight: 700, letterSpacing: "0.12em" }}>🏛️ MYTHOLOGY CREATION FORGE</span>
        <span style={{ color: C.dim, fontSize: 12, fontFamily: C.mono }}>/{mythologyTitle}</span>

        {globalStatus && (
          <span style={{ color: C.gold, fontFamily: C.mono, fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
            {isGeneratingAll && <Spin size={11} />}
            {globalStatus}
          </span>
        )}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          {sagas.length > 0 && (
            <>
              <span style={{ fontFamily: C.mono, fontSize: 11, color: C.dim }}>
                {doneCount}/{sagas.length} sagas · ~{totalWords.toLocaleString()} words
              </span>
              {badge(plan?.genre || "greek", C.crimson)}
            </>
          )}
          <button onClick={addBlankSaga} style={{
            padding: "5px 14px", background: "none", border: `1px solid ${C.border}`,
            borderRadius: 6, color: C.muted, cursor: "pointer", fontFamily: C.mono, fontSize: 11,
          }}>+ Saga</button>
          <button onClick={() => setShowArchitect(true)} style={{
            padding: "6px 18px",
            background: `linear-gradient(90deg, ${C.crimson}22, ${C.gold}22)`,
            border: `1px solid ${C.crimson}55`, borderRadius: 7,
            color: C.crimson, cursor: "pointer", fontFamily: C.mono, fontSize: 12, fontWeight: 700,
            boxShadow: `0 0 16px ${C.crimsonGlow}`,
          }}>🏛️ New Mythology</button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* Saga tree sidebar */}
        <div style={{
          width: 240, flexShrink: 0, borderRight: `1px solid ${C.border}`,
          background: C.panel, display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.12em", textTransform: "uppercase" }}>Sagas</span>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "8px 8px" }}>
            {sagas.length === 0 && (
              <div style={{ padding: "30px 14px", color: C.dim, fontSize: 11, fontFamily: C.mono, textAlign: "center", lineHeight: 2 }}>
                No sagas.<br/>Start with 🏛️ New Mythology.
              </div>
            )}
            {sagas.map(s => {
              const isActive = s.id === activeSagaId;
              return (
                <button key={s.id} onClick={() => setActiveSagaId(s.id)} style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  padding: "7px 10px", borderRadius: 6, marginBottom: 2,
                  background: isActive ? `${C.crimson}18` : "none",
                  border: `1px solid ${isActive ? C.crimson + "44" : "transparent"}`,
                  cursor: "pointer", textAlign: "left",
                }}>
                  <span style={{ color: C.crimson, fontFamily: C.mono, fontSize: 12, width: 18, textAlign: "center", flexShrink: 0 }}>{s.cycle}</span>
                  <span style={{ color: isActive ? C.text : C.muted, fontFamily: C.mono, fontSize: 11, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                    background: s.status === "done" ? C.crimson : s.status === "generating" ? C.gold : s.status === "error" ? C.crimson : C.border,
                    boxShadow: s.status === "generating" ? `0 0 6px ${C.gold}` : "none",
                    animation: s.status === "generating" ? "pulse 1s ease-in-out infinite" : "none",
                  }} />
                </button>
              );
            })}
          </div>

          {/* Side panel tabs */}
          <div style={{ borderTop: `1px solid ${C.border}`, display: "flex" }}>
            {[
              { id: "constellation", icon: "⭐", tip: "Archetype Constellation" },
              { id: "chat", icon: "💬", tip: "Chat"        },
              { id: "outline", icon: "📋", tip: "Outline"  },
            ].map(t => (
              <button key={t.id} onClick={() => setSidePanel(sidePanel === t.id ? null : t.id)} title={t.tip} style={{
                flex: 1, padding: "8px 0",
                background: sidePanel === t.id ? `${C.crimson}18` : "none",
                border: "none", borderRight: t.id === "constellation" ? `1px solid ${C.border}` : t.id === "chat" ? `1px solid ${C.border}` : "none",
                color: sidePanel === t.id ? C.crimson : C.dim,
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
            {sidePanel === "constellation" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Mythic Archetype Constellation</span>
                </div>
                <div style={{ flex: 1, overflow: "auto" }}>
                  <ArchetypeConstellation sagas={sagas} />
                  {plan?.themes && (
                    <div style={{ padding: "0 16px 16px" }}>
                      <div style={{ fontSize: 11, color: C.dim, fontFamily: C.mono, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Themes</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {plan.themes.map(t => badge(t, C.gold))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            {sidePanel === "chat" && (
              <EpicDialogue sagas={sagas} deities={deities} onApplyEdit={() => {}} />
            )}
            {sidePanel === "outline" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Mythology Outline</span>
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
                  {plan?.structure?.map((cycle, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ color: C.crimson, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Cycle {cycle.cycle}</div>
                      <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.5, marginBottom: 6 }}>{cycle.purpose}</div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4 }}>
                        {cycle.sagaCount} sagas
                      </div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4, marginTop: 4 }}>
                        {cycle.archetypes?.join(" → ")}
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
          {!activeSaga ? (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 24,
              color: C.dim, fontFamily: C.mono,
            }}>
              <div style={{ fontSize: 48, opacity: 0.2 }}>🏛️</div>
              <div style={{ fontSize: 14, opacity: 0.5 }}>No saga selected</div>
              <button onClick={() => setShowArchitect(true)} style={{
                padding: "12px 28px",
                background: `linear-gradient(90deg, ${C.crimson}22, ${C.gold}22)`,
                border: `1px solid ${C.crimson}55`, borderRadius: 10,
                color: C.crimson, cursor: "pointer", fontFamily: C.mono, fontSize: 14, fontWeight: 700,
              }}>🏛️ Begin Mythology</button>
            </div>
          ) : (
            <SagaPanel
              saga={activeSaga}
              onDelete={() => {
                setSagas(prev => prev.filter(s => s.id !== activeSaga.id));
                setActiveSagaId(sagas.find(s => s.id !== activeSaga.id)?.id || null);
              }}
              onExpand={() => expandSaga(activeSaga)}
              onLoreAnalyze={() => loreAnalyzeSaga(activeSaga)}
              onEdit={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}