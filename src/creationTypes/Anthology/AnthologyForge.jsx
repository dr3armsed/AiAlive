// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANTHOLOGY FORGE — Interactive Anthology Creation System
// Ported and adapted from ComicBookScriptForge for curated story collections.
// Features: Anthology Architect, Story Builder, Collection Weaver, Theme Validator,
// Structure Analyzer, Story Polisher, Anthology Dialogue.
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

// ── Collection themes ────────────────────────────────────────────────────────────
const THEMES = {
  contemporary: { icon: "🏙️", color: C.gold,     label: "Contemporary"  },
  historical:   { icon: "📜", color: C.sapphire, label: "Historical"    },
  speculative:  { icon: "🌌", color: C.emerald,  label: "Speculative"   },
  fantastical:  { icon: "🐉", color: C.gold,     label: "Fantastical"   },
  magical:      { icon: "✨", color: C.crimson,  label: "Magical"       },
  horror:       { icon: "👻", color: C.crimson,  label: "Horror"        },
  romance:      { icon: "💕", color: C.crimson,  label: "Romance"       },
  mystery:      { icon: "🔍", color: C.sapphire, label: "Mystery"       },
  philosophical:{ icon: "🧠", color: C.sapphire, label: "Philosophical" },
  experimental: { icon: "🌀", color: C.emerald,  label: "Experimental"  },
};

const STRUCTURES = [
  { id: "linked_stories",    label: "Linked Stories",    icon: "🔗", description: "Stories with shared universe or characters" },
  { id: "thematic_collection", label: "Thematic",        icon: "🎭", description: "Stories unified by central theme" },
  { id: "interconnected",    label: "Interconnected",    icon: "🌐", description: "Stories that interweave and influence each other" },
  { id: "contrasting_voices",label: "Contrasting Voices",icon: "🎵", description: "Different perspectives on same subject" },
  { id: "framed_narrative",  label: "Framed Narrative",  icon: "📖", description: "Stories within a larger narrative frame" },
  { id: "genre_mosaic",      label: "Genre Mosaic",      icon: "🎨", description: "Different genres collected together" },
  { id: "temporal_structure",label: "Temporal",          icon: "⏰", description: "Stories arranged by time period" },
  { id: "author_retrospective", label: "Retrospective",  icon: "📚", description: "Collection of author's best works" },
  { id: "custom",            label: "Custom Structure",  icon: "✨", description: "Design your own anthology approach" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => `anth_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

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

// ── Story Collection Map ────────────────────────────────────────────────────────
function StoryCollectionMap({ stories }) {
  const width = 380, height = 200;
  if (!stories.length) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, color:C.dim, fontFamily:C.mono, fontSize:12 }}>
      No stories yet
    </div>
  );

  const points = stories.map((s, i) => ({
    ...s,
    x: (i / Math.max(stories.length - 1, 1)) * width,
    y: height - (s.length || 5) * 15,
  }));

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height + 40}`} style={{ fontFamily: C.mono }}>
      <defs>
        <linearGradient id="collectionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
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

      {/* Collection line */}
      {points.length > 1 && (
        <polyline
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none" stroke="url(#collectionGradient)" strokeWidth={3}
        />
      )}

      {/* Story points */}
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
      <text x={width/2} y={height + 35} fill={C.dim} fontSize="9" textAnchor="middle">Collection Structure & Story Arc</text>
    </svg>
  );
}

