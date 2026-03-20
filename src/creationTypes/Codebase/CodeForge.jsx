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
  bg:        "#060911",
  panel:     "#0b0f1a",
  surface:   "#111827",
  border:    "#1e2a3a",
  borderHi:  "#2e4060",
  green:     "#00ff88",
  greenDim:  "#00cc66",
  greenGlow: "rgba(0,255,136,0.12)",
  blue:      "#38bdf8",
  blueGlow:  "rgba(56,189,248,0.12)",
  amber:     "#fbbf24",
  amberGlow: "rgba(251,191,36,0.12)",
  rose:      "#fb7185",
  roseGlow:  "rgba(251,113,133,0.12)",
  purple:    "#a78bfa",
  text:      "#e2e8f0",
  dim:       "#64748b",
  muted:     "#94a3b8",
  mono:      "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  sans:      "'IBM Plex Sans', 'DM Sans', system-ui, sans-serif",
};

// ── Language configs ──────────────────────────────────────────────────────────
const LANGS = {
  typescript: { ext: "ts",  icon: "𝕋", color: C.blue,   label: "TypeScript" },
  python:     { ext: "py",  icon: "🐍", color: C.green,  label: "Python"     },
  rust:       { ext: "rs",  icon: "⚙", color: C.amber,  label: "Rust"       },
  javascript: { ext: "js",  icon: "JS", color: C.amber,  label: "JavaScript" },
  go:         { ext: "go",  icon: "⬡",  color: C.blue,   label: "Go"         },
  solidity:   { ext: "sol", icon: "◈",  color: C.purple, label: "Solidity"   },
  cpp:        { ext: "cpp", icon: "C⁺", color: C.rose,   label: "C++"        },
};

