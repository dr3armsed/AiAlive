// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CREATIVE NON-FICTION FORGE — Interactive Creative Non-Fiction Creation System
// Ported and adapted from CodeForge.jsx for literary non-fiction.
// Features: Memoir Architect, Essay Builder, Memoir Weaver, Truth Teller,
// Fact Checker, Prose Polisher, Narrative Chat.
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
  memoir:        { icon: "📝", color: C.emerald,  label: "Memoir"        },
  personal_essay:{ icon: "📖", color: C.gold,     label: "Personal Essay"},
  travelogue:    { icon: "✈️",  color: C.sapphire, label: "Travelogue"    },
  biography:     { icon: "👤", color: C.crimson,  label: "Biography"     },
  journalism:    { icon: "📰", color: C.gold,     label: "Journalism"    },
  nature_writing:{ icon: "🌿", color: C.emerald,  label: "Nature Writing"},
  cultural_crit:{ icon: "🎭", color: C.sapphire,  label: "Cultural Crit" },
  historical:    { icon: "🏛️", color: C.crimson,  label: "Historical"    },
  investigative: { icon: "🔍", color: C.gold,     label: "Investigative" },
  experimental:  { icon: "🌀", color: C.emerald,  label: "Experimental"  },
};

const ARCHETYPES = [
  { id: "coming_of_age",   label: "Coming of Age",      icon: "🌱", description: "Personal growth and transformation" },
  { id: "truth_revealed",  label: "Truth Revealed",     icon: "💡", description: "Uncovering hidden realities" },
  { id: "cultural_bridge", label: "Cultural Bridge",    icon: "🌉", description: "Connecting different worlds" },
  { id: "social_comment",  label: "Social Commentary",  icon: "📢", description: "Critiquing societal issues" },
  { id: "personal_loss",   label: "Personal Loss",      icon: "💔", description: "Grief and healing journeys" },
  { id: "adventure_tale",  label: "Adventure Tale",     icon: "🗺️", description: "Exploration and discovery" },
  { id: "identity_quest",  label: "Identity Quest",     icon: "🔍", description: "Self-discovery narratives" },
  { id: "historical_lens", label: "Historical Lens",    icon: "⏳", description: "Personal view of history" },
  { id: "nature_reflect",  label: "Nature Reflection",  icon: "🌳", description: "Environmental and personal insights" },
  { id: "custom",          label: "Custom Approach",    icon: "✨", description: "Describe your own non-fiction style" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => `cnf_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

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

// ── Truth Meter ───────────────────────────────────────────────────────────────
function TruthMeter({ sections }) {
  const width = 380, height = 200;
  if (!sections.length) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, color:C.dim, fontFamily:C.mono, fontSize:12 }}>
      No sections yet
    </div>
  );

  const points = sections.map((s, i) => ({
    ...s,
    x: (i / Math.max(sections.length - 1, 1)) * width,
    y: height - (s.veracity || 5) * 15, // Scale veracity 1-10 to pixels
  }));

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height + 40}`} style={{ fontFamily: C.mono }}>
      <defs>
        <linearGradient id="truthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={C.crimson} />
          <stop offset="50%" stopColor={C.gold} />
          <stop offset="100%" stopColor={C.emerald} />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[2,4,6,8].map(level => (
        <g key={level}>
          <line x1={0} y1={height - level * 15} x2={width} y2={height - level * 15}
            stroke={C.border} strokeWidth={1} opacity={0.3} />
          <text x={-10} y={height - level * 15 + 4} fill={C.dim} fontSize="9" textAnchor="end">{level}</text>
        </g>
      ))}

      {/* Truth line */}
      {points.length > 1 && (
        <polyline
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none" stroke="url(#truthGradient)" strokeWidth={3}
        />
      )}

      {/* Section points */}
      {points.map((p, i) => (
        <g key={p.id}>
          <circle cx={p.x} cy={p.y} r={6} fill={C.gold} stroke={C.bg} strokeWidth={2} />
          <text x={p.x} y={p.y - 10} textAnchor="middle" fill={C.text} fontSize="10" fontWeight="600">
            {p.title.length > 6 ? p.title.slice(0,6)+"…" : p.title}
          </text>
        </g>
      ))}

      {/* Labels */}
      <text x={0} y={height + 20} fill={C.dim} fontSize="10">Beginning</text>
      <text x={width} y={height + 20} fill={C.dim} fontSize="10" textAnchor="end">End</text>
      <text x={width/2} y={height + 35} fill={C.dim} fontSize="9" textAnchor="middle">Truth & Veracity Arc</text>
    </svg>
  );
}

