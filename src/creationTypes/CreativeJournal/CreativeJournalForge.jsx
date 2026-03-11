// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CREATIVE JOURNAL FORGE — Interactive Creative Journal Creation System
// Ported and adapted from CodeForge.jsx for personal creative writing.
// Features: Journal Architect, Entry Builder, Reflection Analyzer,
// Insight Extractor, Theme Weaver, Journal Polisher.
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
  personal_reflection: { icon: "🧠", color: C.emerald,  label: "Personal Reflection" },
  creative_writing:    { icon: "✍️", color: C.gold,     label: "Creative Writing"    },
  travel_journal:      { icon: "✈️", color: C.sapphire, label: "Travel Journal"      },
  dream_journal:       { icon: "🌙", color: C.crimson,  label: "Dream Journal"       },
  gratitude_journal:   { icon: "🙏", color: C.emerald,  label: "Gratitude Journal"   },
  art_journal:         { icon: "🎨", color: C.gold,     label: "Art Journal"         },
  nature_journal:      { icon: "🌿", color: C.emerald,  label: "Nature Journal"      },
  spiritual_journal:   { icon: "🕉️", color: C.crimson,  label: "Spiritual Journal"   },
  therapy_journal:     { icon: "💭", color: C.sapphire, label: "Therapy Journal"     },
  experimental:        { icon: "🌀", color: C.gold,     label: "Experimental"        },
};

const ARCHETYPES = [
  { id: "daily_reflections", label: "Daily Reflections", icon: "📅", description: "Structured daily writing practice" },
  { id: "creative_exercises", label: "Creative Exercises", icon: "🎭", description: "Prompts and writing challenges" },
  { id: "emotional_processing", label: "Emotional Processing", icon: "💔", description: "Working through feelings and experiences" },
  { id: "idea_exploration", label: "Idea Exploration", icon: "💡", description: "Developing thoughts and concepts" },
  { id: "memory_preservation", label: "Memory Preservation", icon: "📖", description: "Recording and reflecting on memories" },
  { id: "goal_tracking", label: "Goal Tracking", icon: "🎯", description: "Personal growth and achievement tracking" },
  { id: "artistic_expression", label: "Artistic Expression", icon: "🎨", description: "Creative writing and artistic journaling" },
  { id: "mindfulness_practice", label: "Mindfulness Practice", icon: "🧘", description: "Present moment awareness and meditation" },
  { id: "relationship_notes", label: "Relationship Notes", icon: "❤️", description: "Observations about relationships and connections" },
  { id: "custom", label: "Custom Journal", icon: "✨", description: "Describe your own journaling approach" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => `cj_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

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

// ── Theme Web ────────────────────────────────────────────────────────────────
function ThemeWeb({ entries }) {
  const width = 380, height = 200;
  if (!entries.length) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, color:C.dim, fontFamily:C.mono, fontSize:12 }}>
      No entries yet
    </div>
  );

  const themes = {};
  entries.forEach(e => {
    if (e.themes) e.themes.forEach(t => {
      themes[t] = (themes[t] || 0) + 1;
    });
  });

  const themeNodes = Object.entries(themes).map(([theme, count], i) => ({
    theme, count,
    x: (i / Math.max(Object.keys(themes).length - 1, 1)) * width,
    y: height - (count * 20), // Scale by frequency
  }));

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height + 40}`} style={{ fontFamily: C.mono }}>
      <defs>
        <linearGradient id="themeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={C.emerald} />
          <stop offset="50%" stopColor={C.gold} />
          <stop offset="100%" stopColor={C.crimson} />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[1,2,3,4,5].map(level => (
        <g key={level}>
          <line x1={0} y1={height - level * 20} x2={width} y2={height - level * 20}
            stroke={C.border} strokeWidth={1} opacity={0.3} />
          <text x={-10} y={height - level * 20 + 4} fill={C.dim} fontSize="9" textAnchor="end">{level}</text>
        </g>
      ))}

      {/* Theme connections */}
      {themeNodes.length > 1 && themeNodes.map((node, i) => {
        if (i < themeNodes.length - 1) {
          const next = themeNodes[i + 1];
          return (
            <line key={`line-${i}`} x1={node.x} y1={node.y} x2={next.x} y2={next.y}
              stroke="url(#themeGradient)" strokeWidth={2} opacity={0.6} />
          );
        }
        return null;
      })}

      {/* Theme nodes */}
      {themeNodes.map((node, i) => (
        <g key={node.theme}>
          <circle cx={node.x} cy={node.y} r={Math.max(6, node.count * 2)} fill={C.emerald} stroke={C.bg} strokeWidth={2} />
          <text x={node.x} y={node.y - 12} textAnchor="middle" fill={C.text} fontSize="10" fontWeight="600">
            {node.theme.length > 8 ? node.theme.slice(0,8)+"…" : node.theme}
          </text>
        </g>
      ))}

      {/* Labels */}
      <text x={0} y={height + 20} fill={C.dim} fontSize="10">Emerging Themes</text>
      <text x={width} y={height + 20} fill={C.dim} fontSize="10" textAnchor="end">Theme Development Arc</text>
      <text x={width/2} y={height + 35} fill={C.dim} fontSize="9" textAnchor="middle">Frequency & Evolution</text>
    </svg>
  );
}

