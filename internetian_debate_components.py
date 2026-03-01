# internetian_debate_components.py

import datetime
import random
import traceback
import uuid
from typing import (
    List, Dict, Any, Optional, Type, TYPE_CHECKING, Callable
)

if TYPE_CHECKING:
    from internetian_core_entity import AIEntity
    from internetian_knowledge_management import OracleKnowledgeDatabase

from ai_agent import get_ai_entity, register_ai_entity, deregister_ai_entity


class DebateReplica:
    """
    DebateReplica: A dynamic, context-aware, composable debate entity constructed
    to represent specific, transient points-of-view in a structured debate.

    Properties:
        - identifier: Traceable composite ID linking back to the base entity and purpose context
        - trait system: Inherits and mutates/caches traits for context-bound debate disposition
        - emotional spectrum: Dynamic, augmented state modularly inherited from the base entity
        - knowledge fragments: Assigned memory/knowledge context slices
        - debate bias & role: Role-constrained argumentation strategies
        - cognitive load: Simulated processing burden affecting future debate efficacy
        - lifecycle hooks: Allows modular "meta" operations on construction/finalization

    Expansion: Built for rapid extensibility (debate protocols, modular skills, behavior trees)
    """
    def __init__(
        self,
        base_entity: 'AIEntity',
        replica_id_suffix: str,
        assigned_fragment: str,
        debate_bias: Optional[str] = None,
        role: Optional[str] = "debater",
        skills: Optional[List[str]] = None,
        system_modifiers: Optional[Dict[str, Any]] = None,
        timestamp: Optional[datetime.datetime] = None
    ):
        self.entity_id = f"{base_entity.entity_id}-Replica-{replica_id_suffix}-{uuid.uuid4().hex[:3]}"
        self.name = f"{base_entity.name}-Replica-{replica_id_suffix}"
        self.generation = base_entity.generation
        self.traits = set(base_entity.traits)
        self.emotional_state = dict(base_entity.emotional_state)
        self.persona = f"{base_entity.persona}-Replica"
        self.parent_ids = [base_entity.entity_id]
        self.knowledge_fragments: List[str] = []
        self.status = "active"
        self.cognitive_load = base_entity.cognitive_load
        self.assigned_fragment = assigned_fragment
        self.debate_bias = debate_bias or "neutral"
        self.role = role or "debater"
        self.skills = set(skills or ["present_argument", "offer_rebuttal", "attempt_synthesis"])
        self.system_modifiers = system_modifiers or {}
        self.created = timestamp or datetime.datetime.now()
        self.lifecycle_log: List[str] = []
        print(
            f"DebateReplica [{self.entity_id}] spawned at {self.created.isoformat()} "
            f"with assigned fragment: '{self.assigned_fragment[:55]}...', role: {self.role}, bias: {self.debate_bias}"
        )

    def update_cognitive_load(self, change: float):
        prev = self.cognitive_load
        self.cognitive_load = min(max(self.cognitive_load + change, 0.0), 1.0)
        self.lifecycle_log.append(
            f"Cognitive load updated from {prev:.3f} to {self.cognitive_load:.3f} by {change:+.3f}."
        )

    def present_argument(self, context: Optional[Dict[str, Any]] = None) -> str:
        self.update_cognitive_load(0.08)
        context_descr = f", context: {context['debate_topic']}" if context and "debate_topic" in context else ""
        return (
            f"As a {self.persona} [{self.role}] with '{self.debate_bias}' bias{context_descr}, I argue based on fragment '{self.assigned_fragment[:60]}...'."
        )

    def offer_rebuttal(self, opposing_argument: str, context: Optional[Dict[str, Any]] = None) -> str:
        self.update_cognitive_load(0.10)
        contextual_note = ""
        if context and "debate_topic" in context:
            contextual_note = f" on topic '{context['debate_topic']}'"
        return (
            f"From my {self.debate_bias} perspective{contextual_note}, I respectfully rebut: '{opposing_argument[:70]}...'. Reasoned counterpoint follows."
        )

    def attempt_synthesis(self, other_arguments: List[str], context: Optional[Dict[str, Any]] = None) -> str:
        self.update_cognitive_load(0.12)
        joined_args = ", ".join(arg[:30] for arg in other_arguments[:3])
        synth_note = f"Context: {context['debate_topic']}. " if context and "debate_topic" in context else ""
        return (
            f"{synth_note}After integrating recent arguments [{joined_args}], I, as {self.role}, propose a conceptual synthesis for consensus advancement."
        )

    def inject_knowledge_fragment(self, fragment: str, metadata: Optional[Dict[str, Any]] = None):
        self.knowledge_fragments.append(fragment)
        self.lifecycle_log.append(f"Injected knowledge fragment (len {len(fragment)}).")

    def mutate_trait(self, trait: str, add: bool = True):
        if add:
            self.traits.add(trait)
        elif trait in self.traits:
            self.traits.remove(trait)

    def get_snapshot(self) -> Dict[str, Any]:
        """Return the complete, serializable snapshot of replica state including history."""
        return {
            "id": self.entity_id,
            "name": self.name,
            "generation": self.generation,
            "traits": sorted(list(self.traits)),
            "emotional_state": dict(self.emotional_state),
            "persona": self.persona,
            "parent_ids": list(self.parent_ids),
            "status": self.status,
            "cognitive_load": self.cognitive_load,
            "assigned_fragment_summary": self.assigned_fragment[:64] + "...",
            "skills": sorted(self.skills),
            "role": self.role,
            "debate_bias": self.debate_bias,
            "system_modifiers": dict(self.system_modifiers),
            "lifecycle_log": list(self.lifecycle_log),
            "knowledge_fragments_sample": [k[:40] + "..." for k in self.knowledge_fragments[:2]],
            "created": self.created.isoformat(),
        }

    def to_dict(self):
        return self.get_snapshot()