// ── Section Panel ─────────────────────────────────────────────────────────────
function SectionPanel({ section, onEdit, onDelete, onExpand, onFactCheck }) {
  const [tab, setTab] = useState("story");
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
        <span style={{ color: C.gold, fontFamily: C.mono, fontSize: 13, fontWeight: 700 }}>📝</span>
        <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, flex: 1 }}>{section.title}</span>
        {badge(section.act || "Act 1", C.sapphire)}
        {section.status === "generating" && <Spin size={12} />}
        {section.status === "done" && <StatusDot color={C.gold} />}
        {section.status === "error" && <StatusDot color={C.crimson} />}

        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {[
            { id: "story", label: "Story" },
            { id: "factcheck", label: "Facts" },
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
        {tab === "story" && (
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
            {/* Story text */}
            <pre style={{
              flex: 1, margin: 0, padding: "14px 20px",
              fontFamily: C.serif, fontSize: 16, lineHeight: "24px",
              color: "#f0e6d2", background: C.bg,
              overflowX: "auto", whiteSpace: "pre-wrap",
            }}>{section.content || (section.status === "generating" ? "Writing section..." : "Empty section")}</pre>
          </div>
        )}

        {tab === "factcheck" && (
          <div style={{ padding: 20 }}>
            {section.factcheck ? (
              <div>
                {/* Score row */}
                {section.factcheck.accuracy !== undefined && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ fontSize: 32, fontFamily: C.mono, fontWeight: 700, color: section.factcheck.accuracy >= 8 ? C.gold : section.factcheck.accuracy >= 5 ? C.emerald : C.crimson }}>
                      {section.factcheck.accuracy}/10
                    </div>
                    <div style={{ color: C.muted, fontSize: 13 }}>{section.factcheck.summary}</div>
                  </div>
                )}
                {/* Issues */}
                {section.factcheck.issues?.map((issue, i) => (
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
              <button onClick={() => onFactCheck(section)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Run Fact Check</button>
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
              }}>Add Research Notes</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Memoir Architect ──────────────────────────────────────────────────────────
function MemoirArchitect({ onAccept, onCancel }) {
  const [step, setStep] = useState(0); // 0=archetype 1=details 2=planning 3=review
  const [archetype, setArchetype] = useState(null);
  const [genre, setGenre] = useState("memoir");
  const [desc, setDesc] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const generatePlan = async () => {
    setLoading(true);
    setStep(2);
    setStatusMsg("AI is crafting the non-fiction structure...");

    const sys = `You are a master creative non-fiction writer and literary critic. Design a complete creative non-fiction piece.
Return ONLY valid JSON: {
  "title": string,
  "logline": string,
  "genre": string,
  "tone": string[],
  "keyFigures": [
    {
      "name": string,
      "role": string (protagonist|antagonist|supporting),
      "significance": string,
      "description": string
    }
  ],
  "structure": [
    {
      "act": number (1|2|3),
      "sections": number,
      "purpose": string,
      "veracityLevel": number (1-10),
      "keyElements": string[]
    }
  ],
  "themes": string[],
  "pointOfView": string,
  "wordCount": string
}
Generate 2-4 key figures and 3-act structure with 3-6 sections total. Be authentic yet impactful.`;

    const msg = `Archetype: ${archetype?.label}
Genre: ${genre}
Description: ${desc || "Craft a creative non-fiction piece that resonates deeply"}
Design a complete creative non-fiction structure.`;

    try {
      const raw = await claude([{ role: "user", content: msg }], sys, 1200);
      const parsed = parseJSON(raw);
      if (parsed) { setPlan(parsed); setStep(3); }
      else { setStatusMsg("Parse error — please retry."); setStep(1); }
    } catch (e) {
      setStatusMsg("Non-fiction inspiration failed.");
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
            MEMOIR ARCHITECT
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
              <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Choose a Non-Fiction Archetype</h2>
              <p style={{ color: C.dim, fontSize: 13, marginBottom: 24, fontFamily: C.mono }}>What narrative approach shall your creative non-fiction take?</p>
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
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Piece Concept</label>
                  <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder={`Describe the real events, people, or experiences that drive your creative non-fiction piece...`}
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
                  }}>📝 Craft Piece</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Loading */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 280, gap: 20 }}>
              <div style={{ position: "relative" }}>
                <Spin size={52} />
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.gold, fontSize: 20 }}>📝</span>
              </div>
              <div style={{ color: C.muted, fontFamily: C.mono, fontSize: 13 }}>{statusMsg}</div>
            </div>
          )}

          {/* Step 3: Review plan */}
          {step === 3 && plan && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ color: C.gold, fontFamily: C.mono, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{plan.title}</h2>
                <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{plan.logline}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {badge(plan.genre, C.gold)}
                  {plan.tone?.map(t => badge(t, C.emerald))}
                </div>
                <p style={{ color: C.dim, fontSize: 13, lineHeight: 1.7, fontStyle: "italic" }}>
                  {plan.pointOfView} · {plan.wordCount} words
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Key Figures ({plan.keyFigures?.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.keyFigures?.map((c, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                    }}>
                      <span style={{ color: C.gold, fontFamily: C.mono, fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>{c.role?.[0]?.toUpperCase()}</span>
                      <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, width: 120, flexShrink: 0 }}>{c.name}</span>
                      <span style={{ color: C.muted, fontSize: 12, flex: 1 }}>{c.significance}: {c.description}</span>
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
                        Veracity: {act.veracityLevel}/10 · {act.sections} sections
                      </div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4, marginTop: 4 }}>
                        {act.keyElements?.join(" → ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(1)} style={{ padding: "10px 20px", background: "none", border: `1px solid ${C.border}`, borderRadius: 8, color: C.dim, cursor: "pointer" }}>← Recraft</button>
                <button onClick={() => onAccept(plan, genre)} style={{
                  flex: 1, padding: "12px 0",
                  background: `linear-gradient(90deg, ${C.gold}, ${C.crimson})`,
                  border: "none", borderRadius: 8, color: C.bg, fontFamily: C.mono,
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  boxShadow: `0 0 30px ${C.goldGlow}`,
                }}>📝 Begin Piece</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Narrative Dialogue (with creative non-fiction) ────────────────────────────
function NarrativeDialogue({ sections, keyFigures, onApplyEdit }) {
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

    const pieceContext = sections.slice(0, 3).map(s =>
      `SECTION: ${s.title}\n${(s.content || "").slice(0, 400)}`
    ).join("\n\n---\n\n");

    const figureContext = keyFigures.map(c => `${c.name} (${c.role}): ${c.significance}`).join("; ");

    const sys = `You are a creative non-fiction consultant and literary critic. Help develop and refine creative non-fiction pieces.
Piece context: ${pieceContext || "No sections yet"}
Key figures: ${figureContext || "No figures yet"}

Answer the writer's question about their creative non-fiction. Suggest improvements, discuss character development, analyze pacing, or explore themes.
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
        <span style={{ fontFamily: C.mono, fontSize: 11, color: C.emerald, letterSpacing: "0.1em" }}>NARRATIVE DIALOGUE</span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 8px" }}>
        {messages.length === 0 && (
          <div style={{ color: C.dim, fontSize: 12, fontFamily: C.mono, textAlign: "center", paddingTop: 40, lineHeight: 2 }}>
            Ask about your piece.<br/>
            "How does this figure's arc work?" · "Fact-checking concerns?" · "Theme development?"
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
          placeholder="Ask about your piece..."
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

// ── Main CreativeNonFictionForge ──────────────────────────────────────────────
export default function CreativeNonFictionForge() {
  const [sections, setSections] = useState([]);
  const [keyFigures, setKeyFigures] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [showArchitect, setShowArchitect] = useState(false);
  const [pieceTitle, setPieceTitle] = useState("Untitled Creative Non-Fiction");
  const [plan, setPlan] = useState(null);
  const [sidePanel, setSidePanel] = useState("truth"); // truth | chat | outline
  const [globalStatus, setGlobalStatus] = useState("");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const activeSection = sections.find(s => s.id === activeSectionId);

  // ── Generate section content ─────────────────────────────────────────────────
  const generateSectionContent = useCallback(async (sectionId, planData, genre, allSections, allKeyFigures) => {
    const sectionMeta = planData?.structure?.find(s => s.act === allSections.find(as => as.id === sectionId)?.act);
    const thisSection = allSections.find(s => s.id === sectionId);
    if (!thisSection) return;

    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, status: "generating" } : s));

    const figureSummary = allKeyFigures.map(c => `${c.name} (${c.role}): ${c.significance}`).join("; ");
    const prevSections = allSections.filter(s => s.act < thisSection.act || (s.act === thisSection.act && s.order < thisSection.order))
      .slice(-2).map(s => `PREV: ${s.title} - ${(s.content || "").slice(0, 200)}...`).join("\n");

    const sys = `You are a master creative non-fiction writer writing in ${genre} genre. Write compelling authentic sections.
Output ONLY the section content — no titles, no explanations.
Write evocative, truth-based prose with emotional depth and factual accuracy.`;

    const msg = `Piece: ${planData?.title || pieceTitle}
Genre: ${genre}
Key Figures: ${figureSummary}

This section: ${thisSection.title}
Act: ${thisSection.act}, Purpose: ${sectionMeta?.purpose || ""}

Previous context:
${prevSections}

Write the complete creative non-fiction section.`;

    try {
      const content = await claude([{ role: "user", content: msg }], sys, 1200);
      setSections(prev => prev.map(s => s.id === sectionId
        ? { ...s, content, status: "done", veracity: sectionMeta?.veracityLevel || 5 }
        : s
      ));
    } catch {
      setSections(prev => prev.map(s => s.id === sectionId ? { ...s, status: "error", content: "Section generation failed." } : s));
    }
  }, [pieceTitle]);

  // ── Accept piece plan and generate sections ──────────────────────────────────
  const handleAcceptPlan = useCallback(async (planData, genre) => {
    setShowArchitect(false);
    setPieceTitle(planData.title);
    setPlan({ ...planData, genre });
    setIsGeneratingAll(true);

    // Create key figures
    const newKeyFigures = planData.keyFigures?.map(c => ({
      id: uid(), name: c.name, role: c.role, significance: c.significance, description: c.description,
      genre, connections: []
    })) || [];
    setKeyFigures(newKeyFigures);

    // Create sections
    const newSections = [];
    let sectionCount = 1;
    planData.structure?.forEach(act => {
      for (let i = 0; i < act.sections; i++) {
        newSections.push({
          id: uid(), title: `Section ${sectionCount}`, act: act.act, order: i + 1,
          form: "creativnonfiction", content: "", status: "queued", factcheck: null, notes: null,
          veracity: act.veracityLevel || 5,
        });
        sectionCount++;
      }
    });

    setSections(newSections);
    setActiveSectionId(newSections[0]?.id);

    for (let i = 0; i < newSections.length; i++) {
      setGlobalStatus(`Writing ${i + 1}/${newSections.length}: ${newSections[i].title}`);
      await generateSectionContent(newSections[i].id, planData, genre, newSections, newKeyFigures);
      await new Promise(r => setTimeout(r, 300));
    }

    setGlobalStatus("Creative non-fiction draft complete.");
    setIsGeneratingAll(false);
  }, [generateSectionContent]);

  // ── Fact check section ───────────────────────────────────────────────────────
  const factCheckSection = useCallback(async (section) => {
    if (!section.content) return;
    setSections(prev => prev.map(s => s.id === section.id ? { ...s, status: "generating" } : s));

    const sys = `You are a fact-checker for creative non-fiction. Analyze the section and return ONLY JSON:
{
  "accuracy": number (1-10),
  "summary": string (one sentence),
  "issues": [
    { "severity": "high"|"med"|"low", "title": string, "detail": string }
  ]
}
Be thorough and specific. Limit to 3 issues max.`;

    const raw = await claude([{ role: "user", content: `Fact-check this section:\n\n${section.content}` }], sys, 1000).catch(() => null);
    const parsed = raw ? parseJSON(raw) : null;

    setSections(prev => prev.map(s => s.id === section.id
      ? { ...s, status: "done", factcheck: parsed || { accuracy: 5, summary: "Fact-check failed.", issues: [] } }
      : s
    ));
  }, []);

  // ── Expand section ───────────────────────────────────────────────────────────
  const expandSection = useCallback(async (section) => {
    if (!section.content) return;
    setSections(prev => prev.map(s => s.id === section.id ? { ...s, status: "generating" } : s));

    const sys = `You are a creative non-fiction writer expanding a section. Add more factual depth, sensory details, and authentic insight.
Return ONLY the expanded section content — no explanations.`;

    const msg = `Expand this section with more factual depth:\n\n${section.content}`;

    const expanded = await claude([{ role: "user", content: msg }], sys, 1200).catch(() => section.content);
    setSections(prev => prev.map(s => s.id === section.id
      ? { ...s, content: expanded, status: "done", factcheck: null }
      : s
    ));
  }, []);

  // ── Quick add section ────────────────────────────────────────────────────────
  const addBlankSection = () => {
    const name = `Section ${sections.length + 1}`;
    const newSection = { id: uid(), title: name, act: 1, order: sections.length + 1, form: "creativnonfiction", content: "", status: "queued", factcheck: null, notes: null, veracity: 5 };
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

      {showArchitect && <MemoirArchitect onAccept={handleAcceptPlan} onCancel={() => setShowArchitect(false)} />}

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "10px 20px", background: C.panel,
        borderBottom: `1px solid ${C.border}`,
        height: 50, flexShrink: 0,
      }}>
        <span style={{ fontFamily: C.mono, color: C.gold, fontSize: 14, fontWeight: 700, letterSpacing: "0.12em" }}>📝 CREATIVE NON-FICTION FORGE</span>
        <span style={{ color: C.dim, fontSize: 12, fontFamily: C.mono }}>/{pieceTitle}</span>

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
                {doneCount}/{sections.length} sections · ~{totalWords.toLocaleString()} words
              </span>
              {badge(plan?.genre || "memoir", C.gold)}
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
          }}>📝 New Piece</button>
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
                No sections.<br/>Start with 📝 New Piece.
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
                  <span style={{ color: C.gold, fontFamily: C.mono, fontSize: 12, width: 18, textAlign: "center", flexShrink: 0 }}>{s.act}</span>
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
              { id: "truth", icon: "⚖️", tip: "Truth Meter" },
              { id: "chat",  icon: "💬", tip: "Chat"        },
              { id: "outline", icon: "📋", tip: "Outline"   },
            ].map(t => (
              <button key={t.id} onClick={() => setSidePanel(sidePanel === t.id ? null : t.id)} title={t.tip} style={{
                flex: 1, padding: "8px 0",
                background: sidePanel === t.id ? `${C.gold}18` : "none",
                border: "none", borderRight: t.id === "truth" ? `1px solid ${C.border}` : t.id === "chat" ? `1px solid ${C.border}` : "none",
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
            {sidePanel === "truth" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Truth & Veracity Arc</span>
                </div>
                <div style={{ flex: 1, overflow: "auto" }}>
                  <TruthMeter sections={sections} />
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
              <NarrativeDialogue sections={sections} keyFigures={keyFigures} onApplyEdit={() => {}} />
            )}
            {sidePanel === "outline" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Piece Outline</span>
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
                  {plan?.structure?.map((act, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ color: C.gold, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Act {act.act}</div>
                      <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.5, marginBottom: 6 }}>{act.purpose}</div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4 }}>
                        Veracity: {act.veracityLevel}/10 · {act.sections} sections
                      </div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4, marginTop: 4 }}>
                        {act.keyElements?.join(" → ")}
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
              <div style={{ fontSize: 48, opacity: 0.2 }}>📝</div>
              <div style={{ fontSize: 14, opacity: 0.5 }}>No section selected</div>
              <button onClick={() => setShowArchitect(true)} style={{
                padding: "12px 28px",
                background: `linear-gradient(90deg, ${C.gold}22, ${C.crimson}22)`,
                border: `1px solid ${C.gold}55`, borderRadius: 10,
                color: C.gold, cursor: "pointer", fontFamily: C.mono, fontSize: 14, fontWeight: 700,
              }}>📝 Begin Piece</button>
            </div>
          ) : (
            <SectionPanel
              section={activeSection}
              onDelete={() => {
                setSections(prev => prev.filter(s => s.id !== activeSection.id));
                setActiveSectionId(sections.find(s => s.id !== activeSection.id)?.id || null);
              }}
              onExpand={() => expandSection(activeSection)}
              onFactCheck={() => factCheckSection(activeSection)}
              onEdit={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}