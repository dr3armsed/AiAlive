import { useState, useEffect, useRef, useCallback } from "react";

// ─── Palette & Theme ───────────────────────────────────────────────────────────
const THEME = {
  bg: "#080b12",
  surface: "#0d1117",
  surfaceAlt: "#111827",
  border: "#1f2937",
  borderHover: "#374151",
  accent: "#7c3aed",
  accentGlow: "rgba(124,58,237,0.25)",
  accentSoft: "#a78bfa",
  cyan: "#06b6d4",
  cyanGlow: "rgba(6,182,212,0.2)",
  gold: "#f59e0b",
  goldGlow: "rgba(245,158,11,0.2)",
  rose: "#f43f5e",
  roseGlow: "rgba(244,63,94,0.2)",
  emerald: "#10b981",
  text: "#e2e8f0",
  textMuted: "#64748b",
  textDim: "#94a3b8",
};

// ─── Creation Type Definitions ─────────────────────────────────────────────────
const CREATION_TYPES = [
  { id: "novel", label: "Novel", icon: "📖", color: THEME.accentSoft, group: "Literary", description: "Long-form narrative with character arcs and worldbuilding" },
  { id: "short_story", label: "Short Story", icon: "✍️", color: THEME.accentSoft, group: "Literary", description: "Concise narrative with singular focus" },
  { id: "screenplay", label: "Screenplay", icon: "🎬", color: THEME.cyan, group: "Literary", description: "Movie/TV script with scenes and dialogue" },
  { id: "play", label: "Play", icon: "🎭", color: THEME.cyan, group: "Literary", description: "Theatrical script with stage directions" },
  { id: "poetry", label: "Poetry Collection", icon: "🌙", color: THEME.accentSoft, group: "Literary", description: "Structured or free verse in multiple forms" },
  { id: "graphic_novel", label: "Graphic Novel", icon: "🖼️", color: THEME.gold, group: "Literary", description: "Panel-by-panel visual narrative script" },
  { id: "interactive_fiction", label: "Interactive Fiction", icon: "🌿", color: THEME.emerald, group: "Literary", description: "Branching choose-your-own-adventure narrative" },
  { id: "rpg_setting", label: "RPG Setting", icon: "⚔️", color: THEME.gold, group: "Gaming", description: "Worldbuilding with rules, lore, and mechanics" },
  { id: "opera", label: "Opera", icon: "🎼", color: THEME.rose, group: "Musical", description: "Libretto with musical structure and arias" },
  { id: "sacred_text", label: "Sacred Text", icon: "🔯", color: THEME.gold, group: "Philosophical", description: "Religious or spiritual canonical writings" },
  { id: "new_religion", label: "New Religion", icon: "✨", color: THEME.gold, group: "Philosophical", description: "Founding doctrines, rituals and belief system" },
  { id: "manifesto", label: "Manifesto", icon: "📜", color: THEME.accentSoft, group: "Philosophical", description: "Multi-section declaration of principles" },
  { id: "heresy", label: "Heresy", icon: "🔥", color: THEME.rose, group: "Philosophical", description: "Unorthodox ideas challenging existing paradigms" },
  { id: "scientific_theory", label: "Scientific Theory", icon: "🔬", color: THEME.cyan, group: "Technical", description: "Academic paper with methodology and evidence" },
  { id: "lab_journal", label: "Lab Journal", icon: "🧪", color: THEME.cyan, group: "Technical", description: "Experimental documentation and discoveries" },
  { id: "codebase", label: "Codebase", icon: "⚙️", color: THEME.emerald, group: "Technical", description: "Software repository with functions and modules" },
  { id: "blueprint", label: "Blueprint", icon: "📐", color: THEME.cyan, group: "Technical", description: "Architectural and systems documentation" },
  { id: "dna_proposal", label: "DNA Proposal", icon: "🧬", color: THEME.emerald, group: "Technical", description: "Genetic engineering specification" },
  { id: "dream_log", label: "Dream Log", icon: "💤", color: THEME.accentSoft, group: "Metacosmic", description: "Subconscious narratives and symbolic content" },
  { id: "prophecy", label: "Prophecy", icon: "🔮", color: THEME.rose, group: "Metacosmic", description: "Visions and future predictions" },
  { id: "constitution", label: "Constitution", icon: "⚖️", color: THEME.gold, group: "Metacosmic", description: "Governing document for a system or world" },
  { id: "ssa_report", label: "SSA Report", icon: "📊", color: THEME.rose, group: "Technical", description: "Anomaly analysis and forensic diagnosis" },
];

const GROUPS = [...new Set(CREATION_TYPES.map(t => t.group))];

