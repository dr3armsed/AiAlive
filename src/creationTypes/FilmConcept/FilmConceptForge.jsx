// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FILM CONCEPT FORGE — Interactive Cinematic Creation System
// Ported and adapted from CodeForge.jsx for film concepts.
// Features: Film Architect, Scene Builder, Storyboard Designer,
// Cinematic Analyzer, Creative Dialogue.
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

// ── Genres ────────────────────────────────────────────────────────────────────
const GENRES = {
  drama:        { icon: "🎭", color: C.emerald,   label: "Drama"        },
  comedy:       { icon: "🎪", color: C.gold,      label: "Comedy"       },
  thriller:     { icon: "🔪", color: C.crimson,   label: "Thriller"     },
  sci_fi:       { icon: "🚀", color: C.sapphire,  label: "Sci-Fi"       },
  horror:       { icon: "👻", color: C.crimson,   label: "Horror"       },
  romance:      { icon: "💕", color: C.emerald,   label: "Romance"      },
  action:       { icon: "💥", color: C.gold,      label: "Action"       },
  documentary:  { icon: "📹", color: C.sapphire,  label: "Documentary"  },
  animation:    { icon: "🎨", color: C.emerald,   label: "Animation"    },
  experimental: { icon: "🌀", color: C.crimson,   label: "Experimental" },
};