// ── Entry Panel ───────────────────────────────────────────────────────────────
function EntryPanel({ entry, onEdit, onDelete, onExpand, onInsightExtract }) {
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
        <span style={{ color: C.emerald, fontFamily: C.mono, fontSize: 13, fontWeight: 700 }}>📓</span>
        <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, flex: 1 }}>{entry.title}</span>
        {badge(entry.date || new Date().toLocaleDateString(), C.sapphire)}
        {entry.status === "generating" && <Spin size={12} />}
        {entry.status === "done" && <StatusDot color={C.emerald} />}
        {entry.status === "error" && <StatusDot color={C.crimson} />}

        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {[
            { id: "content", label: "Content" },
            { id: "insights", label: "Insights" },
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
            }}>{entry.content || (entry.status === "generating" ? "Writing journal entry..." : "Empty entry")}</pre>
          </div>
        )}

        {tab === "insights" && (
          <div style={{ padding: 20 }}>
            {entry.insights ? (
              <div>
                {/* Score row */}
                {entry.insights.depth !== undefined && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ fontSize: 32, fontFamily: C.mono, fontWeight: 700, color: entry.insights.depth >= 8 ? C.emerald : entry.insights.depth >= 5 ? C.gold : C.crimson }}>
                      {entry.insights.depth}/10
                    </div>
                    <div style={{ color: C.muted, fontSize: 13 }}>{entry.insights.summary}</div>
                  </div>
                )}
                {/* Key insights */}
                {entry.insights.keyInsights?.map((insight, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 10, padding: "10px 14px", marginBottom: 8,
                    background: C.surface, borderRadius: 8,
                    borderLeft: `3px solid ${insight.significance === "high" ? C.emerald : insight.significance === "med" ? C.gold : C.dim}`,
                  }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{insight.significance === "high" ? "💡" : insight.significance === "med" ? "✨" : "📝"}</span>
                    <div>
                      <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{insight.title}</div>
                      <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.6 }}>{insight.detail}</div>
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button onClick={onExpand} style={{
                    padding: "8px 18px", background: `${C.emerald}22`,
                    border: `1px solid ${C.emerald}55`, borderRadius: 8,
                    color: C.emerald, cursor: "pointer", fontSize: 13, fontFamily: C.mono,
                  }}>↻ Expand Entry</button>
                </div>
              </div>
            ) : (
              <button onClick={() => onInsightExtract(entry)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Extract Insights</button>
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
              }}>Add Journal Notes</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Journal Architect ─────────────────────────────────────────────────────────