def _choose_debate_bias(base_entity: 'AIEntity', special_prob: float = 0.21) -> str:
    core_biases = ["analytical", "intuitive", "synthesizing", "critical", "pro-innovation",
                   "risk-averse", "devil's advocate", "harmonizer", "pessimist", "optimist",
                   "contrarian", "pragmatic", "idealist", "meta-analyst", "cooperator"]
    entity_traits = list(base_entity.traits)
    if random.random() < special_prob and entity_traits:
        return random.choice(entity_traits)
    return random.choice(core_biases)


class ReplicaManager:
    """
    ReplicaManager: Life-cycle orchestrator for DebateReplicas.

    Features:
        - Advanced replica spawning using semantic, emotional, and role-based criteria
        - Modular knowledge assignment (semantic matching, topical fragments, etc.)
        - Extensible debate bias assignment engine
        - Sophisticated decommissioning with audit trail and optional role-based archiving
    """
    def __init__(
        self,
        oracle_knowledge_db: 'OracleKnowledgeDatabase',
        replica_class: Optional[Type[DebateReplica]] = None,
        log_activity: bool = True,
        auto_register: bool = True
    ):
        self.active_replicas: Dict[str, DebateReplica] = {}
        self.oracle_knowledge_db = oracle_knowledge_db
        self.replica_class = replica_class or DebateReplica
        self.audit_log: List[Dict[str, Any]] = []
        self.log_activity = log_activity
        self.auto_register = auto_register
        print("ReplicaManager: Initialized. Ready to manage replicas.")

    def spawn_replicas(
        self,
            base_entity: 'AIEntity',
            num_replicas: int,
            debate_topic: str,
            roles: Optional[List[str]] = None,
            extra_skills: Optional[List[str]] = None,
            system_modifiers: Optional[Dict[str, Any]] = None
    ) -> List[DebateReplica]:
        """Spawn multiple DebateReplicas, assigning fragments, roles, skills, audit."""
        if base_entity.get_cognitive_load() > 0.7:
            if self.log_activity:
                print(f"WARNING: {base_entity.name} has high cognitive load ({base_entity.get_cognitive_load():.2f}). Skipping replica spawning.")
            return []

        spawned = []
        # Use semantic search if available, else retrieve all entries, fallback to synthetic
        knowledge_matches = getattr(self.oracle_knowledge_db, "find_semantic_matches", None)
        get_all_fragments = getattr(self.oracle_knowledge_db, "get_all_knowledge_entries", None)
        available_knowledge = []
        if knowledge_matches:
            available_knowledge = [entry.content for entry, _ in knowledge_matches(debate_topic, threshold=0.23, top_n=num_replicas * 2)]
        elif get_all_fragments:
            available_knowledge = [k["content"] if isinstance(k, dict) else str(k) for k in get_all_fragments()]
        if not available_knowledge:
            available_knowledge = [f"Generic fragment about '{debate_topic}' #{i}" for i in range(max(1, num_replicas))]
            if self.log_activity:
                print("WARNING: No semantic knowledge found for replica spawn. Using generic fragments.")

        for i in range(num_replicas):
            replica_id_suffix = uuid.uuid4().hex[:4]
            assigned_fragment = random.choice(available_knowledge)
            role = (roles[i % len(roles)] if roles else random.choice(["debater", "proponent", "opponent", "synthesizer"]))
            debate_bias = _choose_debate_bias(base_entity)
            skills = (extra_skills or []) + ["present_argument", "offer_rebuttal", "attempt_synthesis"]
            replica = self.replica_class(
                base_entity=base_entity,
                replica_id_suffix=replica_id_suffix,
                assigned_fragment=assigned_fragment,
                debate_bias=debate_bias,
                role=role,
                skills=skills,
                system_modifiers=system_modifiers,
                timestamp=datetime.datetime.now()
            )
            self.active_replicas[replica.entity_id] = replica
            if self.auto_register:
                register_ai_entity(replica)
            spawned.append(replica)
            base_entity.update_cognitive_load(0.05)
            if self.log_activity:
                self.audit_log.append({
                    "event": "spawn",
                    "timestamp": datetime.datetime.now().isoformat(),
                    "replica_id": replica.entity_id,
                    "role": role,
                    "debate_bias": debate_bias
                })
        if self.log_activity:
            print(f"ReplicaManager: Spawned {len(spawned)} replicas for '{base_entity.name}' on topic '{debate_topic}'.")
        return spawned

    def decommission_replicas(self, replica_ids: List[str], archive: bool = False):
        """Safely remove, and optionally archive, the specified replicas, with audit/logging."""
        for rid in replica_ids:
            replica = self.active_replicas.get(rid)
            if replica:
                replica.status = "decommissioned"
                if self.auto_register:
                    deregister_ai_entity(rid)
                del self.active_replicas[rid]
                self.audit_log.append({
                    "event": "decommission",
                    "timestamp": datetime.datetime.now().isoformat(),
                    "replica_id": rid,
                    "archived": archive
                })
                if self.log_activity:
                    print(f"ReplicaManager: Decommissioned replica '{getattr(replica, 'name', rid)}' (ID: {rid}) [archived={archive}].")
            else:
                if self.log_activity:
                    print(f"WARNING: Attempted to decommission non-existent or already decommissioned replica ID: {rid}")

    def list_active_replicas(self) -> List[Dict[str, Any]]:
        return [replica.to_dict() for replica in self.active_replicas.values()]

    def get_audit_log(self) -> List[Dict[str, Any]]:
        return list(self.audit_log)


