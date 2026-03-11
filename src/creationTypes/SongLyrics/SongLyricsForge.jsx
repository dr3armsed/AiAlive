// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SONG LYRICS FORGE — Interactive Song Lyrics Creation System
// Ported and adapted from CodeForge.jsx for musical lyric composition.
// Features: Lyric Architect, Verse Builder, Melody Weaver, Rhyme Master,
// Flow Analyzer, Lyric Polisher, Musical Chat.
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
  pop:         { icon: "🎤", color: C.gold,     label: "Pop"         },
  rock:        { icon: "🎸", color: C.crimson,  label: "Rock"        },
  hip_hop:     { icon: "🎤", color: C.gold,     label: "Hip-Hop"     },
  country:     { icon: "🤠", color: C.emerald,  label: "Country"     },
  folk:        { icon: "🎻", color: C.sapphire, label: "Folk"        },
  rnb:         { icon: "🎵", color: C.crimson,  label: "R&B"         },
  electronic:  { icon: "🎧", color: C.gold,     label: "Electronic"  },
  indie:       { icon: "🎸", color: C.emerald,  label: "Indie"       },
  jazz:        { icon: "🎷", color: C.sapphire, label: "Jazz"        },
  classical:   { icon: "🎼", color: C.crimson,  label: "Classical"   },
};

const ARCHETYPES = [
  { id: "love_song",      label: "Love Song",       icon: "💕", description: "Romance, heartbreak, relationships" },
  { id: "anthem",         label: "Anthem",          icon: "🎉", description: "Celebration, empowerment, unity" },
  { id: "story_song",     label: "Story Song",      icon: "📖", description: "Narrative-driven with characters and plot" },
  { id: "social_comment", label: "Social Comment",  icon: "📢", description: "Political, social, or cultural critique" },
  { id: "personal_reflect", label: "Personal Reflection", icon: "🪞", description: "Introspective, emotional journey" },
  { id: "party_hype",     label: "Party/Hype",      icon: "🎊", description: "Dance, celebration, high energy" },
  { id: "breakup_ballad", label: "Breakup Ballad",  icon: "💔", description: "Loss, grief, moving on" },
  { id: "coming_of_age",  label: "Coming of Age",   icon: "🌱", description: "Growth, change, self-discovery" },
  { id: "nature_spirit",  label: "Nature/Spirit",   icon: "🌿", description: "Environmental, spiritual themes" },
  { id: "custom",         label: "Custom Theme",    icon: "✨", description: "Describe your own lyrical approach" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => `sl_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

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

// ── Flow Meter ────────────────────────────────────────────────────────────────
function FlowMeter({ verses }) {
  const width = 380, height = 200;
  if (!verses.length) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, color:C.dim, fontFamily:C.mono, fontSize:12 }}>
      No verses yet
    </div>
  );

  const points = verses.map((v, i) => ({
    ...v,
    x: (i / Math.max(verses.length - 1, 1)) * width,
    y: height - (v.flow || 5) * 15, // Scale flow 1-10 to pixels
  }));

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height + 40}`} style={{ fontFamily: C.mono }}>
      <defs>
        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
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

      {/* Flow line */}
      {points.length > 1 && (
        <polyline
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none" stroke="url(#flowGradient)" strokeWidth={3}
        />
      )}

      {/* Verse points */}
      {points.map((p, i) => (
        <g key={p.id}>
          <circle cx={p.x} cy={p.y} r={6} fill={C.gold} stroke={C.bg} strokeWidth={2} />
          <text x={p.x} y={p.y - 10} textAnchor="middle" fill={C.text} fontSize="10" fontWeight="600">
            {p.title.length > 6 ? p.title.slice(0,6)+"…" : p.title}
          </text>
        </g>
      ))}

      {/* Labels */}
      <text x={0} y={height + 20} fill={C.dim} fontSize="10">Intro</text>
      <text x={width} y={height + 20} fill={C.dim} fontSize="10" textAnchor="end">Outro</text>
      <text x={width/2} y={height + 35} fill={C.dim} fontSize="9" textAnchor="middle">Lyric Flow & Rhythm Arc</text>
    </svg>
  );
}

