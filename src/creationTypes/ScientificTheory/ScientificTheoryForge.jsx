// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THEORY FORGE — Interactive Scientific Theory Construction System
// Ported and adapted from CodeForge.jsx for theoretical framework development.
// Features: Paradigm Architect, Hypothesis Builder, Evidence Analyzer,
// Proof Generator, Peer Review System, Citation Manager, Model Simulator.
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

// ── Field configs ─────────────────────────────────────────────────────────────
const FIELDS = {
  physics:       { icon: "⚛️", color: C.sapphire,  label: "Physics"       },
  mathematics:   { icon: "🔢", color: C.gold,      label: "Mathematics"   },
  biology:       { icon: "🧬", color: C.emerald,   label: "Biology"       },
  chemistry:     { icon: "🧪", color: C.crimson,   label: "Chemistry"     },
  computer_sci:  { icon: "💻", color: C.gold,      label: "Computer Science" },
  neuroscience:  { icon: "🧠", color: C.emerald,   label: "Neuroscience"  },
  economics:     { icon: "📈", color: C.gold,      label: "Economics"     },
  philosophy:    { icon: "🤔", color: C.sapphire,  label: "Philosophy"    },
  cosmology:     { icon: "🌌", color: C.sapphire,  label: "Cosmology"     },
  quantum:       { icon: "🔮", color: C.crimson,   label: "Quantum Theory" },
  relativity:    { icon: "⚡", color: C.gold,      label: "Relativity"     },
  information:   { icon: "📊", color: C.emerald,   label: "Information Theory" },
};

