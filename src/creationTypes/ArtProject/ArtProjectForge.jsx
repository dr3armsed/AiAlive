// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ART PROJECT FORGE — Interactive Artistic Creation System
// Ported and adapted from CodeForge.jsx for creative visual arts.
// Features: Art Architect, Canvas Builder, Aesthetic Analyzer,
// Composition Designer, Artistic Polisher, Creative Dialogue.
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
  sans:      "'IBM+Plex Sans', 'Helvetica Neue', system-ui, sans-serif",
  mono:      "'JetBrains Mono', 'Courier New', monospace",
};

// ── Medium configs ────────────────────────────────────────────────────────────
const MEDIUMS = {
  painting:     { icon: "🎨", color: C.emerald,   label: "Painting"     },
  sculpture:    { icon: "🗿", color: C.crimson,   label: "Sculpture"    },
  digital:      { icon: "💻", color: C.gold,      label: "Digital"      },
  photography:  { icon: "📷", color: C.sapphire,  label: "Photography"  },
  mixed_media:  { icon: "🎭", color: C.emerald,   label: "Mixed Media"  },
  installation: { icon: "🏛️", color: C.crimson,   label: "Installation" },
  performance:  { icon: "🎪", color: C.gold,      label: "Performance"  },
  conceptual:   { icon: "💡", color: C.sapphire,  label: "Conceptual"   },
};