// ── Verse Panel ───────────────────────────────────────────────────────────────
function VersePanel({ verse, onEdit, onDelete, onExpand, onFlowCheck }) {
  const [tab, setTab] = useState("lyrics");
  const [copied, setCopied] = useState(false);
  const lines = (verse.content || "").split("\n");

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      background: C.panel, border: `1px solid ${C.border}`,
      borderRadius: 10, overflow: "hidden", height: "100%",
    }}>
      {/* Verse header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 14px", background: C.surface,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ color: C.gold, fontFamily: C.mono, fontSize: 13, fontWeight: 700 }}>🎵</span>
        <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, flex: 1 }}>{verse.title}</span>
        {badge(verse.section || "Verse 1", C.sapphire)}
        {verse.status === "generating" && <Spin size={12} />}
        {verse.status === "done" && <StatusDot color={C.gold} />}
        {verse.status === "error" && <StatusDot color={C.crimson} />}

        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {[
            { id: "lyrics", label: "Lyrics" },
            { id: "flow",    label: "Flow"   },
            { id: "notes",   label: "Notes"  },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
              background: tab === t.id ? `${C.gold}22` : "none",
              border: `1px solid ${tab === t.id ? C.gold + "66" : "transparent"}`,
              color: tab === t.id ? C.gold : C.dim, fontFamily: C.mono,
            }}>{t.label}</button>
          ))}
          <button onClick={() => { navigator.clipboard.writeText(verse.content || ""); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
            style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer", background: "none", border: `1px solid ${C.border}`, color: copied ? C.gold : C.dim, fontFamily: C.mono }}>
            {copied ? "✓" : "copy"}
          </button>
          <button onClick={onDelete} style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, cursor: "pointer", background: "none", border: "none", color: C.dim }}>✕</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        {tab === "lyrics" && (
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
            {/* Lyrics text */}
            <pre style={{
              flex: 1, margin: 0, padding: "14px 20px",
              fontFamily: C.serif, fontSize: 16, lineHeight: "24px",
              color: "#f0e6d2", background: C.bg,
              overflowX: "auto", whiteSpace: "pre-wrap",
            }}>{verse.content || (verse.status === "generating" ? "Writing lyrics..." : "Empty verse")}</pre>
          </div>
        )}

        {tab === "flow" && (
          <div style={{ padding: 20 }}>
            {verse.flowcheck ? (
              <div>
                {/* Score row */}
                {verse.flowcheck.rhythm !== undefined && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ fontSize: 32, fontFamily: C.mono, fontWeight: 700, color: verse.flowcheck.rhythm >= 8 ? C.gold : verse.flowcheck.rhythm >= 5 ? C.emerald : C.crimson }}>
                      {verse.flowcheck.rhythm}/10
                    </div>
                    <div style={{ color: C.muted, fontSize: 13 }}>{verse.flowcheck.summary}</div>
                  </div>
                )}
                {/* Issues */}
                {verse.flowcheck.issues?.map((issue, i) => (
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
                  }}>↻ Expand Verse</button>
                </div>
              </div>
            ) : (
              <button onClick={() => onFlowCheck(verse)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Run Flow Analysis</button>
            )}
          </div>
        )}

        {tab === "notes" && (
          <div style={{ padding: 20 }}>
            {verse.notes ? (
              <pre style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{verse.notes}</pre>
            ) : (
              <button onClick={() => onEdit(verse)} style={{
                padding: "10px 20px", background: "none",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.muted, cursor: "pointer", fontSize: 13,
              }}>Add Lyric Notes</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Lyric Architect ───────────────────────────────────────────────────────────
function LyricArchitect({ onAccept, onCancel }) {
  const [step, setStep] = useState(0); // 0=archetype 1=details 2=planning 3=review
  const [archetype, setArchetype] = useState(null);
  const [genre, setGenre] = useState("pop");
  const [desc, setDesc] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const generatePlan = async () => {
    setLoading(true);
    setStep(2);
    setStatusMsg("AI is crafting the song structure...");

    const sys = `You are a master songwriter and lyricist. Design a complete song structure.
Return ONLY valid JSON: {
  "title": string,
  "hook": string,
  "genre": string,
  "mood": string[],
  "themes": [
    {
      "name": string,
      "description": string
    }
  ],
  "structure": [
    {
      "section": string (verse|chorus|bridge|intro|outro),
      "verses": number,
      "purpose": string,
      "flowLevel": number (1-10),
      "keyElements": string[]
    }
  ],
  "rhymeScheme": string,
  "tempo": string,
  "length": string
}
Generate 2-4 key themes and song structure with 4-8 verses/sections total. Be catchy yet meaningful.`;

    const msg = `Archetype: ${archetype?.label}
Genre: ${genre}
Description: ${desc || "Craft a song that resonates deeply"}
Design a complete song structure.`;

    try {
      const raw = await claude([{ role: "user", content: msg }], sys, 1200);
      const parsed = parseJSON(raw);
      if (parsed) { setPlan(parsed); setStep(3); }
      else { setStatusMsg("Parse error — please retry."); setStep(1); }
    } catch (e) {
      setStatusMsg("Song inspiration failed.");
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
            LYRIC ARCHITECT
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
              <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Choose a Song Archetype</h2>
              <p style={{ color: C.dim, fontSize: 13, marginBottom: 24, fontFamily: C.mono }}>What kind of song shall your lyrics tell?</p>
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
                  <label style={{ display: "block", color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Song Concept</label>
                  <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder={`Describe the emotional core, story, or message that drives your song...`}
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
                  }}>🎵 Craft Song</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Loading */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 280, gap: 20 }}>
              <div style={{ position: "relative" }}>
                <Spin size={52} />
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.gold, fontSize: 20 }}>🎵</span>
              </div>
              <div style={{ color: C.muted, fontFamily: C.mono, fontSize: 13 }}>{statusMsg}</div>
            </div>
          )}

          {/* Step 3: Review plan */}
          {step === 3 && plan && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ color: C.gold, fontFamily: C.mono, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{plan.title}</h2>
                <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{plan.hook}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {badge(plan.genre, C.gold)}
                  {plan.mood?.map(m => badge(m, C.emerald))}
                </div>
                <p style={{ color: C.dim, fontSize: 13, lineHeight: 1.7, fontStyle: "italic" }}>
                  {plan.rhymeScheme} · {plan.tempo} · {plan.length}
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
                      <span style={{ color: C.gold, fontFamily: C.mono, fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>🎵</span>
                      <span style={{ color: C.text, fontFamily: C.mono, fontSize: 13, width: 120, flexShrink: 0 }}>{t.name}</span>
                      <span style={{ color: C.muted, fontSize: 12, flex: 1 }}>{t.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.dim, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Structure</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.structure?.map((sect, i) => (
                    <div key={i} style={{
                      padding: "12px 16px", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                    }}>
                      <div style={{ color: C.gold, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{sect.section}</div>
                      <div style={{ color: C.muted, fontSize: 12, marginBottom: 6 }}>{sect.purpose}</div>
                      <div style={{ color: C.dim, fontSize: 11, lineHeight: 1.4 }}>
                        Flow: {sect.flowLevel}/10 · {sect.verses} verses
                      </div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4, marginTop: 4 }}>
                        {sect.keyElements?.join(" → ")}
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
                }}>🎵 Begin Song</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Musical Dialogue (with song lyrics) ────────────────────────────────────────
function MusicalDialogue({ verses, themes, onApplyEdit }) {
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

    const lyricsContext = verses.slice(0, 3).map(v =>
      `VERSE: ${v.title}\n${(v.content || "").slice(0, 400)}`
    ).join("\n\n---\n\n");

    const themeContext = themes.map(t => `${t.name}: ${t.description}`).join("; ");

    const sys = `You are a songwriter consultant and musical critic. Help develop and refine song lyrics.
Lyrics context: ${lyricsContext || "No verses yet"}
Themes: ${themeContext || "No themes yet"}

Answer the songwriter's question about their lyrics. Suggest improvements, discuss rhyme and rhythm, analyze emotional impact, or explore musicality.
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
        <span style={{ fontFamily: C.mono, fontSize: 11, color: C.emerald, letterSpacing: "0.1em" }}>MUSICAL DIALOGUE</span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 8px" }}>
        {messages.length === 0 && (
          <div style={{ color: C.dim, fontSize: 12, fontFamily: C.mono, textAlign: "center", paddingTop: 40, lineHeight: 2 }}>
            Ask about your lyrics.<br/>
            "How does this rhyme scheme work?" · "Rhythm suggestions?" · "Emotional delivery?"
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
          placeholder="Ask about your lyrics..."
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

// ── Main SongLyricsForge ──────────────────────────────────────────────────────
export default function SongLyricsForge() {
  const [verses, setVerses] = useState([]);
  const [themes, setThemes] = useState([]);
  const [activeVerseId, setActiveVerseId] = useState(null);
  const [showArchitect, setShowArchitect] = useState(false);
  const [songTitle, setSongTitle] = useState("Untitled Song");
  const [plan, setPlan] = useState(null);
  const [sidePanel, setSidePanel] = useState("flow"); // flow | chat | outline
  const [globalStatus, setGlobalStatus] = useState("");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const activeVerse = verses.find(v => v.id === activeVerseId);

  // ── Generate verse content ───────────────────────────────────────────────────
  const generateVerseContent = useCallback(async (verseId, planData, genre, allVerses, allThemes) => {
    const verseMeta = planData?.structure?.find(s => s.section === allVerses.find(av => av.id === verseId)?.section);
    const thisVerse = allVerses.find(v => v.id === verseId);
    if (!thisVerse) return;

    setVerses(prev => prev.map(v => v.id === verseId ? { ...v, status: "generating" } : v));

    const themeSummary = allThemes.map(t => `${t.name}: ${t.description}`).join("; ");
    const prevVerses = allVerses.filter(v => v.section === thisVerse.section && v.order < thisVerse.order)
      .slice(-2).map(v => `PREV: ${v.title} - ${(v.content || "").slice(0, 200)}...`).join("\n");

    const sys = `You are a master songwriter writing lyrics in ${genre} genre. Write compelling catchy lyrics.
Output ONLY the verse content — no titles, no explanations.
Write rhythmic, memorable lyrics with strong emotional impact.`;

    const msg = `Song: ${planData?.title || songTitle}
Genre: ${genre}
Themes: ${themeSummary}

This verse: ${thisVerse.title}
Section: ${thisVerse.section}, Purpose: ${verseMeta?.purpose || ""}

Previous context:
${prevVerses}

Write the complete song verse.`;

    try {
      const content = await claude([{ role: "user", content: msg }], sys, 1200);
      setVerses(prev => prev.map(v => v.id === verseId
        ? { ...v, content, status: "done", flow: verseMeta?.flowLevel || 5 }
        : v
      ));
    } catch {
      setVerses(prev => prev.map(v => v.id === verseId ? { ...v, status: "error", content: "Verse generation failed." } : v));
    }
  }, [songTitle]);

  // ── Accept song plan and generate verses ─────────────────────────────────────
  const handleAcceptPlan = useCallback(async (planData, genre) => {
    setShowArchitect(false);
    setSongTitle(planData.title);
    setPlan({ ...planData, genre });
    setIsGeneratingAll(true);

    // Create themes
    const newThemes = planData.themes?.map(t => ({
      id: uid(), name: t.name, description: t.description,
      genre, connections: []
    })) || [];
    setThemes(newThemes);

    // Create verses
    const newVerses = [];
    let verseCount = 1;
    planData.structure?.forEach(sect => {
      for (let i = 0; i < sect.verses; i++) {
        newVerses.push({
          id: uid(), title: `Verse ${verseCount}`, section: sect.section, order: i + 1,
          form: "songlyrics", content: "", status: "queued", flowcheck: null, notes: null,
          flow: sect.flowLevel || 5,
        });
        verseCount++;
      }
    });

    setVerses(newVerses);
    setActiveVerseId(newVerses[0]?.id);

    for (let i = 0; i < newVerses.length; i++) {
      setGlobalStatus(`Writing ${i + 1}/${newVerses.length}: ${newVerses[i].title}`);
      await generateVerseContent(newVerses[i].id, planData, genre, newVerses, newThemes);
      await new Promise(r => setTimeout(r, 300));
    }

    setGlobalStatus("Song lyrics draft complete.");
    setIsGeneratingAll(false);
  }, [generateVerseContent]);

  // ── Flow check verse ─────────────────────────────────────────────────────────
  const flowCheckVerse = useCallback(async (verse) => {
    if (!verse.content) return;
    setVerses(prev => prev.map(v => v.id === verse.id ? { ...v, status: "generating" } : v));

    const sys = `You are a lyric flow analyst. Analyze the verse and return ONLY JSON:
{
  "rhythm": number (1-10),
  "summary": string (one sentence),
  "issues": [
    { "severity": "high"|"med"|"low", "title": string, "detail": string }
  ]
}
Be specific about rhythm, rhyme, and musicality. Limit to 3 issues max.`;

    const raw = await claude([{ role: "user", content: `Analyze flow of this verse:\n\n${verse.content}` }], sys, 1000).catch(() => null);
    const parsed = raw ? parseJSON(raw) : null;

    setVerses(prev => prev.map(v => v.id === verse.id
      ? { ...v, status: "done", flowcheck: parsed || { rhythm: 5, summary: "Flow analysis failed.", issues: [] } }
      : s
    ));
  }, []);

  // ── Expand verse ─────────────────────────────────────────────────────────────
  const expandVerse = useCallback(async (verse) => {
    if (!verse.content) return;
    setVerses(prev => prev.map(v => v.id === verse.id ? { ...v, status: "generating" } : v));

    const sys = `You are a songwriter expanding a verse. Add more lyrical depth, better rhymes, and emotional resonance.
Return ONLY the expanded verse content — no explanations.`;

    const msg = `Expand this verse with more musicality:\n\n${verse.content}`;

    const expanded = await claude([{ role: "user", content: msg }], sys, 1200).catch(() => verse.content);
    setVerses(prev => prev.map(v => v.id === verse.id
      ? { ...v, content: expanded, status: "done", flowcheck: null }
      : v
    ));
  }, []);

  // ── Quick add verse ──────────────────────────────────────────────────────────
  const addBlankVerse = () => {
    const name = `Verse ${verses.length + 1}`;
    const newVerse = { id: uid(), title: name, section: "verse", order: verses.length + 1, form: "songlyrics", content: "", status: "queued", flowcheck: null, notes: null, flow: 5 };
    setVerses(prev => [...prev, newVerse]);
    setActiveVerseId(newVerse.id);
  };

  const doneCount = verses.filter(v => v.status === "done").length;
  const totalWords = verses.reduce((acc, v) => acc + (v.content?.split(/\s+/).length || 0), 0);

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

      {showArchitect && <LyricArchitect onAccept={handleAcceptPlan} onCancel={() => setShowArchitect(false)} />}

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "10px 20px", background: C.panel,
        borderBottom: `1px solid ${C.border}`,
        height: 50, flexShrink: 0,
      }}>
        <span style={{ fontFamily: C.mono, color: C.gold, fontSize: 14, fontWeight: 700, letterSpacing: "0.12em" }}>🎵 SONG LYRICS FORGE</span>
        <span style={{ color: C.dim, fontSize: 12, fontFamily: C.mono }}>/{songTitle}</span>

        {globalStatus && (
          <span style={{ color: C.emerald, fontFamily: C.mono, fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
            {isGeneratingAll && <Spin size={11} />}
            {globalStatus}
          </span>
        )}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          {verses.length > 0 && (
            <>
              <span style={{ fontFamily: C.mono, fontSize: 11, color: C.dim }}>
                {doneCount}/{verses.length} verses · ~{totalWords.toLocaleString()} words
              </span>
              {badge(plan?.genre || "pop", C.gold)}
            </>
          )}
          <button onClick={addBlankVerse} style={{
            padding: "5px 14px", background: "none", border: `1px solid ${C.border}`,
            borderRadius: 6, color: C.muted, cursor: "pointer", fontFamily: C.mono, fontSize: 11,
          }}>+ Verse</button>
          <button onClick={() => setShowArchitect(true)} style={{
            padding: "6px 18px",
            background: `linear-gradient(90deg, ${C.gold}22, ${C.crimson}22)`,
            border: `1px solid ${C.gold}55`, borderRadius: 7,
            color: C.gold, cursor: "pointer", fontFamily: C.mono, fontSize: 12, fontWeight: 700,
            boxShadow: `0 0 16px ${C.goldGlow}`,
          }}>🎵 New Song</button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* Verse tree sidebar */}
        <div style={{
          width: 240, flexShrink: 0, borderRight: `1px solid ${C.border}`,
          background: C.panel, display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.12em", textTransform: "uppercase" }}>Verses</span>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "8px 8px" }}>
            {verses.length === 0 && (
              <div style={{ padding: "30px 14px", color: C.dim, fontSize: 11, fontFamily: C.mono, textAlign: "center", lineHeight: 2 }}>
                No verses.<br/>Start with 🎵 New Song.
              </div>
            )}
            {verses.map(v => {
              const isActive = v.id === activeVerseId;
              return (
                <button key={v.id} onClick={() => setActiveVerseId(v.id)} style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  padding: "7px 10px", borderRadius: 6, marginBottom: 2,
                  background: isActive ? `${C.gold}18` : "none",
                  border: `1px solid ${isActive ? C.gold + "44" : "transparent"}`,
                  cursor: "pointer", textAlign: "left",
                }}>
                  <span style={{ color: C.gold, fontFamily: C.mono, fontSize: 12, width: 18, textAlign: "center", flexShrink: 0 }}>{v.section?.[0]?.toUpperCase()}</span>
                  <span style={{ color: isActive ? C.text : C.muted, fontFamily: C.mono, fontSize: 11, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.title}</span>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                    background: v.status === "done" ? C.gold : v.status === "generating" ? C.emerald : v.status === "error" ? C.crimson : C.border,
                    boxShadow: v.status === "generating" ? `0 0 6px ${C.emerald}` : "none",
                    animation: v.status === "generating" ? "pulse 1s ease-in-out infinite" : "none",
                  }} />
                </button>
              );
            })}
          </div>

          {/* Side panel tabs */}
          <div style={{ borderTop: `1px solid ${C.border}`, display: "flex" }}>
            {[
              { id: "flow", icon: "🎵", tip: "Flow Meter" },
              { id: "chat", icon: "💬", tip: "Chat"        },
              { id: "outline", icon: "📋", tip: "Outline"  },
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
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Lyric Flow & Rhythm Arc</span>
                </div>
                <div style={{ flex: 1, overflow: "auto" }}>
                  <FlowMeter verses={verses} />
                  {plan?.themes && (
                    <div style={{ padding: "0 16px 16px" }}>
                      <div style={{ fontSize: 11, color: C.dim, fontFamily: C.mono, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Themes</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {plan.themes.map(t => badge(t.name, C.emerald))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            {sidePanel === "chat" && (
              <MusicalDialogue verses={verses} themes={themes} onApplyEdit={() => {}} />
            )}
            {sidePanel === "outline" && (
              <>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Song Outline</span>
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
                  {plan?.structure?.map((sect, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ color: C.gold, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{sect.section}</div>
                      <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.5, marginBottom: 6 }}>{sect.purpose}</div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4 }}>
                        Flow: {sect.flowLevel}/10 · {sect.verses} verses
                      </div>
                      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4, marginTop: 4 }}>
                        {sect.keyElements?.join(" → ")}
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
          {!activeVerse ? (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 24,
              color: C.dim, fontFamily: C.mono,
            }}>
              <div style={{ fontSize: 48, opacity: 0.2 }}>🎵</div>
              <div style={{ fontSize: 14, opacity: 0.5 }}>No verse selected</div>
              <button onClick={() => setShowArchitect(true)} style={{
                padding: "12px 28px",
                background: `linear-gradient(90deg, ${C.gold}22, ${C.crimson}22)`,
                border: `1px solid ${C.gold}55`, borderRadius: 10,
                color: C.gold, cursor: "pointer", fontFamily: C.mono, fontSize: 14, fontWeight: 700,
              }}>🎵 Begin Song</button>
            </div>
          ) : (
            <VersePanel
              verse={activeVerse}
              onDelete={() => {
                setVerses(prev => prev.filter(v => v.id !== activeVerse.id));
                setActiveVerseId(verses.find(v => v.id !== activeVerse.id)?.id || null);
              }}
              onExpand={() => expandVerse(activeVerse)}
              onFlowCheck={() => flowCheckVerse(activeVerse)}
              onEdit={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}