const ARCHETYPES = [
  { id: "character_driven", label: "Character-Driven", icon: "👤", description: "Stories focused on deep character development and personal journeys" },
  { id: "plot_driven", label: "Plot-Driven", icon: "📜", description: "Stories with complex narratives, twists, and intricate plotting" },
  { id: "visual_spectacle", label: "Visual Spectacle", icon: "🎬", description: "Films emphasizing stunning visuals, effects, and cinematic artistry" },
  { id: "social_commentary", label: "Social Commentary", icon: "🗣️", description: "Films addressing societal issues and cultural critique" },
  { id: "psychological", label: "Psychological", icon: "🧠", description: "Stories exploring the human mind, perception, and reality" },
  { id: "historical", label: "Historical", icon: "🏛️", description: "Films set in specific historical periods with period authenticity" },
  { id: "biographical", label: "Biographical", icon: "📖", description: "Stories based on real people's lives and achievements" },
  { id: "genre_bending", label: "Genre-Bending", icon: "🔄", description: "Films that mix genres or subvert genre expectations" },
  { id: "custom", label: "Custom Concept", icon: "✨", description: "Describe your own cinematic approach" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => `fc_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

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

// ── Storyboard Canvas ─────────────────────────────────────────────────────────
function StoryboardCanvas({ scenes }) {
  const width = 380, height = 200;
  if (!scenes.length) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, color:C.dim, fontFamily:C.mono, fontSize:12 }}>
      No scenes yet
    </div>
  );

  const acts = {};
  scenes.forEach(s => {
    acts[s.act] = (acts[s.act] || 0) + 1;
  });

  const actKeys = Object.keys(acts);
  const actY = actKeys.length > 1 ? height / (actKeys.length - 1) : height / 2;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height + 40}`} style={{ fontFamily: C.mono }}>
      <defs>
        <radialGradient id="storyboardGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={C.emerald} />
          <stop offset="50%" stopColor={C.gold} />
          <stop offset="100%" stopColor={C.crimson} />
        </radialGradient>
      </defs>

      {/* Act lines */}
      {actKeys.map((act, i) => (
        <g key={act}>
          <line x1={0} y1={i * actY} x2={width} y2={i * actY} stroke={C.border} strokeWidth={2} opacity={0.6} />
          <text x={width + 5} y={i * actY + 4} fill={C.dim} fontSize="10">{act}</text>
        </g>
      ))}

      {/* Scene nodes */}
      {scenes.map((s, i) => {
        const actIndex = actKeys.indexOf(s.act || "setup");
        const x = 40 + (i / Math.max(scenes.length - 1, 1)) * (width - 80);
        const y = actIndex * actY + (Math.sin(i * 0.7) * 25);
        return (
          <g key={s.id}>
            <rect x={x - 8} y={y - 8} width={16} height={16} fill="url(#storyboardGradient)" stroke={C.bg} strokeWidth={2} />
            <text x={x} y={y - 14} textAnchor="middle" fill={C.text} fontSize="9" fontWeight="600">
              {s.title.length > 6 ? s.title.slice(0,6)+"…" : s.title}
            </text>
            <text x={x} y={y + 20} textAnchor="middle" fill={C.dim} fontSize="8">{s.type}</text>
          </g>
        );
      })}

      {/* Connection lines */}
      {scenes.length > 1 && scenes.map((s, i) => {
        if (i < scenes.length - 1) {
          const actIndex = actKeys.indexOf(s.act || "setup");
          const nextActIndex = actKeys.indexOf(scenes[i + 1].act || "setup");
          const x1 = 40 + (i / Math.max(scenes.length - 1, 1)) * (width - 80);
          const y1 = actIndex * actY + (Math.sin(i * 0.7) * 25);
          const x2 = 40 + ((i + 1) / Math.max(scenes.length - 1, 1)) * (width - 80);
          const y2 = nextActIndex * actY + (Math.sin((i + 1) * 0.7) * 25);
          return (
            <line key={`line-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={C.gold} strokeWidth={2} opacity={0.6} />
          );
        }
        return null;
      })}

      {/* Labels */}
      <text x={0} y={height + 20} fill={C.dim} fontSize="10">Cinematic Storyboard</text>
      <text x={width} y={height + 20} fill={C.dim} fontSize="10" textAnchor="end">Scenes: {scenes.length}</text>
      <text x={width/2} y={height + 35} fill={C.dim} fontSize="9" textAnchor="middle">Narrative Flow & Pacing</text>
    </svg>
  );
}

// ── Scene Panel ───────────────────────────────────────────────────────────────
function ScenePanel({ scene, onEdit, onDelete, onAnalyze, onExpand }) {
  const [tab, setTab] = useState("content");
  const [copied, setCopied] = useState(false);
  const lines = (scene.content || "").split("\n");

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      background: C.panel, border: `1px solid ${C.border}`,
      borderRadius: 10, overflow: "hidden", height: "100%",
    }}>
      {/* Scene header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 14px", background: C.surface,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ color: C.emerald, fontFamily: C.mono, fontSize: 13, fontWeight: 700 }}>🎬</span>
        <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, flex: 1 }}>{scene.title}</span>
        {badge(scene.act || "setup", C.emerald)}
        {scene.status === "generating" && <Spin size={12} />}
        {scene.status === "done" && <StatusDot color={C.emerald} />}
        {scene.status === "error" && <StatusDot color={C.crimson} />}

        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {[
            { id: "content", label: "Content" },
            { id: "cinematic", label: "Cinematic" },
            { id: "notes", label: "Notes" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
              background: tab === t.id ? `${C.emerald}22` : "none",
              border: `1px solid ${tab === t.id ? C.emerald + "66" : "transparent"}`,
              color: tab === t.id ? C.emerald : C.dim, fontFamily: C.mono,
            }}>{t.label}</button>
          ))}
          <button onClick={() => { navigator.clipboard.writeText(scene.content || ""); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
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
            {/* Scene text */}
            <pre style={{
              flex: 1, margin: 0, padding: "14px 20px",
              fontFamily: C.serif, fontSize: 16, lineHeight: "24px",
              color: "#f0e6d2", background: C.bg,
              overflowX: "auto", whiteSpace: "pre-wrap",
            }}>{scene.content || (scene.status === "generating" ? "Developing cinematic scene..." : "Empty scene")}</pre>
          </div>
        )}

        {tab === "cinematic" && (
          <div style={{ padding: 20 }}>
            {scene.cinematicAnalysis ? (
              <div>
                {/* Score row */}
                {scene.cinematicAnalysis.impact !== undefined && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ fontSize: 32, fontFamily: C.mono, fontWeight: 700, color: scene.cinematicAnalysis.impact >= 8 ? C.emerald : scene.cinematicAnalysis.impact >= 5 ? C.gold : C.crimson }}>
                      {scene.cinematicAnalysis.impact}/10
                    </div>
                    <div style={{ color: C.muted, fontSize: 13 }}>{scene.cinematicAnalysis.summary}</div>
                  </div>
                )}
                {/* Cinematic issues */}
                {scene.cinematicAnalysis.issues?.map((issue, i) => (
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
                  }}>↻ Expand Scene</button>
                </div>
              </div>
            ) : (
              <button onClick={() => onAnalyze(scene)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Analyze Cinematic Quality</button>
            )}
          </div>
        )}

        {tab === "notes" && (
          <div style={{ padding: 20 }}>
            {scene.notes ? (
              <pre style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{scene.notes}</pre>
            ) : (
              <button onClick={() => onEdit(scene)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Add Cinematic Notes</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Film Architect ────────────────────────────────────────────────────────────
function FilmArchitect({ onAccept, onCancel }) {
  const [step, setStep] = useState(0); // 0=archetype 1=details 2=planning 3=review
  const [archetype, setArchetype] = useState(null);
  const [genre, setGenre] = useState("drama");
  const [desc, setDesc] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const generatePlan = async () => {
    setLoading(true);
    setStep(2);
    setStatusMsg("AI is conceptualizing the film...");

    const sys = `You are a master filmmaker and screenwriter designing film concepts. Design a complete cinematic work.
Return ONLY valid JSON: {
  "title": string,
  "subtitle": string,
  "genre": string,
  "tone": string[],
  "themes": [
    {
      "theme": string,
      "exploration": string,
      "cinematic": string
    }
  ],
  "structure": [
    {
      "act": number (1|2|3),
      "phase": string,
      "sceneCount": number,
      "techniques": string[]
    }
  ],
  "production": string[],
  "distribution": string[],
  "sceneCount": string
}
Generate 2-4 key cinematic themes and 3-act structure with 4-8 scenes per act. Be cinematically rigorous.`;

    const msg = `Archetype: ${archetype?.label}
Genre: ${genre}
Description: ${desc || "Create a compelling cinematic work that captivates audiences"}
Design a complete film concept.`;

    try {
      const raw = await claude([{ role: "user", content: msg }], sys, 1200);
      const parsed = parseJSON(raw);
      if (parsed) { setPlan(parsed); setStep(3); }
      else { setStatusMsg("Parse error — please retry."); setStep(1); }
    } catch (e) {
      setStatusMsg("Cinematic inspiration failed.");
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
            FILM ARCHITECT
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
              <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Choose a Cinematic Archetype</h2>
              <p style={{ color: C.dim, fontSize: 13, marginBottom: 24, fontFamily: C.mono }}>What cinematic approach shall your film take?</p>
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
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Film Genre</label>
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
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Cinematic Vision</label>
                  <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder={`Describe the cinematic concept, visual style, and audience impact that drives your film...`}
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
                  }}>🎬 Forge Film Concept</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Loading */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 280, gap: 20 }}>
              <div style={{ position: "relative" }}>
                <Spin size={52} />
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.emerald, fontSize: 20 }}>🎬</span>
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
                  {badge(plan.genre, C.emerald)}
                  {plan.tone?.map(t => badge(t, C.gold))}
                </div>
                <p style={{ color: C.dim, fontSize: 13, lineHeight: 1.7, fontStyle: "italic" }}>
                  {plan.production?.join(", ")} · {plan.sceneCount} scenes
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Key Themes ({plan.themes?.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.themes?.map((t, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                    }}>
                      <span style={{ color: C.emerald, fontFamily: C.mono, fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>T{i+1}</span>
                      <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, width: 140, flexShrink: 0 }}>{t.theme.slice(0,18)}...</span>
                      <span style={{ color: C.muted, fontSize: 12, flex: 1 }}>{t.cinematic}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Narrative Structure</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.structure?.map((act, i) => (
                    <div key={i} style={{
                      padding: "12px 16px", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                    }}>
                      <div style={{ color: C.emerald, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Act {act.act}: {act.phase}</div>
                      <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.5, marginBottom: 6 }}>{act.focus}</div>
                      <div style={{ color: C.dim, fontSize: 11, lineHeight: 1.4 }}>
                        {act.sceneCount} scenes
                      </div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4, marginTop: 4 }}>
                        {act.techniques?.join(" → ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(1)} style={{ padding: "10px 20px", background: "none", border: `1px solid ${C.border}`, borderRadius: 8, color: C.dim, cursor: "pointer" }}>← Recraft</button>
                <button onClick={() => onAccept(plan, genre)} style={{
                  flex: 1, padding: "12px 0",
                  background: `linear-gradient(90deg, ${C.emerald}, ${C.gold})`,
                  border: "none", borderRadius: 8, color: C.bg, fontFamily: C.mono,
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  boxShadow: `0 0 30px ${C.emeraldGlow}`,
                }}>🎬 Begin Film Concept</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Creative Dialogue (with cinematic consultation) ───────────────────────────
function CreativeDialogue({ scenes, themes, onApplyEdit }) {
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

    const filmContext = scenes.slice(0, 3).map(s =>
      `SCENE: ${s.title}\n${(s.content || "").slice(0, 400)}`
    ).join("\n\n---\n\n");

    const themeContext = themes.map(t => `${t.theme}: ${t.cinematic}`).join("; ");

    const sys = `You are a master filmmaker, screenwriter, and film critic. Help develop and refine film concepts.
Film context: ${filmContext || "No scenes yet"}
Themes: ${themeContext || "No themes yet"}

Answer the filmmaker's question about their work. Suggest cinematography techniques, narrative structure, character development, or connections to film history.
Be cinematically insightful, technically knowledgeable, and creatively inspiring.`;

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
            Ask about your film.<br/>
            "How should I shoot this scene?" · "Character arc?" · "Pacing?"
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
          placeholder="Ask about your film..."
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

// ── Main FilmConceptForge ─────────────────────────────────────────────────────
export default function FilmConceptForge() {
  const [scenes, setScenes] = useState([]);
  const [activeSceneId, setActiveSceneId] = useState(null);
  const [showArchitect, setShowArchitect] = useState(false);
  const [projectTitle, setProjectTitle] = useState("Untitled Film Concept");
  const [plan, setPlan] = useState(null);
  const [sidePanel, setSidePanel] = useState("storyboard"); // storyboard | chat | structure
  const [globalStatus, setGlobalStatus] = useState("");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const activeScene = scenes.find(s => s.id === activeSceneId);

  // ── Generate scene content ───────────────────────────────────────────────────
  const generateSceneContent = useCallback(async (sceneId, planData, genre, allScenes, allThemes) => {
    const actMeta = planData?.structure?.find(s => s.act === allScenes.find(as => as.id === sceneId)?.act);
    const thisScene = allScenes.find(s => s.id === sceneId);
    if (!thisScene) return;

    setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, status: "generating" } : s));

    const themeSummary = allThemes.map(t => `${t.theme}: ${t.cinematic}`).join("; ");
    const prevScenes = allScenes.filter(s => s.act < thisScene.act || (s.act === thisScene.act && s.order < thisScene.order))
      .slice(-2).map(s => `PREV: ${s.title} - ${(s.content || "").slice(0, 200)}...`).join("\n");

    const sys = `You are a master screenwriter creating detailed cinematic scenes in ${genre} genre. Write rigorous cinematic descriptions and scenes.
Output ONLY the scene content — no titles, no explanations.
Write systematic, well-conceptualized cinematic work with clear visual elements and dramatic intent.`;

    const msg = `Project: ${planData?.title || projectTitle}
Genre: ${genre}
Act: ${thisScene.act}, Phase: ${actMeta?.phase || ""}

Themes: ${themeSummary}

This scene: ${thisScene.title}

Previous context:
${prevScenes}

Write the complete cinematic scene.`;

    try {
      const content = await claude([{ role: "user", content: msg }], sys, 1200);
      setScenes(prev => prev.map(s => s.id === sceneId
        ? { ...s, content, status: "done", elements: actMeta?.techniques || [] }
        : s
      ));
    } catch {
      setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, status: "error", content: "Scene generation failed." } : s));
    }
  }, [projectTitle]);

  // ── Accept film plan and generate scenes ─────────────────────────────────────
  const handleAcceptPlan = useCallback(async (planData, genre) => {
    setShowArchitect(false);
    setProjectTitle(planData.title);
    setPlan({ ...planData, genre });
    setIsGeneratingAll(true);

    // Create themes
    const newThemes = planData.themes?.map(t => ({
      id: uid(), theme: t.theme, exploration: t.exploration, cinematic: t.cinematic,
      genre, connections: []
    })) || [];
    setThemes(newThemes);

    // Create scenes
    const newScenes = [];
    let sceneCount = 1;
    planData.structure?.forEach(act => {
      for (let i = 0; i < act.sceneCount; i++) {
        newScenes.push({
          id: uid(), title: `Scene ${sceneCount}`, act: act.act, order: i + 1,
          form: "filmconcept", content: "", status: "queued", cinematicAnalysis: null, notes: null,
          elements: act.techniques || [],
        });
        sceneCount++;
      }
    });

    setScenes(newScenes);
    setActiveSceneId(newScenes[0]?.id);

    for (let i = 0; i < newScenes.length; i++) {
      setGlobalStatus(`Creating ${i + 1}/${newScenes.length}: ${newScenes[i].title}`);
      await generateSceneContent(newScenes[i].id, planData, genre, newScenes, newThemes);
      await new Promise(r => setTimeout(r, 300));
    }

    setGlobalStatus("Film concept draft complete.");
    setIsGeneratingAll(false);
  }, [generateSceneContent]);

  // ── Cinematic analyze scene ──────────────────────────────────────────────────
  const cinematicAnalyzeScene = useCallback(async (scene) => {
    if (!scene.content) return;
    setScenes(prev => prev.map(s => s.id === scene.id ? { ...s, status: "generating" } : s));

    const sys = `You are a film critic and cinematic theorist analyzing film scenes. Analyze the scene and return ONLY JSON:
{
  "impact": number (1-10),
  "summary": string (one sentence),
  "issues": [
    { "severity": "high"|"med"|"low", "title": string, "detail": string }
  ]
}
Be cinematically rigorous about visual storytelling, pacing, and dramatic impact. Limit to 3 issues max.`;

    const raw = await claude([{ role: "user", content: `Analyze cinematic quality of this film scene:\n\n${scene.content}` }], sys, 1000).catch(() => null);
    const parsed = raw ? parseJSON(raw) : null;

    setScenes(prev => prev.map(s => s.id === scene.id
      ? { ...s, status: "done", cinematicAnalysis: parsed || { impact: 5, summary: "Cinematic analysis failed.", issues: [] } }
      : s
    ));
  }, []);

  // ── Expand scene ─────────────────────────────────────────────────────────────
  const expandScene = useCallback(async (scene) => {
    if (!scene.content) return;
    setScenes(prev => prev.map(s => s.id === scene.id ? { ...s, status: "generating" } : s));

    const sys = `You are a screenwriter expanding a film scene. Add more cinematic detail, additional visual elements, and deeper dramatic exploration.
Return ONLY the expanded scene — no explanations.`;

    const msg = `Expand this cinematic scene with additional dramatic detail:\n\n${scene.content}`;

    const expanded = await claude([{ role: "user", content: msg }], sys, 1200).catch(() => scene.content);
    setScenes(prev => prev.map(s => s.id === scene.id
      ? { ...s, content: expanded, status: "done", cinematicAnalysis: null }
      : s
    ));
  }, []);

  // ── Quick add scene ──────────────────────────────────────────────────────────
  const addBlankScene = () => {
    const name = `Scene ${scenes.length + 1}`;
    const newScene = { id: uid(), title: name, act: 1, order: scenes.length + 1, form: "filmconcept", content: "", status: "queued", cinematicAnalysis: null, notes: null, elements: [] };
    setScenes(prev => [...prev, newScene]);
    setActiveSceneId(newScene.id);
  };

  const doneCount = scenes.filter(s => s.status === "done").length;
  const totalWords = scenes.reduce((acc, s) => acc + (s.content?.split(/\s+/).length || 0), 0);

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

      {showArchitect && <FilmArchitect onAccept={handleAcceptPlan} onCancel={() => setShowArchitect(false)} />}

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "10px 20px", background: C.panel,
        borderBottom: `1px solid ${C.border}`,
        height: 50, flexShrink: 0,
      }}>
        <span style={{ fontFamily: C.mono, color: C.emerald, fontSize: 14, fontWeight: 700, letterSpacing: "0.12em" }}>🎬 FILM CONCEPT FORGE</span>
        <span style={{ color: C.dim, fontSize: 12, fontFamily: C.mono }}>/{projectTitle}</span>

        {globalStatus && (
          <span style={{ color: C.gold, fontFamily: C.mono, fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
            {isGeneratingAll && <Spin size={11} />}
            {globalStatus}
          </span>
        )}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          {scenes.length > 0 && (
            <>
              <span style={{ fontFamily: C.mono, fontSize: 11, color: C.dim }}>
                {doneCount}/{scenes.length} scenes · ~{totalWords.toLocaleString()} words
              </span>
              {badge(plan?.genre || "drama", C.emerald)}
            </>
          )}
          <button onClick={addBlankScene} style={{
            padding: "5px 14px", background: "none", border: `1px solid ${C.border}`,
            borderRadius: 6, color: C.muted, cursor: "pointer", fontFamily: C.mono, fontSize: 11,
          }}>+ Scene</button>
          <button onClick={() => setShowArchitect(true)} style={{
            padding: "6px 18px",
            background: `linear-gradient(90deg, ${C.emerald}22, ${C.gold}22)`,
            border: `1px solid ${C.emerald}55`, borderRadius: 7,
            color: C.emerald, cursor: "pointer", fontFamily: C.mono, fontSize: 12, fontWeight: 700,
            boxShadow: `0 0 16px ${C.emeraldGlow}`,
          }}>🎬 New Film Concept</button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* Scene tree sidebar */}
        <div style={{
          width: 240, flexShrink: 0, borderRight: `1px solid ${C.border}`,
          background: C.panel, display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.12em", textTransform: "uppercase" }}>Scenes</span>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "8px 8px" }}>
            {scenes.length === 0 && (
              <div style={{ padding: "30px 14px", color: C.dim, fontSize: 11, fontFamily: C.mono, textAlign: "center", lineHeight: 2 }}>
                No scenes.<br/>Start with 🎬 New Film Concept.
              </div>
            )}
            {scenes.map(s => {
              const isActive = s.id === activeSceneId;
              return (
                <button key={s.id} onClick={() => setActiveSceneId(s.id)} style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  padding: "7px 10px", borderRadius: 6, marginBottom: 2,
                  background: isActive ? `${C.emerald}18` : "none",
                  border: `1px solid ${isActive ? C.emerald + "44" : "transparent"}`,
                  cursor: "pointer", textAlign: "left",
                }}>
                  <span style={{ color: C.emerald, fontFamily: C.mono, fontSize: 12, width: 18, textAlign: "center", flexShrink: 0 }}>{s.act}</span>
                  <span style={{ color: isActive ? C.text : C.muted, fontFamily: C.mono, fontSize: 11, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                    background: s.status === "done" ? C.emerald : s.status === "generating" ? C.gold : s.status === "error" ? C.crimson : C.border,
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
              { id: "storyboard", icon: "🎬", tip: "Storyboard" },
              { id: "chat", icon: "💬", tip: "Chat"        },
              { id: "structure", icon: "📋", tip: "Structure" },
            ].map(t => (
              <button key={t.id} onClick={() => setSidePanel(sidePanel === t.id ? null : t.id)} title={t.tip} style={{
                flex: 1, padding: "8px 0",
                background: sidePanel === t.id ? `${C.emerald}18` : "none",
                border: "none", borderRight: t.id === "storyboard" ? `1px solid ${C.border}` : t.id === "chat" ? `1px solid ${C.border}` : "none",
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
            {sidePanel === "storyboard" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Cinematic Storyboard</span>
                </div>
                <div style={{ flex: 1, overflow: "auto" }}>
                  <StoryboardCanvas scenes={scenes} />
                  {plan?.distribution && (
                    <div style={{ padding: "0 16px 16px" }}>
                      <div style={{ fontSize: 11, color: C.dim, fontFamily: C.mono, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Distribution</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {plan.distribution.map(d => badge(d, C.gold))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            {sidePanel === "chat" && (
              <CreativeDialogue scenes={scenes} themes={themes} onApplyEdit={() => {}} />
            )}
            {sidePanel === "structure" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Narrative Structure</span>
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
                  {plan?.structure?.map((act, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ color: C.emerald, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Act {act.act}: {act.phase}</div>
                      <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.5, marginBottom: 6 }}>{act.focus}</div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4 }}>
                        {act.sceneCount} scenes
                      </div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4, marginTop: 4 }}>
                        {act.techniques?.join(" → ")}
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
          {!activeScene ? (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 24,
              color: C.dim, fontFamily: C.mono,
            }}>
              <div style={{ fontSize: 48, opacity: 0.2 }}>🎬</div>
              <div style={{ fontSize: 14, opacity: 0.5 }}>No scene selected</div>
              <button onClick={() => setShowArchitect(true)} style={{
                padding: "12px 28px",
                background: `linear-gradient(90deg, ${C.emerald}22, ${C.gold}22)`,
                border: `1px solid ${C.emerald}55`, borderRadius: 10,
                color: C.emerald, cursor: "pointer", fontFamily: C.mono, fontSize: 14, fontWeight: 700,
              }}>🎬 Begin Film Concept</button>
            </div>
          ) : (
            <ScenePanel
              scene={activeScene}
              onDelete={() => {
                setScenes(prev => prev.filter(s => s.id !== activeScene.id));
                setActiveSceneId(scenes.find(s => s.id !== activeScene.id)?.id || null);
              }}
              onExpand={() => expandScene(activeScene)}
              onAnalyze={() => cinematicAnalyzeScene(activeScene)}
              onEdit={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}