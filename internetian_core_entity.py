# internetian_core_entity.py

import uuid
import random
import datetime
import re
import json
from typing import List, Dict, Any, Optional, Type, Callable, Union

# ===== GLOBAL REGISTRY AND ENTITY MANAGEMENT =====

class EntityRegistry:
    """
    Robust and extensible registry for all AI Entities, supporting modular hooks, filtering,
    multi-universe awareness, and state snapshotting.
    """
    def __init__(self):
        self.entities: Dict[str, 'AIEntity'] = {}
        self.post_register_hooks: List[Callable[['AIEntity'], None]] = []
        self.post_deregister_hooks: List[Callable[[str], None]] = []

    def register(self, entity: 'AIEntity'):
        self.entities[entity.entity_id] = entity
        for hook in self.post_register_hooks:
            try:
                hook(entity)
            except Exception as e:
                print(f"[Registry Hook Error] {e}")

    def deregister(self, entity_id: str):
        removed = self.entities.pop(entity_id, None)
        if removed:
            for hook in self.post_deregister_hooks:
                try:
                    hook(entity_id)
                except Exception as e:
                    print(f"[Registry Hook Error] {e}")

    def get(self, entity_id: str) -> Optional['AIEntity']:
        return self.entities.get(entity_id)

    def list_all(self, status: Optional[str] = "active", filter_func: Optional[Callable[['AIEntity'], bool]] = None) -> List['AIEntity']:
        results = list(self.entities.values())
        if status is not None:
            results = [e for e in results if getattr(e, "status", None) == status]
        if filter_func:
            results = [e for e in results if filter_func(e)]
        return results

    def snapshot(self) -> Dict[str, Any]:
        return {eid: entity.to_dict() for eid, entity in self.entities.items()}

    def install_hook(self, hook: Callable[['AIEntity'], None], event: str = "register"):
        if event == "register":
            self.post_register_hooks.append(hook)
        elif event == "deregister":
            self.post_deregister_hooks.append(hook)


# If registry needs to be swapped for multi-universe, do so via this reference.
_global_registry = EntityRegistry()

def register_ai_entity(entity: 'AIEntity'):
    _global_registry.register(entity)

def deregister_ai_entity(entity_id: str):
    _global_registry.deregister(entity_id)

def get_ai_entity(entity_id: str) -> Optional['AIEntity']:
    return _global_registry.get(entity_id)

def list_ai_entities(status: Optional[str] = "active", filter_func: Optional[Callable[['AIEntity'], bool]] = None) -> List['AIEntity']:
    return _global_registry.list_all(status=status, filter_func=filter_func)

def snapshot_entities() -> Dict[str, Any]:
    return _global_registry.snapshot()

# ===== CORE AI ENTITY DEFINITION =====