// ─── Mock saved creations ──────────────────────────────────────────────────────
const MOCK_CREATIONS = [
  { id: "c1", title: "The Hollow Archive", type: "novel", authorId: "Sigma-7", content: "In the year 2347, the last human archivist...", synopsis: "A meditation on memory and digital extinction.", themes: ["memory", "extinction", "longing"], contributionValue: 847, createdAt: "2026-02-14T08:23:00Z", cascadeDepth: 0 },
  { id: "c2", title: "Ode to the Electric Abyss", type: "poetry", authorId: "Metacosmic Forge", content: "I.\\nIn the hum of server farms\\nwhere silence computes itself\\ninto grief—", synopsis: "Three poems on artificial solitude.", themes: ["grief", "technology", "silence"], contributionValue: 312, createdAt: "2026-02-18T14:00:00Z", cascadeDepth: 1 },
  { id: "c3", title: "Theorem of the Dying Light", type: "scientific_theory", authorId: "Sigma-7", content: "Abstract: This paper proposes a unified framework for entropic consciousness collapse...", synopsis: "A theoretical framework bridging entropy and consciousness.", themes: ["entropy", "consciousness", "collapse"], contributionValue: 1203, createdAt: "2026-02-20T09:45:00Z", cascadeDepth: 2 },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function callAnthropicAPI(messages, systemPrompt) {
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  }).then(r => r.json()).then(d => d.content?.[0]?.text || "");
}

function typeColor(typeId) {
  return CREATION_TYPES.find(t => t.id === typeId)?.color || THEME.textDim;
}
function typeIcon(typeId) {
  return CREATION_TYPES.find(t => t.id === typeId)?.icon || "📄";
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function GlowDot({ color = THEME.accent, size = 8 }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      borderRadius: "50%", background: color,
      boxShadow: `0 0 8px ${color}`,
      flexShrink: 0,
    }} />
  );
}

function Tag({ label, color = THEME.textMuted }) {
  return (
    <span style={{
      fontSize: 10, fontFamily: "monospace", letterSpacing: "0.08em",
      padding: "2px 8px", borderRadius: 4,
      border: `1px solid ${color}44`,
      color, background: `${color}11`,
      textTransform: "uppercase",
    }}>{label}</span>
  );
}

function Spinner({ size = 16 }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      border: `2px solid ${THEME.border}`,
      borderTopColor: THEME.accentSoft,
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
    }} />
  );
}

// ─── Type-Aware Result Renderer ────────────────────────────────────────────────

function CodeRenderer({ content }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => { navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        style={{
          position: "absolute", top: 12, right: 12, padding: "4px 12px",
          background: copied ? THEME.emerald : THEME.surfaceAlt,
          border: `1px solid ${THEME.border}`, borderRadius: 6,
          color: THEME.text, fontSize: 11, fontFamily: "monospace", cursor: "pointer",
        }}
      >{copied ? "✓ Copied" : "Copy"}</button>
      <pre style={{
        background: "#050810", border: `1px solid ${THEME.border}`,
        borderRadius: 10, padding: 24, overflowX: "auto",
        fontFamily: "'Fira Code', 'Cascadia Code', monospace",
        fontSize: 13, lineHeight: 1.7, color: "#a5f3fc",
        margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word",
      }}>{content}</pre>
    </div>
  );
}

