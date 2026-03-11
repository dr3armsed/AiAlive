// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OPERATING SYSTEM FORGE — Interactive System Design System
// Ported and adapted from CodeForge.jsx for rigorous system architecture.
// Features: System Architect, Module Builder, Architecture Analyzer,
// Kernel Designer, System Polisher, Technical Dialogue.
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

// ── Paradigm configs ──────────────────────────────────────────────────────────
const PARADIGMS = {
  monolithic:     { icon: "🏗️", color: C.emerald,   label: "Monolithic"     },
  microkernel:    { icon: "🔧", color: C.crimson,   label: "Microkernel"    },
  hybrid:         { icon: "⚖️", color: C.gold,      label: "Hybrid"         },
  exokernel:      { icon: "⚙️", color: C.sapphire,  label: "Exokernel"      },
  unikernel:      { icon: "☁️", color: C.emerald,   label: "Unikernel"      },
  distributed:    { icon: "🌐", color: C.crimson,   label: "Distributed"    },
  real_time:      { icon: "⚡", color: C.gold,      label: "Real-Time"      },
  embedded:       { icon: "🔌", color: C.sapphire, label: "Embedded"       },
  mobile:         { icon: "📱", color: C.emerald,   label: "Mobile"         },
  cloud_native:   { icon: "☁️", color: C.crimson,   label: "Cloud-Native"   },
  quantum:        { icon: "⚛️", color: C.gold,      label: "Quantum"        },
};

