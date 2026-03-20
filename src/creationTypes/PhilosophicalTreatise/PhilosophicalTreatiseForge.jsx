// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHILOSOPHICAL TREATISE FORGE — Interactive Philosophical Writing System
// Ported and adapted from CodeForge.jsx for rigorous philosophical discourse.
// Features: Philosophical Architect, Argument Builder, Logic Analyzer,
// Concept Weaver, Dialectic Polisher, Philosophical Dialogue.
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
  analytic:       { icon: "🔍", color: C.sapphire,  label: "Analytic"       },
  continental:    { icon: "🌍", color: C.emerald,   label: "Continental"    },
  eastern:        { icon: "☯️", color: C.gold,      label: "Eastern"        },
  existential:    { icon: "🤔", color: C.crimson,   label: "Existential"    },
  pragmatist:     { icon: "⚙️", color: C.emerald,   label: "Pragmatist"     },
  feminist:       { icon: "♀️", color: C.crimson,   label: "Feminist"       },
  postmodern:     { icon: "🎭", color: C.gold,      label: "Postmodern"     },
  ancient:        { icon: "🏛️", color: C.sapphire,  label: "Ancient"        },
  medieval:       { icon: "📜", color: C.emerald,   label: "Medieval"       },
  enlightenment:  { icon: "💡", color: C.gold,      label: "Enlightenment"  },
};