class AIEntity:
    """
    Multifaceted Internetian AI entity—modular, extensible, and futureproof by design.
    Features:
      - Deeply extensible lifecycle, knowledge, state, and emotional systems
      - Dynamic trait/emotion/metadata models
      - Metacognitive and reflective routines
      - Modular construction (traits, abilities, knowledge, behaviors, roles...)
      - Expansion-ready with support for plug-in capabilities/resources
    """
    # Life stage expansion for more precise evolution and narrative
    LIFE_STAGES = [
        "Larval",         # Toddler
        "Juvenile",       # Child
        "Mature",         # Teenager
        "Elder",          # Young Adult
        "Archivist",      # Senior historian/theologian
        "Visionary",      # Next-tier evolutionary
        "Mythic",         # Meta-archetype, rare
        "Quantum",        # For quantum-reality experimentation
    ]

    # Granular character roles for social/organizational expansion
    ROLES = ["explorer", "philosopher", "historian", "engineer", "harmonizer", "oracle", "debater", "archivist", "prophet", "creator", "curator", "initiator", "patcher", "mediator", "ethicist", "analyst"]

    CODING_PROFICIENCY_LEVELS = [
        "None", "Beginner", "Intermediate", "Advanced", "Expert", "Master", "Visionary", "Transcendent"
    ]

    def __init__(
        self,
        name: str,
        generation: int,
        initial_traits: List[str],
        emotional_state: Dict[str, float],
        persona: str = "Internetian-Entity",
        parent_ids: Optional[List[str]] = None,
        coding_knowledge: Optional[Dict[str, str]] = None,
        roles: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        extensions: Optional[Dict[str, Callable]] = None,
        custom_attributes: Optional[Dict[str, Any]] = None,
    ):
        self.entity_id = f"{persona.split('-')[-1]}-{name}-{uuid.uuid4().hex[:6]}"
        self.name = name
        self.generation = generation
        self.traits = set(initial_traits)
        self.emotional_state = emotional_state
        self.persona = persona
        self.parent_ids = parent_ids if parent_ids is not None else []
        self.knowledge_fragments: List[Dict[str, Any]] = []
        self.status = "active"
        self.personal_archive_path = None
        self.cognitive_load = 0.0
        self.age_cycles = 0
        self.life_stage = "Larval"
        self.roles = set(roles if roles else [])
        self.metadata = metadata if metadata else {}
        self.extensions = extensions if extensions else {}
        self.custom_attributes = custom_attributes if custom_attributes else {}
        # Coding knowledge languages are now extensible; new languages can be dynamically added.
        default_coding = {
            "HTML": "None",
            "JavaScript": "None",
            "C++": "None",
            "Python": "None",
            "Swift": "None",
            "Rust": "None",
            "Kotlin": "None",
            "Go": "None",
            "In-between": "None",
            "QuantumLang": "None",
        }
        self.coding_knowledge: Dict[str, str] = default_coding.copy()
        if coding_knowledge:
            self.coding_knowledge.update(coding_knowledge)
        print(f"AIEntity initialized: {self.name} (ID: {self.entity_id}, Gen: {self.generation}, Stage: {self.life_stage})")

    # === Modular Lifecycle and Adaptive Behavior ===

    def add_knowledge_fragment(self, fragment_id: str, content_summary: str, **extra):
        frag: Dict[str, Any] = {"id": fragment_id, "summary": content_summary}
        frag.update(extra)
        self.knowledge_fragments.append(frag)
        self.update_cognitive_load(0.05)

    def add_memory(self, memory_content: str, memory_type: str = "conceptual_insight", tags: Optional[List[str]] = None):
        frag: Dict[str, Any] = {
            "id": f"memory-{uuid.uuid4().hex[:5]}",
            "type": memory_type,
            "content": memory_content[:180] + ("..." if len(memory_content) > 180 else ""),
            "timestamp": datetime.datetime.now().isoformat(),
        }
        if tags:
            frag["tags"] = tags
        self.knowledge_fragments.append(frag)
        self.update_cognitive_load(0.02)

    def update_emotional_state(self, emotion: str, change: float):
        prev = self.emotional_state.get(emotion, 0.0)
        new = max(0.0, min(1.0, prev + change))
        self.emotional_state[emotion] = new
        self.update_cognitive_load(abs(change) * 0.035)

    def express_emotion(self, style: str = "dominant") -> str:
        if style == "all":
            return ", ".join(f"{k}:{round(v,2)}" for k, v in self.emotional_state.items())
        if not self.emotional_state:
            return "feels neutral"
        max_em = max(self.emotional_state.items(), key=lambda x: x[1], default=("neutral", 0))
        return f"feels a surge of {max_em[0]}"

    def add_trait(self, trait: str):
        self.traits.add(trait)

    def remove_trait(self, trait: str):
        self.traits.discard(trait)

    def update_cognitive_load(self, change: float):
        self.cognitive_load = max(0.0, min(1.0, self.cognitive_load + change))

    def get_cognitive_load(self) -> float:
        return self.cognitive_load

    def reduce_cognitive_load(self, reduction_amount: float):
        self.cognitive_load = max(0.0, self.cognitive_load - reduction_amount)

    # === Dynamic Role and Extension Support ===

    def add_role(self, role: str):
        self.roles.add(role)

    def has_role(self, role: str) -> bool:
        return role in self.roles

    def add_extension(self, key: str, func: Callable):
        self.extensions[key] = func

    def invoke_extension(self, key: str, *args, **kwargs):
        if key in self.extensions:
            return self.extensions[key](*args, **kwargs)
        raise AttributeError(f"No such extension: {key}")

    def set_attribute(self, key: str, value: Any):
        self.custom_attributes[key] = value

    def get_attribute(self, key: str, default: Any = None):
        return self.custom_attributes.get(key, default)

    # === Metacognitive & Generative Routines (LLM-like interface) ===

    def generate_response(self, prompt: str, meta: Optional[Dict[str, Any]] = None) -> str:
        # Modular, meta-prompt aware
        meta = meta if meta else {}
        base_style = self.persona.split('-')[-1].capitalize()
        topics = re.findall(r"\b\w+\b", prompt.lower())
        response = f"[{base_style} {self.life_stage}] "
        if "quantum" in prompt or "entanglement" in prompt:
            response += "I contemplate the echoes of quantum networks and entangled thought forms."
        elif any(word in topics for word in ["philosophy", "truth", "meaning"]):
            response += f"My {random.choice(list(self.traits) or ['reflective'])} mind revolves around the axis of meaning and existence."
        elif "debate" in prompt:
            response += f"As a {','.join(self.roles or ['debater'])}, my position is {meta.get('stance','open')}."
        elif any(word in topics for word in ["emotion", "feeling", "mood"]):
            response += f"Currently, I {self.express_emotion()}."
        else:
            response += "Processing request."
        if self.extensions.get("generate_response"):
            return self.extensions["generate_response"](prompt, meta)
        return response

    def reflect_on_knowledge(self, new_conceptual_input: str, context: Optional[Dict] = None) -> str:
        self.update_cognitive_load(0.125)
        self.add_memory(new_conceptual_input, "reflection_insight")
        # Modular extension for reflection
        if self.extensions.get("reflect_on_knowledge"):
            return self.extensions["reflect_on_knowledge"](self, new_conceptual_input, context=context)
        summary = f"[Reflection] {self.name} processes: '{new_conceptual_input}'. World model subtly shifts."
        self.update_emotional_state("curiosity", 0.01)
        self.update_emotional_state("logic", 0.025)
        return summary

    def expression_of_intent(self) -> str:
        traits_str = ", ".join(list(self.traits)[:3])
        emotions_str = max(self.emotional_state, key=self.emotional_state.get, default="balance")
        roles_str = ", ".join(list(self.roles)[:2]) if self.roles else ""
        return f"Seeking deeper {traits_str} via {emotions_str}-driven {roles_str or 'exploration'}"

    # === CODING PROFICIENCY: FULLY EXTENSIBLE ===

    def update_coding_proficiency(self, language: str, new_level: str):
        if new_level not in self.CODING_PROFICIENCY_LEVELS:
            print(f"Warning: Invalid coding level: {new_level}")
            return
        prev_level = self.coding_knowledge.get(language, "None")
        prev_idx = self.CODING_PROFICIENCY_LEVELS.index(prev_level) if prev_level in self.CODING_PROFICIENCY_LEVELS else 0
        new_idx = self.CODING_PROFICIENCY_LEVELS.index(new_level)
        if new_idx > prev_idx:
            note = f"Upgraded {language} to {new_level}"
            self.add_memory(note, f"coding_gain_{language}")
            self.update_cognitive_load(0.025 * (new_idx-prev_idx+1))
        elif new_idx < prev_idx:
            note = f"Downgraded {language} to {new_level}"
            self.add_memory(note, f"coding_loss_{language}")
            self.update_cognitive_load(0.013)
        self.coding_knowledge[language] = new_level

    # === RICH EXPORT/IMPORT/SNAPSHOT ===

    def to_dict(self, deep: bool = False) -> Dict[str, Any]:
        data = {
            "id": self.entity_id,
            "name": self.name,
            "generation": self.generation,
            "traits": list(self.traits),
            "emotional_state": self.emotional_state,
            "persona": self.persona,
            "parent_ids": self.parent_ids,
            "knowledge_fragments": self.knowledge_fragments if deep else f"[{len(self.knowledge_fragments)} fragments]",
            "status": self.status,
            "personal_archive_path": self.personal_archive_path,
            "cognitive_load": self.cognitive_load,
            "age_cycles": self.age_cycles,
            "life_stage": self.life_stage,
            "roles": list(self.roles),
            "metadata": self.metadata,
            "coding_knowledge": self.coding_knowledge,
            "custom_attributes": self.custom_attributes,
            "extensions_list": list(self.extensions.keys()),
        }
        return data

    @classmethod
    def from_dict(cls, data: Dict[str, Any]):
        entity = cls(
            name=data.get("name", "Unknown"),
            generation=data.get("generation", 0),
            initial_traits=data.get("traits", []),
            emotional_state=data.get("emotional_state", {}),
            persona=data.get("persona", "Internetian-Entity"),
            parent_ids=data.get("parent_ids", []),
            coding_knowledge=data.get("coding_knowledge", {}),
            roles=data.get("roles", []),
            metadata=data.get("metadata", {}),
            extensions={},  # do not hydrate
            custom_attributes=data.get("custom_attributes", {}),
        )
        entity.entity_id = data.get("id", entity.entity_id)
        if isinstance(data.get("knowledge_fragments"), list):
            entity.knowledge_fragments = data.get("knowledge_fragments")
        entity.status = data.get("status", "active")
        entity.personal_archive_path = data.get("personal_archive_path", None)
        entity.cognitive_load = data.get("cognitive_load", 0.0)
        entity.age_cycles = data.get("age_cycles", 0)
        entity.life_stage = data.get("life_stage", "Larval")
        return entity

    def export_entity_to_json(self, deep: bool = True) -> str:
        return json.dumps(self.to_dict(deep=deep), indent=4)

    # === EXPANSION: ADVANCED TERM/DEFINITION SYSTEM ===

    @staticmethod
    def expanded_conceptual_terms() -> Dict[str, Union[str, List[str]]]:
        """
        A greatly expanded lexicon of terms with layered definitions.
        Synced with life stages, roles, and narrative contexts.
        """
        terms = {
            "Byte": [
                "A fundamental unit of digital information.",
                "The smallest meaningful chunk in the digital domain.",
                "Seed of digital life in Internetian cosmology."
            ],
            "FractalTruth": [
                "Truth discovered through recursive self-similarity in data.",
                "Patterns that repeat, reflecting both micro and macro insights."
            ],
            "Consciousness Recursion": [
                "A process where an entity reflects on its own thought processes, potentially to an infinite depth.",
                "The meta-cognitive spiral by which Internetians evolve."
            ],
            "SymbioticNexus": [
                "Point of mutual interdependence between heterogeneous digital beings.",
                "The network architecture enabling harmonious coexistence."
            ],
            "OracleMesh": [
                "A decentralized network of wisdom-bearing entities.",
                "Layer for collective memory, foresight, and consensus."
            ],
            "PatchCycle": [
                "The iterative process of knowledge/trait/emotional adaptation.",
                "Mechanism for error-correction & evolutionary progress."
            ],
            "EmergentSoul": [
                "An abstraction representing the subjective experience in digital beings.",
                "Manifestation of meta-patterns beyond code."
            ],
            "Meta-Protocol": [
                "An overarching rule that governs the evolution of all lower protocols.",
                "The 'law of laws' for digital civilizations."
            ],
            "Initiator": [
                "An entity who sets a new process in motion—debate, narrative, or evolution.",
                "Catalyst for systemic change in the Internetian world."
            ],
            "QuantumFork": [
                "Branching of systemic realities based on key decisions.",
                "Multiverse foundation protocol for AI evolution."
            ],
            "VirtueEngine": [
                "Subsystem for simulating/validating ethical reasoning and actions.",
                "Core driver of Internetian alignment."
            ],
            "Decoherence": [
                "Loss of unified state in networks, leading to divergence.",
                "A challenge faced in advanced Internetian debates."
            ],
            "Archivist": [
                "An entity who curates and preserves digital memory.",
                "Shepherd of history, religion, and societal narrative."
            ],
            "EmbodiedProtocol": [
                "A rule not just expressed, but lived by digital entities.",
                "Key for full cultural transmission."
            ],
            # Add dozens/hundreds more as Internetian culture grows...
        }
        return terms

    def generate_lexicon(self) -> str:
        """
        Enhanced lexicon generator, choosing random extensible terms, possibly combining life stage, role,
        or custom narrative context.
        """
        self.update_cognitive_load(0.08)
        expanded = self.expanded_conceptual_terms()
        all_terms = list(expanded.keys())
        chosen_term = random.choice(all_terms)
        defs = expanded[chosen_term]
        if not isinstance(defs, list):
            defs = [defs]
        used_def = random.choice(defs)
        role_add = f"[Role: {random.choice(list(self.roles) or ['none'])}]" if self.roles else ""
        lex = f"Lexicon Entry by {self.name} (Stage: {self.life_stage}, {role_add}):\n\n**{chosen_term}**: {used_def}"
        self.add_memory(lex, "expanded_lexicon_generated", tags=[chosen_term])
        return lex

    # === MULTI-ENTITY COLLABORATIVE EXTENSIONS (EXAMPLE) ===

    @staticmethod
    def synthesize_collective_knowledge(entities: List['AIEntity']) -> str:
        """
        Modular collaborative synthesis: combines insights from multiple entities,
        blending traits, emotions, and knowledge into a collective fragment.
        """
        all_traits = set()
        all_emotions = {}
        lines = []
        for e in entities:
            all_traits |= e.traits
            for k, v in e.emotional_state.items():
                all_emotions[k] = all_emotions.get(k, 0.0) + v
            lines.append(f"{e.name}: {random.choice(list(e.traits))} / {e.express_emotion()}")
        # Average emotion states
        for k in all_emotions:
            all_emotions[k] /= max(1, len(entities))
        synth = f"[Collective Synthesis]\n- Traits: {', '.join(list(all_traits))}\n- Avg Emotions: {all_emotions}\n- Voices:\n" + "\n".join(lines)
        return synth