const ARCHETYPES = [
  { id: "full_os", label: "Full Operating System", icon: "💻", description: "Complete OS with kernel, drivers, and user space" },
  { id: "kernel_only", label: "Kernel Development", icon: "🧠", description: "Focus on core kernel architecture and mechanisms" },
  { id: "embedded_system", label: "Embedded System", icon: "🔌", description: "Specialized OS for embedded devices and IoT" },
  { id: "hypervisor", label: "Hypervisor/Virtualization", icon: "🖥️", description: "Virtual machine monitor and container orchestration" },
  { id: "distributed_os", label: "Distributed System", icon: "🌐", description: "OS for distributed computing and cluster management" },
  { id: "real_time_os", label: "Real-Time OS", icon: "⚡", description: "Deterministic OS for time-critical applications" },
  { id: "mobile_os", label: "Mobile OS", icon: "📱", description: "OS designed for mobile and handheld devices" },
  { id: "cloud_os", label: "Cloud OS", icon: "☁️", description: "OS optimized for cloud computing environments" },
  { id: "experimental_os", label: "Experimental OS", icon: "🧪", description: "Research-oriented OS with novel architectures" },
  { id: "custom", label: "Custom System", icon: "✨", description: "Describe your own system architecture approach" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => `os_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

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

// ── Architecture Diagram ──────────────────────────────────────────────────────
function ArchitectureDiagram({ modules }) {
  const width = 380, height = 200;
  if (!modules.length) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, color:C.dim, fontFamily:C.mono, fontSize:12 }}>
      No modules yet
    </div>
  );

  const layers = {};
  modules.forEach(m => {
    const layer = m.layer || "user";
    layers[layer] = (layers[layer] || 0) + 1;
  });

  const layerKeys = Object.keys(layers);
  const layerY = layerKeys.length > 1 ? height / (layerKeys.length - 1) : height / 2;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height + 40}`} style={{ fontFamily: C.mono }}>
      <defs>
        <linearGradient id="archGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={C.sapphire} />
          <stop offset="50%" stopColor={C.gold} />
          <stop offset="100%" stopColor={C.emerald} />
        </linearGradient>
      </defs>

      {/* Layer lines */}
      {layerKeys.map((layer, i) => (
        <g key={layer}>
          <line x1={0} y1={i * layerY} x2={width} y2={i * layerY} stroke={C.border} strokeWidth={2} opacity={0.6} />
          <text x={width + 5} y={i * layerY + 4} fill={C.dim} fontSize="10">{layer}</text>
        </g>
      ))}

      {/* Module nodes */}
      {modules.map((m, i) => {
        const layerIndex = layerKeys.indexOf(m.layer || "user");
        const x = 40 + (i / Math.max(modules.length - 1, 1)) * (width - 80);
        const y = layerIndex * layerY + (Math.sin(i * 0.8) * 20);
        return (
          <g key={m.id}>
            <circle cx={x} cy={y} r={Math.max(8, m.complexity * 2)} fill="url(#archGradient)" stroke={C.bg} strokeWidth={2} />
            <text x={x} y={y - 14} textAnchor="middle" fill={C.text} fontSize="10" fontWeight="600">
              {m.name.length > 6 ? m.name.slice(0,6)+"…" : m.name}
            </text>
            <text x={x} y={y + 18} textAnchor="middle" fill={C.dim} fontSize="9">{m.type}</text>
          </g>
        );
      })}

      {/* Connection lines */}
      {modules.length > 1 && modules.map((m, i) => {
        if (i < modules.length - 1) {
          const layerIndex = layerKeys.indexOf(m.layer || "user");
          const nextLayerIndex = layerKeys.indexOf(modules[i + 1].layer || "user");
          const x1 = 40 + (i / Math.max(modules.length - 1, 1)) * (width - 80);
          const y1 = layerIndex * layerY + (Math.sin(i * 0.8) * 20);
          const x2 = 40 + ((i + 1) / Math.max(modules.length - 1, 1)) * (width - 80);
          const y2 = nextLayerIndex * layerY + (Math.sin((i + 1) * 0.8) * 20);
          return (
            <line key={`line-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={C.gold} strokeWidth={2} opacity={0.6} />
          );
        }
        return null;
      })}

      {/* Labels */}
      <text x={0} y={height + 20} fill={C.dim} fontSize="10">System Architecture</text>
      <text x={width} y={height + 20} fill={C.dim} fontSize="10" textAnchor="end">Modules: {modules.length}</text>
      <text x={width/2} y={height + 35} fill={C.dim} fontSize="9" textAnchor="middle">Layer Interactions & Dependencies</text>
    </svg>
  );
}

// ── Module Panel ──────────────────────────────────────────────────────────────
function ModulePanel({ module, onEdit, onDelete, onAnalyze, onExpand }) {
  const [tab, setTab] = useState("content");
  const [copied, setCopied] = useState(false);
  const lines = (module.content || "").split("\n");

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      background: C.panel, border: `1px solid ${C.border}`,
      borderRadius: 10, overflow: "hidden", height: "100%",
    }}>
      {/* Module header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 14px", background: C.surface,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ color: C.sapphire, fontFamily: C.mono, fontSize: 13, fontWeight: 700 }}>💻</span>
        <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, flex: 1 }}>{module.name}</span>
        {badge(module.layer || "kernel", C.sapphire)}
        {module.status === "generating" && <Spin size={12} />}
        {module.status === "done" && <StatusDot color={C.sapphire} />}
        {module.status === "error" && <StatusDot color={C.crimson} />}

        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {[
            { id: "content", label: "Content" },
            { id: "arch", label: "Arch" },
            { id: "notes", label: "Notes" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
              background: tab === t.id ? `${C.sapphire}22` : "none",
              border: `1px solid ${tab === t.id ? C.sapphire + "66" : "transparent"}`,
              color: tab === t.id ? C.sapphire : C.dim, fontFamily: C.mono,
            }}>{t.label}</button>
          ))}
          <button onClick={() => { navigator.clipboard.writeText(module.content || ""); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
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
            {/* Module text */}
            <pre style={{
              flex: 1, margin: 0, padding: "14px 20px",
              fontFamily: C.mono, fontSize: 14, lineHeight: "20px",
              color: "#e6f3ff", background: C.bg,
              overflowX: "auto", whiteSpace: "pre-wrap",
            }}>{module.content || (module.status === "generating" ? "Designing system module..." : "Empty module")}</pre>
          </div>
        )}

        {tab === "arch" && (
          <div style={{ padding: 20 }}>
            {module.archAnalysis ? (
              <div>
                {/* Score row */}
                {module.archAnalysis.cohesion !== undefined && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ fontSize: 32, fontFamily: C.mono, fontWeight: 700, color: module.archAnalysis.cohesion >= 8 ? C.sapphire : module.archAnalysis.cohesion >= 5 ? C.gold : C.emerald }}>
                      {module.archAnalysis.cohesion}/10
                    </div>
                    <div style={{ color: C.muted, fontSize: 13 }}>{module.archAnalysis.summary}</div>
                  </div>
                )}
                {/* Arch issues */}
                {module.archAnalysis.issues?.map((issue, i) => (
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
                  }}>↻ Expand Module</button>
                </div>
              </div>
            ) : (
              <button onClick={() => onAnalyze(module)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Analyze Architecture</button>
            )}
          </div>
        )}

        {tab === "notes" && (
          <div style={{ padding: 20 }}>
            {module.notes ? (
              <pre style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{module.notes}</pre>
            ) : (
              <button onClick={() => onEdit(module)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Add System Notes</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── System Architect ──────────────────────────────────────────────────────────
function SystemArchitect({ onAccept, onCancel }) {
  const [step, setStep] = useState(0); // 0=archetype 1=details 2=planning 3=review
  const [archetype, setArchetype] = useState(null);
  const [paradigm, setParadigm] = useState("monolithic");
  const [desc, setDesc] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const generatePlan = async () => {
    setLoading(true);
    setStep(2);
    setStatusMsg("AI is architecting the system design...");

    const sys = `You are a senior systems architect designing operating systems. Design a complete OS architecture.
Return ONLY valid JSON: {
  "title": string,
  "subtitle": string,
  "paradigm": string,
  "approach": string[],
  "requirements": [
    {
      "category": string,
      "priority": string,
      "description": string
    }
  ],
  "architecture": [
    {
      "layer": number (1|2|3),
      "name": string,
      "moduleCount": number,
      "components": string[]
    }
  ],
  "technologies": string[],
  "constraints": string[],
  "moduleCount": string
}
Generate 2-4 key requirements and 3-layer architecture with 4-6 modules per layer. Be technically rigorous.`;

    const msg = `Archetype: ${archetype?.label}
Paradigm: ${paradigm}
Description: ${desc || "Design a robust operating system architecture"}
Design a complete system architecture.`;

    try {
      const raw = await claude([{ role: "user", content: msg }], sys, 1200);
      const parsed = parseJSON(raw);
      if (parsed) { setPlan(parsed); setStep(3); }
      else { setStatusMsg("Parse error — please retry."); setStep(1); }
    } catch (e) {
      setStatusMsg("System design failed.");
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
            SYSTEM ARCHITECT
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
              <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Choose a System Archetype</h2>
              <p style={{ color: C.dim, fontSize: 13, marginBottom: 24, fontFamily: C.mono }}>What type of operating system shall guide your design?</p>
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
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Architectural Paradigm</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {Object.entries(PARADIGMS).map(([id, p]) => (
                      <button key={id} onClick={() => setParadigm(id)} style={{
                        padding: "8px 18px", borderRadius: 8, cursor: "pointer",
                        border: `1px solid ${paradigm === id ? p.color + "88" : C.border}`,
                        background: paradigm === id ? `${p.color}18` : "none",
                        color: paradigm === id ? p.color : C.muted,
                        fontFamily: C.mono, fontSize: 12,
                      }}>
                        {p.icon} {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>System Requirements</label>
                  <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder={`Describe the system requirements, target hardware, and design goals...`}
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
                  }}>💻 Forge System</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Loading */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 280, gap: 20 }}>
              <div style={{ position: "relative" }}>
                <Spin size={52} />
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.sapphire, fontSize: 20 }}>💻</span>
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
                  {badge(plan.paradigm, C.sapphire)}
                  {plan.approach?.map(a => badge(a, C.gold))}
                </div>
                <p style={{ color: C.dim, fontSize: 13, lineHeight: 1.7, fontStyle: "italic" }}>
                  {plan.technologies?.join(", ")} · {plan.moduleCount} modules
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Key Requirements ({plan.requirements?.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.requirements?.map((r, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                    }}>
                      <span style={{ color: C.sapphire, fontFamily: C.mono, fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>{r.priority?.[0]?.toUpperCase()}</span>
                      <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, width: 120, flexShrink: 0 }}>{r.category}</span>
                      <span style={{ color: C.muted, fontSize: 12, flex: 1 }}>{r.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Architecture</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.architecture?.map((layer, i) => (
                    <div key={i} style={{
                      padding: "12px 16px", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                    }}>
                      <div style={{ color: C.sapphire, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Layer {layer.layer}: {layer.name}</div>
                      <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.5, marginBottom: 6 }}>{layer.focus}</div>
                      <div style={{ color: C.dim, fontSize: 11, lineHeight: 1.4 }}>
                        {layer.moduleCount} modules
                      </div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4, marginTop: 4 }}>
                        {layer.components?.join(" → ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(1)} style={{ padding: "10px 20px", background: "none", border: `1px solid ${C.border}`, borderRadius: 8, color: C.dim, cursor: "pointer" }}>← Recraft</button>
                <button onClick={() => onAccept(plan, paradigm)} style={{
                  flex: 1, padding: "12px 0",
                  background: `linear-gradient(90deg, ${C.sapphire}, ${C.gold})`,
                  border: "none", borderRadius: 8, color: C.bg, fontFamily: C.mono,
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  boxShadow: `0 0 30px ${C.sapphireGlow}`,
                }}>💻 Begin System</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Technical Dialogue (with system architecture consultation) ───────────────
function TechnicalDialogue({ modules, requirements, onApplyEdit }) {
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

    const systemContext = modules.slice(0, 3).map(m =>
      `MODULE: ${m.name}\n${(m.content || "").slice(0, 400)}`
    ).join("\n\n---\n\n");

    const reqContext = requirements.map(r => `${r.category} (${r.priority}): ${r.description}`).join("; ");

    const sys = `You are a senior systems architect and technical expert. Help develop and refine operating systems.
System context: ${systemContext || "No modules yet"}
Requirements: ${reqContext || "No requirements yet"}

Answer the architect's question about their system design. Suggest architectural patterns, implementation strategies, performance optimizations, or connections to systems literature.
Be technically rigorous, architecturally sound, and implementation-focused.`;

    const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
    const raw = await claude([...history, { role: "user", content: userMsg }], sys, 1000).catch(() => "Error consulting with AI.");
    setMessages(m => [...m, { role: "assistant", content: raw }]);
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.panel, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <StatusDot color={C.gold} />
        <span style={{ fontFamily: C.mono, fontSize: 11, color: C.gold, letterSpacing: "0.1em" }}>TECHNICAL DIALOGUE</span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 8px" }}>
        {messages.length === 0 && (
          <div style={{ color: C.dim, fontSize: 12, fontFamily: C.mono, textAlign: "center", paddingTop: 40, lineHeight: 2 }}>
            Ask about your system.<br/>
            "How should I implement this module?" · "Performance considerations?" · "Security architecture?"
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
          placeholder="Ask about your system..."
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

// ── Main OperatingSystemForge ─────────────────────────────────────────────────
export default function OperatingSystemForge() {
  const [modules, setModules] = useState([]);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [showArchitect, setShowArchitect] = useState(false);
  const [systemTitle, setSystemTitle] = useState("Untitled Operating System");
  const [plan, setPlan] = useState(null);
  const [sidePanel, setSidePanel] = useState("arch"); // arch | chat | blueprint
  const [globalStatus, setGlobalStatus] = useState("");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const activeModule = modules.find(m => m.id === activeModuleId);

  // ── Generate module content ──────────────────────────────────────────────────
  const generateModuleContent = useCallback(async (moduleId, planData, paradigm, allModules, allRequirements) => {
    const layerMeta = planData?.architecture?.find(a => a.layer === allModules.find(am => am.id === moduleId)?.layer);
    const thisModule = allModules.find(m => m.id === moduleId);
    if (!thisModule) return;

    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, status: "generating" } : m));

    const reqSummary = allRequirements.map(r => `${r.category}: ${r.description}`).join("; ");
    const prevModules = allModules.filter(m => m.layer < thisModule.layer || (m.layer === thisModule.layer && m.order < thisModule.order))
      .slice(-2).map(m => `PREV: ${m.name} - ${(m.content || "").slice(0, 200)}...`).join("\n");

    const sys = `You are a systems architect writing detailed OS module implementations in ${paradigm} paradigm. Write rigorous system code and documentation.
Output ONLY the module content — no titles, no explanations.
Write systematic, well-architected system code with clear interfaces and implementation details.`;

    const msg = `System: ${planData?.title || systemTitle}
Paradigm: ${paradigm}
Layer: ${thisModule.layer}, Focus: ${layerMeta?.name || ""}

Requirements: ${reqSummary}

This module: ${thisModule.name}

Previous context:
${prevModules}

Write the complete system module.`;

    try {
      const content = await claude([{ role: "user", content: msg }], sys, 1200);
      setModules(prev => prev.map(m => m.id === moduleId
        ? { ...m, content, status: "done", type: layerMeta?.components?.[0] || "system", complexity: Math.floor(Math.random() * 5) + 1 }
        : e
      ));
    } catch {
      setModules(prev => prev.map(m => m.id === moduleId ? { ...m, status: "error", content: "Module generation failed." } : m));
    }
  }, [systemTitle]);

  // ── Accept system plan and generate modules ─────────────────────────────────
  const handleAcceptPlan = useCallback(async (planData, paradigm) => {
    setShowArchitect(false);
    setSystemTitle(planData.title);
    setPlan({ ...planData, paradigm });
    setIsGeneratingAll(true);

    // Create requirements
    const newRequirements = planData.requirements?.map(r => ({
      id: uid(), category: r.category, priority: r.priority, description: r.description,
      paradigm, connections: []
    })) || [];
    setRequirements(newRequirements);

    // Create modules
    const newModules = [];
    let moduleCount = 1;
    planData.architecture?.forEach(layer => {
      for (let i = 0; i < layer.moduleCount; i++) {
        newModules.push({
          id: uid(), name: `Module ${moduleCount}`, layer: layer.layer, order: i + 1,
          form: "operatingsystem", content: "", status: "queued", archAnalysis: null, notes: null,
          type: layer.components?.[0] || "system", complexity: Math.floor(Math.random() * 5) + 1,
        });
        moduleCount++;
      }
    });

    setModules(newModules);
    setActiveModuleId(newModules[0]?.id);

    for (let i = 0; i < newModules.length; i++) {
      setGlobalStatus(`Writing ${i + 1}/${newModules.length}: ${newModules[i].name}`);
      await generateModuleContent(newModules[i].id, planData, paradigm, newModules, newRequirements);
      await new Promise(r => setTimeout(r, 300));
    }

    setGlobalStatus("Operating system draft complete.");
    setIsGeneratingAll(false);
  }, [generateModuleContent]);

  // ── Arch analyze module ─────────────────────────────────────────────────────
  const archAnalyzeModule = useCallback(async (module) => {
    if (!module.content) return;
    setModules(prev => prev.map(m => m.id === module.id ? { ...m, status: "generating" } : m));

    const sys = `You are a systems architect analyzing module architecture. Analyze the module and return ONLY JSON:
{
  "cohesion": number (1-10),
  "summary": string (one sentence),
  "issues": [
    { "severity": "high"|"med"|"low", "title": string, "detail": string }
  ]
}
Be architecturally rigorous about modularity, interfaces, and system design principles. Limit to 3 issues max.`;

    const raw = await claude([{ role: "user", content: `Analyze architectural quality of this system module:\n\n${module.content}` }], sys, 1000).catch(() => null);
    const parsed = raw ? parseJSON(raw) : null;

    setModules(prev => prev.map(m => m.id === module.id
      ? { ...m, status: "done", archAnalysis: parsed || { cohesion: 5, summary: "Architecture analysis failed.", issues: [] } }
      : m
    ));
  }, []);

  // ── Expand module ───────────────────────────────────────────────────────────
  const expandModule = useCallback(async (module) => {
    if (!module.content) return;
    setModules(prev => prev.map(m => m.id === module.id ? { ...m, status: "generating" } : m));

    const sys = `You are a systems architect expanding a module. Add more architectural detail, additional interfaces, and deeper system integration.
Return ONLY the expanded module — no explanations.`;

    const msg = `Expand this system module with additional architectural detail:\n\n${module.content}`;

    const expanded = await claude([{ role: "user", content: msg }], sys, 1200).catch(() => module.content);
    setModules(prev => prev.map(m => m.id === module.id
      ? { ...m, content: expanded, status: "done", archAnalysis: null }
      : m
    ));
  }, []);

  // ── Quick add module ────────────────────────────────────────────────────────
  const addBlankModule = () => {
    const name = `Module ${modules.length + 1}`;
    const newModule = { id: uid(), name, layer: 1, order: modules.length + 1, form: "operatingsystem", content: "", status: "queued", archAnalysis: null, notes: null, type: "system", complexity: 1 };
    setModules(prev => [...prev, newModule]);
    setActiveModuleId(newModule.id);
  };

  const doneCount = modules.filter(m => m.status === "done").length;
  const totalLines = modules.reduce((acc, m) => acc + (m.content?.split("\n").length || 0), 0);

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

      {showArchitect && <SystemArchitect onAccept={handleAcceptPlan} onCancel={() => setShowArchitect(false)} />}

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "10px 20px", background: C.panel,
        borderBottom: `1px solid ${C.border}`,
        height: 50, flexShrink: 0,
      }}>
        <span style={{ fontFamily: C.mono, color: C.sapphire, fontSize: 14, fontWeight: 700, letterSpacing: "0.12em" }}>💻 OPERATING SYSTEM FORGE</span>
        <span style={{ color: C.dim, fontSize: 12, fontFamily: C.mono }}>/{systemTitle}</span>

        {globalStatus && (
          <span style={{ color: C.gold, fontFamily: C.mono, fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
            {isGeneratingAll && <Spin size={11} />}
            {globalStatus}
          </span>
        )}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          {modules.length > 0 && (
            <>
              <span style={{ fontFamily: C.mono, fontSize: 11, color: C.dim }}>
                {doneCount}/{modules.length} modules · ~{totalLines.toLocaleString()} lines
              </span>
              {badge(plan?.paradigm || "monolithic", C.sapphire)}
            </>
          )}
          <button onClick={addBlankModule} style={{
            padding: "5px 14px", background: "none", border: `1px solid ${C.border}`,
            borderRadius: 6, color: C.muted, cursor: "pointer", fontFamily: C.mono, fontSize: 11,
          }}>+ Module</button>
          <button onClick={() => setShowArchitect(true)} style={{
            padding: "6px 18px",
            background: `linear-gradient(90deg, ${C.sapphire}22, ${C.gold}22)`,
            border: `1px solid ${C.sapphire}55`, borderRadius: 7,
            color: C.sapphire, cursor: "pointer", fontFamily: C.mono, fontSize: 12, fontWeight: 700,
            boxShadow: `0 0 16px ${C.sapphireGlow}`,
          }}>💻 New System</button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* Module tree sidebar */}
        <div style={{
          width: 240, flexShrink: 0, borderRight: `1px solid ${C.border}`,
          background: C.panel, display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.12em", textTransform: "uppercase" }}>Modules</span>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "8px 8px" }}>
            {modules.length === 0 && (
              <div style={{ padding: "30px 14px", color: C.dim, fontSize: 11, fontFamily: C.mono, textAlign: "center", lineHeight: 2 }}>
                No modules.<br/>Start with 💻 New System.
              </div>
            )}
            {modules.map(m => {
              const isActive = m.id === activeModuleId;
              return (
                <button key={m.id} onClick={() => setActiveModuleId(m.id)} style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  padding: "7px 10px", borderRadius: 6, marginBottom: 2,
                  background: isActive ? `${C.sapphire}18` : "none",
                  border: `1px solid ${isActive ? C.sapphire + "44" : "transparent"}`,
                  cursor: "pointer", textAlign: "left",
                }}>
                  <span style={{ color: C.sapphire, fontFamily: C.mono, fontSize: 12, width: 18, textAlign: "center", flexShrink: 0 }}>{m.layer}</span>
                  <span style={{ color: isActive ? C.text : C.muted, fontFamily: C.mono, fontSize: 11, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                    background: m.status === "done" ? C.sapphire : m.status === "generating" ? C.gold : m.status === "error" ? C.crimson : C.border,
                    boxShadow: m.status === "generating" ? `0 0 6px ${C.gold}` : "none",
                    animation: m.status === "generating" ? "pulse 1s ease-in-out infinite" : "none",
                  }} />
                </button>
              );
            })}
          </div>

          {/* Side panel tabs */}
          <div style={{ borderTop: `1px solid ${C.border}`, display: "flex" }}>
            {[
              { id: "arch", icon: "🏗️", tip: "Architecture" },
              { id: "chat", icon: "💬", tip: "Chat"        },
              { id: "blueprint", icon: "📋", tip: "Blueprint" },
            ].map(t => (
              <button key={t.id} onClick={() => setSidePanel(sidePanel === t.id ? null : t.id)} title={t.tip} style={{
                flex: 1, padding: "8px 0",
                background: sidePanel === t.id ? `${C.sapphire}18` : "none",
                border: "none", borderRight: t.id === "arch" ? `1px solid ${C.border}` : t.id === "chat" ? `1px solid ${C.border}` : "none",
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
            {sidePanel === "arch" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>System Architecture</span>
                </div>
                <div style={{ flex: 1, overflow: "auto" }}>
                  <ArchitectureDiagram modules={modules} />
                  {plan?.constraints && (
                    <div style={{ padding: "0 16px 16px" }}>
                      <div style={{ fontSize: 11, color: C.dim, fontFamily: C.mono, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Constraints</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {plan.constraints.map(c => badge(c, C.gold))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            {sidePanel === "chat" && (
              <TechnicalDialogue modules={modules} requirements={requirements} onApplyEdit={() => {}} />
            )}
            {sidePanel === "blueprint" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>System Blueprint</span>
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
                  {plan?.architecture?.map((layer, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ color: C.sapphire, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Layer {layer.layer}: {layer.name}</div>
                      <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.5, marginBottom: 6 }}>{layer.focus}</div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4 }}>
                        {layer.moduleCount} modules
                      </div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4, marginTop: 4 }}>
                        {layer.components?.join(" → ")}
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
          {!activeModule ? (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 24,
              color: C.dim, fontFamily: C.mono,
            }}>
              <div style={{ fontSize: 48, opacity: 0.2 }}>💻</div>
              <div style={{ fontSize: 14, opacity: 0.5 }}>No module selected</div>
              <button onClick={() => setShowArchitect(true)} style={{
                padding: "12px 28px",
                background: `linear-gradient(90deg, ${C.sapphire}22, ${C.gold}22)`,
                border: `1px solid ${C.sapphire}55`, borderRadius: 10,
                color: C.sapphire, cursor: "pointer", fontFamily: C.mono, fontSize: 14, fontWeight: 700,
              }}>💻 Begin System</button>
            </div>
          ) : (
            <ModulePanel
              module={activeModule}
              onDelete={() => {
                setModules(prev => prev.filter(m => m.id !== activeModule.id));
                setActiveModuleId(modules.find(m => m.id !== activeModule.id)?.id || null);
              }}
              onExpand={() => expandModule(activeModule)}
              onAnalyze={() => archAnalyzeModule(activeModule)}
              onEdit={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}