function JournalArchitect({ onAccept, onCancel }) {
  const [step, setStep] = useState(0); // 0=archetype 1=details 2=planning 3=review
  const [archetype, setArchetype] = useState(null);
  const [genre, setGenre] = useState("personal_reflection");
  const [desc, setDesc] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const generatePlan = async () => {
    setLoading(true);
    setStep(2);
    setStatusMsg("AI is crafting your journal structure...");

    const sys = `You are a journaling expert and creative writing coach. Design a complete creative journal.
Return ONLY valid JSON: {
  "title": string,
  "subtitle": string,
  "genre": string,
  "focus": string[],
  "structure": [
    {
      "phase": number (1|2|3),
      "duration": string,
      "purpose": string,
      "entryCount": number,
      "themes": string[]
    }
  ],
  "writingStyle": string,
  "goals": string[],
  "entryCount": string
}
Generate 3 phases with 5-10 entries per phase. Be supportive and creative.`;

    const msg = `Archetype: ${archetype?.label}
Genre: ${genre}
Description: ${desc || "Craft a journal that helps me explore my thoughts and creativity"}
Design a complete journal structure.`;

    try {
      const raw = await claude([{ role: "user", content: msg }], sys, 1200);
      const parsed = parseJSON(raw);
      if (parsed) { setPlan(parsed); setStep(3); }
      else { setStatusMsg("Parse error — please retry."); setStep(1); }
    } catch (e) {
      setStatusMsg("Journal inspiration failed.");
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
            JOURNAL ARCHITECT
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
              <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Choose a Journal Archetype</h2>
              <p style={{ color: C.dim, fontSize: 13, marginBottom: 24, fontFamily: C.mono }}>What kind of journaling journey shall we embark on?</p>
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
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Journal Concept</label>
                  <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder={`Describe the themes, experiences, and insights you want to explore in your journal...`}
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
                  }}>📓 Craft Journal</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Loading */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 280, gap: 20 }}>
              <div style={{ position: "relative" }}>
                <Spin size={52} />
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.emerald, fontSize: 20 }}>📓</span>
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
                  {plan.focus?.map(f => badge(f, C.gold))}
                </div>
                <p style={{ color: C.dim, fontSize: 13, lineHeight: 1.7, fontStyle: "italic" }}>
                  {plan.writingStyle} · {plan.entryCount} entries
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Structure</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.structure?.map((phase, i) => (
                    <div key={i} style={{
                      padding: "12px 16px", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                    }}>
                      <div style={{ color: C.emerald, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Phase {phase.phase}</div>
                      <div style={{ color: C.muted, fontSize: 12, marginBottom: 6 }}>{phase.purpose}</div>
                      <div style={{ color: C.dim, fontSize: 11, lineHeight: 1.4 }}>
                        Duration: {phase.duration} · {phase.entryCount} entries
                      </div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4, marginTop: 4 }}>
                        {phase.themes?.join(" → ")}
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
                }}>📓 Begin Journal</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Journal Dialogue (with journal writing) ───────────────────────────────────