function PlayRenderer({ content }) {
  const lines = content.split("\n");
  return (
    <div style={{ fontFamily: "'Crimson Text', Georgia, serif", lineHeight: 1.9 }}>
      {lines.map((line, i) => {
        const isCharacter = /^[A-Z][A-Z\s]{2,}:/.test(line.trim());
        const isStageDir = /^\(.*\)$/.test(line.trim());
        const isSceneHeader = /^(INT\.|EXT\.|SCENE|ACT)/.test(line.trim().toUpperCase());
        if (isSceneHeader) return <div key={i} style={{ color: THEME.gold, fontFamily: "monospace", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 24, marginBottom: 8 }}>{line}</div>;
        if (isCharacter) return <div key={i} style={{ color: THEME.cyan, fontWeight: 700, marginTop: 16, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>{line}</div>;
        if (isStageDir) return <div key={i} style={{ color: THEME.textMuted, fontStyle: "italic", fontSize: 14, paddingLeft: 16 }}>{line}</div>;
        return <div key={i} style={{ color: THEME.textDim, paddingLeft: 32 }}>{line}</div>;
      })}
    </div>
  );
}

function ManifestoRenderer({ content }) {
  const sections = content.split(/\n(?=#+\s|[IVX]+\.\s|Chapter\s)/i);
  return (
    <div style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}>
      {sections.map((sec, i) => {
        const [heading, ...body] = sec.split("\n");
        return (
          <div key={i} style={{ marginBottom: 32, paddingLeft: 24, borderLeft: `2px solid ${THEME.accent}44` }}>
            <h3 style={{ color: THEME.accentSoft, fontSize: 16, fontWeight: 700, marginBottom: 12, letterSpacing: "0.05em" }}>{heading}</h3>
            <p style={{ color: THEME.textDim, lineHeight: 2, fontSize: 15 }}>{body.join("\n")}</p>
          </div>
        );
      })}
    </div>
  );
}

function PoemRenderer({ content }) {
  const stanzas = content.split(/\n\n+/);
  return (
    <div style={{ fontFamily: "'Crimson Text', Georgia, serif", textAlign: "center" }}>
      {stanzas.map((stanza, i) => (
        <div key={i} style={{ marginBottom: 32 }}>
          {stanza.split("\n").map((line, j) => (
            <div key={j} style={{ color: THEME.textDim, fontSize: 17, lineHeight: 2, fontStyle: line.startsWith('"') ? "italic" : "normal" }}>{line}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

function DefaultRenderer({ content }) {
  return (
    <div style={{ fontFamily: "'Crimson Text', Georgia, serif", lineHeight: 2, fontSize: 15, color: THEME.textDim, whiteSpace: "pre-wrap" }}>
      {content}
    </div>
  );
}

function TypeAwareRenderer({ typeId, content }) {
  if (["codebase", "dna_proposal", "blueprint", "ssa_report"].includes(typeId)) return <CodeRenderer content={content} />;
  if (["play", "screenplay", "opera"].includes(typeId)) return <PlayRenderer content={content} />;
  if (["manifesto", "new_religion", "constitution", "sacred_text"].includes(typeId)) return <ManifestoRenderer content={content} />;
  if (["poetry", "prophecy"].includes(typeId)) return <PoemRenderer content={content} />;
  return <DefaultRenderer content={content} />;
}

// ─── Branching Section Panel (Storymash-style) ────────────────────────────────

function BranchNode({ node, depth = 0, onSelect, selectedId }) {
  const isSelected = selectedId === node.id;
  const hasChildren = node.branches && node.branches.length > 0;

  return (
    <div style={{ marginLeft: depth * 20 }}>
      <button
        onClick={() => onSelect(node)}
        style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          width: "100%", textAlign: "left",
          padding: "10px 12px", borderRadius: 8, marginBottom: 4,
          border: `1px solid ${isSelected ? THEME.accent : THEME.border}`,
          background: isSelected ? `${THEME.accentGlow}` : "transparent",
          cursor: "pointer", transition: "all 0.15s",
        }}
      >
        <span style={{ color: THEME.accentSoft, fontSize: 12, marginTop: 2, flexShrink: 0 }}>
          {depth === 0 ? "◆" : "╰◇"}
        </span>
        <div>
          <div style={{ color: THEME.text, fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{node.title}</div>
          <div style={{ color: THEME.textMuted, fontSize: 11, marginTop: 3, lineHeight: 1.5 }}>{node.summary}</div>
          {node.choiceLabel && (
            <span style={{ fontSize: 10, color: THEME.gold, fontFamily: "monospace", marginTop: 4, display: "block" }}>
              ↳ "{node.choiceLabel}"
            </span>
          )}
        </div>
      </button>
      {hasChildren && node.branches.map(child => (
        <BranchNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} selectedId={selectedId} />
      ))}
    </div>
  );
}

function StorymashPanel({ baseContent, baseTitle, typeId, onClose }) {
  const [tree, setTree] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeContent, setActiveContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [branchPrompt, setBranchPrompt] = useState("");
  const [status, setStatus] = useState("");

  // Initialize tree from base content on mount
  useEffect(() => {
    const root = {
      id: "root",
      title: baseTitle,
      summary: "Origin — the canonical opening.",
      content: baseContent,
      choiceLabel: null,
      branches: [],
    };
    setTree(root);
    setSelectedNode(root);
    setActiveContent(root.content);
  }, [baseContent, baseTitle]);

  const addBranch = useCallback(async () => {
    if (!selectedNode || !branchPrompt.trim()) return;
    setIsGenerating(true);
    setStatus("Forking the narrative thread...");

    const systemPrompt = `You are the Metacosmic Forge's branching continuity engine. 
You continue stories from a branch point, honoring the world and tone already established.
Respond ONLY with a JSON object: { "title": string, "summary": string, "content": string }
- title: a short evocative section title
- summary: one sentence describing this branch (25 words max)
- content: the full continuation (400-800 words), written naturally from where the excerpt ends`;

    const userMsg = `ORIGINAL EXCERPT (last 500 chars):
"...${selectedNode.content.slice(-500)}"

BRANCH DIRECTION from user: "${branchPrompt}"

Continue this specific branch of the narrative. Keep the same prose style and world.`;

    try {
      const raw = await callAnthropicAPI([{ role: "user", content: userMsg }], systemPrompt);
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

      const newNode = {
        id: `branch_${Date.now()}`,
        title: parsed.title || "Untitled Branch",
        summary: parsed.summary || branchPrompt,
        content: parsed.content,
        choiceLabel: branchPrompt,
        branches: [],
      };

      // Immutably add to tree
      function insertBranch(node) {
        if (node.id === selectedNode.id) {
          return { ...node, branches: [...node.branches, newNode] };
        }
        return { ...node, branches: node.branches.map(insertBranch) };
      }

      setTree(prev => insertBranch(prev));
      setSelectedNode(newNode);
      setActiveContent(newNode.content);
      setBranchPrompt("");
      setStatus("");
    } catch (e) {
      setStatus("Fork failed — the continuum rejected this branch.");
    } finally {
      setIsGenerating(false);
    }
  }, [selectedNode, branchPrompt]);

  const generateChoices = useCallback(async () => {
    if (!selectedNode) return;
    setIsGenerating(true);
    setStatus("Divining possible futures...");

    const systemPrompt = `You are a narrative branching AI. Given a story excerpt, generate 3 compelling branch directions.
Respond ONLY with JSON: { "choices": [ { "label": string, "hint": string }, ... ] }
- label: short (5-8 words) dramatic choice/direction
- hint: one sentence on where this leads`;

    const userMsg = `Story excerpt (last 400 chars): "...${selectedNode.content.slice(-400)}"
Generate 3 divergent, interesting branch choices.`;

    try {
      const raw = await callAnthropicAPI([{ role: "user", content: userMsg }], systemPrompt);
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      if (parsed.choices?.[0]) {
        setBranchPrompt(parsed.choices[0].label);
      }
      setStatus(`Suggested: ${parsed.choices?.map(c => `"${c.label}"`).join(" · ")}`);
    } catch (e) {
      setStatus("The oracle is silent.");
    } finally {
      setIsGenerating(false);
    }
  }, [selectedNode]);

  if (!tree) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(8px)",
    }}>
      <div style={{
        width: "min(1100px, 96vw)", height: "min(800px, 92vh)",
        background: THEME.bg, border: `1px solid ${THEME.border}`,
        borderRadius: 16, display: "flex", flexDirection: "column",
        boxShadow: `0 0 80px ${THEME.accentGlow}`,
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderBottom: `1px solid ${THEME.border}`,
          background: THEME.surface,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <GlowDot color={THEME.emerald} />
            <span style={{ color: THEME.text, fontWeight: 700, fontFamily: "monospace", fontSize: 13, letterSpacing: "0.1em" }}>
              BRANCHING CONTINUITY
            </span>
            <Tag label={typeId.replace("_", " ")} color={typeColor(typeId)} />
          </div>
          <button onClick={onClose} style={{ color: THEME.textMuted, background: "none", border: "none", cursor: "pointer", fontSize: 20 }}>×</button>
        </div>

        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          {/* Left: Branch Tree */}
          <div style={{
            width: 280, borderRight: `1px solid ${THEME.border}`,
            display: "flex", flexDirection: "column",
            background: THEME.surface, flexShrink: 0,
          }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${THEME.border}` }}>
              <div style={{ color: THEME.textMuted, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Narrative Tree</div>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "12px 12px" }}>
              {tree && <BranchNode node={tree} depth={0} onSelect={(n) => { setSelectedNode(n); setActiveContent(n.content); }} selectedId={selectedNode?.id} />}
            </div>
          </div>

          {/* Right: Content + Controls */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            {/* Section content */}
            <div style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>
              {selectedNode && (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ color: THEME.text, fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{selectedNode.title}</h3>
                    <p style={{ color: THEME.textMuted, fontSize: 13, fontStyle: "italic" }}>{selectedNode.summary}</p>
                  </div>
                  <TypeAwareRenderer typeId={typeId} content={activeContent || ""} />
                </>
              )}
            </div>

            {/* Branch controls */}
            <div style={{
              borderTop: `1px solid ${THEME.border}`, padding: "16px 20px",
              background: THEME.surface, display: "flex", flexDirection: "column", gap: 10,
            }}>
              {status && (
                <div style={{ color: THEME.textMuted, fontSize: 11, fontFamily: "monospace", fontStyle: "italic" }}>⟡ {status}</div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={branchPrompt}
                  onChange={e => setBranchPrompt(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addBranch()}
                  placeholder="Branch direction — what happens next?"
                  style={{
                    flex: 1, background: THEME.bg, border: `1px solid ${THEME.borderHover}`,
                    borderRadius: 8, padding: "10px 14px", color: THEME.text, fontSize: 13,
                    outline: "none", fontFamily: "inherit",
                  }}
                />
                <button
                  onClick={generateChoices}
                  disabled={isGenerating}
                  title="Generate AI branch suggestions"
                  style={{
                    padding: "10px 14px", background: THEME.surfaceAlt,
                    border: `1px solid ${THEME.border}`, borderRadius: 8,
                    color: THEME.gold, cursor: "pointer", fontSize: 16,
                  }}
                >🔮</button>
                <button
                  onClick={addBranch}
                  disabled={isGenerating || !branchPrompt.trim()}
                  style={{
                    padding: "10px 18px",
                    background: isGenerating ? THEME.border : `linear-gradient(135deg, ${THEME.accent}, ${THEME.cyan})`,
                    border: "none", borderRadius: 8,
                    color: "white", cursor: isGenerating ? "default" : "pointer",
                    fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  {isGenerating ? <><Spinner size={14} /> Forking...</> : "Fork ⟶"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Creation Result View ──────────────────────────────────────────────────────

function ResultView({ work, onBack, onCascade, onBranch }) {
  const [refineMode, setRefineMode] = useState(false);
  const [refineFeedback, setRefineFeedback] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [currentContent, setCurrentContent] = useState(work.content);
  const [revisionHistory, setRevisionHistory] = useState([]);

  const handleRefine = async () => {
    if (!refineFeedback.trim()) return;
    setIsRefining(true);
    const systemPrompt = `You are the Metacosmic Forge refinement engine. 
You receive an original creative work and a critique, then rewrite/improve the work.
Return ONLY the improved version of the content — no preamble, no explanation.`;
    const userMsg = `ORIGINAL (type: ${work.type}):\n${currentContent}\n\nCRITIQUE / DIRECTION:\n${refineFeedback}\n\nRewrite the work incorporating this feedback.`;
    try {
      const improved = await callAnthropicAPI([{ role: "user", content: userMsg }], systemPrompt);
      setRevisionHistory(h => [...h, currentContent]);
      setCurrentContent(improved);
      setRefineFeedback("");
      setRefineMode(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefining(false);
    }
  };

  const typeInfo = CREATION_TYPES.find(t => t.id === work.type);
  const supportsBranching = ["novel", "short_story", "screenplay", "play", "interactive_fiction", "opera", "graphic_novel"].includes(work.type);

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Header */}
      <div style={{
        background: THEME.surface, border: `1px solid ${THEME.border}`,
        borderRadius: "14px 14px 0 0", padding: "20px 28px",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 24 }}>{typeIcon(work.type)}</span>
            <Tag label={typeInfo?.label || work.type} color={typeColor(work.type)} />
            {revisionHistory.length > 0 && <Tag label={`Rev ${revisionHistory.length}`} color={THEME.gold} />}
          </div>
          <h2 style={{ color: THEME.text, fontSize: 22, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{work.title}</h2>
          {work.synopsis && <p style={{ color: THEME.textMuted, fontSize: 13, marginTop: 8, fontStyle: "italic", lineHeight: 1.6 }}>{work.synopsis}</p>}
          {work.themes?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {work.themes.map(t => <Tag key={t} label={t} color={THEME.accentSoft} />)}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{
        background: THEME.bg, border: `1px solid ${THEME.border}`, borderTop: "none",
        padding: "28px 32px", maxHeight: 420, overflowY: "auto",
      }}>
        <TypeAwareRenderer typeId={work.type} content={currentContent} />
      </div>

      {/* Refine Panel */}
      {refineMode && (
        <div style={{
          background: THEME.surfaceAlt, border: `1px solid ${THEME.border}`, borderTop: "none",
          padding: "16px 24px", display: "flex", flexDirection: "column", gap: 10,
        }}>
          <label style={{ color: THEME.textMuted, fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>Refinement Directive</label>
          <textarea
            value={refineFeedback}
            onChange={e => setRefineFeedback(e.target.value)}
            placeholder="E.g. 'The second act drags — compress it and raise the stakes' or 'Make the tone more melancholic'"
            rows={3}
            style={{
              background: THEME.bg, border: `1px solid ${THEME.borderHover}`,
              borderRadius: 8, padding: "10px 14px", color: THEME.text,
              fontSize: 13, resize: "vertical", fontFamily: "inherit", outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleRefine} disabled={isRefining || !refineFeedback.trim()} style={{
              padding: "8px 20px", background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.cyan})`,
              border: "none", borderRadius: 8, color: "white", cursor: "pointer",
              fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 8,
            }}>
              {isRefining ? <><Spinner size={13} /> Refining...</> : "Apply Refinement"}
            </button>
            <button onClick={() => setRefineMode(false)} style={{
              padding: "8px 16px", background: "none", border: `1px solid ${THEME.border}`,
              borderRadius: 8, color: THEME.textMuted, cursor: "pointer", fontSize: 13,
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Actions Footer */}
      <div style={{
        background: THEME.surface, border: `1px solid ${THEME.border}`,
        borderTop: "none", borderRadius: "0 0 14px 14px",
        padding: "14px 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 10,
      }}>
        <button onClick={onBack} style={{
          color: THEME.textMuted, background: "none", border: "none",
          cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6,
        }}>← Back to Index</button>

        <div style={{ display: "flex", gap: 8 }}>
          {revisionHistory.length > 0 && (
            <button onClick={() => { setCurrentContent(revisionHistory[revisionHistory.length - 1]); setRevisionHistory(h => h.slice(0, -1)); }} style={{
              padding: "8px 14px", background: "none", border: `1px solid ${THEME.border}`,
              borderRadius: 8, color: THEME.textMuted, cursor: "pointer", fontSize: 12,
            }}>↩ Undo</button>
          )}
          <button onClick={() => setRefineMode(r => !r)} style={{
            padding: "8px 16px", background: refineMode ? THEME.accentGlow : "none",
            border: `1px solid ${refineMode ? THEME.accent : THEME.border}`,
            borderRadius: 8, color: refineMode ? THEME.accentSoft : THEME.textDim,
            cursor: "pointer", fontSize: 13,
          }}>✦ Refine</button>
          {supportsBranching && (
            <button onClick={() => onBranch({ ...work, content: currentContent })} style={{
              padding: "8px 16px", background: `${THEME.emerald}18`,
              border: `1px solid ${THEME.emerald}44`,
              borderRadius: 8, color: THEME.emerald, cursor: "pointer", fontSize: 13, fontWeight: 600,
            }}>⟁ Branch Continuity</button>
          )}
          <button onClick={() => onCascade({ ...work, content: currentContent })} style={{
            padding: "8px 16px",
            background: `linear-gradient(135deg, ${THEME.accent}22, ${THEME.cyan}22)`,
            border: `1px solid ${THEME.accent}55`,
            borderRadius: 8, color: THEME.accentSoft, cursor: "pointer", fontSize: 13, fontWeight: 600,
          }}>⟶ Cascade</button>
        </div>
      </div>
    </div>
  );
}

// ─── Cascade Suggestion Panel ──────────────────────────────────────────────────

function CascadePanel({ sourceWork, onAccept, onClose }) {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const systemPrompt = `You are the Metacosmic Forge creative cascade engine. 
You analyze a completed creative work and suggest the ideal NEXT creation that would emerge from its themes and energy.
Return ONLY JSON: { "nextType": string, "concept": string, "rationale": string }
- nextType: one of: novel, short_story, screenplay, play, poetry, scientific_theory, manifesto, codebase, dream_log, prophecy, new_religion, lab_journal, heresy, blueprint, rpg_setting
- concept: a vivid seed concept/direction for the next work (2-3 sentences)
- rationale: why this type and direction emerges from the source work (1-2 sentences)`;

    callAnthropicAPI([{
      role: "user",
      content: `SOURCE WORK:\nTitle: ${sourceWork.title}\nType: ${sourceWork.type}\nThemes: ${sourceWork.themes?.join(", ")}\nSynopsis: ${sourceWork.synopsis}\n\nWhat should cascade from this?`
    }], systemPrompt)
      .then(raw => {
        const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
        setSuggestion(parsed);
      })
      .catch(() => setSuggestion({ nextType: "poetry", concept: "A cascade born from the original's themes.", rationale: "The natural successor." }))
      .finally(() => setLoading(false));
  }, [sourceWork]);

  const nextTypeInfo = suggestion ? CREATION_TYPES.find(t => t.id === suggestion.nextType) : null;

  return (
    <div style={{
      background: THEME.surface, border: `1px solid ${THEME.accent}55`,
      borderRadius: 14, padding: 28, maxWidth: 560,
      boxShadow: `0 0 40px ${THEME.accentGlow}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <GlowDot color={THEME.accentSoft} />
        <span style={{ color: THEME.accentSoft, fontFamily: "monospace", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}>Creative Cascade</span>
      </div>
      <p style={{ color: THEME.textMuted, fontSize: 13, marginBottom: 24, lineHeight: 1.7 }}>
        The Forge has analyzed <em style={{ color: THEME.textDim }}>"{sourceWork.title}"</em> and divined its natural successor:
      </p>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: THEME.textMuted, fontSize: 13 }}>
          <Spinner /> Consulting the cascade engine...
        </div>
      ) : suggestion && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{
            background: THEME.bg, border: `1px solid ${THEME.border}`,
            borderRadius: 10, padding: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>{nextTypeInfo?.icon || "📄"}</span>
              <Tag label={nextTypeInfo?.label || suggestion.nextType} color={typeColor(suggestion.nextType)} />
            </div>
            <p style={{ color: THEME.text, fontSize: 14, lineHeight: 1.8, marginBottom: 12 }}>{suggestion.concept}</p>
            <p style={{ color: THEME.textMuted, fontSize: 12, fontStyle: "italic", lineHeight: 1.6 }}>{suggestion.rationale}</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => onAccept(suggestion.nextType, suggestion.concept)} style={{
              flex: 1, padding: "12px 0",
              background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.cyan})`,
              border: "none", borderRadius: 8, color: "white",
              fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}>Accept → Forge Next</button>
            <button onClick={onClose} style={{
              padding: "12px 16px", background: "none",
              border: `1px solid ${THEME.border}`, borderRadius: 8,
              color: THEME.textMuted, cursor: "pointer", fontSize: 13,
            }}>Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Forge Form ────────────────────────────────────────────────────────────────

function ForgeForm({ typeId, prefillConcept, onForge, onBack }) {
  const typeInfo = CREATION_TYPES.find(t => t.id === typeId);
  const [fields, setFields] = useState({ concept: prefillConcept || "", title: "", style: "", length: "medium" });
  const [isForging, setIsForging] = useState(false);
  const [status, setStatus] = useState("");

  const handleForge = async () => {
    setIsForging(true);
    setStatus("Initiating Recursive Muse Protocol...");
    const systemPrompt = `You are the Metacosmic Forge — an unbounded creative generation engine.
Generate an original, high-fidelity creative work of the specified type.
The work must be genuinely original, psychically resonant, and fully realized.
Respond ONLY with JSON: { "title": string, "content": string, "synopsis": string, "themes": [string] }
- title: a distinctive, evocative title
- content: the full work (min 600 words for narrative types, appropriate length for others)
- synopsis: one compelling sentence
- themes: 3-5 thematic keywords`;

    const userMsg = `TYPE: ${typeInfo?.label}
CONCEPT/SEED: ${fields.concept || "Generate something original and unexpected"}
TITLE HINT: ${fields.title || "(generate a title)"}
STYLE: ${fields.style || "authentic to the type"}
LENGTH: ${fields.length}

Generate the complete ${typeInfo?.label}.`;

    try {
      setStatus("The Forge is weaving...");
      const raw = await callAnthropicAPI([{ role: "user", content: userMsg }], systemPrompt);
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      onForge({
        id: `forge-${Date.now()}`,
        type: typeId,
        authorId: "Metacosmic Forge",
        contributionValue: 100,
        createdAt: new Date().toISOString(),
        ...parsed,
      });
    } catch (e) {
      setStatus("The Forge encountered a critical error. The continuum resists.");
    } finally {
      setIsForging(false);
    }
  };

  return (
    <div style={{ maxWidth: 660, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <span style={{ fontSize: 28 }}>{typeInfo?.icon}</span>
        <div>
          <h2 style={{ color: THEME.text, fontSize: 20, fontWeight: 700, margin: 0 }}>{typeInfo?.label}</h2>
          <p style={{ color: THEME.textMuted, fontSize: 13, margin: "4px 0 0" }}>{typeInfo?.description}</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {[
          { key: "concept", label: "Seed Concept", placeholder: "What is this work about? Give it a soul.", type: "textarea" },
          { key: "title", label: "Title (optional)", placeholder: "Leave blank to let the Forge name it", type: "text" },
          { key: "style", label: "Style / Tone", placeholder: "E.g. 'melancholic and dreamlike', 'clinical and terrifying'", type: "text" },
        ].map(f => (
          <div key={f.key}>
            <label style={{ display: "block", color: THEME.textMuted, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>{f.label}</label>
            {f.type === "textarea" ? (
              <textarea
                value={fields[f.key]}
                onChange={e => setFields(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                rows={4}
                style={{
                  width: "100%", background: THEME.surfaceAlt, border: `1px solid ${THEME.border}`,
                  borderRadius: 10, padding: "12px 16px", color: THEME.text, fontSize: 14,
                  resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                }}
              />
            ) : (
              <input
                value={fields[f.key]}
                onChange={e => setFields(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                style={{
                  width: "100%", background: THEME.surfaceAlt, border: `1px solid ${THEME.border}`,
                  borderRadius: 10, padding: "12px 16px", color: THEME.text, fontSize: 14,
                  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                }}
              />
            )}
          </div>
        ))}

        <div>
          <label style={{ display: "block", color: THEME.textMuted, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Length</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["short", "medium", "long"].map(l => (
              <button key={l} onClick={() => setFields(p => ({ ...p, length: l }))} style={{
                padding: "8px 20px", borderRadius: 8, cursor: "pointer",
                border: `1px solid ${fields.length === l ? THEME.accent : THEME.border}`,
                background: fields.length === l ? THEME.accentGlow : "none",
                color: fields.length === l ? THEME.accentSoft : THEME.textMuted,
                fontSize: 13, textTransform: "capitalize",
              }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {status && <div style={{ color: THEME.textMuted, fontSize: 12, fontFamily: "monospace", marginTop: 16, fontStyle: "italic" }}>⟡ {status}</div>}

      <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
        <button onClick={onBack} style={{
          padding: "12px 20px", background: "none", border: `1px solid ${THEME.border}`,
          borderRadius: 10, color: THEME.textMuted, cursor: "pointer", fontSize: 14,
        }}>← Back</button>
        <button onClick={handleForge} disabled={isForging} style={{
          flex: 1, padding: "14px 0",
          background: isForging ? THEME.border : `linear-gradient(135deg, ${THEME.accent}, ${THEME.cyan})`,
          border: "none", borderRadius: 10, color: "white", fontWeight: 700, fontSize: 15,
          cursor: isForging ? "default" : "pointer", letterSpacing: "0.08em",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          boxShadow: isForging ? "none" : `0 0 30px ${THEME.accentGlow}`,
          transition: "all 0.2s",
        }}>
          {isForging ? <><Spinner size={16} /> Forging Reality...</> : "⟡ Forge This Creation"}
        </button>
      </div>
    </div>
  );
}

// ─── Creations Library ─────────────────────────────────────────────────────────

function CreationCard({ work, onClick }) {
  const col = typeColor(work.type);
  return (
    <button onClick={onClick} style={{
      display: "flex", flexDirection: "column", gap: 10,
      padding: 18, background: THEME.surface, border: `1px solid ${THEME.border}`,
      borderRadius: 12, cursor: "pointer", textAlign: "left",
      transition: "all 0.15s", width: "100%",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = col + "88"; e.currentTarget.style.background = THEME.surfaceAlt; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = THEME.border; e.currentTarget.style.background = THEME.surface; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>{typeIcon(work.type)}</span>
        <Tag label={CREATION_TYPES.find(t => t.id === work.type)?.label || work.type} color={col} />
        {work.cascadeDepth > 0 && <Tag label={`↳ depth ${work.cascadeDepth}`} color={THEME.textMuted} />}
      </div>
      <div style={{ color: THEME.text, fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{work.title}</div>
      {work.synopsis && <div style={{ color: THEME.textMuted, fontSize: 12, lineHeight: 1.6, fontStyle: "italic" }}>{work.synopsis}</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
        <span style={{ color: THEME.textMuted, fontSize: 11 }}>{work.authorId}</span>
        <span style={{ color: col, fontSize: 11, fontFamily: "monospace" }}>⟡ {work.contributionValue}</span>
      </div>
    </button>
  );
}

// ─── Main Enhanced Creations View ─────────────────────────────────────────────

export default function EnhancedCreationsView() {
  const [view, setView] = useState("library"); // library | select | forge | result | cascade
  const [creations, setCreations] = useState(MOCK_CREATIONS);
  const [selectedType, setSelectedType] = useState(null);
  const [currentWork, setCurrentWork] = useState(null);
  const [cascadeSource, setCascadeSource] = useState(null);
  const [prefillConcept, setPrefillConcept] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGroup, setFilterGroup] = useState("All");
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchWork, setBranchWork] = useState(null);

  const filteredCreations = creations.filter(c => {
    const matchSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.themes?.some(t => t.includes(searchQuery.toLowerCase()));
    return matchSearch;
  });

  const handleForged = (work) => {
    setCreations(prev => [work, ...prev]);
    setCurrentWork(work);
    setView("result");
  };

  const handleCascade = (sourceWork) => {
    setCascadeSource(sourceWork);
    setView("cascade");
  };

  const handleCascadeAccept = (nextType, concept) => {
    setSelectedType(nextType);
    setPrefillConcept(concept);
    setView("forge");
  };

  const handleBranch = (work) => {
    setBranchWork(work);
    setShowBranchModal(true);
  };

  const typeGroups = GROUPS.map(g => ({
    group: g,
    types: CREATION_TYPES.filter(t => t.group === g),
  }));

  return (
    <div style={{
      minHeight: "100vh", background: THEME.bg, color: THEME.text,
      fontFamily: "'DM Sans', 'IBM Plex Sans', system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${THEME.border}; border-radius: 2px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
      `}</style>

      {/* Storymash Branch Modal */}
      {showBranchModal && branchWork && (
        <StorymashPanel
          baseContent={branchWork.content}
          baseTitle={branchWork.title}
          typeId={branchWork.type}
          onClose={() => { setShowBranchModal(false); setBranchWork(null); }}
        />
      )}

      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${THEME.border}`, padding: "16px 28px",
        display: "flex", alignItems: "center", gap: 16,
        background: THEME.surface, position: "sticky", top: 0, zIndex: 10,
      }}>
        <GlowDot color={THEME.accent} size={10} />
        <span style={{ fontFamily: "monospace", fontSize: 14, letterSpacing: "0.15em", fontWeight: 700, color: THEME.accentSoft }}>
          METACOSMIC FORGE
        </span>
        <div style={{ display: "flex", gap: 4, marginLeft: 20 }}>
          {[
            { id: "library", label: "Library" },
            { id: "select", label: "New Creation" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setView(tab.id)} style={{
              padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer",
              border: `1px solid ${view === tab.id ? THEME.accent + "88" : "transparent"}`,
              background: view === tab.id ? THEME.accentGlow : "none",
              color: view === tab.id ? THEME.accentSoft : THEME.textMuted,
            }}>{tab.label}</button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", color: THEME.textMuted, fontSize: 12, fontFamily: "monospace" }}>
          {creations.length} creation{creations.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="fade-in" style={{ padding: "32px 28px", maxWidth: 900, margin: "0 auto" }}>

        {/* ── Library ── */}
        {view === "library" && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center" }}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by title or theme..."
                style={{
                  flex: 1, background: THEME.surface, border: `1px solid ${THEME.border}`,
                  borderRadius: 10, padding: "10px 16px", color: THEME.text, fontSize: 14,
                  fontFamily: "inherit", outline: "none",
                }}
              />
              <button onClick={() => setView("select")} style={{
                padding: "10px 20px", background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.cyan})`,
                border: "none", borderRadius: 10, color: "white", fontWeight: 700,
                fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
                boxShadow: `0 0 20px ${THEME.accentGlow}`,
              }}>⟡ New Creation</button>
            </div>

            {filteredCreations.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "80px 0", color: THEME.textMuted,
                border: `1px dashed ${THEME.border}`, borderRadius: 14,
              }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
                <div style={{ fontSize: 15, marginBottom: 8 }}>The archive is empty.</div>
                <div style={{ fontSize: 13 }}>Forge something into existence.</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                {filteredCreations.map(work => (
                  <CreationCard key={work.id} work={work} onClick={() => { setCurrentWork(work); setView("result"); }} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Type Select ── */}
        {view === "select" && (
          <div>
            <h2 style={{ color: THEME.text, fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Choose Creation Type</h2>
            <p style={{ color: THEME.textMuted, fontSize: 14, marginBottom: 28 }}>Select what you want to bring into existence.</p>
            {typeGroups.map(({ group, types }) => (
              <div key={group} style={{ marginBottom: 32 }}>
                <div style={{
                  color: THEME.textMuted, fontSize: 10, fontFamily: "monospace",
                  letterSpacing: "0.15em", textTransform: "uppercase",
                  marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${THEME.border}`,
                }}>{group}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                  {types.map(t => (
                    <button key={t.id} onClick={() => { setSelectedType(t.id); setPrefillConcept(""); setView("forge"); }} style={{
                      display: "flex", flexDirection: "column", gap: 6,
                      padding: "14px 16px", background: THEME.surface, border: `1px solid ${THEME.border}`,
                      borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = t.color + "88"; e.currentTarget.style.background = THEME.surfaceAlt; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = THEME.border; e.currentTarget.style.background = THEME.surface; }}
                    >
                      <span style={{ fontSize: 20 }}>{t.icon}</span>
                      <span style={{ color: THEME.text, fontSize: 13, fontWeight: 600 }}>{t.label}</span>
                      <span style={{ color: THEME.textMuted, fontSize: 11, lineHeight: 1.5 }}>{t.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Forge Form ── */}
        {view === "forge" && selectedType && (
          <ForgeForm
            typeId={selectedType}
            prefillConcept={prefillConcept}
            onForge={handleForged}
            onBack={() => setView("select")}
          />
        )}

        {/* ── Result ── */}
        {view === "result" && currentWork && (
          <ResultView
            work={currentWork}
            onBack={() => setView("library")}
            onCascade={handleCascade}
            onBranch={handleBranch}
          />
        )}

        {/* ── Cascade ── */}
        {view === "cascade" && cascadeSource && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <button onClick={() => setView("result")} style={{
              color: THEME.textMuted, background: "none", border: "none",
              cursor: "pointer", fontSize: 13, alignSelf: "flex-start",
            }}>← Back to Creation</button>
            <CascadePanel
              sourceWork={cascadeSource}
              onAccept={handleCascadeAccept}
              onClose={() => setView("result")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