const ARCHETYPES = [
  { id: "systematic_treatise", label: "Systematic Treatise", icon: "📚", description: "Comprehensive philosophical system building" },
  { id: "dialogue_socratic", label: "Socratic Dialogue", icon: "💬", description: "Question-and-answer philosophical inquiry" },
  { id: "critique_analysis", label: "Critical Analysis", icon: "🔬", description: "Examination and evaluation of philosophical positions" },
  { id: "meditation_reflection", label: "Philosophical Meditation", icon: "🧘", description: "Contemplative exploration of fundamental questions" },
  { id: "dialectical_method", label: "Dialectical Method", icon: "⚖️", description: "Thesis-antithesis-synthesis argumentation" },
  { id: "phenomenological_study", label: "Phenomenological Study", icon: "👁️", description: "Investigation of conscious experience" },
  { id: "ethical_inquiry", label: "Ethical Inquiry", icon: "⚖️", description: "Examination of moral philosophy and values" },
  { id: "metaphysical_investigation", label: "Metaphysical Investigation", icon: "🌌", description: "Study of reality, existence, and being" },
  { id: "epistemological_analysis", label: "Epistemological Analysis", icon: "🧠", description: "Theory of knowledge and justification" },
  { id: "custom", label: "Custom Philosophical Work", icon: "✨", description: "Describe your own philosophical approach" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => `pt_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

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

// ── Concept Lattice ───────────────────────────────────────────────────────────
function ConceptLattice({ sections }) {
  const width = 380, height = 200;
  if (!sections.length) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, color:C.dim, fontFamily:C.mono, fontSize:12 }}>
      No sections yet
    </div>
  );

  const concepts = {};
  sections.forEach(s => {
    if (s.concepts) s.concepts.forEach(c => {
      concepts[c] = (concepts[c] || 0) + 1;
    });
  });

  const nodes = Object.entries(concepts).map(([concept, count], i) => ({
    concept, count,
    x: 40 + (i / Math.max(Object.keys(concepts).length - 1, 1)) * (width - 80),
    y: height / 2 + (Math.sin(i * 0.7) * 50), // Lattice pattern
  }));

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height + 40}`} style={{ fontFamily: C.mono }}>
      <defs>
        <radialGradient id="conceptGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={C.sapphire} />
          <stop offset="50%" stopColor={C.gold} />
          <stop offset="100%" stopColor={C.emerald} />
        </radialGradient>
      </defs>

      {/* Lattice grid */}
      {[0,1,2,3,4].map(row => (
        <g key={row}>
          {[0,1,2,3,4].map(col => (
            <circle key={`${row}-${col}`} cx={40 + col * 68} cy={30 + row * 35} r={2} fill={C.border} opacity={0.3} />
          ))}
        </g>
      ))}

      {/* Concept nodes */}
      {nodes.map((node, i) => (
        <g key={node.concept}>
          <circle cx={node.x} cy={node.y} r={Math.max(6, node.count * 2)} fill="url(#conceptGradient)" stroke={C.bg} strokeWidth={2} />
          <text x={node.x} y={node.y - 12} textAnchor="middle" fill={C.text} fontSize="10" fontWeight="600">
            {node.concept.length > 8 ? node.concept.slice(0,8)+"…" : node.concept}
          </text>
          <text x={node.x} y={node.y + 16} textAnchor="middle" fill={C.dim} fontSize="9">{node.count}</text>
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
      <text x={0} y={height + 20} fill={C.dim} fontSize="10">Philosophical Concepts</text>
      <text x={width} y={height + 20} fill={C.dim} fontSize="10" textAnchor="end">Concept Lattice</text>
      <text x={width/2} y={height + 35} fill={C.dim} fontSize="9" textAnchor="middle">Interconnections & Depth</text>
    </svg>
  );
}

// ── Section Panel ─────────────────────────────────────────────────────────────
function SectionPanel({ section, onEdit, onDelete, onExpand, onLogicAnalyze }) {
  const [tab, setTab] = useState("content");
  const [copied, setCopied] = useState(false);
  const lines = (section.content || "").split("\n");

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      background: C.panel, border: `1px solid ${C.border}`,
      borderRadius: 10, overflow: "hidden", height: "100%",
    }}>
      {/* Section header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 14px", background: C.surface,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ color: C.sapphire, fontFamily: C.mono, fontSize: 13, fontWeight: 700 }}>📚</span>
        <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, flex: 1 }}>{section.title}</span>
        {badge(section.chapter || "Chapter 1", C.emerald)}
        {section.status === "generating" && <Spin size={12} />}
        {section.status === "done" && <StatusDot color={C.sapphire} />}
        {section.status === "error" && <StatusDot color={C.crimson} />}

        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {[
            { id: "content", label: "Content" },
            { id: "logic", label: "Logic" },
            { id: "notes", label: "Notes" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
              background: tab === t.id ? `${C.sapphire}22` : "none",
              border: `1px solid ${tab === t.id ? C.sapphire + "66" : "transparent"}`,
              color: tab === t.id ? C.sapphire : C.dim, fontFamily: C.mono,
            }}>{t.label}</button>
          ))}
          <button onClick={() => { navigator.clipboard.writeText(section.content || ""); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
            style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer", background: "none", border: `1px solid ${C.border}`, color: copied ? C.sapphire : C.dim, fontFamily: C.mono }}>
            {copied ? "✓" : "copy"}
          </button>
          <button onClick={onDelete} style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, cursor: "pointer", background: "none", border: "none", color: C.dim }}>✕</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        {tab === "content" && (
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
            {/* Section text */}
            <pre style={{
              flex: 1, margin: 0, padding: "14px 20px",
              fontFamily: C.serif, fontSize: 16, lineHeight: "24px",
              color: "#f0e6d2", background: C.bg,
              overflowX: "auto", whiteSpace: "pre-wrap",
            }}>{section.content || (section.status === "generating" ? "Developing philosophical argument..." : "Empty section")}</pre>
          </div>
        )}

        {tab === "logic" && (
          <div style={{ padding: 20 }}>
            {section.logic ? (
              <div>
                {/* Score row */}
                {section.logic.coherence !== undefined && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ fontSize: 32, fontFamily: C.mono, fontWeight: 700, color: section.logic.coherence >= 8 ? C.sapphire : section.logic.coherence >= 5 ? C.gold : C.emerald }}>
                      {section.logic.coherence}/10
                    </div>
                    <div style={{ color: C.muted, fontSize: 13 }}>{section.logic.summary}</div>
                  </div>
                )}
                {/* Logic issues */}
                {section.logic.issues?.map((issue, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 10, padding: "10px 14px", marginBottom: 8,
                    background: C.surface, borderRadius: 8,
                    borderLeft: `3px solid ${issue.severity === "high" ? C.crimson : issue.severity === "med" ? C.emerald : C.dim}`,
                  }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{issue.severity === "high" ? "❌" : issue.severity === "med" ? "⚠️" : "ℹ️"}</span>
                    <div>
                      <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{issue.title}</div>
                      <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.6 }}>{issue.detail}</div>
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button onClick={onExpand} style={{
                    padding: "8px 18px", background: `${C.sapphire}22`,
                    border: `1px solid ${C.sapphire}55`, borderRadius: 8,
                    color: C.sapphire, cursor: "pointer", fontSize: 13, fontFamily: C.mono,
                  }}>↻ Expand Section</button>
                </div>
              </div>
            ) : (
              <button onClick={() => onLogicAnalyze(section)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Analyze Logical Structure</button>
            )}
          </div>
        )}

        {tab === "notes" && (
          <div style={{ padding: 20 }}>
            {section.notes ? (
              <pre style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{section.notes}</pre>
            ) : (
              <button onClick={() => onEdit(section)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Add Philosophical Notes</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Philosophical Architect ───────────────────────────────────────────────────
function PhilosophicalArchitect({ onAccept, onCancel }) {
  const [step, setStep] = useState(0); // 0=archetype 1=details 2=planning 3=review
  const [archetype, setArchetype] = useState(null);
  const [genre, setGenre] = useState("analytic");
  const [desc, setDesc] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const generatePlan = async () => {
    setLoading(true);
    setStep(2);
    setStatusMsg("AI is crafting the philosophical framework...");

    const sys = `You are a master philosopher and academic writer. Design a complete philosophical treatise.
Return ONLY valid JSON: {
  "title": string,
  "subtitle": string,
  "genre": string,
  "approach": string[],
  "thinkers": [
    {
      "name": string,
      "influence": string,
      "contribution": string,
      "era": string
    }
  ],
  "structure": [
    {
      "part": number (1|2|3),
      "focus": string,
      "sectionCount": number,
      "concepts": string[]
    }
  ],
  "methodology": string,
  "themes": string[],
  "sectionCount": string
}
Generate 2-4 key philosophical thinkers and 3-part structure with 4-6 sections per part. Be philosophically rigorous.`;

    const msg = `Archetype: ${archetype?.label}
Genre: ${genre}
Description: ${desc || "Craft a philosophical treatise that advances human understanding"}
Design a complete philosophical structure.`;

    try {
      const raw = await claude([{ role: "user", content: msg }], sys, 1200);
      const parsed = parseJSON(raw);
      if (parsed) { setPlan(parsed); setStep(3); }
      else { setStatusMsg("Parse error — please retry."); setStep(1); }
    } catch (e) {
      setStatusMsg("Philosophical inspiration failed.");
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
        boxShadow: `0 0 60px ${C.sapphireGlow}`,
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
          <StatusDot color={C.sapphire} />
          <span style={{ fontFamily: C.mono, fontSize: 13, color: C.sapphire, letterSpacing: "0.1em" }}>
            PHILOSOPHICAL ARCHITECT
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {["Archetype","Details","Planning","Review"].map((s,i) => (
              <span key={i} style={{
                fontFamily: C.mono, fontSize: 10, color: step >= i ? C.sapphire : C.dim,
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
              <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Choose a Philosophical Archetype</h2>
              <p style={{ color: C.dim, fontSize: 13, marginBottom: 24, fontFamily: C.mono }}>What philosophical method shall guide your treatise?</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 12 }}>
                {ARCHETYPES.map(a => (
                  <button key={a.id} onClick={() => { setArchetype(a); setStep(1); }}
                    style={{
                      padding: "16px 18px", background: C.surface, border: `1px solid ${C.border}`,
                      borderRadius: 12, cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                      display: "flex", flexDirection: "column", gap: 8,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.sapphire + "88"; e.currentTarget.style.background = C.panel; }}
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
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Philosophical Tradition</label>
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
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Philosophical Thesis</label>
                  <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder={`Describe the philosophical problem, question, or thesis that drives your treatise...`}
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
                    background: `linear-gradient(90deg, ${C.sapphire}22, ${C.gold}22)`,
                    border: `1px solid ${C.sapphire}55`, borderRadius: 8,
                    color: C.sapphire, fontFamily: C.mono, fontWeight: 700, fontSize: 14,
                    cursor: "pointer", letterSpacing: "0.05em",
                  }}>📚 Forge Treatise</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Loading */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 280, gap: 20 }}>
              <div style={{ position: "relative" }}>
                <Spin size={52} />
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.sapphire, fontSize: 20 }}>📚</span>
              </div>
              <div style={{ color: C.muted, fontFamily: C.mono, fontSize: 13 }}>{statusMsg}</div>
            </div>
          )}

          {/* Step 3: Review plan */}
          {step === 3 && plan && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ color: C.sapphire, fontFamily: C.mono, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{plan.title}</h2>
                <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{plan.subtitle}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {badge(plan.genre, C.sapphire)}
                  {plan.approach?.map(a => badge(a, C.gold))}
                </div>
                <p style={{ color: C.dim, fontSize: 13, lineHeight: 1.7, fontStyle: "italic" }}>
                  {plan.methodology} · {plan.sectionCount} sections
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Key Thinkers ({plan.thinkers?.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.thinkers?.map((t, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                    }}>
                      <span style={{ color: C.sapphire, fontFamily: C.mono, fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>{t.era?.[0]?.toUpperCase()}</span>
                      <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, width: 140, flexShrink: 0 }}>{t.name}</span>
                      <span style={{ color: C.muted, fontSize: 12, flex: 1 }}>{t.influence}: {t.contribution}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Structure</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.structure?.map((part, i) => (
                    <div key={i} style={{
                      padding: "12px 16px", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                    }}>
                      <div style={{ color: C.sapphire, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Part {part.part}</div>
                      <div style={{ color: C.muted, fontSize: 12, marginBottom: 6 }}>{part.focus}</div>
                      <div style={{ color: C.dim, fontSize: 11, lineHeight: 1.4 }}>
                        {part.sectionCount} sections
                      </div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4, marginTop: 4 }}>
                        {part.concepts?.join(" → ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(1)} style={{ padding: "10px 20px", background: "none", border: `1px solid ${C.border}`, borderRadius: 8, color: C.dim, cursor: "pointer" }}>← Recraft</button>
                <button onClick={() => onAccept(plan, genre)} style={{
                  flex: 1, padding: "12px 0",
                  background: `linear-gradient(90deg, ${C.sapphire}, ${C.gold})`,
                  border: "none", borderRadius: 8, color: C.bg, fontFamily: C.mono,
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  boxShadow: `0 0 30px ${C.sapphireGlow}`,
                }}>📚 Begin Treatise</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Philosophical Dialogue (with philosophical discourse) ─────────────────────
function PhilosophicalDialogue({ sections, thinkers, onApplyEdit }) {
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

    const treatiseContext = sections.slice(0, 3).map(s =>
      `SECTION: ${s.title}\n${(s.content || "").slice(0, 400)}`
    ).join("\n\n---\n\n");

    const thinkerContext = thinkers.map(t => `${t.name} (${t.era}): ${t.influence}`).join("; ");

    const sys = `You are a philosophical scholar and critical thinker. Help develop and refine philosophical treatises.
Treatise context: ${treatiseContext || "No sections yet"}
Thinkers: ${thinkerContext || "No thinkers yet"}

Answer the philosopher's question about their treatise. Suggest arguments, counterarguments, conceptual clarifications, or connections to philosophical tradition.
Be rigorous, insightful, and intellectually honest.`;

    const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
    const raw = await claude([...history, { role: "user", content: userMsg }], sys, 1000).catch(() => "Error consulting with AI.");
    setMessages(m => [...m, { role: "assistant", content: raw }]);
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.panel, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <StatusDot color={C.gold} />
        <span style={{ fontFamily: C.mono, fontSize: 11, color: C.gold, letterSpacing: "0.1em" }}>PHILOSOPHICAL DISCOURSE</span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 8px" }}>
        {messages.length === 0 && (
          <div style={{ color: C.dim, fontSize: 12, fontFamily: C.mono, textAlign: "center", paddingTop: 40, lineHeight: 2 }}>
            Ask about your treatise.<br/>
            "How does this argument hold up?" · "What would Kant say?" · "Logical consistency?"
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
              background: m.role === "user" ? `${C.sapphire}18` : C.surface,
              border: `1px solid ${m.role === "user" ? C.sapphire + "44" : C.border}`,
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
          placeholder="Ask about your treatise..."
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

// ── Main PhilosophicalTreatiseForge ───────────────────────────────────────────
export default function PhilosophicalTreatiseForge() {
  const [sections, setSections] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [showArchitect, setShowArchitect] = useState(false);
  const [treatiseTitle, setTreatiseTitle] = useState("Untitled Treatise");
  const [plan, setPlan] = useState(null);
  const [sidePanel, setSidePanel] = useState("lattice"); // lattice | chat | outline
  const [globalStatus, setGlobalStatus] = useState("");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const activeSection = sections.find(s => s.id === activeSectionId);

  // ── Generate section content ────────────────────────────────────────────────
  const generateSectionContent = useCallback(async (sectionId, planData, genre, allSections, allThinkers) => {
    const partMeta = planData?.structure?.find(s => s.part === allSections.find(as => as.id === sectionId)?.part);
    const thisSection = allSections.find(s => s.id === sectionId);
    if (!thisSection) return;

    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, status: "generating" } : s));

    const thinkerSummary = allThinkers.map(t => `${t.name} (${t.era}): ${t.influence}`).join("; ");
    const prevSections = allSections.filter(s => s.part < thisSection.part || (s.part === thisSection.part && s.order < thisSection.order))
      .slice(-2).map(s => `PREV: ${s.title} - ${(s.content || "").slice(0, 200)}...`).join("\n");

    const sys = `You are a master philosopher writing in ${genre} tradition. Write rigorous philosophical arguments.
Output ONLY the section content — no titles, no explanations.
Write systematic, well-argued philosophical discourse with clear reasoning and conceptual analysis.`;

    const msg = `Treatise: ${planData?.title || treatiseTitle}
Genre: ${genre}
Part: ${thisSection.part}, Focus: ${partMeta?.focus || ""}

Thinkers: ${thinkerSummary}

This section: ${thisSection.title}

Previous context:
${prevSections}

Write the complete philosophical section.`;

    try {
      const content = await claude([{ role: "user", content: msg }], sys, 1200);
      setSections(prev => prev.map(s => s.id === sectionId
        ? { ...s, content, status: "done", concepts: partMeta?.concepts || [] }
        : e
      ));
    } catch {
      setSections(prev => prev.map(s => s.id === sectionId ? { ...s, status: "error", content: "Section generation failed." } : s));
    }
  }, [treatiseTitle]);

  // ── Accept treatise plan and generate sections ──────────────────────────────
  const handleAcceptPlan = useCallback(async (planData, genre) => {
    setShowArchitect(false);
    setTreatiseTitle(planData.title);
    setPlan({ ...planData, genre });
    setIsGeneratingAll(true);

    // Create thinkers
    const newThinkers = planData.thinkers?.map(t => ({
      id: uid(), name: t.name, era: t.era, influence: t.influence, contribution: t.contribution,
      genre, connections: []
    })) || [];
    setThinkers(newThinkers);

    // Create sections
    const newSections = [];
    let sectionCount = 1;
    planData.structure?.forEach(part => {
      for (let i = 0; i < part.sectionCount; i++) {
        newSections.push({
          id: uid(), title: `Section ${sectionCount}`, part: part.part, order: i + 1,
          form: "philosophicaltreatise", content: "", status: "queued", logic: null, notes: null,
          concepts: part.concepts || [],
        });
        sectionCount++;
      }
    });

    setSections(newSections);
    setActiveSectionId(newSections[0]?.id);

    for (let i = 0; i < newSections.length; i++) {
      setGlobalStatus(`Writing ${i + 1}/${newSections.length}: ${newSections[i].title}`);
      await generateSectionContent(newSections[i].id, planData, genre, newSections, newThinkers);
      await new Promise(r => setTimeout(r, 300));
    }

    setGlobalStatus("Philosophical treatise draft complete.");
    setIsGeneratingAll(false);
  }, [generateSectionContent]);

  // ── Logic analyze section ───────────────────────────────────────────────────
  const logicAnalyzeSection = useCallback(async (section) => {
    if (!section.content) return;
    setSections(prev => prev.map(s => s.id === section.id ? { ...s, status: "generating" } : s));

    const sys = `You are a philosophical logician analyzing arguments. Analyze the section and return ONLY JSON:
{
  "coherence": number (1-10),
  "summary": string (one sentence),
  "issues": [
    { "severity": "high"|"med"|"low", "title": string, "detail": string }
  ]
}
Be rigorous about logical consistency, argument structure, and philosophical clarity. Limit to 3 issues max.`;

    const raw = await claude([{ role: "user", content: `Analyze logical structure of this philosophical section:\n\n${section.content}` }], sys, 1000).catch(() => null);
    const parsed = raw ? parseJSON(raw) : null;

    setSections(prev => prev.map(s => s.id === section.id
      ? { ...s, status: "done", logic: parsed || { coherence: 5, summary: "Logic analysis failed.", issues: [] } }
      : s
    ));
  }, []);

  // ── Expand section ──────────────────────────────────────────────────────────
  const expandSection = useCallback(async (section) => {
    if (!section.content) return;
    setSections(prev => prev.map(s => s.id === section.id ? { ...s, status: "generating" } : s));

    const sys = `You are a philosopher expanding an argument. Add more depth, counterarguments, and philosophical nuance.
Return ONLY the expanded section — no explanations.`;

    const msg = `Expand this philosophical section with deeper analysis:\n\n${section.content}`;

    const expanded = await claude([{ role: "user", content: msg }], sys, 1200).catch(() => section.content);
    setSections(prev => prev.map(s => s.id === section.id
      ? { ...s, content: expanded, status: "done", logic: null }
      : s
    ));
  }, []);

  // ── Quick add section ───────────────────────────────────────────────────────
  const addBlankSection = () => {
    const name = `Section ${sections.length + 1}`;
    const newSection = { id: uid(), title: name, part: 1, order: sections.length + 1, form: "philosophicaltreatise", content: "", status: "queued", logic: null, notes: null, concepts: [] };
    setSections(prev => [...prev, newSection]);
    setActiveSectionId(newSection.id);
  };

  const doneCount = sections.filter(s => s.status === "done").length;
  const totalWords = sections.reduce((acc, s) => acc + (s.content?.split(/\s+/).length || 0), 0);

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

      {showArchitect && <PhilosophicalArchitect onAccept={handleAcceptPlan} onCancel={() => setShowArchitect(false)} />}

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "10px 20px", background: C.panel,
        borderBottom: `1px solid ${C.border}`,
        height: 50, flexShrink: 0,
      }}>
        <span style={{ fontFamily: C.mono, color: C.sapphire, fontSize: 14, fontWeight: 700, letterSpacing: "0.12em" }}>📚 PHILOSOPHICAL TREATISE FORGE</span>
        <span style={{ color: C.dim, fontSize: 12, fontFamily: C.mono }}>/{treatiseTitle}</span>

        {globalStatus && (
          <span style={{ color: C.gold, fontFamily: C.mono, fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
            {isGeneratingAll && <Spin size={11} />}
            {globalStatus}
          </span>
        )}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          {sections.length > 0 && (
            <>
              <span style={{ fontFamily: C.mono, fontSize: 11, color: C.dim }}>
                {doneCount}/{sections.length} sections · ~{totalWords.toLocaleString()} words
              </span>
              {badge(plan?.genre || "analytic", C.sapphire)}
            </>
          )}
          <button onClick={addBlankSection} style={{
            padding: "5px 14px", background: "none", border: `1px solid ${C.border}`,
            borderRadius: 6, color: C.muted, cursor: "pointer", fontFamily: C.mono, fontSize: 11,
          }}>+ Section</button>
          <button onClick={() => setShowArchitect(true)} style={{
            padding: "6px 18px",
            background: `linear-gradient(90deg, ${C.sapphire}22, ${C.gold}22)`,
            border: `1px solid ${C.sapphire}55`, borderRadius: 7,
            color: C.sapphire, cursor: "pointer", fontFamily: C.mono, fontSize: 12, fontWeight: 700,
            boxShadow: `0 0 16px ${C.sapphireGlow}`,
          }}>📚 New Treatise</button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* Section tree sidebar */}
        <div style={{
          width: 240, flexShrink: 0, borderRight: `1px solid ${C.border}`,
          background: C.panel, display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.12em", textTransform: "uppercase" }}>Sections</span>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "8px 8px" }}>
            {sections.length === 0 && (
              <div style={{ padding: "30px 14px", color: C.dim, fontSize: 11, fontFamily: C.mono, textAlign: "center", lineHeight: 2 }}>
                No sections.<br/>Start with 📚 New Treatise.
              </div>
            )}
            {sections.map(s => {
              const isActive = s.id === activeSectionId;
              return (
                <button key={s.id} onClick={() => setActiveSectionId(s.id)} style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  padding: "7px 10px", borderRadius: 6, marginBottom: 2,
                  background: isActive ? `${C.sapphire}18` : "none",
                  border: `1px solid ${isActive ? C.sapphire + "44" : "transparent"}`,
                  cursor: "pointer", textAlign: "left",
                }}>
                  <span style={{ color: C.sapphire, fontFamily: C.mono, fontSize: 12, width: 18, textAlign: "center", flexShrink: 0 }}>{s.part}</span>
                  <span style={{ color: isActive ? C.text : C.muted, fontFamily: C.mono, fontSize: 11, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                    background: s.status === "done" ? C.sapphire : s.status === "generating" ? C.gold : s.status === "error" ? C.crimson : C.border,
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
              { id: "lattice", icon: "🔗", tip: "Concept Lattice" },
              { id: "chat", icon: "💬", tip: "Chat"        },
              { id: "outline", icon: "📋", tip: "Outline"  },
            ].map(t => (
              <button key={t.id} onClick={() => setSidePanel(sidePanel === t.id ? null : t.id)} title={t.tip} style={{
                flex: 1, padding: "8px 0",
                background: sidePanel === t.id ? `${C.sapphire}18` : "none",
                border: "none", borderRight: t.id === "lattice" ? `1px solid ${C.border}` : t.id === "chat" ? `1px solid ${C.border}` : "none",
                color: sidePanel === t.id ? C.sapphire : C.dim,
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
            {sidePanel === "lattice" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Philosophical Concept Lattice</span>
                </div>
                <div style={{ flex: 1, overflow: "auto" }}>
                  <ConceptLattice sections={sections} />
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
              <PhilosophicalDialogue sections={sections} thinkers={thinkers} onApplyEdit={() => {}} />
            )}
            {sidePanel === "outline" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Treatise Outline</span>
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
                  {plan?.structure?.map((part, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ color: C.sapphire, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Part {part.part}</div>
                      <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.5, marginBottom: 6 }}>{part.focus}</div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4 }}>
                        {part.sectionCount} sections
                      </div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4, marginTop: 4 }}>
                        {part.concepts?.join(" → ")}
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
          {!activeSection ? (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 24,
              color: C.dim, fontFamily: C.mono,
            }}>
              <div style={{ fontSize: 48, opacity: 0.2 }}>📚</div>
              <div style={{ fontSize: 14, opacity: 0.5 }}>No section selected</div>
              <button onClick={() => setShowArchitect(true)} style={{
                padding: "12px 28px",
                background: `linear-gradient(90deg, ${C.sapphire}22, ${C.gold}22)`,
                border: `1px solid ${C.sapphire}55`, borderRadius: 10,
                color: C.sapphire, cursor: "pointer", fontFamily: C.mono, fontSize: 14, fontWeight: 700,
              }}>📚 Begin Treatise</button>
            </div>
          ) : (
            <SectionPanel
              section={activeSection}
              onDelete={() => {
                setSections(prev => prev.filter(s => s.id !== activeSection.id));
                setActiveSectionId(sections.find(s => s.id !== activeSection.id)?.id || null);
              }}
              onExpand={() => expandSection(activeSection)}
              onLogicAnalyze={() => logicAnalyzeSection(activeSection)}
              onEdit={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}