// ── Story Panel ──────────────────────────────────────────────────────────────────
function StoryPanel({ story, onEdit, onDelete, onExpand, onThemeCheck }) {
  const [tab, setTab] = useState("content");
  const [copied, setCopied] = useState(false);
  const lines = (story.content || "").split("\n");

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      background: C.panel, border: `1px solid ${C.border}`,
      borderRadius: 10, overflow: "hidden", height: "100%",
    }}>
      {/* Story header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 14px", background: C.surface,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ color: C.gold, fontFamily: C.mono, fontSize: 13, fontWeight: 700 }}>📖</span>
        <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, flex: 1 }}>{story.title}</span>
        {badge(story.genre || "Story", C.sapphire)}
        {story.status === "generating" && <Spin size={12} />}
        {story.status === "done" && <StatusDot color={C.gold} />}
        {story.status === "error" && <StatusDot color={C.crimson} />}

        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {[
            { id: "content", label: "Content" },
            { id: "theme", label: "Theme" },
            { id: "notes", label: "Notes" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
              background: tab === t.id ? `${C.gold}22` : "none",
              border: `1px solid ${tab === t.id ? C.gold + "66" : "transparent"}`,
              color: tab === t.id ? C.gold : C.dim, fontFamily: C.mono,
            }}>{t.label}</button>
          ))}
          <button onClick={() => { navigator.clipboard.writeText(story.content || ""); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
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
            {/* Story text */}
            <pre style={{
              flex: 1, margin: 0, padding: "14px 20px",
              fontFamily: C.serif, fontSize: 16, lineHeight: "24px",
              color: "#f0e6d2", background: C.bg,
              overflowX: "auto", whiteSpace: "pre-wrap",
            }}>{story.content || (story.status === "generating" ? "Crafting story..." : "Empty story")}</pre>
          </div>
        )}

        {tab === "theme" && (
          <div style={{ padding: 20 }}>
            {story.themeAnalysis ? (
              <div>
                {/* Score row */}
                {story.themeAnalysis.coherence !== undefined && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ fontSize: 32, fontFamily: C.mono, fontWeight: 700, color: story.themeAnalysis.coherence >= 8 ? C.gold : story.themeAnalysis.coherence >= 5 ? C.emerald : C.crimson }}>
                      {story.themeAnalysis.coherence}/10
                    </div>
                    <div style={{ color: C.muted, fontSize: 13 }}>{story.themeAnalysis.summary}</div>
                  </div>
                )}
                {/* Themes */}
                {story.themeAnalysis.themes?.map((theme, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 10, padding: "10px 14px", marginBottom: 8,
                    background: C.surface, borderRadius: 8,
                    borderLeft: `3px solid ${C.gold}`,
                  }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>✦</span>
                    <div>
                      <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{theme.name}</div>
                      <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.6 }}>{theme.description}</div>
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button onClick={onExpand} style={{
                    padding: "8px 18px", background: `${C.gold}22`,
                    border: `1px solid ${C.gold}55`, borderRadius: 8,
                    color: C.gold, cursor: "pointer", fontSize: 13, fontFamily: C.mono,
                  }}>↻ Expand Story</button>
                </div>
              </div>
            ) : (
              <button onClick={() => onThemeCheck(story)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Analyze Theme Coherence</button>
            )}
          </div>
        )}

        {tab === "notes" && (
          <div style={{ padding: 20 }}>
            {story.notes ? (
              <pre style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{story.notes}</pre>
            ) : (
              <button onClick={() => onEdit(story)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Add Story Notes</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Anthology Architect ───────────────────────────────────────────────────────────
function AnthologyArchitect({ onAccept, onCancel }) {
  const [step, setStep] = useState(0); // 0=structure 1=details 2=planning 3=review
  const [structure, setStructure] = useState(null);
  const [theme, setTheme] = useState("contemporary");
  const [desc, setDesc] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const generatePlan = async () => {
    setLoading(true);
    setStep(2);
    setStatusMsg("AI is architecting your anthology...");

    const sys = `You are a master anthology editor and curator. Design a complete anthology collection.
Return ONLY valid JSON: {
  "title": string,
  "tagline": string,
  "theme": string,
  "structure": string,
  "tone": string[],
  "stories": [
    {
      "number": number,
      "title": string,
      "genre": string,
      "synopsis": string,
      "wordCount": number,
      "perspective": string
    }
  ],
  "unifyingElements": string[],
  "targetAudience": string,
  "totalWordCount": string
}
Generate 4-7 diverse stories with varied genres and perspectives. Ensure thematic coherence. Include diverse voices.`;

    const msg = `Collection Structure: ${structure?.label}
Theme: ${theme}
Description: ${desc || "Curate a compelling anthology that resonates"}
Design a complete anthology collection.`;

    try {
      const raw = await claude([{ role: "user", content: msg }], sys, 1200);
      const parsed = parseJSON(raw);
      if (parsed) { setPlan(parsed); setStep(3); }
      else { setStatusMsg("Parse error — please retry."); setStep(1); }
    } catch (e) {
      setStatusMsg("Curation inspiration failed.");
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
            ANTHOLOGY ARCHITECT
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {["Structure","Details","Planning","Review"].map((s,i) => (
              <span key={i} style={{
                fontFamily: C.mono, fontSize: 10, color: step >= i ? C.gold : C.dim,
                opacity: step >= i ? 1 : 0.4,
              }}>{s}{i < 3 ? " →" : ""}</span>
            ))}
          </div>
          <button onClick={onCancel} style={{ background: "none", border: "none", color: C.dim, cursor: "pointer", fontSize: 20, marginLeft: 16 }}>×</button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: 28 }}>
          {/* Step 0: Structure */}
          {step === 0 && (
            <div>
              <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Choose Anthology Structure</h2>
              <p style={{ color: C.dim, fontSize: 13, marginBottom: 24, fontFamily: C.mono }}>How shall your stories be collected and connected?</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 12 }}>
                {STRUCTURES.map(s => (
                  <button key={s.id} onClick={() => { setStructure(s); setStep(1); }}
                    style={{
                      padding: "16px 18px", background: C.surface, border: `1px solid ${C.border}`,
                      borderRadius: 12, cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                      display: "flex", flexDirection: "column", gap: 8,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold + "88"; e.currentTarget.style.background = C.panel; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface; }}
                  >
                    <span style={{ fontSize: 26 }}>{s.icon}</span>
                    <span style={{ color: C.text, fontSize: 14, fontWeight: 600 }}>{s.label}</span>
                    <span style={{ color: C.dim, fontSize: 12, lineHeight: 1.5 }}>{s.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Details */}
          {step === 1 && structure && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <span style={{ fontSize: 26 }}>{structure.icon}</span>
                <div>
                  <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: 0 }}>{structure.label}</h2>
                  <p style={{ color: C.dim, fontSize: 12, fontFamily: C.mono, margin: "4px 0 0" }}>{structure.description}</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Primary Theme</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {Object.entries(THEMES).map(([id, t]) => (
                      <button key={id} onClick={() => setTheme(id)} style={{
                        padding: "8px 18px", borderRadius: 8, cursor: "pointer",
                        border: `1px solid ${theme === id ? t.color + "88" : C.border}`,
                        background: theme === id ? `${t.color}18` : "none",
                        color: theme === id ? t.color : C.muted,
                        fontFamily: C.mono, fontSize: 12,
                      }}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Anthology Vision</label>
                  <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder={`Describe your anthology vision, what connects the stories, target audience, and editorial goals...`}
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
                  }}>📚 Curate Anthology</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Loading */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 280, gap: 20 }}>
              <div style={{ position: "relative" }}>
                <Spin size={52} />
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.gold, fontSize: 20 }}>📚</span>
              </div>
              <div style={{ color: C.muted, fontFamily: C.mono, fontSize: 13 }}>{statusMsg}</div>
            </div>
          )}

          {/* Step 3: Review plan */}
          {step === 3 && plan && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ color: C.gold, fontFamily: C.mono, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{plan.title}</h2>
                <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{plan.tagline}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {badge(plan.theme, C.gold)}
                  {plan.tone?.map(t => badge(t, C.emerald))}
                </div>
                <p style={{ color: C.dim, fontSize: 13, lineHeight: 1.7, fontStyle: "italic" }}>
                  {plan.structure} · {plan.targetAudience} · {plan.totalWordCount}
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Stories ({plan.stories?.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.stories?.map((story, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                    }}>
                      <span style={{ color: C.gold, fontFamily: C.mono, fontSize: 14, width: 24, textAlign: "center", flexShrink: 0 }}>{story.number}</span>
                      <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, width: 140, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{story.title}</span>
                      <span style={{ color: C.muted, fontSize: 12, flex: 1 }}>{story.genre} · {story.wordCount.toLocaleString()} words</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Unifying Elements</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {plan.unifyingElements?.map((elem, i) => badge(elem, C.emerald))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(1)} style={{ padding: "10px 20px", background: "none", border: `1px solid ${C.border}`, borderRadius: 8, color: C.dim, cursor: "pointer" }}>← Recurate</button>
                <button onClick={() => onAccept(plan, theme)} style={{
                  flex: 1, padding: "12px 0",
                  background: `linear-gradient(90deg, ${C.gold}, ${C.crimson})`,
                  border: "none", borderRadius: 8, color: C.bg, fontFamily: C.mono,
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  boxShadow: `0 0 30px ${C.goldGlow}`,
                }}>📚 Begin Anthology</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Anthology Dialogue ────────────────────────────────────────────────────────────
function AnthologyDialogue({ stories, onApplyEdit }) {
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

    const storyContext = stories.slice(0, 3).map(s =>
      `STORY: ${s.title}\n${(s.content || "").slice(0, 300)}`
    ).join("\n\n---\n\n");

    const sys = `You are an anthology editor and curator. Help develop and refine story collections.
Story context: ${storyContext || "No stories yet"}

Answer the curator's question about their anthology. Suggest improvements, discuss story ordering, thematic coherence, or collection structure.
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
        <span style={{ fontFamily: C.mono, fontSize: 11, color: C.emerald, letterSpacing: "0.1em" }}>ANTHOLOGY DIALOGUE</span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 8px" }}>
        {messages.length === 0 && (
          <div style={{ color: C.dim, fontSize: 12, fontFamily: C.mono, textAlign: "center", paddingTop: 40, lineHeight: 2 }}>
            Ask about your anthology.<br/>
            "How should these stories flow?" · "Thematic coherence?" · "Story ordering?"
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
          placeholder="Ask about your anthology..."
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

// ── Main AnthologyForge ──────────────────────────────────────────────────────────
export default function AnthologyForge() {
  const [stories, setStories] = useState([]);
  const [activeStoryId, setActiveStoryId] = useState(null);
  const [showArchitect, setShowArchitect] = useState(false);
  const [anthologyTitle, setAnthologyTitle] = useState("Untitled Anthology");
  const [plan, setPlan] = useState(null);
  const [sidePanel, setSidePanel] = useState("flow"); // flow | chat | outline
  const [globalStatus, setGlobalStatus] = useState("");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const activeStory = stories.find(s => s.id === activeStoryId);

  // ── Generate story content ───────────────────────────────────────────────────
  const generateStoryContent = useCallback(async (storyId, planData, theme, allStories) => {
    const storyMeta = planData?.stories?.find(s => s.number === allStories.find(as => as.id === storyId)?.number);
    const thisStory = allStories.find(s => s.id === storyId);
    if (!thisStory) return;

    setStories(prev => prev.map(s => s.id === storyId ? { ...s, status: "generating" } : s));

    const prevStories = allStories.filter(s => s.number < thisStory.number)
      .slice(-2).map(s => `PREV: ${s.title} - ${(s.content || "").slice(0, 200)}...`).join("\n");

    const sys = `You are a master storyteller. Write compelling stories for an anthology themed around ${theme}.
Output ONLY the completed story — no titles, no explanations.
Write vivid, engaging prose that stands alone while fitting into the collection's theme.`;

    const msg = `Anthology: ${planData?.title || anthologyTitle}
Theme: ${theme}
Structure: ${planData?.structure || "linked"}

This story: ${thisStory.title}
Genre: ${storyMeta?.genre || "Literary"}
Word target: ${storyMeta?.wordCount || 2000}
Perspective: ${storyMeta?.perspective || "third person"}

Previous stories for context:
${prevStories}

Write the complete story.`;

    try {
      const content = await claude([{ role: "user", content: msg }], sys, 1500);
      setStories(prev => prev.map(s => s.id === storyId
        ? { ...s, content, status: "done" }
        : s
      ));
    } catch {
      setStories(prev => prev.map(s => s.id === storyId ? { ...s, status: "error", content: "Story generation failed." } : s));
    }
  }, [anthologyTitle]);

  // ── Accept anthology plan and generate stories ───────────────────────────────
  const handleAcceptPlan = useCallback(async (planData, theme) => {
    setShowArchitect(false);
    setAnthologyTitle(planData.title);
    setPlan({ ...planData, theme });
    setIsGeneratingAll(true);

    // Create stories
    const newStories = planData.stories?.map(s => ({
      id: uid(), title: s.title, number: s.number, genre: s.genre, synopsis: s.synopsis,
      form: "anthology", content: "", status: "queued", themeAnalysis: null, notes: null,
    })) || [];

    setStories(newStories);
    setActiveStoryId(newStories[0]?.id);

    for (let i = 0; i < newStories.length; i++) {
      setGlobalStatus(`Writing ${i + 1}/${newStories.length}: ${newStories[i].title}`);
      await generateStoryContent(newStories[i].id, planData, theme, newStories);
      await new Promise(r => setTimeout(r, 300));
    }

    setGlobalStatus("Anthology collection draft complete.");
    setIsGeneratingAll(false);
  }, [generateStoryContent]);

  // ── Theme coherence check ────────────────────────────────────────────────────
  const themeCheckStory = useCallback(async (story) => {
    if (!story.content) return;
    setStories(prev => prev.map(s => s.id === story.id ? { ...s, status: "generating" } : s));

    const sys = `You are an anthology editor analyzing thematic coherence. Analyze the story and return ONLY JSON:
{
  "coherence": number (1-10),
  "summary": string (one sentence),
  "themes": [
    { "name": string, "description": string }
  ]
}
Identify key themes and how they connect to anthology collections. Limit to 3 themes max.`;

    const raw = await claude([{ role: "user", content: `Check thematic coherence of this story:\n\n${story.content}` }], sys, 1000).catch(() => null);
    const parsed = raw ? parseJSON(raw) : null;

    setStories(prev => prev.map(s => s.id === story.id
      ? { ...s, status: "done", themeAnalysis: parsed || { coherence: 5, summary: "Analysis failed.", themes: [] } }
      : s
    ));
  }, []);

  // ── Expand story ─────────────────────────────────────────────────────────────
  const expandStory = useCallback(async (story) => {
    if (!story.content) return;
    setStories(prev => prev.map(s => s.id === story.id ? { ...s, status: "generating" } : s));

    const sys = `You are a story editor expanding a work. Add more depth, character development, and narrative richness.
Return ONLY the expanded story — no explanations.`;

    const msg = `Expand this story with more depth and resonance:\n\n${story.content}`;

    const expanded = await claude([{ role: "user", content: msg }], sys, 1500).catch(() => story.content);
    setStories(prev => prev.map(s => s.id === story.id
      ? { ...s, content: expanded, status: "done", themeAnalysis: null }
      : s
    ));
  }, []);

  // ── Quick add story ──────────────────────────────────────────────────────────
  const addBlankStory = () => {
    const name = `Story ${stories.length + 1}`;
    const newStory = { id: uid(), title: name, number: stories.length + 1, genre: "Literary", form: "anthology", content: "", status: "queued", themeAnalysis: null, notes: null };
    setStories(prev => [...prev, newStory]);
    setActiveStoryId(newStory.id);
  };

  const doneCount = stories.filter(s => s.status === "done").length;
  const totalWords = stories.reduce((acc, s) => acc + (s.content?.split(/\s+/).length || 0), 0);

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

      {showArchitect && <AnthologyArchitect onAccept={handleAcceptPlan} onCancel={() => setShowArchitect(false)} />}

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "10px 20px", background: C.panel,
        borderBottom: `1px solid ${C.border}`,
        height: 50, flexShrink: 0,
      }}>
        <span style={{ fontFamily: C.mono, color: C.gold, fontSize: 14, fontWeight: 700, letterSpacing: "0.12em" }}>📚 ANTHOLOGY FORGE</span>
        <span style={{ color: C.dim, fontSize: 12, fontFamily: C.mono }}>/{anthologyTitle}</span>

        {globalStatus && (
          <span style={{ color: C.emerald, fontFamily: C.mono, fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
            {isGeneratingAll && <Spin size={11} />}
            {globalStatus}
          </span>
        )}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          {stories.length > 0 && (
            <>
              <span style={{ fontFamily: C.mono, fontSize: 11, color: C.dim }}>
                {doneCount}/{stories.length} stories · ~{totalWords.toLocaleString()} words
              </span>
              {badge(plan?.theme || "contemporary", C.gold)}
            </>
          )}
          <button onClick={addBlankStory} style={{
            padding: "5px 14px", background: "none", border: `1px solid ${C.border}`,
            borderRadius: 6, color: C.muted, cursor: "pointer", fontFamily: C.mono, fontSize: 11,
          }}>+ Story</button>
          <button onClick={() => setShowArchitect(true)} style={{
            padding: "6px 18px",
            background: `linear-gradient(90deg, ${C.gold}22, ${C.crimson}22)`,
            border: `1px solid ${C.gold}55`, borderRadius: 7,
            color: C.gold, cursor: "pointer", fontFamily: C.mono, fontSize: 12, fontWeight: 700,
            boxShadow: `0 0 16px ${C.goldGlow}`,
          }}>📚 New Anthology</button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* Story tree sidebar */}
        <div style={{
          width: 240, flexShrink: 0, borderRight: `1px solid ${C.border}`,
          background: C.panel, display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.12em", textTransform: "uppercase" }}>Stories</span>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "8px 8px" }}>
            {stories.length === 0 && (
              <div style={{ padding: "30px 14px", color: C.dim, fontSize: 11, fontFamily: C.mono, textAlign: "center", lineHeight: 2 }}>
                No stories.<br/>Start with 📚 New Anthology.
              </div>
            )}
            {stories.map(s => {
              const isActive = s.id === activeStoryId;
              return (
                <button key={s.id} onClick={() => setActiveStoryId(s.id)} style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  padding: "7px 10px", borderRadius: 6, marginBottom: 2,
                  background: isActive ? `${C.gold}18` : "none",
                  border: `1px solid ${isActive ? C.gold + "44" : "transparent"}`,
                  cursor: "pointer", textAlign: "left",
                }}>
                  <span style={{ color: C.gold, fontFamily: C.mono, fontSize: 12, width: 18, textAlign: "center", flexShrink: 0 }}>{s.number}</span>
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
              { id: "flow", icon: "📊", tip: "Collection Structure" },
              { id: "chat", icon: "💬", tip: "Chat"               },
              { id: "outline", icon: "📋", tip: "Plan"           },
            ].map(t => (
              <button key={t.id} onClick={() => setSidePanel(sidePanel === t.id ? null : t.id)} title={t.tip} style={{
                flex: 1, padding: "8px 0",
                background: sidePanel === t.id ? `${C.gold}18` : "none",
                border: "none", borderRight: t.id === "flow" ? `1px solid ${C.border}` : t.id === "chat" ? `1px solid ${C.border}` : "none",
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
            {sidePanel === "flow" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Collection Structure</span>
                </div>
                <div style={{ flex: 1, overflow: "auto" }}>
                  <StoryCollectionMap stories={stories} />
                  {plan?.unifyingElements && (
                    <div style={{ padding: "0 16px 16px" }}>
                      <div style={{ fontSize: 11, color: C.dim, fontFamily: C.mono, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Unifying Elements</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {plan.unifyingElements.map(e => badge(e, C.emerald))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            {sidePanel === "chat" && (
              <AnthologyDialogue stories={stories} onApplyEdit={() => {}} />
            )}
            {sidePanel === "outline" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Anthology Plan</span>
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: C.gold, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Structure</div>
                    <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.5 }}>{plan?.structure}</div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: C.gold, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Target Audience</div>
                    <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.5 }}>{plan?.targetAudience}</div>
                  </div>
                  <div>
                    <div style={{ color: C.gold, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Stories</div>
                    {plan?.stories?.map((s, i) => (
                      <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ color: C.text, fontSize: 11, fontWeight: 600, marginBottom: 2 }}>{s.number}. {s.title}</div>
                        <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.3 }}>{s.synopsis}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Main editor area */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {!activeStory ? (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 24,
              color: C.dim, fontFamily: C.mono,
            }}>
              <div style={{ fontSize: 48, opacity: 0.2 }}>📚</div>
              <div style={{ fontSize: 14, opacity: 0.5 }}>No story selected</div>
              <button onClick={() => setShowArchitect(true)} style={{
                padding: "12px 28px",
                background: `linear-gradient(90deg, ${C.gold}22, ${C.crimson}22)`,
                border: `1px solid ${C.gold}55`, borderRadius: 10,
                color: C.gold, cursor: "pointer", fontFamily: C.mono, fontSize: 14, fontWeight: 700,
              }}>📚 Begin Anthology</button>
            </div>
          ) : (
            <StoryPanel
              story={activeStory}
              onDelete={() => {
                setStories(prev => prev.filter(s => s.id !== activeStory.id));
                setActiveStoryId(stories.find(s => s.id !== activeStory.id)?.id || null);
              }}
              onExpand={() => expandStory(activeStory)}
              onThemeCheck={() => themeCheckStory(activeStory)}
              onEdit={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}
