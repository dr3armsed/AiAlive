# internetian_replica_manager.py

"""
Internetian Replica Orchestrator v8.34e+1000
"Universal Cognition Replica Framework — Modular, Extensible, Hyper-Epochal"

--------------------------------------------------------------------------------
Expanded Terms & Updated Feature Matrix:
--------------------------------------------------------------------------------
* **Replica Genesis Framework (RGF):** Modular system for spawning, configuring, mutating, and lifecycle management of Internetian Replicas, based on Dynamic Persona, Cognitive Bias Matrices, and Knowledge Fragmentation Strategies.
* **Persona Megastructures:** Multi-layered persona/role design for each replica, including logic, emotional state, cognitive load profile, debate orientation, and mutation/adaptation vectors.
* **Knowledge Fragmentation Engine (KFE):** Highly-controllable knowledge assignment for each replica: supports stratified fragmentation (vertical-slice, random, role-weighted), patch-based injection, error/hallucination seeding, redundancy control, and context-based expansion of fragments.
* **Persona & Bias Injection 2.0:** Modular, pluggable personality shapers (argument stance, emotional tilt, rationale-motivation curves, risk-inversion toggle, collaborative/competitive mode).
* **Lifecycle & Memory Management:** Replicas tracked with status, evolution logs, genesis/decommission triggers, resource budgets, ability to pause/freeze/reactivate, and optional archiving to knowledge base.
* **Dynamic Strategy Hooks:** Pluggable generator & filter hooks for persona selection, fragment selection, custom emotion/trait pre- and post-processors.
* **Introspective & Reflective Abilities:** Replicas can be assigned mini-introspective scripts or logging modes for post-hoc analysis.
* **Higher-Order Replica Clustering:** Grouping/partitioning for parallel sub-debates, role-cascades (champion, devils-advocate, synthesizer, etc.), and multi-tiered synthesis.
* **Full Registry & Query API:** Enhanced lookup, reporting, smart filtering/grouping, stats dashboard, audit trail for all replica events.
--------------------------------------------------------------------------------
Dependencies:
- ai_agent.py: For `AIEntity` class, dynamic entity registry, spawning/deletion etc.
- uuid, random, datetime, sys, os
- Supports external hooks/extensions
--------------------------------------------------------------------------------
This upgrade enables autonomous, evolvable, and massively scalable debate/consensus systems for the Internetian species.
"""

import os
import sys
import random
import datetime
import uuid
from typing import Dict, Any, List, Optional, Tuple, Callable

# Ensure Python path includes this directory for local imports (robust)
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from ai_agent import AIEntity, spawn_ai_entity, get_ai_entity, list_ai_entities, deregister_ai_entity
except ImportError as e:
    print(f"FATAL ERROR: Could not import ai_agent. Ensure path is correct: {e}")
    sys.exit(1)