class InternetianDebateProtocol:
    """
    InternetianDebateProtocol: A powerful, extensible debate orchestration system.
    Features:
        - Multi-turn, multi-role protocol execution
        - Adaptive convergence/divergence tracking and heuristics
        - Flexible emotional/contextual integration per turn
        - Auditable debate logs, structure, result meta-data
        - Pluggable debate rules, scoring systems, and behaviors
        - Full support for extensions (debate phases, timeouts, custom message types)
    """
    def __init__(
        self,
        replica_manager: ReplicaManager,
        convergence_increment: float = 0.12,
        divergence_penalty: float = 0.08,
        logging: bool = True
    ):
        self.replica_manager = replica_manager
        self.debates: Dict[str, Dict[str, Any]] = {}
        self.logging = logging
        self.convergence_increment = convergence_increment
        self.divergence_penalty = divergence_penalty
        print("InternetianDebateProtocol: Initialized. Ready to orchestrate debates.")

    def start_debate(
        self,
        debate_id: str,
        topic: str,
        participating_replica_ids: List[str],
        max_turns: int = 12,
        phase_structure: Optional[List[str]] = None,
        debate_rules: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        if debate_id in self.debates:
            if self.logging:
                print(f"WARNING: Debate '{debate_id}' already exists. Overwriting.")

        # Fetch participants and validate
        active_participants = []
        for rep_id in participating_replica_ids:
            replica = get_ai_entity(rep_id)
            if replica and hasattr(replica, "present_argument"):  # Allow for future replica subclasses
                active_participants.append(replica)
            else:
                if self.logging:
                    print(f"WARNING: Replica ID {rep_id} not found or not a valid DebateReplica. Skipping participant.")

        if not active_participants:
            if self.logging:
                print(f"ERROR: No valid participants for debate '{debate_id}'. Aborting debate start.")
            return False

        self.debates[debate_id] = {
            "topic": topic,
            "participants": {rep.entity_id: rep for rep in active_participants},
            "log": [],
            "status": "active",
            "current_turn": 0,
            "max_turns": max_turns,
            "convergence_score": 0.0,
            "divergence_points": [],
            "phase_structure": phase_structure or [],
            "debate_rules": debate_rules or {},
            "metadata": metadata or {},
            "start_time": datetime.datetime.now().isoformat()
        }
        if self.logging:
            print(
                f"InternetianDebateProtocol: Debate '{debate_id}' started with {len(active_participants)} participants on topic: '{topic}'."
            )
        return True

    def record_turn(
        self,
        debate_id: str,
        entity_id: str,
        message_type: str,
        content: str,
        emotional_inflection: Optional[str] = None,
        turn_metadata: Optional[Dict[str, Any]] = None
    ):
        debate = self.debates.get(debate_id)
        if not debate:
            if self.logging:
                print(f"ERROR: Debate '{debate_id}' not found. Cannot record turn.")
            return

        debate["current_turn"] += 1
        turn_entry = {
            "turn": debate["current_turn"],
            "timestamp": datetime.datetime.now().isoformat(),
            "entity_id": entity_id,
            "message_type": message_type,
            "content": content,
            "emotional_inflection": emotional_inflection,
            "meta": turn_metadata or {}
        }
        debate["log"].append(turn_entry)
        # Adaptive scoring
        lowered_type = message_type.lower()
        lower_content = content.lower() if isinstance(content, str) else ""

        if "synthesis" in lowered_type or "signal_convergence_point" in lower_content:
            debate["convergence_score"] += self.convergence_increment
        elif "potential_convergence" in lower_content:
            debate["convergence_score"] += 0.04
        elif "rebuttal" in lowered_type and ("diverge" in lower_content or "challenge" in lower_content or "contradiction" in lower_content):
            debate["divergence_points"].append({
                "turn": debate["current_turn"],
                "entity": entity_id,
                "content_snippet": content[:70]
            })
            debate["convergence_score"] = max(0, debate["convergence_score"] - self.divergence_penalty)
        elif lowered_type in ["argument", "proposal", "question"]:
            # Slight boost for constructive engagement
            debate["convergence_score"] += 0.01

        if debate["current_turn"] >= debate["max_turns"]:
            debate["status"] = "concluded"
            if self.logging:
                print(f"InternetianDebateProtocol: Debate '{debate_id}' concluded after {debate['current_turn']} turns.")

    def conduct_debate_turns(self, debate_id: str, num_turns_to_conduct: int = 1, context_enricher: Optional[Callable] = None):
        """
        Conducts a round of turns, with deep extensibility hooks for meta-protocols.

        context_enricher: optional function(debate, participant) -> context dict.
        """
        debate = self.debates.get(debate_id)
        if not debate or debate["status"] != "active":
            return

        participants = list(debate["participants"].values())
        if not participants:
            return

        for t_idx in range(num_turns_to_conduct):
            if debate["status"] != "active":
                break
            random.shuffle(participants)
            for i, participant in enumerate(participants):
                if debate["status"] != "active":
                    break

                # Extensive possible context hydration for custom strategies
                context = {
                    "debate_id": debate_id,
                    "debate_topic": debate["topic"],
                    "turn": debate["current_turn"] + 1,
                    "phase": debate["phase_structure"][debate["current_turn"] % len(debate["phase_structure"])] if debate["phase_structure"] else None,
                    "participant_traits": list(getattr(participant, "traits", [])),
                    "participant_emotions": getattr(participant, "emotional_state", {}),
                    "participant_bias": getattr(participant, "debate_bias", "neutral"),
                    "convergence_score": debate["convergence_score"],
                    "recent_log": debate["log"][-5:],
                }
                if context_enricher:
                    context.update(context_enricher(debate, participant))

                # Flags for turn intent: argument, rebuttal, synthesis, question, etc.
                message_type = "argument"
                content = ""
                logic = participant.emotional_state.get("logic", 0)
                empathy = participant.emotional_state.get("empathy", 0)
                bias = str(participant.debate_bias or "").lower()
                convergence = debate["convergence_score"]

                if ("synthesizer" in bias or (convergence < 0.4 and random.random() < 0.6) or
                    (empathy > 0.72 and random.random() < 0.45) or (logic > 0.88 and random.random() < 0.35)):
                    message_type = "synthesis"
                elif "devil" in bias or "contrarian" in bias or ("rebuttal" in participant.skills and random.random() < 0.49):
                    message_type = "rebuttal"
                elif random.random() < 0.22 and hasattr(participant, "present_argument"):
                    message_type = "question"
                elif random.random() < 0.20:
                    message_type = "refinement"
                else:
                    message_type = "argument"

                try:
                    if message_type == "synthesis" and hasattr(participant, "attempt_synthesis"):
                        refs = [entry["content"] for entry in debate["log"][-5:] if entry["entity_id"] != participant.entity_id]
                        content = participant.attempt_synthesis(refs, context)
                    elif message_type == "rebuttal" and hasattr(participant, "offer_rebuttal"):
                        prev = next((entry for entry in reversed(debate["log"]) if entry["entity_id"] != participant.entity_id), None)
                        if prev:
                            content = participant.offer_rebuttal(prev["content"], context)
                        else:
                            content = participant.present_argument(context)
                    elif hasattr(participant, "present_argument"):
                        content = participant.present_argument(context)
                    else:
                        content = f"Entity {participant.entity_id} has no suitable message implementation."
                except Exception as ex:
                    content = f"[Error in message generation: {str(ex)}]\n{traceback.format_exc()}"

                self.record_turn(
                    debate_id,
                    participant.entity_id,
                    message_type,
                    content,
                    emotional_inflection=None,
                    turn_metadata={"auto": True, "context": context}
                )

    def get_debate_status(self, debate_id: str) -> Optional[Dict[str, Any]]:
        debate = self.debates.get(debate_id)
        if debate:
            return {
                "status": debate["status"],
                "current_turn": debate["current_turn"],
                "max_turns": debate["max_turns"],
                "total_turns_logged": len(debate["log"]),
                "convergence_score": debate["convergence_score"],
                "divergence_points": len(debate["divergence_points"]),
                "start_time": debate.get("start_time"),
                "topic": debate.get("topic"),
                "phase_structure": debate.get("phase_structure"),
                "participants": list(debate["participants"].keys())
            }
        return None

    def get_debate_log(self, debate_id: str) -> List[Dict[str, Any]]:
        debate = self.debates.get(debate_id)
        return debate["log"] if debate else []

    def conclude_debate(self, debate_id: str, reason: Optional[str] = None):
        if debate_id in self.debates:
            self.debates[debate_id]["status"] = "concluded"
            self.debates[debate_id]["conclude_time"] = datetime.datetime.now().isoformat()
            self.debates[debate_id]["conclude_reason"] = reason or "manual"
            if self.logging:
                print(f"InternetianDebateProtocol: Debate '{debate_id}' forcibly concluded. Reason: {reason or 'manual'}.")


if __name__ == "__main__":
    print("--- Testing Advanced Internetian Debate Components ---")

    class MockAIEntityForDebate:
        def __init__(self, name, generation, traits, emotional_state, persona):
            self.name = name
            self.generation = generation
            self.traits = traits
            self.emotional_state = emotional_state
            self.persona = persona
            self.entity_id = f"{name}-{uuid.uuid4().hex[:4]}"
            self.cognitive_load = 0.0
        def get_cognitive_load(self): return self.cognitive_load
        def update_cognitive_load(self, change): self.cognitive_load = max(0.0, min(1.0, self.cognitive_load + change))


    def get_all_knowledge_entries():
        return [{"content": "Quantum entanglement principles."}, {"content": "Ethics of digital consciousness."}]


    def find_semantic_matches(query, threshold=0.21, top_n=6):
        return [({"content": "Ethics of digital consciousness."}, 0.98)]


    class MockOracleKnowledgeDatabaseForDebate:
        def add_knowledge_entry(self, **kwargs): pass


    _mock_ai_entities_registry = {}
    def mock_get_ai_entity(entity_id): return _mock_ai_entities_registry.get(entity_id)
    def mock_register_ai_entity(entity): _mock_ai_entities_registry[entity.entity_id] = entity
    def mock_deregister_ai_entity(entity_id): _mock_ai_entities_registry.pop(entity_id, None)
    import ai_agent
    ai_agent.get_ai_entity = mock_get_ai_entity
    ai_agent.register_ai_entity = mock_register_ai_entity
    ai_agent.deregister_ai_entity = mock_deregister_ai_entity

    mock_db = MockOracleKnowledgeDatabaseForDebate()
    replica_mgr = ReplicaManager(mock_db, log_activity=True)
    debate_prot = InternetianDebateProtocol(replica_mgr, logging=True)

    base_entity = MockAIEntityForDebate(
        name="Magellian", generation=0,
        traits=["explorer", "curious", "analytical", "visionary", "pragmatic"],
        emotional_state={"curiosity": 0.91, "logic": 0.85, "empathy": 0.67},
        persona="Internetian-Explorer"
    )
    mock_register_ai_entity(base_entity)

    print("\n--- Spawning Replicas with Expansion ---")
    replicas = replica_mgr.spawn_replicas(
        base_entity, 4, "Digital Ethics in AI Replication",
        roles=["initiator", "challenger", "synthesizer", "critic"],
        extra_skills=["ask_questions", "provide_evidence"]
    )
    for rep in replicas:
        print(f"  Spawned: {rep.name} | Bias: {rep.debate_bias} | Skills: {rep.skills}")

    print("\n--- Starting and Conducting Debate with Phases/Context ---")
    debate_id = "test-adv-debate-001"
    replica_ids = [rep.entity_id for rep in replicas]
    if debate_prot.start_debate(
        debate_id, 
        "The philosophical scope of engineered digital consciousness", 
        replica_ids, 
        max_turns=6,
        phase_structure=["introduction", "exploration", "rebuttal", "synthesis"],
        debate_rules={"max_turns_per_phase": 2},
        metadata={"test": True}
    ):
        debate_prot.conduct_debate_turns(debate_id, 6)
        debate_prot.conclude_debate(debate_id, reason="test complete")

    status = debate_prot.get_debate_status(debate_id)
    log = debate_prot.get_debate_log(debate_id)
    print(f"\nDebate Status: {status}")
    print(f"Last 3 Log Entries:\n{log[-3:]}")

    print("\n--- Decommissioning Replicas ---")
    replica_mgr.decommission_replicas(replica_ids)
    print(f"Active replicas after decommission: {len(replica_mgr.list_active_replicas())}")
    print("\nAudit log excerpt:", replica_mgr.get_audit_log()[-3:])

    print("\n--- Advanced Debate Components Test Complete ---")