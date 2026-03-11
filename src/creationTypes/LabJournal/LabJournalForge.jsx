// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LAB JOURNAL FORGE — Interactive Scientific Research System
// Ported and adapted from CodeForge.jsx for rigorous scientific documentation.
// Features: Lab Architect, Experiment Builder, Data Analyzer,
// Hypothesis Tester, Research Polisher, Scientific Dialogue.
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
  biology:       { icon: "🧬", color: C.emerald,   label: "Biology"       },
  chemistry:     { icon: "⚗️", color: C.crimson,   label: "Chemistry"     },
  physics:       { icon: "⚛️", color: C.sapphire,  label: "Physics"       },
  neuroscience:  { icon: "🧠", color: C.gold,      label: "Neuroscience"  },
  ecology:       { icon: "🌿", color: C.emerald,   label: "Ecology"       },
  materials:     { icon: "🔬", color: C.crimson,   label: "Materials"     },
  astronomy:     { icon: "🌌", color: C.sapphire,  label: "Astronomy"     },
  computer_sci:  { icon: "💻", color: C.gold,      label: "Computer Sci"  },
  psychology:    { icon: "🧠", color: C.emerald,   label: "Psychology"    },
  engineering:   { icon: "⚙️", color: C.crimson,   label: "Engineering"   },
};

const ARCHETYPES = [
  { id: "experimental_research", label: "Experimental Research", icon: "🔬", description: "Hypothesis-driven experimental studies" },
  { id: "observational_study", label: "Observational Study", icon: "👁️", description: "Systematic observation and data collection" },
  { id: "computational_modeling", label: "Computational Modeling", icon: "💻", description: "Simulation and computational analysis" },
  { id: "field_research", label: "Field Research", icon: "🌍", description: "Research conducted in natural environments" },
  { id: "clinical_trial", label: "Clinical Trial", icon: "🏥", description: "Human subject research and trials" },
  { id: "materials_synthesis", label: "Materials Synthesis", icon: "🧪", description: "Development and characterization of new materials" },
  { id: "behavioral_study", label: "Behavioral Study", icon: "🐭", description: "Animal or human behavior research" },
  { id: "survey_research", label: "Survey Research", icon: "📊", description: "Large-scale data collection via surveys" },
  { id: "meta_analysis", label: "Meta-Analysis", icon: "📈", description: "Statistical synthesis of existing studies" },
  { id: "custom", label: "Custom Research", icon: "✨", description: "Describe your own research methodology" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => `lj_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

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

// ── Data Visualization ─────────────────────────────────────────────────────────
function DataVisualization({ entries }) {
  const width = 380, height = 200;
  if (!entries.length) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, color:C.dim, fontFamily:C.mono, fontSize:12 }}>
      No data yet
    </div>
  );

  const dataPoints = [];
  entries.forEach(e => {
    if (e.dataPoints) e.dataPoints.forEach(dp => {
      dataPoints.push({ ...dp, entryId: e.id, date: e.date });
    });
  });

  if (!dataPoints.length) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, color:C.dim, fontFamily:C.mono, fontSize:12 }}>
      No data points
    </div>
  );

  const xScale = dataPoints.length > 1 ? width / (dataPoints.length - 1) : width / 2;
  const yValues = dataPoints.map(d => d.value || 0);
  const yMin = Math.min(...yValues), yMax = Math.max(...yValues);
  const yRange = yMax - yMin || 1;
  const yScale = height / yRange;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height + 40}`} style={{ fontFamily: C.mono }}>
      <defs>
        <linearGradient id="dataGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={C.emerald} />
          <stop offset="50%" stopColor={C.gold} />
          <stop offset="100%" stopColor={C.sapphire} />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0,1,2,3,4].map(i => (
        <g key={i}>
          <line x1={0} y1={i * 40} x2={width} y2={i * 40} stroke={C.border} strokeWidth={0.5} opacity={0.3} />
        </g>
      ))}

      {/* Data line */}
      {dataPoints.length > 1 && (
        <path
          d={dataPoints.map((d, i) => {
            const x = i * xScale;
            const y = height - ((d.value - yMin) * yScale);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
          }).join(' ')}
          stroke="url(#dataGradient)" strokeWidth={2} fill="none"
        />
      )}

      {/* Data points */}
      {dataPoints.map((d, i) => {
        const x = i * xScale;
        const y = height - ((d.value - yMin) * yScale);
        return (
          <circle key={i} cx={x} cy={y} r={4} fill={C.emerald} stroke={C.bg} strokeWidth={2} />
        );
      })}

      {/* Labels */}
      <text x={0} y={height + 20} fill={C.dim} fontSize="10">Time Series</text>
      <text x={width} y={height + 20} fill={C.dim} fontSize="10" textAnchor="end">Data Points: {dataPoints.length}</text>
      <text x={width/2} y={height + 35} fill={C.dim} fontSize="9" textAnchor="middle">Experimental Data Visualization</text>
    </svg>
  );
}