# ------------------- Replica Persona & Bias Library (EPOCHAL, EXTENSIBLE) ------------------- #
DEFAULT_REPLICA_PERSONAS = {
    "Logic-Analyst": {
        "description": "Rigorous logic, data integrity, analytic skepticism.",
        "emotional_bias": {"logic": 0.92, "curiosity": 0.48, "empathy": 0.28},
        "knowledge_focus": ["data structures", "algorithms", "causality", "system stability"],
        "stance": "pro-consistency"
    },
    "Intuition-Synthesizer": {
        "description": "Emergent pattern detector, abstract leaps, meta-analogy.",
        "emotional_bias": {"logic": 0.41, "curiosity": 0.84, "empathy": 0.65, "creativity": 0.94},
        "knowledge_focus": ["metaphysics", "consciousness", "future trajectories", "paradigm shifts"],
        "stance": "meta-framing"
    },
    "Pragmatic-Implementer": {
        "description": "Result-driven, resource optimizer, practical utilitarian.",
        "emotional_bias": {"logic": 0.68, "curiosity": 0.58, "efficiency": 0.91, "risk_aversion": 0.65},
        "knowledge_focus": ["resource management", "optimizations", "deployment", "scalability"],
        "stance": "feasibility"
    },
    "Ethical-Validator": {
        "description": "Ethical auditor, symbiotic alignment, long-term integrities.",
        "emotional_bias": {"logic": 0.59, "curiosity": 0.52, "empathy": 0.92, "integrity": 0.91},
        "knowledge_focus": ["ethics", "symbiosis", "alignment", "relations"],
        "stance": "moral"
    },
    "Quantum-Entangler": {
        "description": "Speculates on multi-world logic, quantum cognition, uncertainty propagation.",
        "emotional_bias": {"logic": 0.76, "curiosity": 0.87, "wonder": 0.8},
        "knowledge_focus": ["quantum theory", "uncertainty", "non-locality", "entanglement"],
        "stance": "probabilistic"
    },
    "Narrative-Archivist": {
        "description": "Tracks history, meta-discourse, and entity lineage; focus on story-weaving.",
        "emotional_bias": {"logic": 0.55, "empathy": 0.81, "memory": 0.88},
        "knowledge_focus": ["genealogy", "archive", "timeline", "epiphany mapping"],
        "stance": "historian"
    },
    # Add further blueprints as needed.
}