const ARCHETYPES = [
  { id: "studio_painting", label: "Studio Painting", icon: "🎨", description: "Traditional or contemporary painting on canvas or other surfaces" },
  { id: "sculptural_work", label: "Sculptural Work", icon: "🗿", description: "Three-dimensional artistic creation and assembly" },
  { id: "digital_artwork", label: "Digital Artwork", icon: "💻", description: "Computer-generated or digitally manipulated art" },
  { id: "photographic_series", label: "Photographic Series", icon: "📷", description: "Documentary or artistic photography projects" },
  { id: "mixed_media_piece", label: "Mixed Media Piece", icon: "🎭", description: "Artwork combining multiple artistic mediums" },
  { id: "site_specific_installation", label: "Site-Specific Installation", icon: "🏛️", description: "Art designed for a particular location or space" },
  { id: "performance_art", label: "Performance Art", icon: "🎪", description: "Live artistic performance and interaction" },
  { id: "conceptual_artwork", label: "Conceptual Artwork", icon: "💡", description: "Art focused on ideas rather than physical form" },
  { id: "custom", label: "Custom Artistic Work", icon: "✨", description: "Describe your own artistic approach" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => `ap_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

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

// ── Composition Canvas ─────────────────────────────────────────────────────────
function CompositionCanvas({ canvases }) {
  const width = 380, height = 200;
  if (!canvases.length) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, color:C.dim, fontFamily:C.mono, fontSize:12 }}>
      No canvases yet
    </div>
  );

  const elements = [];
  canvases.forEach(c => {
    if (c.elements) c.elements.forEach(e => {
      elements.push({ ...e, canvasId: c.id, stage: c.stage });
    });
  });

  if (!elements.length) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, color:C.dim, fontFamily:C.mono, fontSize:12 }}>
      No elements
    </div>
  );

  const stages = {};
  canvases.forEach(c => {
    stages[c.stage] = (stages[c.stage] || 0) + 1;
  });

  const stageKeys = Object.keys(stages);
  const stageY = stageKeys.length > 1 ? height / (stageKeys.length - 1) : height / 2;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height + 40}`} style={{ fontFamily: C.mono }}>
      <defs>
        <radialGradient id="compositionGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={C.emerald} />
          <stop offset="50%" stopColor={C.gold} />
          <stop offset="100%" stopColor={C.crimson} />
        </radialGradient>
      </defs>

      {/* Stage lines */}
      {stageKeys.map((stage, i) => (
        <g key={stage}>
          <line x1={0} y1={i * stageY} x2={width} y2={i * stageY} stroke={C.border} strokeWidth={2} opacity={0.6} />
          <text x={width + 5} y={i * stageY + 4} fill={C.dim} fontSize="10">{stage}</text>
        </g>
      ))}

      {/* Element nodes */}
      {elements.map((e, i) => {
        const stageIndex = stageKeys.indexOf(e.stage || "concept");
        const x = 40 + (i / Math.max(elements.length - 1, 1)) * (width - 80);
        const y = stageIndex * stageY + (Math.sin(i * 0.7) * 25);
        return (
          <g key={e.id}>
            <circle cx={x} cy={y} r={Math.max(6, e.weight * 2)} fill="url(#compositionGradient)" stroke={C.bg} strokeWidth={2} />
            <text x={x} y={y - 12} textAnchor="middle" fill={C.text} fontSize="9" fontWeight="600">
              {e.name.length > 8 ? e.name.slice(0,8)+"…" : e.name}
            </text>
            <text x={x} y={y + 16} textAnchor="middle" fill={C.dim} fontSize="8">{e.type}</text>
          </g>
        );
      })}

      {/* Connection lines */}
      {elements.length > 1 && elements.map((e, i) => {
        if (i < elements.length - 1) {
          const stageIndex = stageKeys.indexOf(e.stage || "concept");
          const nextStageIndex = stageKeys.indexOf(elements[i + 1].stage || "concept");
          const x1 = 40 + (i / Math.max(elements.length - 1, 1)) * (width - 80);
          const y1 = stageIndex * stageY + (Math.sin(i * 0.7) * 25);
          const x2 = 40 + ((i + 1) / Math.max(elements.length - 1, 1)) * (width - 80);
          const y2 = nextStageIndex * stageY + (Math.sin((i + 1) * 0.7) * 25);
          return (
            <line key={`line-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={C.gold} strokeWidth={2} opacity={0.6} />
          );
        }
        return null;
      })}

      {/* Labels */}
      <text x={0} y={height + 20} fill={C.dim} fontSize="10">Artistic Composition</text>
      <text x={width} y={height + 20} fill={C.dim} fontSize="10" textAnchor="end">Elements: {elements.length}</text>
      <text x={width/2} y={height + 35} fill={C.dim} fontSize="9" textAnchor="middle">Creative Relationships & Flow</text>
    </svg>
  );
}

// ── Canvas Panel ──────────────────────────────────────────────────────────────
function CanvasPanel({ canvas, onEdit, onDelete, onAnalyze, onExpand }) {
  const [tab, setTab] = useState("content");
  const [copied, setCopied] = useState(false);
  const lines = (canvas.content || "").split("\n");

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      background: C.panel, border: `1px solid ${C.border}`,
      borderRadius: 10, overflow: "hidden", height: "100%",
    }}>
      {/* Canvas header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 14px", background: C.surface,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ color: C.emerald, fontFamily: C.mono, fontSize: 13, fontWeight: 700 }}>🎨</span>
        <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, flex: 1 }}>{canvas.title}</span>
        {badge(canvas.stage || "concept", C.emerald)}
        {canvas.status === "generating" && <Spin size={12} />}
        {canvas.status === "done" && <StatusDot color={C.emerald} />}
        {canvas.status === "error" && <StatusDot color={C.crimson} />}

        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {[
            { id: "content", label: "Content" },
            { id: "aesthetic", label: "Aesthetic" },
            { id: "notes", label: "Notes" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
              background: tab === t.id ? `${C.emerald}22` : "none",
              border: `1px solid ${tab === t.id ? C.emerald + "66" : "transparent"}`,
              color: tab === t.id ? C.emerald : C.dim, fontFamily: C.mono,
            }}>{t.label}</button>
          ))}
          <button onClick={() => { navigator.clipboard.writeText(canvas.content || ""); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
            style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer", background: "none", border: `1px solid ${C.border}`, color: copied ? C.emerald : C.dim, fontFamily: C.mono }}>
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
            {/* Canvas text */}
            <pre style={{
              flex: 1, margin: 0, padding: "14px 20px",
              fontFamily: C.serif, fontSize: 16, lineHeight: "24px",
              color: "#f0e6d2", background: C.bg,
              overflowX: "auto", whiteSpace: "pre-wrap",
            }}>{canvas.content || (canvas.status === "generating" ? "Developing artistic concept..." : "Empty canvas")}</pre>
          </div>
        )}

        {tab === "aesthetic" && (
          <div style={{ padding: 20 }}>
            {canvas.aestheticAnalysis ? (
              <div>
                {/* Score row */}
                {canvas.aestheticAnalysis.impact !== undefined && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ fontSize: 32, fontFamily: C.mono, fontWeight: 700, color: canvas.aestheticAnalysis.impact >= 8 ? C.emerald : canvas.aestheticAnalysis.impact >= 5 ? C.gold : C.crimson }}>
                      {canvas.aestheticAnalysis.impact}/10
                    </div>
                    <div style={{ color: C.muted, fontSize: 13 }}>{canvas.aestheticAnalysis.summary}</div>
                  </div>
                )}
                {/* Aesthetic issues */}
                {canvas.aestheticAnalysis.issues?.map((issue, i) => (
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
                    padding: "8px 18px", background: `${C.emerald}22`,
                    border: `1px solid ${C.emerald}55`, borderRadius: 8,
                    color: C.emerald, cursor: "pointer", fontSize: 13, fontFamily: C.mono,
                  }}>↻ Expand Canvas</button>
                </div>
              </div>
            ) : (
              <button onClick={() => onAnalyze(canvas)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Analyze Aesthetics</button>
            )}
          </div>
        )}

        {tab === "notes" && (
          <div style={{ padding: 20 }}>
            {canvas.notes ? (
              <pre style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{canvas.notes}</pre>
            ) : (
              <button onClick={() => onEdit(canvas)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Add Artistic Notes</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Art Architect ─────────────────────────────────────────────────────────────
function ArtArchitect({ onAccept, onCancel }) {
  const [step, setStep] = useState(0); // 0=archetype 1=details 2=planning 3=review
  const [archetype, setArchetype] = useState(null);
  const [medium, setMedium] = useState("painting");
  const [desc, setDesc] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const generatePlan = async () => {
    setLoading(true);
    setStep(2);
    setStatusMsg("AI is conceptualizing the artwork...");

    const sys = `You are a master artist and curator designing art projects. Design a complete artistic work.
Return ONLY valid JSON: {
  "title": string,
  "subtitle": string,
  "medium": string,
  "approach": string[],
  "concepts": [
    {
      "theme": string,
      "inspiration": string,
      "execution": string
    }
  ],
  "process": [
    {
      "stage": number (1|2|3),
      "phase": string,
      "canvasCount": number,
      "techniques": string[]
    }
  ],
  "materials": string[],
  "presentation": string[],
  "canvasCount": string
}
Generate 2-4 key artistic concepts and 3-stage creative process with 3-5 canvases per stage. Be artistically rigorous.`;

    const msg = `Archetype: ${archetype?.label}
Medium: ${medium}
Description: ${desc || "Create a compelling artistic work that challenges perceptions"}
Design a complete art project.`;

    try {
      const raw = await claude([{ role: "user", content: msg }], sys, 1200);
      const parsed = parseJSON(raw);
      if (parsed) { setPlan(parsed); setStep(3); }
      else { setStatusMsg("Parse error — please retry."); setStep(1); }
    } catch (e) {
      setStatusMsg("Artistic inspiration failed.");
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
        boxShadow: `0 0 60px ${C.emeraldGlow}`,
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
          <StatusDot color={C.emerald} />
          <span style={{ fontFamily: C.mono, fontSize: 13, color: C.emerald, letterSpacing: "0.1em" }}>
            ART ARCHITECT
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {["Archetype","Details","Planning","Review"].map((s,i) => (
              <span key={i} style={{
                fontFamily: C.mono, fontSize: 10, color: step >= i ? C.emerald : C.dim,
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
              <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Choose an Artistic Archetype</h2>
              <p style={{ color: C.dim, fontSize: 13, marginBottom: 24, fontFamily: C.mono }}>What form shall your artistic expression take?</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 12 }}>
                {ARCHETYPES.map(a => (
                  <button key={a.id} onClick={() => { setArchetype(a); setStep(1); }}
                    style={{
                      padding: "16px 18px", background: C.surface, border: `1px solid ${C.border}`,
                      borderRadius: 12, cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                      display: "flex", flexDirection: "column", gap: 8,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.emerald + "88"; e.currentTarget.style.background = C.panel; }}
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
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Artistic Medium</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {Object.entries(MEDIUMS).map(([id, m]) => (
                      <button key={id} onClick={() => setMedium(id)} style={{
                        padding: "8px 18px", borderRadius: 8, cursor: "pointer",
                        border: `1px solid ${medium === id ? m.color + "88" : C.border}`,
                        background: medium === id ? `${m.color}18` : "none",
                        color: medium === id ? m.color : C.muted,
                        fontFamily: C.mono, fontSize: 12,
                      }}>
                        {m.icon} {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Artistic Vision</label>
                  <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder={`Describe the artistic concept, themes, and vision that drives your work...`}
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
                    background: `linear-gradient(90deg, ${C.emerald}22, ${C.gold}22)`,
                    border: `1px solid ${C.emerald}55`, borderRadius: 8,
                    color: C.emerald, fontFamily: C.mono, fontWeight: 700, fontSize: 14,
                    cursor: "pointer", letterSpacing: "0.05em",
                  }}>🎨 Forge Art Project</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Loading */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 280, gap: 20 }}>
              <div style={{ position: "relative" }}>
                <Spin size={52} />
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.emerald, fontSize: 20 }}>🎨</span>
              </div>
              <div style={{ color: C.muted, fontFamily: C.mono, fontSize: 13 }}>{statusMsg}</div>
            </div>
          )}

          {/* Step 3: Review plan */}
          {step === 3 && plan && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ color: C.emerald, fontFamily: C.mono, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{plan.title}</h2>
                <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{plan.subtitle}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {badge(plan.medium, C.emerald)}
                  {plan.approach?.map(a => badge(a, C.gold))}
                </div>
                <p style={{ color: C.dim, fontSize: 13, lineHeight: 1.7, fontStyle: "italic" }}>
                  {plan.materials?.join(", ")} · {plan.canvasCount} canvases
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Key Concepts ({plan.concepts?.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.concepts?.map((c, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                    }}>
                      <span style={{ color: C.emerald, fontFamily: C.mono, fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>C{i+1}</span>
                      <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, width: 140, flexShrink: 0 }}>{c.theme.slice(0,18)}...</span>
                      <span style={{ color: C.muted, fontSize: 12, flex: 1 }}>{c.execution}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Creative Process</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.process?.map((stage, i) => (
                    <div key={i} style={{
                      padding: "12px 16px", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                    }}>
                      <div style={{ color: C.emerald, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Stage {stage.stage}: {stage.phase}</div>
                      <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.5, marginBottom: 6 }}>{stage.focus}</div>
                      <div style={{ color: C.dim, fontSize: 11, lineHeight: 1.4 }}>
                        {stage.canvasCount} canvases
                      </div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4, marginTop: 4 }}>
                        {stage.techniques?.join(" → ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(1)} style={{ padding: "10px 20px", background: "none", border: `1px solid ${C.border}`, borderRadius: 8, color: C.dim, cursor: "pointer" }}>← Recraft</button>
                <button onClick={() => onAccept(plan, medium)} style={{
                  flex: 1, padding: "12px 0",
                  background: `linear-gradient(90deg, ${C.emerald}, ${C.gold})`,
                  border: "none", borderRadius: 8, color: C.bg, fontFamily: C.mono,
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  boxShadow: `0 0 30px ${C.emeraldGlow}`,
                }}>🎨 Begin Art Project</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Creative Dialogue (with artistic consultation) ────────────────────────────
function CreativeDialogue({ canvases, concepts, onApplyEdit }) {
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

    const artContext = canvases.slice(0, 3).map(c =>
      `CANVAS: ${c.title}\n${(c.content || "").slice(0, 400)}`
    ).join("\n\n---\n\n");

    const conceptContext = concepts.map(c => `${c.theme}: ${c.execution}`).join("; ");

    const sys = `You are a master artist, curator, and art critic. Help develop and refine artistic projects.
Art context: ${artContext || "No canvases yet"}
Concepts: ${conceptContext || "No concepts yet"}

Answer the artist's question about their work. Suggest composition techniques, color theory, artistic movements, or connections to art history.
Be artistically insightful, technically knowledgeable, and creatively inspiring.`;

    const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
    const raw = await claude([...history, { role: "user", content: userMsg }], sys, 1000).catch(() => "Error consulting with AI.");
    setMessages(m => [...m, { role: "assistant", content: raw }]);
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.panel, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <StatusDot color={C.gold} />
        <span style={{ fontFamily: C.mono, fontSize: 11, color: C.gold, letterSpacing: "0.1em" }}>CREATIVE DIALOGUE</span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 8px" }}>
        {messages.length === 0 && (
          <div style={{ color: C.dim, fontSize: 12, fontFamily: C.mono, textAlign: "center", paddingTop: 40, lineHeight: 2 }}>
            Ask about your art.<br/>
            "How should I compose this piece?" · "Color theory?" · "Art historical context?"
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
              background: m.role === "user" ? `${C.emerald}18` : C.surface,
              border: `1px solid ${m.role === "user" ? C.emerald + "44" : C.border}`,
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
          placeholder="Ask about your art..."
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

// ── Main ArtProjectForge ──────────────────────────────────────────────────────
export default function ArtProjectForge() {
  const [canvases, setCanvases] = useState([]);
  const [activeCanvasId, setActiveCanvasId] = useState(null);
  const [showArchitect, setShowArchitect] = useState(false);
  const [projectTitle, setProjectTitle] = useState("Untitled Art Project");
  const [plan, setPlan] = useState(null);
  const [sidePanel, setSidePanel] = useState("composition"); // composition | chat | process
  const [globalStatus, setGlobalStatus] = useState("");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const activeCanvas = canvases.find(c => c.id === activeCanvasId);

  // ── Generate canvas content ──────────────────────────────────────────────────
  const generateCanvasContent = useCallback(async (canvasId, planData, medium, allCanvases, allConcepts) => {
    const stageMeta = planData?.process?.find(p => p.stage === allCanvases.find(ac => ac.id === canvasId)?.stage);
    const thisCanvas = allCanvases.find(c => c.id === canvasId);
    if (!thisCanvas) return;

    setCanvases(prev => prev.map(c => c.id === canvasId ? { ...c, status: "generating" } : c));

    const conceptSummary = allConcepts.map(c => `${c.theme}: ${c.execution}`).join("; ");
    const prevCanvases = allCanvases.filter(c => c.stage < thisCanvas.stage || (c.stage === thisCanvas.stage && c.order < thisCanvas.order))
      .slice(-2).map(c => `PREV: ${c.title} - ${(c.content || "").slice(0, 200)}...`).join("\n");

    const sys = `You are a master artist creating detailed artistic concepts in ${medium} medium. Write rigorous artistic descriptions and concepts.
Output ONLY the canvas content — no titles, no explanations.
Write systematic, well-conceptualized artistic work with clear visual elements and artistic intent.`;

    const msg = `Project: ${planData?.title || projectTitle}
Medium: ${medium}
Stage: ${thisCanvas.stage}, Phase: ${stageMeta?.phase || ""}

Concepts: ${conceptSummary}

This canvas: ${thisCanvas.title}

Previous context:
${prevCanvases}

Write the complete artistic canvas.`;

    try {
      const content = await claude([{ role: "user", content: msg }], sys, 1200);
      setCanvases(prev => prev.map(c => c.id === canvasId
        ? { ...c, content, status: "done", elements: stageMeta?.techniques || [] }
        : e
      ));
    } catch {
      setCanvases(prev => prev.map(c => c.id === canvasId ? { ...c, status: "error", content: "Canvas generation failed." } : c));
    }
  }, [projectTitle]);

  // ── Accept art plan and generate canvases ───────────────────────────────────
  const handleAcceptPlan = useCallback(async (planData, medium) => {
    setShowArchitect(false);
    setProjectTitle(planData.title);
    setPlan({ ...planData, medium });
    setIsGeneratingAll(true);

    // Create concepts
    const newConcepts = planData.concepts?.map(c => ({
      id: uid(), theme: c.theme, inspiration: c.inspiration, execution: c.execution,
      medium, connections: []
    })) || [];
    setConcepts(newConcepts);

    // Create canvases
    const newCanvases = [];
    let canvasCount = 1;
    planData.process?.forEach(stage => {
      for (let i = 0; i < stage.canvasCount; i++) {
        newCanvases.push({
          id: uid(), title: `Canvas ${canvasCount}`, stage: stage.stage, order: i + 1,
          form: "artproject", content: "", status: "queued", aestheticAnalysis: null, notes: null,
          elements: stage.techniques || [],
        });
        canvasCount++;
      }
    });

    setCanvases(newCanvases);
    setActiveCanvasId(newCanvases[0]?.id);

    for (let i = 0; i < newCanvases.length; i++) {
      setGlobalStatus(`Creating ${i + 1}/${newCanvases.length}: ${newCanvases[i].title}`);
      await generateCanvasContent(newCanvases[i].id, planData, medium, newCanvases, newConcepts);
      await new Promise(r => setTimeout(r, 300));
    }

    setGlobalStatus("Art project draft complete.");
    setIsGeneratingAll(false);
  }, [generateCanvasContent]);

  // ── Aesthetic analyze canvas ────────────────────────────────────────────────
  const aestheticAnalyzeCanvas = useCallback(async (canvas) => {
    if (!canvas.content) return;
    setCanvases(prev => prev.map(c => c.id === canvas.id ? { ...c, status: "generating" } : c));

    const sys = `You are an art critic and aesthetic theorist analyzing artistic work. Analyze the canvas and return ONLY JSON:
{
  "impact": number (1-10),
  "summary": string (one sentence),
  "issues": [
    { "severity": "high"|"med"|"low", "title": string, "detail": string }
  ]
}
Be aesthetically rigorous about composition, technique, and artistic merit. Limit to 3 issues max.`;

    const raw = await claude([{ role: "user", content: `Analyze aesthetic quality of this artistic canvas:\n\n${canvas.content}` }], sys, 1000).catch(() => null);
    const parsed = raw ? parseJSON(raw) : null;

    setCanvases(prev => prev.map(c => c.id === canvas.id
      ? { ...c, status: "done", aestheticAnalysis: parsed || { impact: 5, summary: "Aesthetic analysis failed.", issues: [] } }
      : c
    ));
  }, []);

  // ── Expand canvas ───────────────────────────────────────────────────────────
  const expandCanvas = useCallback(async (canvas) => {
    if (!canvas.content) return;
    setCanvases(prev => prev.map(c => c.id === canvas.id ? { ...c, status: "generating" } : c));

    const sys = `You are an artist expanding a canvas. Add more artistic detail, additional visual elements, and deeper aesthetic exploration.
Return ONLY the expanded canvas — no explanations.`;

    const msg = `Expand this artistic canvas with additional creative detail:\n\n${canvas.content}`;

    const expanded = await claude([{ role: "user", content: msg }], sys, 1200).catch(() => canvas.content);
    setCanvases(prev => prev.map(c => c.id === canvas.id
      ? { ...c, content: expanded, status: "done", aestheticAnalysis: null }
      : c
    ));
  }, []);

  // ── Quick add canvas ────────────────────────────────────────────────────────
  const addBlankCanvas = () => {
    const name = `Canvas ${canvases.length + 1}`;
    const newCanvas = { id: uid(), title: name, stage: 1, order: canvases.length + 1, form: "artproject", content: "", status: "queued", aestheticAnalysis: null, notes: null, elements: [] };
    setCanvases(prev => [...prev, newCanvas]);
    setActiveCanvasId(newCanvas.id);
  };

  const doneCount = canvases.filter(c => c.status === "done").length;
  const totalWords = canvases.reduce((acc, c) => acc + (c.content?.split(/\s+/).length || 0), 0);

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

      {showArchitect && <ArtArchitect onAccept={handleAcceptPlan} onCancel={() => setShowArchitect(false)} />}

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "10px 20px", background: C.panel,
        borderBottom: `1px solid ${C.border}`,
        height: 50, flexShrink: 0,
      }}>
        <span style={{ fontFamily: C.mono, color: C.emerald, fontSize: 14, fontWeight: 700, letterSpacing: "0.12em" }}>🎨 ART PROJECT FORGE</span>
        <span style={{ color: C.dim, fontSize: 12, fontFamily: C.mono }}>/{projectTitle}</span>

        {globalStatus && (
          <span style={{ color: C.gold, fontFamily: C.mono, fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
            {isGeneratingAll && <Spin size={11} />}
            {globalStatus}
          </span>
        )}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          {canvases.length > 0 && (
            <>
              <span style={{ fontFamily: C.mono, fontSize: 11, color: C.dim }}>
                {doneCount}/{canvases.length} canvases · ~{totalWords.toLocaleString()} words
              </span>
              {badge(plan?.medium || "painting", C.emerald)}
            </>
          )}
          <button onClick={addBlankCanvas} style={{
            padding: "5px 14px", background: "none", border: `1px solid ${C.border}`,
            borderRadius: 6, color: C.muted, cursor: "pointer", fontFamily: C.mono, fontSize: 11,
          }}>+ Canvas</button>
          <button onClick={() => setShowArchitect(true)} style={{
            padding: "6px 18px",
            background: `linear-gradient(90deg, ${C.emerald}22, ${C.gold}22)`,
            border: `1px solid ${C.emerald}55`, borderRadius: 7,
            color: C.emerald, cursor: "pointer", fontFamily: C.mono, fontSize: 12, fontWeight: 700,
            boxShadow: `0 0 16px ${C.emeraldGlow}`,
          }}>🎨 New Art Project</button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* Canvas tree sidebar */}
        <div style={{
          width: 240, flexShrink: 0, borderRight: `1px solid ${C.border}`,
          background: C.panel, display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.12em", textTransform: "uppercase" }}>Canvases</span>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "8px 8px" }}>
            {canvases.length === 0 && (
              <div style={{ padding: "30px 14px", color: C.dim, fontSize: 11, fontFamily: C.mono, textAlign: "center", lineHeight: 2 }}>
                No canvases.<br/>Start with 🎨 New Art Project.
              </div>
            )}
            {canvases.map(c => {
              const isActive = c.id === activeCanvasId;
              return (
                <button key={c.id} onClick={() => setActiveCanvasId(c.id)} style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  padding: "7px 10px", borderRadius: 6, marginBottom: 2,
                  background: isActive ? `${C.emerald}18` : "none",
                  border: `1px solid ${isActive ? C.emerald + "44" : "transparent"}`,
                  cursor: "pointer", textAlign: "left",
                }}>
                  <span style={{ color: C.emerald, fontFamily: C.mono, fontSize: 12, width: 18, textAlign: "center", flexShrink: 0 }}>{c.stage}</span>
                  <span style={{ color: isActive ? C.text : C.muted, fontFamily: C.mono, fontSize: 11, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</span>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                    background: c.status === "done" ? C.emerald : c.status === "generating" ? C.gold : c.status === "error" ? C.crimson : C.border,
                    boxShadow: c.status === "generating" ? `0 0 6px ${C.gold}` : "none",
                    animation: c.status === "generating" ? "pulse 1s ease-in-out infinite" : "none",
                  }} />
                </button>
              );
            })}
          </div>

          {/* Side panel tabs */}
          <div style={{ borderTop: `1px solid ${C.border}`, display: "flex" }}>
            {[
              { id: "composition", icon: "🎨", tip: "Composition" },
              { id: "chat", icon: "💬", tip: "Chat"        },
              { id: "process", icon: "📋", tip: "Process" },
            ].map(t => (
              <button key={t.id} onClick={() => setSidePanel(sidePanel === t.id ? null : t.id)} title={t.tip} style={{
                flex: 1, padding: "8px 0",
                background: sidePanel === t.id ? `${C.emerald}18` : "none",
                border: "none", borderRight: t.id === "composition" ? `1px solid ${C.border}` : t.id === "chat" ? `1px solid ${C.border}` : "none",
                color: sidePanel === t.id ? C.emerald : C.dim,
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
            {sidePanel === "composition" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Artistic Composition</span>
                </div>
                <div style={{ flex: 1, overflow: "auto" }}>
                  <CompositionCanvas canvases={canvases} />
                  {plan?.presentation && (
                    <div style={{ padding: "0 16px 16px" }}>
                      <div style={{ fontSize: 11, color: C.dim, fontFamily: C.mono, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Presentation</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {plan.presentation.map(p => badge(p, C.gold))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            {sidePanel === "chat" && (
              <CreativeDialogue canvases={canvases} concepts={concepts} onApplyEdit={() => {}} />
            )}
            {sidePanel === "process" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Creative Process</span>
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
                  {plan?.process?.map((stage, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ color: C.emerald, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Stage {stage.stage}: {stage.phase}</div>
                      <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.5, marginBottom: 6 }}>{stage.focus}</div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4 }}>
                        {stage.canvasCount} canvases
                      </div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4, marginTop: 4 }}>
                        {stage.techniques?.join(" → ")}
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
          {!activeCanvas ? (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 24,
              color: C.dim, fontFamily: C.mono,
            }}>
              <div style={{ fontSize: 48, opacity: 0.2 }}>🎨</div>
              <div style={{ fontSize: 14, opacity: 0.5 }}>No canvas selected</div>
              <button onClick={() => setShowArchitect(true)} style={{
                padding: "12px 28px",
                background: `linear-gradient(90deg, ${C.emerald}22, ${C.gold}22)`,
                border: `1px solid ${C.emerald}55`, borderRadius: 10,
                color: C.emerald, cursor: "pointer", fontFamily: C.mono, fontSize: 14, fontWeight: 700,
              }}>🎨 Begin Art Project</button>
            </div>
          ) : (
            <CanvasPanel
              canvas={activeCanvas}
              onDelete={() => {
                setCanvases(prev => prev.filter(c => c.id !== activeCanvas.id));
                setActiveCanvasId(canvases.find(c => c.id !== activeCanvas.id)?.id || null);
              }}
              onExpand={() => expandCanvas(activeCanvas)}
              onAnalyze={() => aestheticAnalyzeCanvas(activeCanvas)}
              onEdit={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}