const ARCHETYPES = [
  { id: "paradigm_shift",    label: "Paradigm Shift",     icon: "💥", description: "Revolutionary framework that changes how we understand a field" },
  { id: "unified_theory",    label: "Unified Theory",     icon: "🔗", description: "Brings together disparate phenomena under one explanatory model" },
  { id: "evolutionary",      label: "Evolutionary Theory", icon: "🧬", description: "Explains development and change over time through natural processes" },
  { id: "computational",     label: "Computational Model", icon: "🖥️", description: "Uses computation and algorithms to explain complex systems" },
  { id: "quantum_mechanical",label: "Quantum Mechanical", icon: "⚛️", description: "Incorporates quantum principles and uncertainty into explanations" },
  { id: "emergent",          label: "Emergent Phenomena",  icon: "🌊", description: "Complex behaviors arising from simple rules and interactions" },
  { id: "information_based", label: "Information-Based",  icon: "📡", description: "Treats information as fundamental, with computation and communication at core" },
  { id: "thermodynamic",     label: "Thermodynamic",      icon: "🔥", description: "Based on energy, entropy, and the arrow of time" },
  { id: "network_theory",    label: "Network Theory",     icon: "🕸️", description: "Explains systems through interconnected nodes and relationships" },
  { id: "custom",            label: "Custom Framework",   icon: "✨", description: "Describe your own theoretical approach" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => `t_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

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

// ── Concept Relationship Graph (Theoretical) ──────────────────────────────────
function ConceptGraph({ concepts }) {
  const radius = 120;
  const cx = 200, cy = 160;
  if (!concepts.length) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:320, color:C.dim, fontFamily:C.mono, fontSize:12 }}>
      No concepts yet
    </div>
  );

  const nodes = concepts.map((c, i) => {
    const angle = (2 * Math.PI * i) / concepts.length - Math.PI / 2;
    return { ...c, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });

  const edges = [];
  concepts.forEach((c, i) => {
    (c.relationships || []).forEach(rel => {
      const j = concepts.findIndex(cc => cc.name === rel.with);
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
        const color = type === "implies" ? C.emerald : type === "contradicts" ? C.crimson : type === "extends" ? C.gold : C.dim;
        return (
          <line key={i}
            x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
            stroke={color} strokeWidth={2} strokeDasharray={type === "contradicts" ? "4 3" : "none"}
            markerEnd="url(#arrow)" opacity={0.7}
          />
        );
      })}

      {nodes.map((n, i) => {
        const field = FIELDS[n.field] || FIELDS.physics;
        return (
          <g key={n.id} filter="url(#glow)">
            <circle cx={n.x} cy={n.y} r={24} fill={C.panel} stroke={field.color} strokeWidth={2} opacity={0.9} />
            <text x={n.x} y={n.y - 6} textAnchor="middle" fill={field.color} fontSize="12" fontWeight="700">{n.type || "?"}</text>
            <text x={n.x} y={n.y + 8} textAnchor="middle" fill={C.muted} fontSize="9">
              {n.name.length > 8 ? n.name.slice(0,8)+"…" : n.name}
            </text>
          </g>
        );
      })}

      {/* Center label */}
      <text x={cx} y={cy} textAnchor="middle" fill={C.dim} fontSize="10" opacity={0.5}>
        {concepts.length} concept{concepts.length !== 1 ? "s" : ""}
      </text>
    </svg>
  );
}

// ── Section Panel ─────────────────────────────────────────────────────────────
function SectionPanel({ section, onEdit, onDelete, onExpand, onCritique }) {
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
        <span style={{ color: C.gold, fontFamily: C.mono, fontSize: 13, fontWeight: 700 }}>📄</span>
        <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, flex: 1 }}>{section.title}</span>
        {badge(section.type || "Unknown", C.sapphire)}
        {section.status === "generating" && <Spin size={12} />}
        {section.status === "done" && <StatusDot color={C.gold} />}
        {section.status === "error" && <StatusDot color={C.crimson} />}

        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {[
            { id: "content", label: "Section" },
            { id: "critique", label: "Review" },
            { id: "notes", label: "Notes" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
              background: tab === t.id ? `${C.gold}22` : "none",
              border: `1px solid ${tab === t.id ? C.gold + "66" : "transparent"}`,
              color: tab === t.id ? C.gold : C.dim, fontFamily: C.mono,
            }}>{t.label}</button>
          ))}
          <button onClick={() => { navigator.clipboard.writeText(section.content || ""); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
            style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer", background: "none", border: `1px solid ${C.border}`, color: copied ? C.gold : C.dim, fontFamily: C.mono }}>
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
              fontFamily: C.serif, fontSize: 14, lineHeight: "24px",
              color: "#f0e6d2", background: C.bg,
              overflowX: "auto", whiteSpace: "pre-wrap",
            }}>{section.content || (section.status === "generating" ? "Developing theory..." : "Empty section")}</pre>
          </div>
        )}

        {tab === "critique" && (
          <div style={{ padding: 20 }}>
            {section.critique ? (
              <div>
                {/* Score row */}
                {section.critique.score !== undefined && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ fontSize: 32, fontFamily: C.mono, fontWeight: 700, color: section.critique.score >= 8 ? C.gold : section.critique.score >= 5 ? C.emerald : C.crimson }}>
                      {section.critique.score}/10
                    </div>
                    <div style={{ color: C.muted, fontSize: 13 }}>{section.critique.summary}</div>
                  </div>
                )}
                {/* Issues */}
                {section.critique.issues?.map((issue, i) => (
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
                  }}>↻ Expand Section</button>
                </div>
              </div>
            ) : (
              <button onClick={() => onCritique(section)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Run Peer Review</button>
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
              }}>Add Notes</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Paradigm Architect ────────────────────────────────────────────────────────
function ParadigmArchitect({ onAccept, onCancel }) {
  const [step, setStep] = useState(0); // 0=archetype 1=details 2=planning 3=review
  const [archetype, setArchetype] = useState(null);
  const [field, setField] = useState("physics");
  const [desc, setDesc] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const generatePlan = async () => {
    setLoading(true);
    setStep(2);
    setStatusMsg("AI is formulating your theoretical framework...");

    const sys = `You are a theoretical physicist/mathematician. Design a complete scientific theory.
Return ONLY valid JSON: {
  "title": string,
  "summary": string,
  "field": string,
  "scope": string[],
  "concepts": [
    {
      "name": string,
      "type": string (hypothesis|axiom|theorem|model|principle),
      "description": string
    }
  ],
  "structure": [
    {
      "section": number (1|2|3|4|5),
      "title": string,
      "purpose": string,
      "keyIdeas": string[]
    }
  ],
  "predictions": string[],
  "implications": string[],
  "complexity": string (simple|moderate|complex)
}
Generate 5-8 core concepts and 4-5 section structure. Be rigorous and innovative.`;

    const msg = `Archetype: ${archetype?.label}
Field: ${field}
Description: ${desc || "Develop a groundbreaking scientific theory"}
Design a complete theoretical framework.`;

    try {
      const raw = await claude([{ role: "user", content: msg }], sys, 1200);
      const parsed = parseJSON(raw);
      if (parsed) { setPlan(parsed); setStep(3); }
      else { setStatusMsg("Parse error — please retry."); setStep(1); }
    } catch (e) {
      setStatusMsg("Theory design failed.");
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
            PARADIGM ARCHITECT
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
              <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Choose a Theoretical Archetype</h2>
              <p style={{ color: C.dim, fontSize: 13, marginBottom: 24, fontFamily: C.mono }}>What kind of theory are you developing?</p>
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
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Scientific Field</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {Object.entries(FIELDS).map(([id, f]) => (
                      <button key={id} onClick={() => setField(id)} style={{
                        padding: "8px 18px", borderRadius: 8, cursor: "pointer",
                        border: `1px solid ${field === id ? f.color + "88" : C.border}`,
                        background: field === id ? `${f.color}18` : "none",
                        color: field === id ? f.color : C.muted,
                        fontFamily: C.mono, fontSize: 12,
                      }}>
                        {f.icon} {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Theoretical Concept</label>
                  <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder={`Describe your theory's core idea, problem it solves, or phenomena it explains...`}
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
                  }}>⚛️ Formulate Theory</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Loading */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 280, gap: 20 }}>
              <div style={{ position: "relative" }}>
                <Spin size={52} />
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.gold, fontSize: 20 }}>⚛️</span>
              </div>
              <div style={{ color: C.muted, fontFamily: C.mono, fontSize: 13 }}>{statusMsg}</div>
            </div>
          )}

          {/* Step 3: Review plan */}
          {step === 3 && plan && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ color: C.gold, fontFamily: C.mono, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{plan.title}</h2>
                <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{plan.summary}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {badge(plan.field, C.gold)}
                  {plan.scope?.map(s => badge(s, C.emerald))}
                </div>
                <p style={{ color: C.dim, fontSize: 13, lineHeight: 1.7, fontStyle: "italic" }}>
                  {plan.complexity} complexity · {plan.predictions?.length || 0} key predictions
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Core Concepts ({plan.concepts?.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.concepts?.map((c, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                    }}>
                      <span style={{ color: C.gold, fontFamily: C.mono, fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>{c.type?.[0]?.toUpperCase()}</span>
                      <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, width: 140, flexShrink: 0 }}>{c.name}</span>
                      <span style={{ color: C.muted, fontSize: 12, flex: 1 }}>{c.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Structure</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.structure?.map((s, i) => (
                    <div key={i} style={{
                      padding: "12px 16px", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                    }}>
                      <div style={{ color: C.gold, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Section {s.section}: {s.title}</div>
                      <div style={{ color: C.muted, fontSize: 12, marginBottom: 6 }}>{s.purpose}</div>
                      <div style={{ color: C.dim, fontSize: 11, lineHeight: 1.4 }}>
                        {s.keyIdeas?.join(" → ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(1)} style={{ padding: "10px 20px", background: "none", border: `1px solid ${C.border}`, borderRadius: 8, color: C.dim, cursor: "pointer" }}>← Reformulate</button>
                <button onClick={() => onAccept(plan, field)} style={{
                  flex: 1, padding: "12px 0",
                  background: `linear-gradient(90deg, ${C.gold}, ${C.crimson})`,
                  border: "none", borderRadius: 8, color: C.bg, fontFamily: C.mono,
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  boxShadow: `0 0 30px ${C.goldGlow}`,
                }}>📖 Begin Theory</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Scientific Discourse (with theory) ─────────────────────────────────────────
function ScientificDiscourse({ sections, concepts, onApplyEdit }) {
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

    const theoryContext = sections.slice(0, 3).map(s =>
      `SECTION: ${s.title}\n${(s.content || "").slice(0, 400)}`
    ).join("\n\n---\n\n");

    const conceptContext = concepts.map(c => `${c.name}: ${c.description}`).join("; ");

    const sys = `You are a scientific peer reviewer and theoretical consultant. Help develop and refine scientific theories.
Theory context: ${theoryContext || "No sections yet"}
Concepts: ${conceptContext || "No concepts yet"}

Answer the theorist's question about their theory. Suggest improvements, identify flaws, propose experiments, or discuss implications.
Be rigorous, constructive, and evidence-based.`;

    const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
    const raw = await claude([...history, { role: "user", content: userMsg }], sys, 1000).catch(() => "Error consulting with AI.");
    setMessages(m => [...m, { role: "assistant", content: raw }]);
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.panel, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <StatusDot color={C.emerald} />
        <span style={{ fontFamily: C.mono, fontSize: 11, color: C.emerald, letterSpacing: "0.1em" }}>SCIENTIFIC DISCOURSE</span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 8px" }}>
        {messages.length === 0 && (
          <div style={{ color: C.dim, fontSize: 12, fontFamily: C.mono, textAlign: "center", paddingTop: 40, lineHeight: 2 }}>
            Ask about your theory.<br/>
            "How can I test this?" · "What's the evidence?" · "Potential flaws?"
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
          placeholder="Ask about your theory..."
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

// ── Main TheoryForge ──────────────────────────────────────────────────────────
export default function TheoryForge() {
  const [sections, setSections] = useState([]);
  const [concepts, setConcepts] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [showArchitect, setShowArchitect] = useState(false);
  const [theoryTitle, setTheoryTitle] = useState("Untitled Theory");
  const [plan, setPlan] = useState(null);
  const [sidePanel, setSidePanel] = useState("concepts"); // concepts | chat | outline
  const [globalStatus, setGlobalStatus] = useState("");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const activeSection = sections.find(s => s.id === activeSectionId);

  // ── Generate section content ────────────────────────────────────────────────
  const generateSectionContent = useCallback(async (sectionId, planData, field, allSections, allConcepts) => {
    const sectionMeta = planData?.structure?.find(s => s.section === allSections.find(as => as.id === sectionId)?.section);
    const thisSection = allSections.find(s => s.id === sectionId);
    if (!thisSection) return;

    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, status: "generating" } : s));

    const conceptSummary = allConcepts.map(c => `${c.name} (${c.type}): ${c.description}`).join("; ");
    const prevSections = allSections.filter(s => s.section < thisSection.section || (s.section === thisSection.section && s.order < thisSection.order))
      .slice(-2).map(s => `PREV: ${s.title} - ${(s.content || "").slice(0, 200)}...`).join("\n");

    const sys = `You are a theoretical scientist writing rigorous academic content in ${field} field. Write formal, evidence-based theoretical exposition.
Output ONLY the section content — no section headings, no explanations.
Write clear, logical, mathematical/scientific prose with proper citations and reasoning.`;

    const msg = `Theory: ${planData?.title || theoryTitle}
Field: ${field}
Concepts: ${conceptSummary}

This section: ${thisSection.title}
Section: ${thisSection.section}, Purpose: ${sectionMeta?.purpose || ""}

Previous context:
${prevSections}

Write the complete theoretical section.`;

    try {
      const content = await claude([{ role: "user", content: msg }], sys, 1200);
      setSections(prev => prev.map(s => s.id === sectionId
        ? { ...s, content, status: "done" }
        : s
      ));
    } catch {
      setSections(prev => prev.map(s => s.id === sectionId ? { ...s, status: "error", content: "Section generation failed." } : s));
    }
  }, [theoryTitle]);

  // ── Accept theory plan and generate sections ───────────────────────────────
  const handleAcceptPlan = useCallback(async (planData, field) => {
    setShowArchitect(false);
    setTheoryTitle(planData.title);
    setPlan({ ...planData, field });
    setIsGeneratingAll(true);

    // Create concepts
    const newConcepts = planData.concepts?.map(c => ({
      id: uid(), name: c.name, type: c.type, description: c.description,
      field, relationships: []
    })) || [];
    setConcepts(newConcepts);

    // Create sections
    const newSections = [];
    planData.structure?.forEach(section => {
      newSections.push({
        id: uid(), title: section.title, section: section.section, order: 1,
        type: "theory", content: "", status: "queued", critique: null, notes: null,
      });
    });

    setSections(newSections);
    setActiveSectionId(newSections[0]?.id);

    for (let i = 0; i < newSections.length; i++) {
      setGlobalStatus(`Developing ${i + 1}/${newSections.length}: ${newSections[i].title}`);
      await generateSectionContent(newSections[i].id, planData, field, newSections, newConcepts);
      await new Promise(r => setTimeout(r, 300));
    }

    setGlobalStatus("Theory draft complete.");
    setIsGeneratingAll(false);
  }, [generateSectionContent]);

  // ── Critique section ───────────────────────────────────────────────────────
  const critiqueSection = useCallback(async (section) => {
    if (!section.content) return;
    setSections(prev => prev.map(s => s.id === section.id ? { ...s, status: "generating" } : s));

    const sys = `You are a peer reviewer in theoretical science. Analyze the section and return ONLY JSON:
{
  "score": number (1-10),
  "summary": string (one sentence),
  "issues": [
    { "severity": "high"|"med"|"low", "title": string, "detail": string }
  ]
}
Be rigorous and constructive. Limit to 3 issues max.`;

    const raw = await claude([{ role: "user", content: `Review this theoretical section:\n\n${section.content}` }], sys, 1000).catch(() => null);
    const parsed = raw ? parseJSON(raw) : null;

    setSections(prev => prev.map(s => s.id === section.id
      ? { ...s, status: "done", critique: parsed || { score: 5, summary: "Review failed.", issues: [] } }
      : s
    ));
  }, []);

  // ── Expand section ─────────────────────────────────────────────────────────
  const expandSection = useCallback(async (section) => {
    if (!section.content) return;
    setSections(prev => prev.map(s => s.id === section.id ? { ...s, status: "generating" } : s));

    const sys = `You are a theoretical scientist expanding a section. Add more detail, mathematical rigor, and deeper analysis.
Return ONLY the expanded section content — no explanations.`;

    const msg = `Expand this theoretical section with more depth and rigor:\n\n${section.content}`;

    const expanded = await claude([{ role: "user", content: msg }], sys, 1200).catch(() => section.content);
    setSections(prev => prev.map(s => s.id === section.id
      ? { ...s, content: expanded, status: "done", critique: null }
      : s
    ));
  }, []);

  // ── Quick add section ──────────────────────────────────────────────────────
  const addBlankSection = () => {
    const name = `Section ${sections.length + 1}`;
    const newSection = { id: uid(), title: name, section: sections.length + 1, order: 1, type: "theory", content: "", status: "queued", critique: null, notes: null };
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

      {showArchitect && <ParadigmArchitect onAccept={handleAcceptPlan} onCancel={() => setShowArchitect(false)} />}

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "10px 20px", background: C.panel,
        borderBottom: `1px solid ${C.border}`,
        height: 50, flexShrink: 0,
      }}>
        <span style={{ fontFamily: C.mono, color: C.gold, fontSize: 14, fontWeight: 700, letterSpacing: "0.12em" }}>⚛️ THEORY FORGE</span>
        <span style={{ color: C.dim, fontSize: 12, fontFamily: C.mono }}>/{theoryTitle}</span>

        {globalStatus && (
          <span style={{ color: C.emerald, fontFamily: C.mono, fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
            {isGeneratingAll && <Spin size={11} />}
            {globalStatus}
          </span>
        )}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          {sections.length > 0 && (
            <>
              <span style={{ fontFamily: C.mono, fontSize: 11, color: C.dim }}>
                {doneCount}/{sections.length} sections · {totalWords.toLocaleString()} words
              </span>
              {badge(plan?.field || "physics", C.gold)}
            </>
          )}
          <button onClick={addBlankSection} style={{
            padding: "5px 14px", background: "none", border: `1px solid ${C.border}`,
            borderRadius: 6, color: C.muted, cursor: "pointer", fontFamily: C.mono, fontSize: 11,
          }}>+ Section</button>
          <button onClick={() => setShowArchitect(true)} style={{
            padding: "6px 18px",
            background: `linear-gradient(90deg, ${C.gold}22, ${C.crimson}22)`,
            border: `1px solid ${C.gold}55`, borderRadius: 7,
            color: C.gold, cursor: "pointer", fontFamily: C.mono, fontSize: 12, fontWeight: 700,
            boxShadow: `0 0 16px ${C.goldGlow}`,
          }}>⚛️ New Theory</button>
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
                No sections.<br/>Start with ⚛️ New Theory.
              </div>
            )}
            {sections.map(s => {
              const isActive = s.id === activeSectionId;
              return (
                <button key={s.id} onClick={() => setActiveSectionId(s.id)} style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  padding: "7px 10px", borderRadius: 6, marginBottom: 2,
                  background: isActive ? `${C.gold}18` : "none",
                  border: `1px solid ${isActive ? C.gold + "44" : "transparent"}`,
                  cursor: "pointer", textAlign: "left",
                }}>
                  <span style={{ color: C.gold, fontFamily: C.mono, fontSize: 12, width: 18, textAlign: "center", flexShrink: 0 }}>{s.section}</span>
                  <span style={{ color: isActive ? C.text : C.muted, fontFamily: C.mono, fontSize: 11, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                    background: s.status === "done" ? C.gold : s.status === "generating" ? C.emerald : s.status === "error" ? C.crimson : C.border,
                    boxShadow: s.status === "generating" ? `0 0 6px ${C.emerald}` : "none",
                    animation: s.status === "generating" ? "pulse 1s ease-in-out infinite" : "none",
                  }} />
                </button>
              );
            })}
          </div>

          {/* Side panel tabs */}
          <div style={{ borderTop: `1px solid ${C.border}`, display: "flex" }}>
            {[
              { id: "concepts", icon: "🧠", tip: "Concepts" },
              { id: "chat",     icon: "💬", tip: "Chat"     },
              { id: "outline",  icon: "📋", tip: "Outline"  },
            ].map(t => (
              <button key={t.id} onClick={() => setSidePanel(sidePanel === t.id ? null : t.id)} title={t.tip} style={{
                flex: 1, padding: "8px 0",
                background: sidePanel === t.id ? `${C.gold}18` : "none",
                border: "none", borderRight: t.id === "concepts" ? `1px solid ${C.border}` : t.id === "chat" ? `1px solid ${C.border}` : "none",
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
            {sidePanel === "concepts" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Concept Relationships</span>
                </div>
                <div style={{ flex: 1, overflow: "auto" }}>
                  <ConceptGraph concepts={concepts} />
                  {plan?.predictions && (
                    <div style={{ padding: "0 16px 16px" }}>
                      <div style={{ fontSize: 11, color: C.dim, fontFamily: C.mono, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Key Predictions</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {plan.predictions.slice(0, 3).map(p => badge(p.slice(0, 20) + "...", C.emerald))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            {sidePanel === "chat" && (
              <ScientificDiscourse sections={sections} concepts={concepts} onApplyEdit={() => {}} />
            )}
            {sidePanel === "outline" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Theory Outline</span>
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
                  {plan?.structure?.map((section, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ color: C.gold, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Section {section.section}: {section.title}</div>
                      <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.5, marginBottom: 6 }}>{section.purpose}</div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4 }}>
                        {section.keyIdeas?.map((e, j) => (
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
          {!activeSection ? (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 24,
              color: C.dim, fontFamily: C.mono,
            }}>
              <div style={{ fontSize: 48, opacity: 0.2 }}>⚛️</div>
              <div style={{ fontSize: 14, opacity: 0.5 }}>No section selected</div>
              <button onClick={() => setShowArchitect(true)} style={{
                padding: "12px 28px",
                background: `linear-gradient(90deg, ${C.gold}22, ${C.crimson}22)`,
                border: `1px solid ${C.gold}55`, borderRadius: 10,
                color: C.gold, cursor: "pointer", fontFamily: C.mono, fontSize: 14, fontWeight: 700,
              }}>⚛️ Begin Theory</button>
            </div>
          ) : (
            <SectionPanel
              section={activeSection}
              onDelete={() => {
                setSections(prev => prev.filter(s => s.id !== activeSection.id));
                setActiveSectionId(sections.find(s => s.id !== activeSection.id)?.id || null);
              }}
              onExpand={() => expandSection(activeSection)}
              onCritique={() => critiqueSection(activeSection)}
              onEdit={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}