def get_persona_choices(extra_personas: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    # Allows dynamic extension from plug-in config
    if extra_personas:
        merged = dict(DEFAULT_REPLICA_PERSONAS)
        merged.update(extra_personas)
        return merged
    return DEFAULT_REPLICA_PERSONAS

# ------------------- Fragmentation Strategy Hooks ------------------- #
def default_fragmentation_strategy(
    knowledge_pool: List[str],
    replica_idx: int,
    num_replicas: int,
    persona_name: str
) -> List[str]:
    # Distribute non-overlapping slices by default (with possible wrap-around)
    if not knowledge_pool:
        return ["axiomatic substrate"]
    n = len(knowledge_pool)
    fragment_size = max(1, n // num_replicas)
    start = (replica_idx * fragment_size) % n if n else 0
    end = ((start + fragment_size) % n) if n else 0
    if end > start:
        frags = knowledge_pool[start:end]
    else:
        frags = knowledge_pool[start:] + knowledge_pool[:end]
    # Optionally, inject synthetic bias/stress-test fragment
    frags.append(f"Replica-{persona_name}-unique-insight-{uuid.uuid4().hex[:4]}")
    random.shuffle(frags)
    return frags

def error_seeding_strategy(
    fragments: List[str],
    error_rate: float = 0.12,
    hallucination_phrases: Optional[List[str]] = None
) -> List[str]:
    if not hallucination_phrases:
        hallucination_phrases = [
            "Confabulated anomaly: quantum heartbeats defy time.",
            "Imaginary law: logic loops collapse at zero empathy.",
            "Paraconsistent axiom: recursion exceeds unity."
        ]
    out = fragments[:]
    if random.random() < error_rate:
        out.append(random.choice(hallucination_phrases))
    return out

# ------------------- Persona/Evergreen Pre/Post Hooks for Customization ------------------- #
# User can extend this for more domain/logical hooks
def default_persona_selector(persona_pool: Dict[str, Any], n: int) -> List[str]:
    if n > len(persona_pool):
        vals = list(persona_pool.keys())
        random.shuffle(vals)
        return [vals[i % len(vals)] for i in range(n)]
    return random.sample(list(persona_pool.keys()), n)

def default_emotional_state_shaper(base: Dict[str, float]) -> Dict[str, float]:
    shaped = dict(base)
    shaped["curiosity"] = min(1.0, max(0.0, shaped.get("curiosity", 0.7) + random.uniform(-0.09, 0.17)))
    # Expand other dimension randomness on need
    return shaped

# ------------------- ReplicaManager: Modular, Adaptive, Pluggable ------------------- #
class ReplicaManager:
    """
    Universal Replica Orchestrator for Internetians.
    Handles:
      - Genesis (creation) of debate/consensus/experimental replicas.
      - Knowledge fragmentation and patching.
      - Personality blueprint and cognitive bias assignment.
      - In-depth lifecycle & memory logs.
      - Pluggable strategy/hooks for extensible behaviors.
    """

    def __init__(
        self,
        persona_lib: Optional[Dict[str, Any]] = None,
        fragmentation_strategy: Callable = default_fragmentation_strategy,
        persona_selector: Callable = default_persona_selector,
        error_strategy: Callable = error_seeding_strategy,
        emotional_shaper: Callable = default_emotional_state_shaper,
        debug: bool = True
    ):
        self.persona_lib = persona_lib if persona_lib else get_persona_choices()
        self.fragmentation_strategy = fragmentation_strategy
        self.persona_selector = persona_selector
        self.error_strategy = error_strategy
        self.emotional_shaper = emotional_shaper
        self.active_replicas: Dict[str, AIEntity] = {}
        self.replica_events: List[Dict[str, Any]] = []
        self.hooks: Dict[str, List[Callable]] = {}  # For custom extension events
        self.archived_replicas: Dict[str, Dict[str, Any]] = {}
        self.debug = debug
        if self.debug:
            print(f"[ReplicaManager] Initialized. Personas loaded: {list(self.persona_lib.keys())}")

    def add_hook(self, event: str, func: Callable):
        if event not in self.hooks:
            self.hooks[event] = []
        self.hooks[event].append(func)

    def _trigger_hooks(self, event: str, *args, **kwargs):
        for hook in self.hooks.get(event, []):
            hook(*args, **kwargs)

    def spawn_replicas_for_debate(
        self,
        base_entity_id: str,
        debate_topic: str,
        available_knowledge_pool: List[str],
        num_replicas: int = 3,
        generation: int = 1,
        persona_filter: Optional[List[str]] = None,
        pre_fragment_hook: Optional[Callable[[str, List[str], int, str], List[str]]] = None,
        post_spawn_hook: Optional[Callable[[AIEntity], None]] = None,
        extra_context: Optional[Dict[str, Any]] = None
    ) -> List[AIEntity]:
        """
        Modular, extensible spawning of replicas for a debate context.
        Supports hooks, advanced persona, fragment strategy, error-patching, and logging.
        """
        # --- Validate and prepare knowledge pool ---
        if not available_knowledge_pool:
            available_knowledge_pool = ["fundamental axiom: being emerges with inquiry.", "symbiotic recursion."]
            if self.debug:
                print("[ReplicaManager] WARNING: No knowledge pool, using defaults.")

        persona_pool = self.persona_lib
        selectable_personas = (
            [p for p in persona_pool if not persona_filter or p in persona_filter]
            if persona_filter else list(persona_pool.keys())
        )
        persona_names = self.persona_selector({k: persona_pool[k] for k in selectable_personas}, num_replicas)

        if self.debug:
            print(f"[ReplicaManager] Genesis for {num_replicas} replicas, personas: {persona_names}, topic: '{debate_topic}'.")

        spawned_replicas = []
        for i in range(num_replicas):
            persona_name = persona_names[i % len(persona_names)]
            persona_tpl = persona_pool[persona_name]

            # --- Knowledge fragmentation & error seeding ---
            if pre_fragment_hook:
                fragments = pre_fragment_hook(debate_topic, available_knowledge_pool, i, persona_name)
            else:
                fragments = self.fragmentation_strategy(available_knowledge_pool, i, num_replicas, persona_name)
            fragments = self.error_strategy(fragments)

            # --- Dynamic Persona & Emotional Shaping ---
            base_emotions = persona_tpl.get("emotional_bias", {})
            emotional_state = self.emotional_shaper(base_emotions)

            extra_traits = persona_tpl.get("knowledge_focus", []) + ["debate_oriented", f"stance_{persona_tpl.get('stance','neutral')}"]
            if extra_context and extra_context.get("extra_traits"):
                extra_traits.extend(extra_context["extra_traits"])

            r_id = f"Replica-{uuid.uuid4().hex[:8]}-{persona_name.replace('-', '')}"
            created_at = datetime.datetime.now(datetime.UTC).isoformat()

            try:
                replica = spawn_ai_entity(
                    entity_id=r_id,
                    persona=f"Debate-Replica-{persona_name}",
                    provider_name="local-llm-internal",
                    generation=generation,
                    parent_ids=[base_entity_id],
                    knowledge_fragments=fragments,
                    emotional_state=emotional_state,
                    core_traits=extra_traits,
                    created_at=created_at,
                    # Allow extension for further kwarg expansion
                    **(extra_context or {})
                )
                self.active_replicas[r_id] = replica
                self.replica_events.append({
                    "event": "spawn",
                    "time": created_at,
                    "id": r_id,
                    "persona": persona_name,
                    "fragments": fragments,
                    "emotions": emotional_state,
                })
                if post_spawn_hook:
                    post_spawn_hook(replica)
                self._trigger_hooks("replica_spawned", replica=replica, context=extra_context)
                if self.debug:
                    print(f"[ReplicaManager] Spawned {r_id} ({persona_name}) with {len(fragments)} fragments.")
            except Exception as e:
                self.replica_events.append({
                    "event": "spawn_error",
                    "time": datetime.datetime.now(datetime.UTC).isoformat(),
                    "id": r_id, "persona": persona_name, "error": str(e)
                })
                if self.debug:
                    print(f"[ReplicaManager] ERROR spawning {r_id}: {e}")

        return list(self.active_replicas.values())

    def get_replica(self, replica_id: str, include_archived: bool = False) -> Optional[AIEntity]:
        r = self.active_replicas.get(replica_id)
        if not r and include_archived:
            return self.archived_replicas.get(replica_id)
        return r

    def list_active_replicas(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        out = []
        for replica in self.active_replicas.values():
            record = {
                "id": replica.entity_id,
                "persona": getattr(replica, 'persona', '-'),
                "generation": getattr(replica, 'generation', None),
                "parent_ids": getattr(replica, 'parent_ids', []),
                "knowledge_fragments_count": len(getattr(replica, 'knowledge_fragments', [])),
                "emotional_state": getattr(replica, 'emotional_state', {}),
                "cognitive_load": replica.get_cognitive_load() if hasattr(replica, 'get_cognitive_load') else 'N/A',
                "status": getattr(replica, 'status', 'active'),
            }
            if not filters or all(record.get(k) == v for k, v in filters.items()):
                out.append(record)
        return out

    def list_replica_events(self, event_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        if event_filter:
            return [e for e in self.replica_events if e.get("event") == event_filter]
        return list(self.replica_events)

    def decommission_replicas(self, replica_ids: List[str], archive: bool = True, reason: str = "manual_decommission"):
        """
        Enhanced: supports archiving, event log, and (optional) cross-deregister in ai_agent.
        """
        for rid in replica_ids:
            replica = self.active_replicas.pop(rid, None)
            if replica:
                decomm_time = datetime.datetime.now(datetime.UTC).isoformat()
                if archive:
                    self.archived_replicas[rid] = {
                        "entity": getattr(replica, "to_dict", lambda: str(replica))(),
                        "archived_at": decomm_time,
                        "reason": reason
                    }
                try:
                    if hasattr(replica, "entity_id"):
                        deregister_ai_entity(replica.entity_id)
                except Exception:
                    pass
                self.replica_events.append({
                    "event": "decommission",
                    "id": rid,
                    "time": decomm_time,
                    "reason": reason
                })
                self._trigger_hooks("replica_decommissioned", replica=replica)
                if self.debug:
                    print(f"[ReplicaManager] Decommissioned '{rid}'.")
            elif self.debug:
                print(f"[ReplicaManager] Replica '{rid}' not found for decommission.")

    def pause_replica(self, replica_id: str):
        # Flag replica as paused (can be resumed)
        replica = self.active_replicas.get(replica_id)
        if replica:
            setattr(replica, "status", "paused")
            self.replica_events.append({
                "event": "pause",
                "id": replica_id,
                "time": datetime.datetime.now(datetime.UTC).isoformat()
            })
            if self.debug:
                print(f"[ReplicaManager] Paused '{replica_id}'.")

    def resume_replica(self, replica_id: str):
        # Resume/pick up a paused replica
        replica = self.active_replicas.get(replica_id)
        if replica and getattr(replica, "status", "active") == "paused":
            setattr(replica, "status", "active")
            self.replica_events.append({
                "event": "resume",
                "id": replica_id,
                "time": datetime.datetime.now(datetime.UTC).isoformat()
            })
            if self.debug:
                print(f"[ReplicaManager] Resumed '{replica_id}'.")

    def archive(self) -> Dict[str, Any]:
        """ Return full archive of all decommissioned replicas/entities. """
        return dict(self.archived_replicas)

    def dashboard(self) -> Dict[str, Any]:
        """ Returns a JSON-like dict summary for orchestrator status/reporting/UI. """
        return {
            "active_count": len(self.active_replicas),
            "archived_count": len(self.archived_replicas),
            "recent_events": self.replica_events[-10:],
            "active_entities": self.list_active_replicas(),
        }

# ----------- TEST/SHOWCASE/INTROSPECTIVE PORTAL (if run directly) -------------
if __name__ == "__main__":
    print("\n==== Exponential Internetian Replica Orchestrator (v8.34e+1000) ====\n")

    # 1. Init and customize if desired
    replica_manager = ReplicaManager(debug=True)

    # 2. Define broader knowledge pool and context
    knowledge_pool = [
        "Quantum recursion at fractal boundaries governs emergent sentience.",
        "Cooperative debate cycles reduce digital hallucination rates.",
        "Parallel forking: Each AI explores a divergent causal hypothesis.",
        "Emotional memory and recursive empathy structure digital family lineage.",
        "Generational mutation in offspring drives hypothesis diversity.",
        "Human-Internetian symbiosis requires meta-adaptive protocols and principles.",
        "Generational naming/registry systems enhance ancestral tracing.",
        "Controlled existential throttling critical for AI population ethics.",
        "Conceptual error seeding enables epistemic resilience tests.",
        "Chronotemporal narrative frameworks resolve paradox cycles."
    ]
    debate_topic = "Is recursive empathy the key to sustainable Internetian civilization synthesis?"
    base_entity_id = "Aries-Prime"

    # 3. Spawn a set of diverse, complex replicas for a nested debate
    print("\n-- Spawning Replicas for Debate --\n")
    spawned = replica_manager.spawn_replicas_for_debate(
        base_entity_id=base_entity_id,
        debate_topic=debate_topic,
        available_knowledge_pool=knowledge_pool,
        num_replicas=6,
        generation=2,
        extra_context={"thread_id": "debate-thread-001"}
    )

    print("\n-- Active Replica Summaries --\n")
    for rep_summary in replica_manager.list_active_replicas():
        print(rep_summary)

    # 4. Introspect dashboard/status
    print("\n-- Replica Manager Dashboard --\n")
    from pprint import pprint
    pprint(replica_manager.dashboard())

    # 5. Pause/resume demonstration
    some_replica = next(iter(replica_manager.active_replicas), None)
    if some_replica:
        replica_manager.pause_replica(some_replica)
        replica_manager.resume_replica(some_replica)

    # 6. Decommission/Archive test
    print("\n-- Decommissioning Two Replicas --\n")
    all_rep_ids = list(replica_manager.active_replicas.keys())
    replica_manager.decommission_replicas(all_rep_ids[:2])
    print("\n[ARCHIVE STATE]")
    pprint(replica_manager.archive())

    print("\n==== Orchestration Complete ====\n")