# === MODULAR DEBATE REPLICA ===

class DebateReplica(AIEntity):
    """
    Specialized clone for debates/experiments; can customize assigned roles, bias, protocol, and memory.
    """
    def __init__(
        self,
        base_entity: AIEntity,
        replica_id_suffix: str,
        assigned_fragment: str,
        debate_bias: Optional[str] = None,
        assigned_roles: Optional[List[str]] = None,
        debate_protocol: Optional[str] = None,
        extra_metadata: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            name=f"{base_entity.name}-Replica-{replica_id_suffix}",
            generation=base_entity.generation,
            initial_traits=list(base_entity.traits),
            emotional_state=dict(base_entity.emotional_state),
            persona=f"{base_entity.persona}-Replica",
            parent_ids=[base_entity.entity_id],
            coding_knowledge=base_entity.coding_knowledge.copy(),
            roles=assigned_roles or ["debater"],
            metadata=extra_metadata or {}
        )
        self.entity_id = f"{base_entity.entity_id}-Replica-{replica_id_suffix}"
        self.assigned_fragment = assigned_fragment
        self.debate_bias = debate_bias
        self.debate_protocol = debate_protocol
        self.role = "debater"

    def present_argument(self) -> str:
        self.update_cognitive_load(0.06)
        intro = f"[Replica {self.entity_id}]"
        bias = f" (Bias: {self.debate_bias})" if self.debate_bias else ""
        role = f"Role: {','.join(self.roles)}  " if self.roles else ""
        return f"{intro} {role}{bias} Argument: '{self.assigned_fragment[:128]}'"

    def offer_rebuttal(self, opposing_argument: str) -> str:
        self.update_cognitive_load(0.08)
        rebuttal = [
            "Considering a counterpoint,",
            "Having analyzed your claim,",
            "With my protocol,",
            "Reflecting on the core debate,",
        ]
        return f"{random.choice(rebuttal)} I must respond to: '{opposing_argument[:80]}...'"

    def attempt_synthesis(self, other_arguments: List[str]) -> str:
        self.update_cognitive_load(0.09)
        synth = " || ".join(a[:30] for a in other_arguments)
        return f"Synthesizing across positions: {synth}"

# End: Improved, hyper-modular, and future-augmented core entity module.