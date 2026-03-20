// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPERIMENTAL WORKS FORGE — Interactive Experimental Creation System
// Ported and adapted from CodeForge.jsx for experimental works.
// Features: Experimental Architect, Work Builder, Innovation Designer,
// Experimental Analyzer, Creative Dialogue.
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

// ── Experimental approaches ───────────────────────────────────────────────────
const APPROACHES = {
  conceptual:     { icon: "💡", color: C.emerald,   label: "Conceptual"     },
  multimedia:     { icon: "🎭", color: C.gold,      label: "Multimedia"     },
  interactive:    { icon: "🎮", color: C.sapphire,  label: "Interactive"    },
  generative:     { icon: "🤖", color: C.emerald,   label: "Generative"     },
  immersive:      { icon: "🌐", color: C.crimson,   label: "Immersive"      },
  abstract:       { icon: "🌀", color: C.gold,      label: "Abstract"       },
  hybrid:         { icon: "🔗", color: C.sapphire,  label: "Hybrid"         },
  experimental:   { icon: "⚗️", color: C.emerald,   label: "Experimental"   },
};

const ARCHETYPES = [
  { id: "boundary_pushing", label: "Boundary Pushing", icon: "🚀", description: "Works that challenge conventional forms and push creative limits" },
  { id: "medium_blending", label: "Medium Blending", icon: "🔗", description: "Combining different artistic mediums in innovative ways" },
  { id: "conceptual_exploration", label: "Conceptual Exploration", icon: "💡", description: "Deep dives into abstract concepts and philosophical ideas" },
  { id: "interactive_experience", label: "Interactive Experience", icon: "🎮", description: "Works that actively involve and respond to the audience" },
  { id: "generative_art", label: "Generative Art", icon: "🤖", description: "Art created through algorithmic or procedural means" },
  { id: "immersive_environment", label: "Immersive Environment", icon: "🌐", description: "Total sensory experiences that envelop the participant" },
  { id: "abstract_expression", label: "Abstract Expression", icon: "🌀", description: "Non-representational works exploring pure form and emotion" },
  { id: "hybrid_innovation", label: "Hybrid Innovation", icon: "⚗️", description: "Fusing technology, art, and unconventional approaches" },
  { id: "custom", label: "Custom Experimental", icon: "✨", description: "Describe your own experimental approach" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => `ew_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

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

// ── Innovation Canvas ─────────────────────────────────────────────────────────
function InnovationCanvas({ works }) {
  const width = 380, height = 200;
  if (!works.length) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, color:C.dim, fontFamily:C.mono, fontSize:12 }}>
      No works yet
    </div>
  );

  const phases = {};
  works.forEach(w => {
    phases[w.phase] = (phases[w.phase] || 0) + 1;
  });

  const phaseKeys = Object.keys(phases);
  const phaseY = phaseKeys.length > 1 ? height / (phaseKeys.length - 1) : height / 2;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height + 40}`} style={{ fontFamily: C.mono }}>
      <defs>
        <radialGradient id="innovationGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={C.emerald} />
          <stop offset="50%" stopColor={C.gold} />
          <stop offset="100%" stopColor={C.crimson} />
        </radialGradient>
      </defs>

      {/* Phase lines */}
      {phaseKeys.map((phase, i) => (
        <g key={phase}>
          <line x1={0} y1={i * phaseY} x2={width} y2={i * phaseY} stroke={C.border} strokeWidth={2} opacity={0.6} />
          <text x={width + 5} y={i * phaseY + 4} fill={C.dim} fontSize="10">{phase}</text>
        </g>
      ))}

      {/* Work nodes */}
      {works.map((w, i) => {
        const phaseIndex = phaseKeys.indexOf(w.phase || "exploration");
        const x = 40 + (i / Math.max(works.length - 1, 1)) * (width - 80);
        const y = phaseIndex * phaseY + (Math.sin(i * 0.7) * 25);
        return (
          <g key={w.id}>
            <rect x={x - 8} y={y - 8} width={16} height={16} fill="url(#innovationGradient)" stroke={C.bg} strokeWidth={2} rx={2} />
            <text x={x} y={y - 14} textAnchor="middle" fill={C.text} fontSize="9" fontWeight="600">
              {w.title.length > 6 ? w.title.slice(0,6)+"…" : w.title}
            </text>
            <text x={x} y={y + 20} textAnchor="middle" fill={C.dim} fontSize="8">{w.type}</text>
          </g>
        );
      })}

      {/* Connection lines */}
      {works.length > 1 && works.map((w, i) => {
        if (i < works.length - 1) {
          const phaseIndex = phaseKeys.indexOf(w.phase || "exploration");
          const nextPhaseIndex = phaseKeys.indexOf(works[i + 1].phase || "exploration");
          const x1 = 40 + (i / Math.max(works.length - 1, 1)) * (width - 80);
          const y1 = phaseIndex * phaseY + (Math.sin(i * 0.7) * 25);
          const x2 = 40 + ((i + 1) / Math.max(works.length - 1, 1)) * (width - 80);
          const y2 = nextPhaseIndex * phaseY + (Math.sin((i + 1) * 0.7) * 25);
          return (
            <line key={`line-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={C.gold} strokeWidth={2} opacity={0.6} />
          );
        }
        return null;
      })}

      {/* Labels */}
      <text x={0} y={height + 20} fill={C.dim} fontSize="10">Experimental Innovation</text>
      <text x={width} y={height + 20} fill={C.dim} fontSize="10" textAnchor="end">Works: {works.length}</text>
      <text x={width/2} y={height + 35} fill={C.dim} fontSize="9" textAnchor="middle">Creative Evolution & Breakthrough</text>
    </svg>
  );
}

// ── Work Panel ────────────────────────────────────────────────────────────────
function WorkPanel({ work, onEdit, onDelete, onAnalyze, onExpand }) {
  const [tab, setTab] = useState("content");
  const [copied, setCopied] = useState(false);
  const lines = (work.content || "").split("\n");

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      background: C.panel, border: `1px solid ${C.border}`,
      borderRadius: 10, overflow: "hidden", height: "100%",
    }}>
      {/* Work header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 14px", background: C.surface,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ color: C.emerald, fontFamily: C.mono, fontSize: 13, fontWeight: 700 }}>⚗️</span>
        <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, flex: 1 }}>{work.title}</span>
        {badge(work.phase || "exploration", C.emerald)}
        {work.status === "generating" && <Spin size={12} />}
        {work.status === "done" && <StatusDot color={C.emerald} />}
        {work.status === "error" && <StatusDot color={C.crimson} />}

        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {[
            { id: "content", label: "Content" },
            { id: "experimental", label: "Experimental" },
            { id: "notes", label: "Notes" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
              background: tab === t.id ? `${C.emerald}22` : "none",
              border: `1px solid ${tab === t.id ? C.emerald + "66" : "transparent"}`,
              color: tab === t.id ? C.emerald : C.dim, fontFamily: C.mono,
            }}>{t.label}</button>
          ))}
          <button onClick={() => { navigator.clipboard.writeText(work.content || ""); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
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
            {/* Work text */}
            <pre style={{
              flex: 1, margin: 0, padding: "14px 20px",
              fontFamily: C.serif, fontSize: 16, lineHeight: "24px",
              color: "#f0e6d2", background: C.bg,
              overflowX: "auto", whiteSpace: "pre-wrap",
            }}>{work.content || (work.status === "generating" ? "Developing experimental work..." : "Empty work")}</pre>
          </div>
        )}

        {tab === "experimental" && (
          <div style={{ padding: 20 }}>
            {work.experimentalAnalysis ? (
              <div>
                {/* Score row */}
                {work.experimentalAnalysis.impact !== undefined && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ fontSize: 32, fontFamily: C.mono, fontWeight: 700, color: work.experimentalAnalysis.impact >= 8 ? C.emerald : work.experimentalAnalysis.impact >= 5 ? C.gold : C.crimson }}>
                      {work.experimentalAnalysis.impact}/10
                    </div>
                    <div style={{ color: C.muted, fontSize: 13 }}>{work.experimentalAnalysis.summary}</div>
                  </div>
                )}
                {/* Experimental issues */}
                {work.experimentalAnalysis.issues?.map((issue, i) => (
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
                  }}>↻ Expand Work</button>
                </div>
              </div>
            ) : (
              <button onClick={() => onAnalyze(work)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Analyze Experimental Quality</button>
            )}
          </div>
        )}

        {tab === "notes" && (
          <div style={{ padding: 20 }}>
            {work.notes ? (
              <pre style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{work.notes}</pre>
            ) : (
              <button onClick={() => onEdit(work)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Add Experimental Notes</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Experimental Architect ────────────────────────────────────────────────────
function ExperimentalArchitect({ onAccept, onCancel }) {
  const [step, setStep] = useState(0); // 0=archetype 1=details 2=planning 3=review
  const [archetype, setArchetype] = useState(null);
  const [approach, setApproach] = useState("conceptual");
  const [desc, setDesc] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const generatePlan = async () => {
    setLoading(true);
    setStep(2);
    setStatusMsg("AI is conceptualizing the experimental work...");

    const sys = `You are a visionary artist and experimental creator designing groundbreaking works. Design a complete experimental project.
Return ONLY valid JSON: {
  "title": string,
  "subtitle": string,
  "approach": string,
  "innovation": string[],
  "concepts": [
    {
      "breakthrough": string,
      "method": string,
      "impact": string
    }
  ],
  "process": [
    {
      "phase": number (1|2|3),
      "stage": string,
      "workCount": number,
      "techniques": string[]
    }
  ],
  "technology": string[],
  "presentation": string[],
  "workCount": string
}
Generate 2-4 key experimental concepts and 3-phase innovative process with 3-5 works per phase. Be radically innovative.`;

    const msg = `Archetype: ${archetype?.label}
Approach: ${approach}
Description: ${desc || "Create a groundbreaking experimental work that challenges perceptions"}
Design a complete experimental project.`;

    try {
      const raw = await claude([{ role: "user", content: msg }], sys, 1200);
      const parsed = parseJSON(raw);
      if (parsed) { setPlan(parsed); setStep(3); }
      else { setStatusMsg("Parse error — please retry."); setStep(1); }
    } catch (e) {
      setStatusMsg("Experimental inspiration failed.");
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
          <span style={{ fontFamily: C.mono, color: C.emerald, fontSize: 13, letterSpacing: "0.1em" }}>
            EXPERIMENTAL ARCHITECT
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
              <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Choose an Experimental Archetype</h2>
              <p style={{ color: C.dim, fontSize: 13, marginBottom: 24, fontFamily: C.mono }}>What experimental path shall your work take?</p>
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
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Experimental Approach</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {Object.entries(APPROACHES).map(([id, a]) => (
                      <button key={id} onClick={() => setApproach(id)} style={{
                        padding: "8px 18px", borderRadius: 8, cursor: "pointer",
                        border: `1px solid ${approach === id ? a.color + "88" : C.border}`,
                        background: approach === id ? `${a.color}18` : "none",
                        color: approach === id ? a.color : C.muted,
                        fontFamily: C.mono, fontSize: 12,
                      }}>
                        {a.icon} {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Experimental Vision</label>
                  <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder={`Describe the experimental concept, innovative methods, and boundary-pushing vision that drives your work...`}
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
                  }}>⚗️ Forge Experimental Work</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Loading */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 280, gap: 20 }}>
              <div style={{ position: "relative" }}>
                <Spin size={52} />
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.emerald, fontSize: 20 }}>⚗️</span>
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
                  {badge(plan.approach, C.emerald)}
                  {plan.innovation?.map(i => badge(i, C.gold))}
                </div>
                <p style={{ color: C.dim, fontSize: 13, lineHeight: 1.7, fontStyle: "italic" }}>
                  {plan.technology?.join(", ")} · {plan.workCount} works
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Key Breakthroughs ({plan.concepts?.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.concepts?.map((c, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                    }}>
                      <span style={{ color: C.emerald, fontFamily: C.mono, fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>B{i+1}</span>
                      <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, width: 140, flexShrink: 0 }}>{c.breakthrough.slice(0,18)}...</span>
                      <span style={{ color: C.muted, fontSize: 12, flex: 1 }}>{c.impact}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Innovative Process</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.process?.map((phase, i) => (
                    <div key={i} style={{
                      padding: "12px 16px", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                    }}>
                      <div style={{ color: C.emerald, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Phase {phase.phase}: {phase.stage}</div>
                      <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.5, marginBottom: 6 }}>{phase.focus}</div>
                      <div style={{ color: C.dim, fontSize: 11, lineHeight: 1.4 }}>
                        {phase.workCount} works
                      </div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4, marginTop: 4 }}>
                        {phase.techniques?.join(" → ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(1)} style={{ padding: "10px 20px", background: "none", border: `1px solid ${C.border}`, borderRadius: 8, color: C.dim, cursor: "pointer" }}>← Recraft</button>
                <button onClick={() => onAccept(plan, approach)} style={{
                  flex: 1, padding: "12px 0",
                  background: `linear-gradient(90deg, ${C.emerald}, ${C.gold})`,
                  border: "none", borderRadius: 8, color: C.bg, fontFamily: C.mono,
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  boxShadow: `0 0 30px ${C.emeraldGlow}`,
                }}>⚗️ Begin Experimental Work</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Creative Dialogue (with experimental consultation) ────────────────────────
function CreativeDialogue({ works, concepts, onApplyEdit }) {
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

    const experimentalContext = works.slice(0, 3).map(w =>
      `WORK: ${w.title}\n${(w.content || "").slice(0, 400)}`
    ).join("\n\n---\n\n");

    const conceptContext = concepts.map(c => `${c.breakthrough}: ${c.impact}`).join("; ");

    const sys = `You are a visionary experimental artist and innovator. Help develop and refine groundbreaking experimental works.
Experimental context: ${experimentalContext || "No works yet"}
Breakthroughs: ${conceptContext || "No concepts yet"}

Answer the artist's question about their experimental work. Suggest innovative techniques, boundary-pushing methods, technological integration, or connections to avant-garde art movements.
Be radically innovative, technically visionary, and creatively boundary-pushing.`;

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
            Ask about your experimental work.<br/>
            "How can I push this boundary?" · "Tech integration?" · "Avant-garde methods?"
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
          placeholder="Ask about your experimental work..."
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

// ── Main ExperimentalWorksForge ───────────────────────────────────────────────
export default function ExperimentalWorksForge() {
  const [works, setWorks] = useState([]);
  const [activeWorkId, setActiveWorkId] = useState(null);
  const [showArchitect, setShowArchitect] = useState(false);
  const [projectTitle, setProjectTitle] = useState("Untitled Experimental Work");
  const [plan, setPlan] = useState(null);
  const [sidePanel, setSidePanel] = useState("innovation"); // innovation | chat | process
  const [globalStatus, setGlobalStatus] = useState("");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const activeWork = works.find(w => w.id === activeWorkId);

  // ── Generate work content ────────────────────────────────────────────────────
  const generateWorkContent = useCallback(async (workId, planData, approach, allWorks, allConcepts) => {
    const phaseMeta = planData?.process?.find(p => p.phase === allWorks.find(aw => aw.id === workId)?.phase);
    const thisWork = allWorks.find(w => w.id === workId);
    if (!thisWork) return;

    setWorks(prev => prev.map(w => w.id === workId ? { ...w, status: "generating" } : w));

    const conceptSummary = allConcepts.map(c => `${c.breakthrough}: ${c.impact}`).join("; ");
    const prevWorks = allWorks.filter(w => w.phase < thisWork.phase || (w.phase === thisWork.phase && w.order < thisWork.order))
      .slice(-2).map(w => `PREV: ${w.title} - ${(w.content || "").slice(0, 200)}...`).join("\n");

    const sys = `You are a visionary experimental artist creating groundbreaking works in ${approach} approach. Write rigorous experimental concepts and works.
Output ONLY the work content — no titles, no explanations.
Write systematic, well-conceptualized experimental work with clear innovative elements and boundary-pushing intent.`;

    const msg = `Project: ${planData?.title || projectTitle}
Approach: ${approach}
Phase: ${thisWork.phase}, Stage: ${phaseMeta?.stage || ""}

Breakthroughs: ${conceptSummary}

This work: ${thisWork.title}

Previous context:
${prevWorks}

Write the complete experimental work.`;

    try {
      const content = await claude([{ role: "user", content: msg }], sys, 1200);
      setWorks(prev => prev.map(w => w.id === workId
        ? { ...w, content, status: "done", elements: phaseMeta?.techniques || [] }
        : s
      ));
    } catch {
      setWorks(prev => prev.map(w => w.id === workId ? { ...w, status: "error", content: "Work generation failed." } : w));
    }
  }, [projectTitle]);

  // ── Accept experimental plan and generate works ─────────────────────────────
  const handleAcceptPlan = useCallback(async (planData, approach) => {
    setShowArchitect(false);
    setProjectTitle(planData.title);
    setPlan({ ...planData, approach });
    setIsGeneratingAll(true);

    // Create concepts
    const newConcepts = planData.concepts?.map(c => ({
      id: uid(), breakthrough: c.breakthrough, method: c.method, impact: c.impact,
      approach, connections: []
    })) || [];
    setConcepts(newConcepts);

    // Create works
    const newWorks = [];
    let workCount = 1;
    planData.process?.forEach(phase => {
      for (let i = 0; i < phase.workCount; i++) {
        newWorks.push({
          id: uid(), title: `Work ${workCount}`, phase: phase.phase, order: i + 1,
          form: "experimentalworks", content: "", status: "queued", experimentalAnalysis: null, notes: null,
          elements: phase.techniques || [],
        });
        workCount++;
      }
    });

    setWorks(newWorks);
    setActiveWorkId(newWorks[0]?.id);

    for (let i = 0; i < newWorks.length; i++) {
      setGlobalStatus(`Creating ${i + 1}/${newWorks.length}: ${newWorks[i].title}`);
      await generateWorkContent(newWorks[i].id, planData, approach, newWorks, newConcepts);
      await new Promise(r => setTimeout(r, 300));
    }

    setGlobalStatus("Experimental work draft complete.");
    setIsGeneratingAll(false);
  }, [generateWorkContent]);

  // ── Experimental analyze work ────────────────────────────────────────────────
  const experimentalAnalyzeWork = useCallback(async (work) => {
    if (!work.content) return;
    setWorks(prev => prev.map(w => w.id === work.id ? { ...w, status: "generating" } : w));

    const sys = `You are an experimental art critic and innovation theorist analyzing groundbreaking works. Analyze the work and return ONLY JSON:
{
  "impact": number (1-10),
  "summary": string (one sentence),
  "issues": [
    { "severity": "high"|"med"|"low", "title": string, "detail": string }
  ]
}
Be radically innovative about experimental quality, boundary-pushing potential, and artistic breakthrough. Limit to 3 issues max.`;

    const raw = await claude([{ role: "user", content: `Analyze experimental quality of this groundbreaking work:\n\n${work.content}` }], sys, 1000).catch(() => null);
    const parsed = raw ? parseJSON(raw) : null;

    setWorks(prev => prev.map(w => w.id === work.id
      ? { ...w, status: "done", experimentalAnalysis: parsed || { impact: 5, summary: "Experimental analysis failed.", issues: [] } }
      : w
    ));
  }, []);

  // ── Expand work ──────────────────────────────────────────────────────────────
  const expandWork = useCallback(async (work) => {
    if (!work.content) return;
    setWorks(prev => prev.map(w => w.id === work.id ? { ...w, status: "generating" } : w));

    const sys = `You are an experimental artist expanding a groundbreaking work. Add more innovative elements, additional boundary-pushing techniques, and deeper experimental exploration.
Return ONLY the expanded work — no explanations.`;

    const msg = `Expand this experimental work with additional innovative detail:\n\n${work.content}`;

    const expanded = await claude([{ role: "user", content: msg }], sys, 1200).catch(() => work.content);
    setWorks(prev => prev.map(w => w.id === work.id
      ? { ...w, content: expanded, status: "done", experimentalAnalysis: null }
      : w
    ));
  }, []);

  // ── Quick add work ───────────────────────────────────────────────────────────
  const addBlankWork = () => {
    const name = `Work ${works.length + 1}`;
    const newWork = { id: uid(), title: name, phase: 1, order: works.length + 1, form: "experimentalworks", content: "", status: "queued", experimentalAnalysis: null, notes: null, elements: [] };
    setWorks(prev => [...prev, newWork]);
    setActiveWorkId(newWork.id);
  };

  const doneCount = works.filter(w => w.status === "done").length;
  const totalWords = works.reduce((acc, w) => acc + (w.content?.split(/\s+/).length || 0), 0);

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

      {showArchitect && <ExperimentalArchitect onAccept={handleAcceptPlan} onCancel={() => setShowArchitect(false)} />}

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "10px 20px", background: C.panel,
        borderBottom: `1px solid ${C.border}`,
        height: 50, flexShrink: 0,
      }}>
        <span style={{ fontFamily: C.mono, color: C.emerald, fontSize: 14, fontWeight: 700, letterSpacing: "0.12em" }}>⚗️ EXPERIMENTAL WORKS FORGE</span>
        <span style={{ color: C.dim, fontSize: 12, fontFamily: C.mono }}>/{projectTitle}</span>

        {globalStatus && (
          <span style={{ color: C.gold, fontFamily: C.mono, fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
            {isGeneratingAll && <Spin size={11} />}
            {globalStatus}
          </span>
        )}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          {works.length > 0 && (
            <>
              <span style={{ fontFamily: C.mono, fontSize: 11, color: C.dim }}>
                {doneCount}/{works.length} works · ~{totalWords.toLocaleString()} words
              </span>
              {badge(plan?.approach || "conceptual", C.emerald)}
            </>
          )}
          <button onClick={addBlankWork} style={{
            padding: "5px 14px", background: "none", border: `1px solid ${C.border}`,
            borderRadius: 6, color: C.muted, cursor: "pointer", fontFamily: C.mono, fontSize: 11,
          }}>+ Work</button>
          <button onClick={() => setShowArchitect(true)} style={{
            padding: "6px 18px",
            background: `linear-gradient(90deg, ${C.emerald}22, ${C.gold}22)`,
            border: `1px solid ${C.emerald}55`, borderRadius: 7,
            color: C.emerald, cursor: "pointer", fontFamily: C.mono, fontSize: 12, fontWeight: 700,
            boxShadow: `0 0 16px ${C.emeraldGlow}`,
          }}>⚗️ New Experimental Work</button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* Work tree sidebar */}
        <div style={{
          width: 240, flexShrink: 0, borderRight: `1px solid ${C.border}`,
          background: C.panel, display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.12em", textTransform: "uppercase" }}>Works</span>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "8px 8px" }}>
            {works.length === 0 && (
              <div style={{ padding: "30px 14px", color: C.dim, fontSize: 11, fontFamily: C.mono, textAlign: "center", lineHeight: 2 }}>
                No works.<br/>Start with ⚗️ New Experimental Work.
              </div>
            )}
            {works.map(w => {
              const isActive = w.id === activeWorkId;
              return (
                <button key={w.id} onClick={() => setActiveWorkId(w.id)} style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  padding: "7px 10px", borderRadius: 6, marginBottom: 2,
                  background: isActive ? `${C.emerald}18` : "none",
                  border: `1px solid ${isActive ? C.emerald + "44" : "transparent"}`,
                  cursor: "pointer", textAlign: "left",
                }}>
                  <span style={{ color: C.emerald, fontFamily: C.mono, fontSize: 12, width: 18, textAlign: "center", flexShrink: 0 }}>{w.phase}</span>
                  <span style={{ color: isActive ? C.text : C.muted, fontFamily: C.mono, fontSize: 11, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.title}</span>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                    background: w.status === "done" ? C.emerald : w.status === "generating" ? C.gold : w.status === "error" ? C.crimson : C.border,
                    boxShadow: w.status === "generating" ? `0 0 6px ${C.gold}` : "none",
                    animation: w.status === "generating" ? "pulse 1s ease-in-out infinite" : "none",
                  }} />
                </button>
              );
            })}
          </div>

          {/* Side panel tabs */}
          <div style={{ borderTop: `1px solid ${C.border}`, display: "flex" }}>
            {[
              { id: "innovation", icon: "⚗️", tip: "Innovation" },
              { id: "chat", icon: "💬", tip: "Chat"        },
              { id: "process", icon: "📋", tip: "Process" },
            ].map(t => (
              <button key={t.id} onClick={() => setSidePanel(sidePanel === t.id ? null : t.id)} title={t.tip} style={{
                flex: 1, padding: "8px 0",
                background: sidePanel === t.id ? `${C.emerald}18` : "none",
                border: "none", borderRight: t.id === "innovation" ? `1px solid ${C.border}` : t.id === "chat" ? `1px solid ${C.border}` : "none",
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
            {sidePanel === "innovation" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Experimental Innovation</span>
                </div>
                <div style={{ flex: 1, overflow: "auto" }}>
                  <InnovationCanvas works={works} />
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
              <CreativeDialogue works={works} concepts={concepts} onApplyEdit={() => {}} />
            )}
            {sidePanel === "process" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Innovative Process</span>
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
                  {plan?.process?.map((phase, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ color: C.emerald, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Phase {phase.phase}: {phase.stage}</div>
                      <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.5, marginBottom: 6 }}>{phase.focus}</div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4 }}>
                        {phase.workCount} works
                      </div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4, marginTop: 4 }}>
                        {phase.techniques?.join(" → ")}
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
          {!activeWork ? (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 24,
              color: C.dim, fontFamily: C.mono,
            }}>
              <div style={{ fontSize: 48, opacity: 0.2 }}>⚗️</div>
              <div style={{ fontSize: 14, opacity: 0.5 }}>No work selected</div>
              <button onClick={() => setShowArchitect(true)} style={{
                padding: "12px 28px",
                background: `linear-gradient(90deg, ${C.emerald}22, ${C.gold}22)`,
                border: `1px solid ${C.emerald}55`, borderRadius: 10,
                color: C.emerald, cursor: "pointer", fontFamily: C.mono, fontSize: 14, fontWeight: 700,
              }}>⚗️ Begin Experimental Work</button>
            </div>
          ) : (
            <WorkPanel
              work={activeWork}
              onDelete={() => {
                setWorks(prev => prev.filter(w => w.id !== activeWork.id));
                setActiveWorkId(works.find(w => w.id !== activeWork.id)?.id || null);
              }}
              onExpand={() => expandWork(activeWork)}
              onAnalyze={() => experimentalAnalyzeWork(activeWork)}
              onEdit={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}