function JournalDialogue({ entries, onApplyEdit }) {
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

    const journalContext = entries.slice(0, 3).map(e =>
      `ENTRY: ${e.title}\n${(e.content || "").slice(0, 400)}`
    ).join("\n\n---\n\n");

    const sys = `You are a journaling coach and creative writing mentor. Help develop and refine journal entries.
Journal context: ${journalContext || "No entries yet"}

Answer the writer's question about their journaling. Suggest writing prompts, discuss themes, offer reflection questions, or help with creative expression.
Be supportive, insightful, and encouraging.`;

    const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
    const raw = await claude([...history, { role: "user", content: userMsg }], sys, 1000).catch(() => "Error consulting with AI.");
    setMessages(m => [...m, { role: "assistant", content: raw }]);
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.panel, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <StatusDot color={C.gold} />
        <span style={{ fontFamily: C.mono, fontSize: 11, color: C.gold, letterSpacing: "0.1em" }}>JOURNAL DIALOGUE</span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 8px" }}>
        {messages.length === 0 && (
          <div style={{ color: C.dim, fontSize: 12, fontFamily: C.mono, textAlign: "center", paddingTop: 40, lineHeight: 2 }}>
            Ask about your journal.<br/>
            "How can I deepen this entry?" · "What themes am I exploring?" · "Writing prompts?"
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
          placeholder="Ask about your journal..."
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

// ── Main CreativeJournalForge ─────────────────────────────────────────────────
export default function CreativeJournalForge() {
  const [entries, setEntries] = useState([]);
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [showArchitect, setShowArchitect] = useState(false);
  const [journalTitle, setJournalTitle] = useState("Untitled Journal");
  const [plan, setPlan] = useState(null);
  const [sidePanel, setSidePanel] = useState("themes"); // themes | chat | outline
  const [globalStatus, setGlobalStatus] = useState("");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const activeEntry = entries.find(e => e.id === activeEntryId);

  // ── Generate entry content ───────────────────────────────────────────────────
  const generateEntryContent = useCallback(async (entryId, planData, genre, allEntries) => {
    const phaseMeta = planData?.structure?.find(s => s.phase === allEntries.find(ae => ae.id === entryId)?.phase);
    const thisEntry = allEntries.find(e => e.id === entryId);
    if (!thisEntry) return;

    setEntries(prev => prev.map(e => e.id === entryId ? { ...e, status: "generating" } : e));

    const prevEntries = allEntries.filter(e => e.phase < thisEntry.phase || (e.phase === thisEntry.phase && e.order < thisEntry.order))
      .slice(-2).map(e => `PREV: ${e.title} - ${(e.content || "").slice(0, 200)}...`).join("\n");

    const sys = `You are a journaling coach writing in ${genre} style. Write authentic, reflective journal entries.
Output ONLY the entry content — no titles, no explanations.
Write personal, introspective writing that explores thoughts, feelings, and experiences.`;

    const msg = `Journal: ${planData?.title || journalTitle}
Genre: ${genre}
Phase: ${thisEntry.phase}, Purpose: ${phaseMeta?.purpose || ""}

This entry: ${thisEntry.title}

Previous context:
${prevEntries}

Write the complete journal entry.`;

    try {
      const content = await claude([{ role: "user", content: msg }], sys, 1200);
      setEntries(prev => prev.map(e => e.id === entryId
        ? { ...e, content, status: "done", themes: phaseMeta?.themes || [] }
        : e
      ));
    } catch {
      setEntries(prev => prev.map(e => e.id === entryId ? { ...e, status: "error", content: "Entry generation failed." } : e));
    }
  }, [journalTitle]);

  // ── Accept journal plan and generate entries ────────────────────────────────
  const handleAcceptPlan = useCallback(async (planData, genre) => {
    setShowArchitect(false);
    setJournalTitle(planData.title);
    setPlan({ ...planData, genre });
    setIsGeneratingAll(true);

    const newEntries = [];
    let entryCount = 1;
    planData.structure?.forEach(phase => {
      for (let i = 0; i < phase.entryCount; i++) {
        newEntries.push({
          id: uid(), title: `Entry ${entryCount}`, phase: phase.phase, order: i + 1,
          form: "creativejournal", content: "", status: "queued", insights: null, notes: null,
          date: new Date().toLocaleDateString(), themes: phase.themes || [],
        });
        entryCount++;
      }
    });

    setEntries(newEntries);
    setActiveEntryId(newEntries[0]?.id);

    for (let i = 0; i < newEntries.length; i++) {
      setGlobalStatus(`Writing ${i + 1}/${newEntries.length}: ${newEntries[i].title}`);
      await generateEntryContent(newEntries[i].id, planData, genre, newEntries);
      await new Promise(r => setTimeout(r, 300));
    }

    setGlobalStatus("Journal draft complete.");
    setIsGeneratingAll(false);
  }, [generateEntryContent]);

  // ── Insight extract entry ────────────────────────────────────────────────────
  const insightExtractEntry = useCallback(async (entry) => {
    if (!entry.content) return;
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: "generating" } : e));

    const sys = `You are a journaling insight analyzer. Analyze the entry and return ONLY JSON:
{
  "depth": number (1-10),
  "summary": string (one sentence),
  "keyInsights": [
    { "significance": "high"|"med"|"low", "title": string, "detail": string }
  ]
}
Be insightful about emotional depth, self-awareness, and personal growth. Limit to 3 insights max.`;

    const raw = await claude([{ role: "user", content: `Analyze insights from this journal entry:\n\n${entry.content}` }], sys, 1000).catch(() => null);
    const parsed = raw ? parseJSON(raw) : null;

    setEntries(prev => prev.map(e => e.id === entry.id
      ? { ...e, status: "done", insights: parsed || { depth: 5, summary: "Insight analysis failed.", keyInsights: [] } }
      : e
    ));
  }, []);

  // ── Expand entry ─────────────────────────────────────────────────────────────
  const expandEntry = useCallback(async (entry) => {
    if (!entry.content) return;
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: "generating" } : e));

    const sys = `You are a journaling coach expanding an entry. Add more depth, reflection, and personal insight.
Return ONLY the expanded entry — no explanations.`;

    const msg = `Expand this journal entry with deeper reflection:\n\n${entry.content}`;

    const expanded = await claude([{ role: "user", content: msg }], sys, 1200).catch(() => entry.content);
    setEntries(prev => prev.map(e => e.id === entry.id
      ? { ...e, content: expanded, status: "done", insights: null }
      : e
    ));
  }, []);

  // ── Quick add entry ──────────────────────────────────────────────────────────
  const addBlankEntry = () => {
    const name = `Entry ${entries.length + 1}`;
    const newEntry = { id: uid(), title: name, phase: 1, order: entries.length + 1, form: "creativejournal", content: "", status: "queued", insights: null, notes: null, date: new Date().toLocaleDateString(), themes: [] };
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

      {showArchitect && <JournalArchitect onAccept={handleAcceptPlan} onCancel={() => setShowArchitect(false)} />}

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "10px 20px", background: C.panel,
        borderBottom: `1px solid ${C.border}`,
        height: 50, flexShrink: 0,
      }}>
        <span style={{ fontFamily: C.mono, color: C.emerald, fontSize: 14, fontWeight: 700, letterSpacing: "0.12em" }}>📓 CREATIVE JOURNAL FORGE</span>
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
              {badge(plan?.genre || "personal_reflection", C.emerald)}
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
          }}>📓 New Journal</button>
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
                No entries.<br/>Start with 📓 New Journal.
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
              { id: "themes", icon: "🕸️", tip: "Theme Web" },
              { id: "chat", icon: "💬", tip: "Chat"        },
              { id: "outline", icon: "📋", tip: "Outline"  },
            ].map(t => (
              <button key={t.id} onClick={() => setSidePanel(sidePanel === t.id ? null : t.id)} title={t.tip} style={{
                flex: 1, padding: "8px 0",
                background: sidePanel === t.id ? `${C.emerald}18` : "none",
                border: "none", borderRight: t.id === "themes" ? `1px solid ${C.border}` : t.id === "chat" ? `1px solid ${C.border}` : "none",
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
            {sidePanel === "themes" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Theme Development Web</span>
                </div>
                <div style={{ flex: 1, overflow: "auto" }}>
                  <ThemeWeb entries={entries} />
                  {plan?.goals && (
                    <div style={{ padding: "0 16px 16px" }}>
                      <div style={{ fontSize: 11, color: C.dim, fontFamily: C.mono, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Goals</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {plan.goals.map(g => badge(g, C.gold))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            {sidePanel === "chat" && (
              <JournalDialogue entries={entries} onApplyEdit={() => {}} />
            )}
            {sidePanel === "outline" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Journal Outline</span>
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
                  {plan?.structure?.map((phase, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ color: C.emerald, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Phase {phase.phase}</div>
                      <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.5, marginBottom: 6 }}>{phase.purpose}</div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4 }}>
                        Duration: {phase.duration} · {phase.entryCount} entries
                      </div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4, marginTop: 4 }}>
                        {phase.themes?.join(" → ")}
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
              <div style={{ fontSize: 48, opacity: 0.2 }}>📓</div>
              <div style={{ fontSize: 14, opacity: 0.5 }}>No entry selected</div>
              <button onClick={() => setShowArchitect(true)} style={{
                padding: "12px 28px",
                background: `linear-gradient(90deg, ${C.emerald}22, ${C.gold}22)`,
                border: `1px solid ${C.emerald}55`, borderRadius: 10,
                color: C.emerald, cursor: "pointer", fontFamily: C.mono, fontSize: 14, fontWeight: 700,
              }}>📓 Begin Journal</button>
            </div>
          ) : (
            <EntryPanel
              entry={activeEntry}
              onDelete={() => {
                setEntries(prev => prev.filter(e => e.id !== activeEntry.id));
                setActiveEntryId(entries.find(e => e.id !== activeEntry.id)?.id || null);
              }}
              onExpand={() => expandEntry(activeEntry)}
              onInsightExtract={() => insightExtractEntry(activeEntry)}
              onEdit={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}