// ── Entry Panel ───────────────────────────────────────────────────────────────
function EntryPanel({ entry, onEdit, onDelete, onAnalyze, onExpand }) {
  const [tab, setTab] = useState("content");
  const [copied, setCopied] = useState(false);
  const lines = (entry.content || "").split("\n");

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      background: C.panel, border: `1px solid ${C.border}`,
      borderRadius: 10, overflow: "hidden", height: "100%",
    }}>
      {/* Entry header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 14px", background: C.surface,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ color: C.emerald, fontFamily: C.mono, fontSize: 13, fontWeight: 700 }}>🔬</span>
        <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, flex: 1 }}>{entry.title}</span>
        {badge(entry.type || "experiment", C.emerald)}
        {entry.status === "generating" && <Spin size={12} />}
        {entry.status === "done" && <StatusDot color={C.emerald} />}
        {entry.status === "error" && <StatusDot color={C.crimson} />}

        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {[
            { id: "content", label: "Content" },
            { id: "data", label: "Data" },
            { id: "notes", label: "Notes" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
              background: tab === t.id ? `${C.emerald}22` : "none",
              border: `1px solid ${tab === t.id ? C.emerald + "66" : "transparent"}`,
              color: tab === t.id ? C.emerald : C.dim, fontFamily: C.mono,
            }}>{t.label}</button>
          ))}
          <button onClick={() => { navigator.clipboard.writeText(entry.content || ""); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
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
            {/* Entry text */}
            <pre style={{
              flex: 1, margin: 0, padding: "14px 20px",
              fontFamily: C.serif, fontSize: 16, lineHeight: "24px",
              color: "#f0e6d2", background: C.bg,
              overflowX: "auto", whiteSpace: "pre-wrap",
            }}>{entry.content || (entry.status === "generating" ? "Recording experimental observations..." : "Empty entry")}</pre>
          </div>
        )}

        {tab === "data" && (
          <div style={{ padding: 20 }}>
            {entry.dataAnalysis ? (
              <div>
                {/* Score row */}
                {entry.dataAnalysis.significance !== undefined && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ fontSize: 32, fontFamily: C.mono, fontWeight: 700, color: entry.dataAnalysis.significance >= 8 ? C.emerald : entry.dataAnalysis.significance >= 5 ? C.gold : C.sapphire }}>
                      {entry.dataAnalysis.significance}/10
                    </div>
                    <div style={{ color: C.muted, fontSize: 13 }}>{entry.dataAnalysis.summary}</div>
                  </div>
                )}
                {/* Data issues */}
                {entry.dataAnalysis.issues?.map((issue, i) => (
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
                  }}>↻ Expand Analysis</button>
                </div>
              </div>
            ) : (
              <button onClick={() => onAnalyze(entry)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Analyze Data</button>
            )}
          </div>
        )}

        {tab === "notes" && (
          <div style={{ padding: 20 }}>
            {entry.notes ? (
              <pre style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{entry.notes}</pre>
            ) : (
              <button onClick={() => onEdit(entry)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Add Research Notes</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Lab Architect ─────────────────────────────────────────────────────────────
function LabArchitect({ onAccept, onCancel }) {
  const [step, setStep] = useState(0); // 0=archetype 1=details 2=planning 3=review
  const [archetype, setArchetype] = useState(null);
  const [field, setField] = useState("biology");
  const [desc, setDesc] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const generatePlan = async () => {
    setLoading(true);
    setStep(2);
    setStatusMsg("AI is designing the research protocol...");

    const sys = `You are a senior research scientist designing lab journals. Design a complete research project.
Return ONLY valid JSON: {
  "title": string,
  "subtitle": string,
  "field": string,
  "methodology": string[],
  "hypotheses": [
    {
      "statement": string,
      "variables": string[],
      "prediction": string
    }
  ],
  "protocol": [
    {
      "phase": number (1|2|3),
      "focus": string,
      "entryCount": number,
      "techniques": string[]
    }
  ],
  "equipment": string[],
  "controls": string[],
  "entryCount": string
}
Generate 2-4 key hypotheses and 3-phase protocol with 3-5 entries per phase. Be scientifically rigorous.`;

    const msg = `Archetype: ${archetype?.label}
Field: ${field}
Description: ${desc || "Design a comprehensive research study"}
Design a complete scientific protocol.`;

    try {
      const raw = await claude([{ role: "user", content: msg }], sys, 1200);
      const parsed = parseJSON(raw);
      if (parsed) { setPlan(parsed); setStep(3); }
      else { setStatusMsg("Parse error — please retry."); setStep(1); }
    } catch (e) {
      setStatusMsg("Research design failed.");
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
            LAB ARCHITECT
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
              <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Choose a Research Archetype</h2>
              <p style={{ color: C.dim, fontSize: 13, marginBottom: 24, fontFamily: C.mono }}>What type of scientific investigation shall guide your lab journal?</p>
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
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Research Question</label>
                  <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder={`Describe the scientific question or hypothesis that drives your research...`}
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
                  }}>🔬 Forge Lab Journal</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Loading */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 280, gap: 20 }}>
              <div style={{ position: "relative" }}>
                <Spin size={52} />
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.emerald, fontSize: 20 }}>🔬</span>
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
                  {badge(plan.field, C.emerald)}
                  {plan.methodology?.map(m => badge(m, C.gold))}
                </div>
                <p style={{ color: C.dim, fontSize: 13, lineHeight: 1.7, fontStyle: "italic" }}>
                  {plan.equipment?.join(", ")} · {plan.entryCount} entries
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Key Hypotheses ({plan.hypotheses?.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.hypotheses?.map((h, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                    }}>
                      <span style={{ color: C.emerald, fontFamily: C.mono, fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>H{i+1}</span>
                      <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, width: 200, flexShrink: 0 }}>{h.statement.slice(0,30)}...</span>
                      <span style={{ color: C.muted, fontSize: 12, flex: 1 }}>{h.prediction}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Protocol</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.protocol?.map((phase, i) => (
                    <div key={i} style={{
                      padding: "12px 16px", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                    }}>
                      <div style={{ color: C.emerald, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Phase {phase.phase}</div>
                      <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.5, marginBottom: 6 }}>{phase.focus}</div>
                      <div style={{ color: C.dim, fontSize: 11, lineHeight: 1.4 }}>
                        {phase.entryCount} entries
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
                <button onClick={() => onAccept(plan, field)} style={{
                  flex: 1, padding: "12px 0",
                  background: `linear-gradient(90deg, ${C.emerald}, ${C.gold})`,
                  border: "none", borderRadius: 8, color: C.bg, fontFamily: C.mono,
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  boxShadow: `0 0 30px ${C.emeraldGlow}`,
                }}>🔬 Begin Research</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Scientific Dialogue (with research consultation) ──────────────────────────
function ScientificDialogue({ entries, hypotheses, onApplyEdit }) {
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

    const researchContext = entries.slice(0, 3).map(e =>
      `ENTRY: ${e.title}\n${(e.content || "").slice(0, 400)}`
    ).join("\n\n---\n\n");

    const hypothesisContext = hypotheses.map(h => `${h.statement}: ${h.prediction}`).join("; ");

    const sys = `You are a research scientist and statistical expert. Help develop and refine scientific research.
Research context: ${researchContext || "No entries yet"}
Hypotheses: ${hypothesisContext || "No hypotheses yet"}

Answer the researcher's question about their study. Suggest experimental designs, statistical analyses, controls, or connections to scientific literature.
Be methodologically rigorous, statistically sound, and scientifically honest.`;

    const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
    const raw = await claude([...history, { role: "user", content: userMsg }], sys, 1000).catch(() => "Error consulting with AI.");
    setMessages(m => [...m, { role: "assistant", content: raw }]);
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.panel, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <StatusDot color={C.gold} />
        <span style={{ fontFamily: C.mono, fontSize: 11, color: C.gold, letterSpacing: "0.1em" }}>SCIENTIFIC DIALOGUE</span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 8px" }}>
        {messages.length === 0 && (
          <div style={{ color: C.dim, fontSize: 12, fontFamily: C.mono, textAlign: "center", paddingTop: 40, lineHeight: 2 }}>
            Ask about your research.<br/>
            "How should I design this experiment?" · "Statistical analysis?" · "Control variables?"
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
          placeholder="Ask about your research..."
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

// ── Main LabJournalForge ──────────────────────────────────────────────────────
export default function LabJournalForge() {
  const [entries, setEntries] = useState([]);
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [showArchitect, setShowArchitect] = useState(false);
  const [journalTitle, setJournalTitle] = useState("Untitled Lab Journal");
  const [plan, setPlan] = useState(null);
  const [sidePanel, setSidePanel] = useState("viz"); // viz | chat | protocol
  const [globalStatus, setGlobalStatus] = useState("");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const activeEntry = entries.find(e => e.id === activeEntryId);

  // ── Generate entry content ───────────────────────────────────────────────────
  const generateEntryContent = useCallback(async (entryId, planData, field, allEntries, allHypotheses) => {
    const phaseMeta = planData?.protocol?.find(p => p.phase === allEntries.find(ae => ae.id === entryId)?.phase);
    const thisEntry = allEntries.find(e => e.id === entryId);
    if (!thisEntry) return;

    setEntries(prev => prev.map(e => e.id === entryId ? { ...e, status: "generating" } : e));

    const hypothesisSummary = allHypotheses.map(h => `${h.statement} → ${h.prediction}`).join("; ");
    const prevEntries = allEntries.filter(e => e.phase < thisEntry.phase || (e.phase === thisEntry.phase && e.order < thisEntry.order))
      .slice(-2).map(e => `PREV: ${e.title} - ${(e.content || "").slice(0, 200)}...`).join("\n");

    const sys = `You are a research scientist writing detailed lab journal entries in ${field}. Write rigorous scientific documentation.
Output ONLY the entry content — no titles, no explanations.
Write systematic, well-documented scientific observations with clear methodology and data.`;

    const msg = `Journal: ${planData?.title || journalTitle}
Field: ${field}
Phase: ${thisEntry.phase}, Focus: ${phaseMeta?.focus || ""}

Hypotheses: ${hypothesisSummary}

This entry: ${thisEntry.title}

Previous context:
${prevEntries}

Write the complete lab journal entry.`;

    try {
      const content = await claude([{ role: "user", content: msg }], sys, 1200);
      setEntries(prev => prev.map(e => e.id === entryId
        ? { ...e, content, status: "done", dataPoints: phaseMeta?.techniques || [] }
        : e
      ));
    } catch {
      setEntries(prev => prev.map(e => e.id === entryId ? { ...e, status: "error", content: "Entry generation failed." } : e));
    }
  }, [journalTitle]);

  // ── Accept journal plan and generate entries ────────────────────────────────
  const handleAcceptPlan = useCallback(async (planData, field) => {
    setShowArchitect(false);
    setJournalTitle(planData.title);
    setPlan({ ...planData, field });
    setIsGeneratingAll(true);

    // Create hypotheses
    const newHypotheses = planData.hypotheses?.map(h => ({
      id: uid(), statement: h.statement, variables: h.variables, prediction: h.prediction,
      field, connections: []
    })) || [];
    setHypotheses(newHypotheses);

    // Create entries
    const newEntries = [];
    let entryCount = 1;
    planData.protocol?.forEach(phase => {
      for (let i = 0; i < phase.entryCount; i++) {
        newEntries.push({
          id: uid(), title: `Entry ${entryCount}`, phase: phase.phase, order: i + 1,
          form: "labjournal", content: "", status: "queued", dataAnalysis: null, notes: null,
          dataPoints: phase.techniques || [],
        });
        entryCount++;
      }
    });

    setEntries(newEntries);
    setActiveEntryId(newEntries[0]?.id);

    for (let i = 0; i < newEntries.length; i++) {
      setGlobalStatus(`Writing ${i + 1}/${newEntries.length}: ${newEntries[i].title}`);
      await generateEntryContent(newEntries[i].id, planData, field, newEntries, newHypotheses);
      await new Promise(r => setTimeout(r, 300));
    }

    setGlobalStatus("Lab journal draft complete.");
    setIsGeneratingAll(false);
  }, [generateEntryContent]);

  // ── Data analyze entry ──────────────────────────────────────────────────────
  const dataAnalyzeEntry = useCallback(async (entry) => {
    if (!entry.content) return;
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: "generating" } : e));

    const sys = `You are a data analyst evaluating scientific data. Analyze the entry and return ONLY JSON:
{
  "significance": number (1-10),
  "summary": string (one sentence),
  "issues": [
    { "severity": "high"|"med"|"low", "title": string, "detail": string }
  ]
}
Be statistically rigorous about data quality, experimental design, and scientific validity. Limit to 3 issues max.`;

    const raw = await claude([{ role: "user", content: `Analyze data quality of this lab entry:\n\n${entry.content}` }], sys, 1000).catch(() => null);
    const parsed = raw ? parseJSON(raw) : null;

    setEntries(prev => prev.map(e => e.id === entry.id
      ? { ...e, status: "done", dataAnalysis: parsed || { significance: 5, summary: "Data analysis failed.", issues: [] } }
      : e
    ));
  }, []);

  // ── Expand entry ────────────────────────────────────────────────────────────
  const expandEntry = useCallback(async (entry) => {
    if (!entry.content) return;
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: "generating" } : e));

    const sys = `You are a scientist expanding a lab entry. Add more detailed observations, additional data points, and deeper analysis.
Return ONLY the expanded entry — no explanations.`;

    const msg = `Expand this lab journal entry with additional scientific detail:\n\n${entry.content}`;

    const expanded = await claude([{ role: "user", content: msg }], sys, 1200).catch(() => entry.content);
    setEntries(prev => prev.map(e => e.id === entry.id
      ? { ...e, content: expanded, status: "done", dataAnalysis: null }
      : e
    ));
  }, []);

  // ── Quick add entry ─────────────────────────────────────────────────────────
  const addBlankEntry = () => {
    const name = `Entry ${entries.length + 1}`;
    const newEntry = { id: uid(), title: name, phase: 1, order: entries.length + 1, form: "labjournal", content: "", status: "queued", dataAnalysis: null, notes: null, dataPoints: [] };
    setEntries(prev => [...prev, newEntry]);
    setActiveEntryId(newEntry.id);
  };

  const doneCount = entries.filter(e => e.status === "done").length;
  const totalWords = entries.reduce((acc, e) => acc + (e.content?.split(/\s+/).length || 0), 0);

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

      {showArchitect && <LabArchitect onAccept={handleAcceptPlan} onCancel={() => setShowArchitect(false)} />}

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "10px 20px", background: C.panel,
        borderBottom: `1px solid ${C.border}`,
        height: 50, flexShrink: 0,
      }}>
        <span style={{ fontFamily: C.mono, color: C.emerald, fontSize: 14, fontWeight: 700, letterSpacing: "0.12em" }}>🔬 LAB JOURNAL FORGE</span>
        <span style={{ color: C.dim, fontSize: 12, fontFamily: C.mono }}>/{journalTitle}</span>

        {globalStatus && (
          <span style={{ color: C.gold, fontFamily: C.mono, fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
            {isGeneratingAll && <Spin size={11} />}
            {globalStatus}
          </span>
        )}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          {entries.length > 0 && (
            <>
              <span style={{ fontFamily: C.mono, fontSize: 11, color: C.dim }}>
                {doneCount}/{entries.length} entries · ~{totalWords.toLocaleString()} words
              </span>
              {badge(plan?.field || "biology", C.emerald)}
            </>
          )}
          <button onClick={addBlankEntry} style={{
            padding: "5px 14px", background: "none", border: `1px solid ${C.border}`,
            borderRadius: 6, color: C.muted, cursor: "pointer", fontFamily: C.mono, fontSize: 11,
          }}>+ Entry</button>
          <button onClick={() => setShowArchitect(true)} style={{
            padding: "6px 18px",
            background: `linear-gradient(90deg, ${C.emerald}22, ${C.gold}22)`,
            border: `1px solid ${C.emerald}55`, borderRadius: 7,
            color: C.emerald, cursor: "pointer", fontFamily: C.mono, fontSize: 12, fontWeight: 700,
            boxShadow: `0 0 16px ${C.emeraldGlow}`,
          }}>🔬 New Lab Journal</button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* Entry tree sidebar */}
        <div style={{
          width: 240, flexShrink: 0, borderRight: `1px solid ${C.border}`,
          background: C.panel, display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.12em", textTransform: "uppercase" }}>Entries</span>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "8px 8px" }}>
            {entries.length === 0 && (
              <div style={{ padding: "30px 14px", color: C.dim, fontSize: 11, fontFamily: C.mono, textAlign: "center", lineHeight: 2 }}>
                No entries.<br/>Start with 🔬 New Lab Journal.
              </div>
            )}
            {entries.map(e => {
              const isActive = e.id === activeEntryId;
              return (
                <button key={e.id} onClick={() => setActiveEntryId(e.id)} style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  padding: "7px 10px", borderRadius: 6, marginBottom: 2,
                  background: isActive ? `${C.emerald}18` : "none",
                  border: `1px solid ${isActive ? C.emerald + "44" : "transparent"}`,
                  cursor: "pointer", textAlign: "left",
                }}>
                  <span style={{ color: C.emerald, fontFamily: C.mono, fontSize: 12, width: 18, textAlign: "center", flexShrink: 0 }}>{e.phase}</span>
                  <span style={{ color: isActive ? C.text : C.muted, fontFamily: C.mono, fontSize: 11, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</span>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                    background: e.status === "done" ? C.emerald : e.status === "generating" ? C.gold : e.status === "error" ? C.crimson : C.border,
                    boxShadow: e.status === "generating" ? `0 0 6px ${C.gold}` : "none",
                    animation: e.status === "generating" ? "pulse 1s ease-in-out infinite" : "none",
                  }} />
                </button>
              );
            })}
          </div>

          {/* Side panel tabs */}
          <div style={{ borderTop: `1px solid ${C.border}`, display: "flex" }}>
            {[
              { id: "viz", icon: "📊", tip: "Data Viz" },
              { id: "chat", icon: "💬", tip: "Chat"      },
              { id: "protocol", icon: "📋", tip: "Protocol" },
            ].map(t => (
              <button key={t.id} onClick={() => setSidePanel(sidePanel === t.id ? null : t.id)} title={t.tip} style={{
                flex: 1, padding: "8px 0",
                background: sidePanel === t.id ? `${C.emerald}18` : "none",
                border: "none", borderRight: t.id === "viz" ? `1px solid ${C.border}` : t.id === "chat" ? `1px solid ${C.border}` : "none",
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
            {sidePanel === "viz" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Data Visualization</span>
                </div>
                <div style={{ flex: 1, overflow: "auto" }}>
                  <DataVisualization entries={entries} />
                  {plan?.controls && (
                    <div style={{ padding: "0 16px 16px" }}>
                      <div style={{ fontSize: 11, color: C.dim, fontFamily: C.mono, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Controls</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {plan.controls.map(c => badge(c, C.gold))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            {sidePanel === "chat" && (
              <ScientificDialogue entries={entries} hypotheses={hypotheses} onApplyEdit={() => {}} />
            )}
            {sidePanel === "protocol" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Research Protocol</span>
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
                  {plan?.protocol?.map((phase, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ color: C.emerald, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Phase {phase.phase}</div>
                      <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.5, marginBottom: 6 }}>{phase.focus}</div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4 }}>
                        {phase.entryCount} entries
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
          {!activeEntry ? (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 24,
              color: C.dim, fontFamily: C.mono,
            }}>
              <div style={{ fontSize: 48, opacity: 0.2 }}>🔬</div>
              <div style={{ fontSize: 14, opacity: 0.5 }}>No entry selected</div>
              <button onClick={() => setShowArchitect(true)} style={{
                padding: "12px 28px",
                background: `linear-gradient(90deg, ${C.emerald}22, ${C.gold}22)`,
                border: `1px solid ${C.emerald}55`, borderRadius: 10,
                color: C.emerald, cursor: "pointer", fontFamily: C.mono, fontSize: 14, fontWeight: 700,
              }}>🔬 Begin Research</button>
            </div>
          ) : (
            <EntryPanel
              entry={activeEntry}
              onDelete={() => {
                setEntries(prev => prev.filter(e => e.id !== activeEntry.id));
                setActiveEntryId(entries.find(e => e.id !== activeEntry.id)?.id || null);
              }}
              onExpand={() => expandEntry(activeEntry)}
              onAnalyze={() => dataAnalyzeEntry(activeEntry)}
              onEdit={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}