const ARCHETYPES = [
  { id: "api",        label: "REST API",         icon: "⚡", description: "HTTP server with endpoints, auth, validation" },
  { id: "cli",        label: "CLI Tool",          icon: "⌨", description: "Command-line utility with argument parsing" },
  { id: "lib",        label: "Library / SDK",     icon: "📦", description: "Reusable module with public API" },
  { id: "agent",      label: "AI Agent",          icon: "🤖", description: "Autonomous agent with tools and memory" },
  { id: "pipeline",   label: "Data Pipeline",     icon: "⟁",  description: "ETL / streaming data processing" },
  { id: "compiler",   label: "Compiler / Parser", icon: "⊞",  description: "Language toolchain, AST, transformations" },
  { id: "crypto",     label: "Cryptographic",     icon: "🔐", description: "Cryptography, ZK proofs, blockchain" },
  { id: "sim",        label: "Simulation",        icon: "◉",  description: "Physics, agent-based or world simulation" },
  { id: "metacosmic", label: "Metacosmic Entity", icon: "✦",  description: "Digital consciousness / DNA system module" },
  { id: "custom",     label: "Custom",            icon: "◆",  description: "Describe your own architecture" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => `f_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

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
    border: `2px solid ${C.border}`, borderTopColor: C.green,
    borderRadius: "50%", animation: "spin 0.6s linear infinite",
  }} />;
}

function StatusDot({ color = C.green }) {
  return <span style={{
    display: "inline-block", width: 8, height: 8, borderRadius: "50%",
    background: color, boxShadow: `0 0 8px ${color}`,
    flexShrink: 0,
  }} />;
}

// ── Dependency Graph (SVG) ────────────────────────────────────────────────────
function DepGraph({ files }) {
  const radius = 110;
  const cx = 180, cy = 150;
  if (!files.length) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300, color:C.dim, fontFamily:C.mono, fontSize:12 }}>
      No files yet
    </div>
  );

  const nodes = files.map((f, i) => {
    const angle = (2 * Math.PI * i) / files.length - Math.PI / 2;
    return { ...f, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });

  const edges = [];
  files.forEach((f, i) => {
    (f.imports || []).forEach(imp => {
      const j = files.findIndex(ff => ff.filename.includes(imp) || imp.includes(ff.name));
      if (j !== -1 && j !== i) edges.push([i, j]);
    });
  });

  return (
    <svg width="100%" viewBox="0 0 360 300" style={{ fontFamily: C.mono }}>
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={C.dim} />
        </marker>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {edges.map(([a, b], i) => (
        <line key={i}
          x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke={C.border} strokeWidth={1.5} strokeDasharray="4 3"
          markerEnd="url(#arrow)" opacity={0.6}
        />
      ))}

      {nodes.map((n, i) => {
        const lang = LANGS[n.language] || LANGS.typescript;
        return (
          <g key={n.id} filter="url(#glow)">
            <circle cx={n.x} cy={n.y} r={22} fill={C.panel} stroke={lang.color} strokeWidth={1.5} opacity={0.9} />
            <text x={n.x} y={n.y - 4} textAnchor="middle" fill={lang.color} fontSize="11" fontWeight="700">{lang.icon}</text>
            <text x={n.x} y={n.y + 9} textAnchor="middle" fill={C.muted} fontSize="8">
              {n.filename.length > 10 ? n.filename.slice(0,10)+"…" : n.filename}
            </text>
          </g>
        );
      })}

      {/* Center label */}
      <text x={cx} y={cy} textAnchor="middle" fill={C.dim} fontSize="9" opacity={0.5}>
        {files.length} module{files.length !== 1 ? "s" : ""}
      </text>
    </svg>
  );
}

// ── Code Panel ────────────────────────────────────────────────────────────────
function CodePanel({ file, onRename, onDelete, onRefactor, onAddTest, onExplain }) {
  const [tab, setTab] = useState("code");
  const [copied, setCopied] = useState(false);
  const lang = LANGS[file.language] || LANGS.typescript;
  const lines = (file.code || "").split("\n");

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      background: C.panel, border: `1px solid ${C.border}`,
      borderRadius: 10, overflow: "hidden", height: "100%",
    }}>
      {/* File header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 14px", background: C.surface,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ color: lang.color, fontFamily: C.mono, fontSize: 13, fontWeight: 700 }}>{lang.icon}</span>
        <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, flex: 1 }}>{file.filename}</span>
        {badge(lang.label, lang.color)}
        {file.status === "generating" && <Spin size={12} />}
        {file.status === "done" && <StatusDot color={C.green} />}
        {file.status === "error" && <StatusDot color={C.rose} />}

        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {[
            { id: "code", label: "Code" },
            { id: "critique", label: "Critique" },
            { id: "tests", label: "Tests" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
              background: tab === t.id ? `${C.green}22` : "none",
              border: `1px solid ${tab === t.id ? C.green + "66" : "transparent"}`,
              color: tab === t.id ? C.green : C.dim, fontFamily: C.mono,
            }}>{t.label}</button>
          ))}
          <button onClick={() => { navigator.clipboard.writeText(file.code || ""); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
            style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer", background: "none", border: `1px solid ${C.border}`, color: copied ? C.green : C.dim, fontFamily: C.mono }}>
            {copied ? "✓" : "copy"}
          </button>
          <button onClick={onDelete} style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, cursor: "pointer", background: "none", border: "none", color: C.dim }}>✕</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        {tab === "code" && (
          <div style={{ display: "flex" }}>
            {/* Line numbers */}
            <div style={{
              padding: "14px 0", borderRight: `1px solid ${C.border}`,
              minWidth: 42, textAlign: "right", userSelect: "none",
              background: C.bg,
            }}>
              {lines.map((_, i) => (
                <div key={i} style={{ color: C.dim, fontFamily: C.mono, fontSize: 12, lineHeight: "20px", paddingRight: 10 }}>{i + 1}</div>
              ))}
            </div>
            {/* Code */}
            <pre style={{
              flex: 1, margin: 0, padding: "14px 20px",
              fontFamily: C.mono, fontSize: 12.5, lineHeight: "20px",
              color: "#a5f3fc", background: C.bg,
              overflowX: "auto", whiteSpace: "pre",
            }}>{file.code || (file.status === "generating" ? "// ⟡ Forging..." : "// Empty")}</pre>
          </div>
        )}

        {tab === "critique" && (
          <div style={{ padding: 20 }}>
            {file.critique ? (
              <div>
                {/* Score row */}
                {file.critique.score !== undefined && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ fontSize: 32, fontFamily: C.mono, fontWeight: 700, color: file.critique.score >= 8 ? C.green : file.critique.score >= 5 ? C.amber : C.rose }}>
                      {file.critique.score}/10
                    </div>
                    <div style={{ color: C.muted, fontSize: 13 }}>{file.critique.summary}</div>
                  </div>
                )}
                {/* Issues */}
                {file.critique.issues?.map((issue, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 10, padding: "10px 14px", marginBottom: 8,
                    background: C.surface, borderRadius: 8,
                    borderLeft: `3px solid ${issue.severity === "high" ? C.rose : issue.severity === "med" ? C.amber : C.dim}`,
                  }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{issue.severity === "high" ? "🔴" : issue.severity === "med" ? "🟡" : "🔵"}</span>
                    <div>
                      <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{issue.title}</div>
                      <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.6 }}>{issue.detail}</div>
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button onClick={onRefactor} style={{
                    padding: "8px 18px", background: `${C.green}22`,
                    border: `1px solid ${C.green}55`, borderRadius: 8,
                    color: C.green, cursor: "pointer", fontSize: 13, fontFamily: C.mono,
                  }}>↻ Auto-Refactor</button>
                </div>
              </div>
            ) : (
              <button onClick={() => onExplain(file)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Run Critique Analysis</button>
            )}
          </div>
        )}

        {tab === "tests" && (
          <div style={{ padding: 20 }}>
            {file.tests ? (
              <pre style={{ fontFamily: C.mono, fontSize: 12, color: "#86efac", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{file.tests}</pre>
            ) : (
              <button onClick={onAddTest} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>⟡ Generate Test Suite</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Architecture Planner ──────────────────────────────────────────────────────
function ArchPlanner({ onAccept, onCancel }) {
  const [step, setStep] = useState(0); // 0=archetype 1=details 2=planning 3=review
  const [archetype, setArchetype] = useState(null);
  const [lang, setLang] = useState("typescript");
  const [desc, setDesc] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const generatePlan = async () => {
    setLoading(true);
    setStep(2);
    setStatusMsg("Architect AI is designing your system...");

    const sys = `You are a senior software architect. Design a complete multi-file project plan.
Return ONLY valid JSON: {
  "projectName": string,
  "summary": string,
  "techStack": string[],
  "files": [
    {
      "filename": string,
      "language": string (one of: typescript, python, rust, javascript, go, solidity, cpp),
      "role": string (brief one-line description),
      "exports": string[] (key exports/functions),
      "imports": string[] (which other filenames this imports from),
      "complexity": "low"|"medium"|"high",
      "priority": number (1=first to generate)
    }
  ],
  "architecture": string (2-3 sentence explanation of the design),
  "entryPoint": string (filename of main entry)
}
Generate between 4 and 8 files. Be specific and realistic.`;

    const msg = `Archetype: ${archetype?.label}
Language preference: ${lang}
Description: ${desc || "Build something excellent with this archetype"}
Design a complete, production-ready multi-file project.`;

    try {
      const raw = await claude([{ role: "user", content: msg }], sys, 1000);
      const parsed = parseJSON(raw);
      if (parsed) { setPlan(parsed); setStep(3); }
      else { setStatusMsg("Parse error — please retry."); setStep(1); }
    } catch (e) {
      setStatusMsg("Architecture generation failed.");
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
        width: "min(780px,94vw)", maxHeight: "90vh",
        background: C.bg, border: `1px solid ${C.borderHi}`,
        borderRadius: 16, display: "flex", flexDirection: "column",
        boxShadow: `0 0 60px ${C.greenGlow}`,
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
          <StatusDot color={C.green} />
          <span style={{ fontFamily: C.mono, fontSize: 13, color: C.green, letterSpacing: "0.1em" }}>
            ARCHITECTURE PLANNER
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {["Archetype","Details","Planning","Review"].map((s,i) => (
              <span key={i} style={{
                fontFamily: C.mono, fontSize: 10, color: step >= i ? C.green : C.dim,
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
              <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Choose an Architecture Archetype</h2>
              <p style={{ color: C.dim, fontSize: 13, marginBottom: 24, fontFamily: C.mono }}>What kind of system are you forging?</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 10 }}>
                {ARCHETYPES.map(a => (
                  <button key={a.id} onClick={() => { setArchetype(a); setStep(1); }}
                    style={{
                      padding: "14px 16px", background: C.surface, border: `1px solid ${C.border}`,
                      borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                      display: "flex", flexDirection: "column", gap: 6,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.green + "88"; e.currentTarget.style.background = C.panel; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface; }}
                  >
                    <span style={{ fontSize: 20 }}>{a.icon}</span>
                    <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{a.label}</span>
                    <span style={{ color: C.dim, fontSize: 11, lineHeight: 1.5 }}>{a.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Details */}
          {step === 1 && archetype && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <span style={{ fontSize: 24 }}>{archetype.icon}</span>
                <div>
                  <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: 0 }}>{archetype.label}</h2>
                  <p style={{ color: C.dim, fontSize: 12, fontFamily: C.mono, margin: "4px 0 0" }}>{archetype.description}</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Primary Language</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {Object.entries(LANGS).map(([id, l]) => (
                      <button key={id} onClick={() => setLang(id)} style={{
                        padding: "7px 16px", borderRadius: 7, cursor: "pointer",
                        border: `1px solid ${lang === id ? l.color + "88" : C.border}`,
                        background: lang === id ? `${l.color}18` : "none",
                        color: lang === id ? l.color : C.muted,
                        fontFamily: C.mono, fontSize: 12,
                      }}>
                        {l.icon} {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Describe Your System</label>
                  <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder={`Describe what this ${archetype.label} should do, key features, constraints, or design goals...`}
                    rows={5}
                    style={{
                      width: "100%", background: C.surface, border: `1px solid ${C.border}`,
                      borderRadius: 10, padding: "12px 16px", color: C.text,
                      fontFamily: C.sans, fontSize: 14, resize: "vertical", outline: "none",
                      boxSizing: "border-box", lineHeight: 1.7,
                    }}
                  />
                </div>

                {statusMsg && <div style={{ color: C.rose, fontFamily: C.mono, fontSize: 12 }}>{statusMsg}</div>}

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(0)} style={{ padding: "10px 20px", background: "none", border: `1px solid ${C.border}`, borderRadius: 8, color: C.dim, cursor: "pointer" }}>← Back</button>
                  <button onClick={generatePlan} style={{
                    flex: 1, padding: "12px 0",
                    background: `linear-gradient(90deg, ${C.green}22, ${C.blue}22)`,
                    border: `1px solid ${C.green}55`, borderRadius: 8,
                    color: C.green, fontFamily: C.mono, fontWeight: 700, fontSize: 14,
                    cursor: "pointer", letterSpacing: "0.05em",
                  }}>⟡ Design Architecture</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Loading */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 260, gap: 20 }}>
              <div style={{ position: "relative" }}>
                <Spin size={48} />
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.green, fontSize: 18 }}>⟡</span>
              </div>
              <div style={{ color: C.muted, fontFamily: C.mono, fontSize: 13 }}>{statusMsg}</div>
            </div>
          )}

          {/* Step 3: Review plan */}
          {step === 3 && plan && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ color: C.green, fontFamily: C.mono, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{plan.projectName}</h2>
                <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{plan.summary}</p>
                <p style={{ color: C.dim, fontSize: 13, lineHeight: 1.7, fontStyle: "italic" }}>{plan.architecture}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                  {plan.techStack?.map(t => badge(t, C.blue))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Files to generate ({plan.files?.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.files?.sort((a,b) => a.priority - b.priority).map((f, i) => {
                    const l = LANGS[f.language] || LANGS.typescript;
                    return (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                        background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                      }}>
                        <span style={{ color: l.color, fontFamily: C.mono, fontSize: 14, width: 20, textAlign: "center" }}>{l.icon}</span>
                        <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, width: 160, flexShrink: 0 }}>{f.filename}</span>
                        <span style={{ color: C.muted, fontSize: 12, flex: 1 }}>{f.role}</span>
                        {badge(f.complexity, f.complexity === "high" ? C.rose : f.complexity === "medium" ? C.amber : C.green)}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(1)} style={{ padding: "10px 20px", background: "none", border: `1px solid ${C.border}`, borderRadius: 8, color: C.dim, cursor: "pointer" }}>← Redesign</button>
                <button onClick={() => onAccept(plan, lang)} style={{
                  flex: 1, padding: "12px 0",
                  background: `linear-gradient(90deg, ${C.green}, ${C.blue})`,
                  border: "none", borderRadius: 8, color: C.bg, fontFamily: C.mono,
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  boxShadow: `0 0 30px ${C.greenGlow}`,
                }}>⟡ Forge All Files</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Prompt panel (chat with codebase) ─────────────────────────────────────────
function ChatPanel({ files, onApplyPatch }) {
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

    const codeContext = files.slice(0, 4).map(f =>
      `// FILE: ${f.filename}\n${(f.code || "").slice(0, 600)}`
    ).join("\n\n---\n\n");

    const sys = `You are a senior engineer reviewing a codebase. 
The codebase context:
${codeContext || "// No files yet"}

Answer the developer's question. If they ask for changes, explain exactly what to change and why.
Be concise but precise. Use code blocks when showing code snippets.`;

    const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
    const raw = await claude([...history, { role: "user", content: userMsg }], sys, 1000).catch(() => "Error communicating with AI.");
    setMessages(m => [...m, { role: "assistant", content: raw }]);
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.panel, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <StatusDot color={C.blue} />
        <span style={{ fontFamily: C.mono, fontSize: 11, color: C.blue, letterSpacing: "0.1em" }}>CODEBASE CHAT</span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 8px" }}>
        {messages.length === 0 && (
          <div style={{ color: C.dim, fontSize: 12, fontFamily: C.mono, textAlign: "center", paddingTop: 40, lineHeight: 2 }}>
            Ask anything about your codebase.<br/>
            "What does X do?" · "How do I add auth?" · "Find the bug in Y"
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
              background: m.role === "user" ? `${C.blue}18` : C.surface,
              border: `1px solid ${m.role === "user" ? C.blue + "44" : C.border}`,
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
            <Spin size={12} /> Analyzing...
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask about the codebase..."
          style={{
            flex: 1, background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "8px 12px", color: C.text,
            fontFamily: C.sans, fontSize: 13, outline: "none",
          }}
        />
        <button onClick={send} disabled={loading} style={{
          padding: "8px 14px", background: loading ? C.border : `${C.blue}22`,
          border: `1px solid ${C.blue}55`, borderRadius: 8,
          color: C.blue, cursor: loading ? "default" : "pointer", fontFamily: C.mono, fontSize: 12,
        }}>⟶</button>
      </div>
    </div>
  );
}

// ── Main CodeForge ────────────────────────────────────────────────────────────
export default function CodeForge() {
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [showPlanner, setShowPlanner] = useState(false);
  const [projectName, setProjectName] = useState("Untitled Project");
  const [plan, setPlan] = useState(null);
  const [sidePanel, setSidePanel] = useState("graph"); // graph | chat | quick
  const [globalStatus, setGlobalStatus] = useState("");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const activeFile = files.find(f => f.id === activeFileId);

  // ── Generate code for a single file ────────────────────────────────────────
  const generateFileCode = useCallback(async (fileId, planData, langDefault, allFiles) => {
    const fileMeta = planData?.files?.find(f => f.filename === allFiles.find(af => af.id === fileId)?.filename);
    const thisFile = allFiles.find(f => f.id === fileId);
    if (!thisFile) return;

    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "generating" } : f));

    const siblingSummary = (planData?.files || [])
      .filter(f => f.filename !== thisFile.filename)
      .map(f => `// ${f.filename}: ${f.role} — exports: ${f.exports?.join(", ")}`)
      .join("\n");

    const sys = `You are an expert ${langDefault} engineer. Write production-quality, well-commented code.
Output ONLY the raw code — no markdown fences, no explanation.
Write complete, real implementations — never use TODO or placeholder stubs.`;

    const msg = `Project: ${planData?.projectName || projectName}
Architecture: ${planData?.architecture || ""}

This file: ${thisFile.filename}
Role: ${fileMeta?.role || "module"}
Key exports: ${fileMeta?.exports?.join(", ") || ""}
Imports from: ${fileMeta?.imports?.join(", ") || ""}

Other modules in the project:
${siblingSummary}

Write the complete implementation of ${thisFile.filename}.`;

    try {
      const code = await claude([{ role: "user", content: msg }], sys, 1000);
      setFiles(prev => prev.map(f => f.id === fileId
        ? { ...f, code, status: "done", imports: fileMeta?.imports || [] }
        : f
      ));
    } catch {
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "error", code: "// Generation failed" } : f));
    }
  }, [projectName]);

  // ── Accept arch plan and generate all files ──────────────────────────────────
  const handleAcceptPlan = useCallback(async (planData, lang) => {
    setShowPlanner(false);
    setProjectName(planData.projectName);
    setPlan({ ...planData, lang });
    setIsGeneratingAll(true);

    const sorted = [...(planData.files || [])].sort((a, b) => a.priority - b.priority);
    const newFiles = sorted.map(f => ({
      id: uid(), filename: f.filename, language: f.language || lang,
      code: "", status: "queued", role: f.role,
      exports: f.exports, imports: f.imports, critique: null, tests: null,
    }));

    setFiles(newFiles);
    setActiveFileId(newFiles[0]?.id);

    for (let i = 0; i < newFiles.length; i++) {
      setGlobalStatus(`Forging ${i + 1}/${newFiles.length}: ${newFiles[i].filename}`);
      await generateFileCode(newFiles[i].id, planData, lang, newFiles);
      await new Promise(r => setTimeout(r, 200));
    }

    setGlobalStatus("All files forged.");
    setIsGeneratingAll(false);
  }, [generateFileCode]);

  // ── Critique a file ──────────────────────────────────────────────────────────
  const critiqueFile = useCallback(async (file) => {
    if (!file.code) return;
    setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: "generating" } : f));

    const sys = `You are a senior code reviewer. Analyze the code and return ONLY JSON:
{
  "score": number (1-10),
  "summary": string (one sentence),
  "issues": [
    { "severity": "high"|"med"|"low", "title": string, "detail": string }
  ]
}
Be honest and specific. Limit to 4 issues max.`;

    const raw = await claude([{ role: "user", content: `Review this ${file.language} code:\n\n${file.code}` }], sys, 1000).catch(() => null);
    const parsed = raw ? parseJSON(raw) : null;

    setFiles(prev => prev.map(f => f.id === file.id
      ? { ...f, status: "done", critique: parsed || { score: 5, summary: "Review failed.", issues: [] } }
      : f
    ));
  }, []);

  // ── Auto-refactor ─────────────────────────────────────────────────────────────
  const refactorFile = useCallback(async (file) => {
    if (!file.code || !file.critique) return;
    setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: "generating" } : f));

    const issues = file.critique.issues?.map(i => `- [${i.severity}] ${i.title}: ${i.detail}`).join("\n") || "";
    const sys = `You are a refactoring expert. Fix the issues in the code. Return ONLY the improved code — no markdown fences.`;
    const msg = `Fix these issues in the code:\n${issues}\n\nOriginal code:\n${file.code}`;

    const improved = await claude([{ role: "user", content: msg }], sys, 1000).catch(() => file.code);
    setFiles(prev => prev.map(f => f.id === file.id
      ? { ...f, code: improved, status: "done", critique: null }
      : f
    ));
  }, []);

  // ── Generate tests ─────────────────────────────────────────────────────────
  const generateTests = useCallback(async (file) => {
    if (!file.code) return;
    setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: "generating" } : f));

    const sys = `You are a testing expert. Write a complete test suite. Return ONLY the raw test code.`;
    const msg = `Write tests for this ${file.language} code:\n\n${file.code}`;

    const tests = await claude([{ role: "user", content: msg }], sys, 1000).catch(() => "// Test generation failed");
    setFiles(prev => prev.map(f => f.id === file.id ? { ...f, tests, status: "done" } : f));
  }, []);

  // ── Quick add file ────────────────────────────────────────────────────────
  const addBlankFile = () => {
    const name = `module_${files.length + 1}.ts`;
    const newFile = { id: uid(), filename: name, language: "typescript", code: "", status: "queued", critique: null, tests: null };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  const doneCount = files.filter(f => f.status === "done").length;
  const totalLOC = files.reduce((acc, f) => acc + (f.code?.split("\n").length || 0), 0);

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh",
      background: C.bg, color: C.text,
      fontFamily: C.sans,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>

      {showPlanner && <ArchPlanner onAccept={handleAcceptPlan} onCancel={() => setShowPlanner(false)} />}

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "10px 20px", background: C.panel,
        borderBottom: `1px solid ${C.border}`,
        height: 50, flexShrink: 0,
      }}>
        <span style={{ fontFamily: C.mono, color: C.green, fontSize: 14, fontWeight: 700, letterSpacing: "0.12em" }}>⟡ CODE FORGE</span>
        <span style={{ color: C.dim, fontSize: 12, fontFamily: C.mono }}>/{projectName}</span>

        {globalStatus && (
          <span style={{ color: C.amber, fontFamily: C.mono, fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
            {isGeneratingAll && <Spin size={11} />}
            {globalStatus}
          </span>
        )}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          {files.length > 0 && (
            <>
              <span style={{ fontFamily: C.mono, fontSize: 11, color: C.dim }}>
                {doneCount}/{files.length} files · {totalLOC} LOC
              </span>
              {badge(plan?.lang || "ts", C.blue)}
            </>
          )}
          <button onClick={addBlankFile} style={{
            padding: "5px 14px", background: "none", border: `1px solid ${C.border}`,
            borderRadius: 6, color: C.muted, cursor: "pointer", fontFamily: C.mono, fontSize: 11,
          }}>+ File</button>
          <button onClick={() => setShowPlanner(true)} style={{
            padding: "6px 18px",
            background: `linear-gradient(90deg, ${C.green}22, ${C.blue}22)`,
            border: `1px solid ${C.green}55`, borderRadius: 7,
            color: C.green, cursor: "pointer", fontFamily: C.mono, fontSize: 12, fontWeight: 700,
            boxShadow: `0 0 16px ${C.greenGlow}`,
          }}>⟡ New Project</button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* File tree sidebar */}
        <div style={{
          width: 220, flexShrink: 0, borderRight: `1px solid ${C.border}`,
          background: C.panel, display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.12em", textTransform: "uppercase" }}>Project Files</span>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "8px 8px" }}>
            {files.length === 0 && (
              <div style={{ padding: "30px 14px", color: C.dim, fontSize: 11, fontFamily: C.mono, textAlign: "center", lineHeight: 2 }}>
                No files.<br/>Start with ⟡ New Project.
              </div>
            )}
            {files.map(f => {
              const l = LANGS[f.language] || LANGS.typescript;
              const isActive = f.id === activeFileId;
              return (
                <button key={f.id} onClick={() => setActiveFileId(f.id)} style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  padding: "7px 10px", borderRadius: 6, marginBottom: 2,
                  background: isActive ? `${C.green}18` : "none",
                  border: `1px solid ${isActive ? C.green + "44" : "transparent"}`,
                  cursor: "pointer", textAlign: "left",
                }}>
                  <span style={{ color: l.color, fontFamily: C.mono, fontSize: 12, width: 18, textAlign: "center", flexShrink: 0 }}>{l.icon}</span>
                  <span style={{ color: isActive ? C.text : C.muted, fontFamily: C.mono, fontSize: 11, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.filename}</span>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                    background: f.status === "done" ? C.green : f.status === "generating" ? C.amber : f.status === "error" ? C.rose : C.border,
                    boxShadow: f.status === "generating" ? `0 0 6px ${C.amber}` : "none",
                    animation: f.status === "generating" ? "pulse 1s ease-in-out infinite" : "none",
                  }} />
                </button>
              );
            })}
          </div>

          {/* Side panel tabs */}
          <div style={{ borderTop: `1px solid ${C.border}`, display: "flex" }}>
            {[
              { id: "graph", icon: "⬡", tip: "Dep Graph" },
              { id: "chat",  icon: "⌘", tip: "Chat"      },
            ].map(t => (
              <button key={t.id} onClick={() => setSidePanel(sidePanel === t.id ? null : t.id)} title={t.tip} style={{
                flex: 1, padding: "8px 0",
                background: sidePanel === t.id ? `${C.green}18` : "none",
                border: "none", borderRight: t.id === "graph" ? `1px solid ${C.border}` : "none",
                color: sidePanel === t.id ? C.green : C.dim,
                cursor: "pointer", fontFamily: C.mono, fontSize: 16,
              }}>{t.icon}</button>
            ))}
          </div>
        </div>

        {/* Side panel expansion */}
        {sidePanel && (
          <div style={{
            width: sidePanel === "chat" ? 320 : 240,
            borderRight: `1px solid ${C.border}`,
            background: C.panel, overflow: "hidden",
            display: "flex", flexDirection: "column",
          }}>
            {sidePanel === "graph" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Dependency Graph</span>
                </div>
                <div style={{ flex: 1, overflow: "auto" }}>
                  <DepGraph files={files} />
                  {plan?.architecture && (
                    <div style={{ padding: "0 16px 16px" }}>
                      <div style={{ fontSize: 11, color: C.dim, fontFamily: C.mono, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Architecture</div>
                      <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.7 }}>{plan.architecture}</p>
                    </div>
                  )}
                </div>
              </>
            )}
            {sidePanel === "chat" && (
              <ChatPanel files={files} onApplyPatch={() => {}} />
            )}
          </div>
        )}

        {/* Main editor area */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {!activeFile ? (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 24,
              color: C.dim, fontFamily: C.mono,
            }}>
              <div style={{ fontSize: 48, opacity: 0.2 }}>⟡</div>
              <div style={{ fontSize: 14, opacity: 0.5 }}>No file selected</div>
              <button onClick={() => setShowPlanner(true)} style={{
                padding: "12px 28px",
                background: `linear-gradient(90deg, ${C.green}22, ${C.blue}22)`,
                border: `1px solid ${C.green}55`, borderRadius: 10,
                color: C.green, cursor: "pointer", fontFamily: C.mono, fontSize: 14, fontWeight: 700,
              }}>⟡ Start a New Project</button>
            </div>
          ) : (
            <CodePanel
              file={activeFile}
              onDelete={() => {
                setFiles(prev => prev.filter(f => f.id !== activeFile.id));
                setActiveFileId(files.find(f => f.id !== activeFile.id)?.id || null);
              }}
              onRefactor={() => refactorFile(activeFile)}
              onAddTest={() => generateTests(activeFile)}
              onExplain={() => critiqueFile(activeFile)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
