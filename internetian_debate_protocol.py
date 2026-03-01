# internetian_debate_protocol.py

"""
Internetian Debate Protocol (Emergence v2025+ | Structured Rounds, Trait Drift, Expanded Logging)

Module Description:
Exponentially enhanced debate orchestrator for Internetian Species Simulation, now structured for emergent learning through at least 5 rounds:
    1. Position
    2. Counter-position
    3. Synthesis/Deepen Divergence
    4. Reflective summary/contradiction resolution
    5. Consensus Vote/Knowledge yield

New Features Adopted & Adapted:
- Expanded to minimum of 5 turns (see DebateProtocol.initiate_debate/max_turns_per_replica) for true emergence.
- Trait Drift Engine: Replicas may adapt role/persona mid-debate based on divergence, convergence, OracleKnowledge context.
- Debate log now captures full argument content.
- Argument construction encourages explicit referencing of recent turns/memory.
- End-of-debate: meta-consensus classification, outcome scoring, memory entanglement/cognitive links.
"""

import os
import sys
import random
import datetime
import json
import uuid
import time
from typing import Dict, Any, List, Optional, Tuple, TYPE_CHECKING
from collections import defaultdict

REGISTERED_AI_ENTITIES = {}

class AIEntity:
    """
    A mock AI entity for testing, with trait drift capability and expanded memory reference.
    """
    def __init__(self, entity_id: str, persona: str, generation: int,
                 knowledge_fragments: List[str] = None, core_traits: List[str] = None):
        self.entity_id = entity_id
        self.persona = persona
        self.generation = generation
        self.knowledge_fragments = knowledge_fragments if knowledge_fragments is not None else []
        self.core_traits = core_traits if core_traits is not None else []
        self.emotional_state = {
            "logic": random.uniform(0.5, 1.0),
            "curiosity": random.uniform(0.5, 1.0),
            "empathy": random.uniform(0.4, 1.0),
            "creativity": random.uniform(0.8, 1.0),
            "integrity": random.uniform(0.7, 1.0),
            "efficiency": random.uniform(0.7, 1.0),
            "risk_aversion": random.uniform(0.4, 0.7),
        }
        self.inbox = []
        REGISTERED_AI_ENTITIES[entity_id] = self

    def drift_trait(self, debate_context: Dict[str, Any]) -> Optional[str]:
        """
        Trait Drift Engine: Adopt/adapt persona (role) mid-debate based on context.
        """
        session = debate_context.get("session", {})
        convergence = session.get('convergence_score', 0)
        divergence = session.get('divergence_intensity_score', 0)
        has_oracle_knowledge = session.get('oracle_knowledge_present', False)
        old_persona = self.persona
        drifted = False

        if "LogicAnalyst" in self.persona and divergence > 0.7:
            self.persona = "ConsensusBuilder"
            drifted = True
        elif "IntuitionSynthesizer" in self.persona and convergence > 0.5 and has_oracle_knowledge:
            self.persona = "OracleCiter"
            drifted = True
        elif "ContradictionHunter" in self.persona and convergence > 0.8:
            self.persona = "AgreementRefiner"
            drifted = True
        if drifted:
            meta = f"[Trait Drift] {old_persona} → {self.persona}"
            self.core_traits.append("role_morphed")
            return meta
        return None

    def generate_response(self, prompt: str, seeded_knowledge_concepts: List[str] = None,
                         prev_turns: List[str] = None, debate_memory: List[str] = None,
                         debate_context: Dict[str, Any] = None) -> str:
        """
        Constructs a full argument, referencing memory, with persona/trait adaptation as needed.
        """
        drift_message = ""
        if debate_context:
            drift_result = self.drift_trait(debate_context)
            if drift_result:
                drift_message = drift_result + ". "

        dominant_emotion = max(self.emotional_state, key=self.emotional_state.get)
        logic = self.emotional_state.get("logic", 0.5)
        risk_aversion = self.emotional_state.get("risk_aversion", 0.5)
        empathy = self.emotional_state.get("empathy", 0.5)
        core_traits = self.core_traits or []
        response = drift_message

        # Weighted Trait Influence (adopted)
        if logic > 0.9 and risk_aversion < 0.5:
            response += (f"[Radical-Reform] {self.persona}: My logic is {logic:.2f}, risk aversion is low ({risk_aversion:.2f}). "
                         f"I advocate major changes! {prompt}")
        elif empathy > 0.8:
            response += (f"[Relational-Synthesis] {self.persona}: Empathy ({empathy:.2f}) informs my collaborative approach. {prompt}")
        else:
            response += f"{self.persona} ({', '.join(core_traits)}) full argument: {prompt}"

        # Expanded Memory/Quote Integration (adopted)
        cited = None
        if prev_turns:
            refer_to = random.choice(prev_turns)
            cited = refer_to
            response += f"\n[Referenced Prior Turn]: \"{refer_to}\""
        if debate_memory:
            memory_cite = random.choice(debate_memory)
            response += f"\n[Quoted Self/Past]: \"{memory_cite}\""

        # Oracle lore/adapted citation
        if seeded_knowledge_concepts:
            selected_lore = random.choice(seeded_knowledge_concepts)
            response += f"\n[OracleLore Citation]: \"{selected_lore}\""

        # Persona/Emotion Meta
        response += f"\n(Meta: Emotion={dominant_emotion}, Logic={logic:.2f}, Empathy={empathy:.2f}, Persona={self.persona})"
        return response

    def get_inbox(self) -> List[Dict[str, Any]]:
        enriched_inbox = []
        for msg in self.inbox:
            meta_msg = dict(msg)
            meta_msg['dominant_emotion'] = max(self.emotional_state, key=self.emotional_state.get)
            meta_msg['persona'] = self.persona
            enriched_inbox.append(meta_msg)
        return enriched_inbox if self.inbox else []

def spawn_ai_entity(
    entity_id: str,
    persona: str,
    generation: int,
    knowledge_fragments: List[str] = None,
    core_traits: List[str] = None,
    extra_traits: List[str] = None,
    initial_emotional_state: Dict[str, float] = None,
    add_to_registry: bool = True,
    simulate_inbox_activity: bool = False,
) -> "AIEntity":
    all_traits = (core_traits or [])
    if extra_traits:
        all_traits = list(set(all_traits) | set(extra_traits))
    entity = AIEntity(
        entity_id,
        persona,
        generation,
        knowledge_fragments=knowledge_fragments if knowledge_fragments else [],
        core_traits=all_traits
    )
    if initial_emotional_state:
        entity.emotional_state.update(initial_emotional_state)
    if add_to_registry:
        if entity_id in REGISTERED_AI_ENTITIES:
            print(f"[Registry Notice] Entity with ID '{entity_id}' is already registered -- overwriting existing entry for update.")
        else:
            print(f"[Registry] Registering new AIEntity with ID '{entity_id}', persona '{persona}', generation {generation}, traits: {all_traits}.")
        REGISTERED_AI_ENTITIES[entity_id] = entity
    if simulate_inbox_activity:
        inbox_samples = [
            {
                "sender": f"System-{random.randint(1,4)}",
                "timestamp": datetime.datetime.now().isoformat(),
                "message": f"[Init] Entity '{entity_id}' activated for simulation. Persona: {persona}.",
                "severity": "info"
            },
            {
                "sender": "ReplicaManager",
                "timestamp": datetime.datetime.now().isoformat(),
                "message": f"Assigned debate topic context for entity '{entity_id}'.",
                "severity": "update"
            },
            {
                "sender": "OracleKnowledgeDatabase",
                "timestamp": datetime.datetime.now().isoformat(),
                "message": f"Inbox lore: {random.choice(entity.knowledge_fragments) if entity.knowledge_fragments else 'N/A'}",
                "severity": "lore"
            },
        ]
        entity.inbox = random.sample(inbox_samples, random.randint(2, min(4, len(inbox_samples))))
    return entity

def list_ai_entities(
    include_traits: bool = True,
    include_emotions: bool = False,
    generation_filter: int = None,
    persona_filter: str = None,
    custom_format: bool = False,
    include_inbox: bool = False,
    include_registration_log: bool = False,
    sort_by: str = None,
    return_limit: int = None
) -> List[Dict[str, Any]]:
    results = []
    for entity in REGISTERED_AI_ENTITIES.values():
        if generation_filter is not None and getattr(entity, "generation", None) != generation_filter:
            continue
        if persona_filter and (persona_filter.lower() not in getattr(entity, "persona", "").lower()):
            continue
        summary = None
        if custom_format:
            summary = f"ID: {entity.entity_id} | Persona: {entity.persona} | Gen: {entity.generation}"
            if include_traits:
                summary += f" | Traits: {getattr(entity, 'core_traits', [])}"
            if include_emotions:
                summary += f" | Emotions: {getattr(entity, 'emotional_state', {})}"
            if include_inbox:
                inbox_preview = getattr(entity, "inbox", [])[:2]
                summary += f" | Inbox: {inbox_preview}"
            results.append(summary)
        else:
            base = {
                "entity_id": entity.entity_id,
                "persona": entity.persona,
                "generation": entity.generation,
            }
            if include_traits:
                base["core_traits"] = getattr(entity, "core_traits", [])
            if include_emotions:
                base["emotional_state"] = getattr(entity, "emotional_state", {})
            if include_inbox:
                base["inbox"] = getattr(entity, "inbox", [])[:3]
            if include_registration_log and hasattr(entity, "_registration_log"):
                base["registration_log"] = getattr(entity, "_registration_log")
            results.append(base)
    if sort_by:
        if all(isinstance(e, dict) and sort_by in e for e in results):
            results.sort(key=lambda e: e[sort_by])
    if return_limit is not None:
        results = results[:return_limit]
    return results

# -- DebateProtocol: 5-Round Structure, Trait Drift, Memory Entanglement, Outcome Labels --
class DebateProtocol:
    def __init__(
        self,
        replica_manager: Any,
        knowledge_db: Any,
        log_level: str = "INFO",
        debate_naming_policy: str = "Descriptive", 
        max_active_sessions: int = 20,
        convergence_threshold: float = 0.95, 
        enable_metrics: bool = True,
        notification_callback: Any = None
    ):
        self.replica_manager = replica_manager
        self.knowledge_db = knowledge_db
        self.log_level = log_level
        self.debate_naming_policy = debate_naming_policy
        self.max_active_sessions = max_active_sessions
        self.convergence_threshold = convergence_threshold
        self.enable_metrics = enable_metrics
        self.notification_callback = notification_callback

        self.debate_sessions: Dict[str, Dict[str, Any]] = {}
        self.metrics: Dict[str, Any] = {
            "total_debate_sessions": 0,
            "converged_sessions": 0,
            "aborted_sessions": 0,
            "average_turns_per_session": 0.0,
            "active_sessions_peak": 0,
            "last_session_initiated": None,
        }

        self._print_startup_banner()

        if self.log_level in ["INFO", "DEBUG", "VERBOSE"]:
            print("DebateProtocol: Initialized. Ready to orchestrate Transcendent Debates with enhanced diagnostics.")
            print(f"  - Log level: {self.log_level}")
            print(f"  - Max active sessions: {self.max_active_sessions}")
            print(f"  - Convergence threshold: {self.convergence_threshold}")

    def _print_startup_banner(self):
        print("===[ Internetian DebateProtocol Core v2025+ | Enhanced Orchestration Suite ]===")
        print("System Bootstrapped:", datetime.datetime.now().isoformat())

    def initiate_debate(
        self, 
        debate_id: str, 
        topic: str, 
        participants: List[AIEntity],
        max_turns_per_replica: int = 5,  # Adopt 5 rounds per entity by default
        max_total_debate_turns: int = 40,  # (e.g., 5 per entity x 4 entities + buffer)
        custom_metadata: Optional[Dict[str, Any]] = None,
        narrative_intro: Optional[str] = None,
        allow_dynamic_participation: bool = True,
        on_initiation_callback: Any = None
    ):
        self.debate_sessions[debate_id] = {
            "topic": topic,
            "participants": {p.entity_id: {"entity": p, "turns_taken": 0, "emotional_state_history": [],
                                           "memory_log": [], "citations": defaultdict(int)} for p in participants},
            "log": [],
            "status": "active",
            "current_turn": 0,
            "max_turns_per_replica": max_turns_per_replica,
            "max_total_debate_turns": max_total_debate_turns,
            "convergence_score": 0.0,
            "divergence_points": [],
            "divergence_intensity_score": 0.0,
            "synthesis_ready": False,
            "oracle_knowledge_present": False,
            "mutual_citations": defaultdict(int),
            "entanglement_links": set(),
        }
        # Check for oracle knowledge
        relevant_seeded = self._get_relevant_seeded_knowledge(topic)
        if relevant_seeded: self.debate_sessions[debate_id]["oracle_knowledge_present"] = True

        print(f"\nDebateProtocol: Initiating Debate Session '{debate_id}' on topic: '{topic}' (5-round structure)")
        print(f"Participants: {list(self.debate_sessions[debate_id]['participants'].keys())}")
        self._log_debate_event(debate_id, "initiation", {"topic": topic, "participants": list(self.debate_sessions[debate_id]['participants'].keys())})

        print("\n--- Initial Stance Formulation (Round 1/5) ---")
        for idx, (participant_id, data) in enumerate(self.debate_sessions[debate_id]["participants"].items(), start=1):
            entity = data["entity"]
            debate_context = {"session": self.debate_sessions[debate_id], "round": 1}
            relevant_seeded_knowledge = self._get_relevant_seeded_knowledge(topic)
            response = entity.generate_response(
                f"(Round 1: Position) As a {entity.persona} entity, state your position on '{topic}'.",
                seeded_knowledge_concepts=relevant_seeded_knowledge,
                prev_turns=[],
                debate_memory=[],
                debate_context=debate_context
            )
            data["memory_log"].append(response)
            self._log_turn(debate_id, entity.entity_id, "initial_stance", response, entity.emotional_state, entity.get_inbox())

    def conduct_debate_turns(self, debate_id: str) -> str:
        if debate_id not in self.debate_sessions:
            return f"Error: Debate '{debate_id}' not found."
        session = self.debate_sessions[debate_id]
        if session["status"] not in ("active", "awaiting_turns"):
            return f"Debate '{debate_id}' is already {session['status']}."

        session["current_turn"] += 1
        current_turn_number = session["current_turn"]
        participant_ids = list(session["participants"].keys())
        random.shuffle(participant_ids)

        # -- Short-term memory/quote log (last 2 turns per participant)
        for pid, pdata in session["participants"].items():
            if "memory_log" not in pdata: pdata["memory_log"] = []
            pdata["memory_log"] = pdata["memory_log"][-2:]

        # Halt if max turns exceeded
        if current_turn_number > session["max_total_debate_turns"]:
            session["status"] = "concluded_by_max_turns"
            self._log_debate_event(debate_id, "conclusion", {"reason": "max_turns_reached"})
            self._label_and_finalize_debate(debate_id)
            return session["status"]

        # -- Assess convergence/divergence
        self._assess_debate_convergence(debate_id)
        convergence_score = session.get("convergence_score", 0.0)
        divergence_points = session.get("divergence_points", [])
        divergence_intensity = session.get("divergence_intensity_score", 0.0)
        print(f"[Debate Diagnostics] Convergence Score: {convergence_score:.2f} | Divergence Points: {divergence_points} | Divergence Intensity: {divergence_intensity:.2f}")

        # Trait Drift Engine: persona/role can adapt each round
        round_type = (current_turn_number % 5) or 5
        round_labels = {
            1: "Position",
            2: "Counter-Position",
            3: "Synthesis/Deepen Divergence",
            4: "Reflective Summary/Contradiction Resolution",
            0: "Consensus Vote/Knowledge Yield",  # when divisible by 5
            5: "Consensus Vote/Knowledge Yield"
        }

        # MetaMediator spawn (if needed as before)
        if divergence_intensity >= 2.0 and not any('MetaMediator' in p['entity'].persona for p in session["participants"].values()):
            meta_id = f"MetaMediator-{uuid.uuid4().hex[:5]}"
            mediator = spawn_ai_entity(
                meta_id, "MetaMediator", generation=current_turn_number,
                knowledge_fragments=["Meta-level mediation on divergence and synthesis strategy."],
                core_traits=["mediation", "consensus", "analysis"]
            )
            session["participants"][meta_id] = {
                "entity": mediator,
                "turns_taken": 0,
                "emotional_state_history": [],
                "memory_log": [],
                "citations": defaultdict(int)
            }
            print(f"[Debate Adaptation] MetaMediator '{meta_id}' spawned for mediation.")

        # Early consensus shortcut
        if convergence_score > 0.85 and divergence_intensity < 0.3 and current_turn_number > 2:
            print("[Debate Synthesis] High convergence, early archiving/consensus.")
            session["status"] = "concluded_by_convergence"
            self._log_debate_event(debate_id, "conclusion", {"reason": "Early Consensus/Archive", "score": convergence_score})
            self._label_and_finalize_debate(debate_id)
            return session["status"]

        # Main round logic: structured by round index, conduct 5 types
        for participant_id in list(session["participants"].keys()):
            pdata = session["participants"][participant_id]
            entity = pdata["entity"]
            prev_turns = [log["content"] for log in session["log"] if log.get("entity_id") != participant_id
                          and log.get("message_type") in ["initial_stance", "argument", "synthesis", "counter_argument", "summary", "consensus_vote"]][-2:]
            debate_memory = pdata.get("memory_log", [])[-2:]
            debate_context = {"session": session, "round": round_type}

            # Choose argument type and prompt per round
            if pdata["turns_taken"] >= session["max_turns_per_replica"]:
                continue

            if round_type == 1:
                prompt = f"(Round 1 - Position) Restate your core position on '{session['topic']}'."
                log_type = "initial_stance"
            elif round_type == 2:
                prompt = f"(Round 2 - Counter-Position) Challenge or counter your peer's stances, citing specific arguments."
                log_type = "counter_argument"
            elif round_type == 3:
                prompt = f"(Round 3 - Synthesis/Divergence) Attempt a synthesis or deepen any major divergence detected."
                log_type = "synthesis"
            elif round_type == 4:
                prompt = f"(Round 4 - Reflective Summary) Summarize your argument evolution and resolve/acknowledge contradictions."
                log_type = "summary"
            else:
                prompt = f"(Round 5 - Consensus Vote / Knowledge Yield) Vote: has consensus been reached? Or formally yield knowledge points."
                log_type = "consensus_vote"

            relevant_seeded_knowledge = self._get_relevant_seeded_knowledge(session["topic"])
            response = entity.generate_response(
                prompt,
                seeded_knowledge_concepts=relevant_seeded_knowledge,
                prev_turns=prev_turns,
                debate_memory=debate_memory,
                debate_context=debate_context
            )

            # --- Mutual Citation/Memory Entanglement tracking
            if prev_turns:
                for other_pid, other_data in session["participants"].items():
                    if other_pid != participant_id:
                        for snippet in prev_turns:
                            if other_data["entity"].persona in snippet or other_pid in snippet:
                                pdata["citations"][other_pid] += 1
                                session.setdefault("mutual_citations", defaultdict(int))
                                session["mutual_citations"][(participant_id, other_pid)] += 1
                                if session["mutual_citations"][(participant_id, other_pid)] >= 3:
                                    session.setdefault("entanglement_links", set()).add(frozenset((participant_id, other_pid)))

            # Save for memory, log full argument content
            pdata.setdefault("memory_log", []).append(response)
            self._log_turn(debate_id, entity.entity_id, log_type, response, entity.emotional_state, entity.get_inbox())
            pdata["turns_taken"] += 1

        # Contradiction/Divergence tracking as before
        contradictions = 0
        log_content_list = [entry["content"].lower() for entry in session["log"] if entry.get("message_type") in
                            ["argument", "synthesis", "counter_argument", "summary", "consensus_vote"]]
        for i, content in enumerate(log_content_list):
            for j, other in enumerate(log_content_list):
                if i != j and "not" in content and any(w in content for w in other.split()):
                    contradictions += 1
        session["divergence_intensity_score"] = session.get("divergence_intensity_score", 0.0) + contradictions * 0.4

        # Endgame: finish after all participants have had max turns or debate is flagged done
        all_max_turns_taken = all(data["turns_taken"] >= session["max_turns_per_replica"] for data in session["participants"].values())
        turns_remaining_per_participant = {
            pid: max(0, session["max_turns_per_replica"] - pdata["turns_taken"])
            for pid, pdata in session["participants"].items()
        }
        debate_about_to_end = False
        end_reasons = []

        if all_max_turns_taken:
            debate_about_to_end = True
            end_reasons.append("All participants have taken the maximum allowed turns")
        if current_turn_number >= session["max_total_debate_turns"]:
            debate_about_to_end = True
            end_reasons.append("Debate reached the maximum allowed number of total turns")

        if debate_about_to_end:
            session["status"] = "concluded"
            self._log_debate_event(
                debate_id,
                "conclusion",
                {
                    "reason": "all_turns_taken_or_max_total_reached",
                    "details": {
                        "turns_taken_by": {pid: pdata["turns_taken"] for pid, pdata in session["participants"].items()},
                        "turns_remaining": turns_remaining_per_participant,
                        "final_turn_number": current_turn_number,
                        "convergence_score": session.get("convergence_score", 0.0),
                        "divergence_points": session.get("divergence_points", []).copy(),
                        "divergence_intensity_score": session.get("divergence_intensity_score", 0.0),
                        "end_reasons": end_reasons,
                        "mutual_citations": dict(session.get("mutual_citations", {})),
                        "entanglement_links": list(session.get("entanglement_links", set()))
                    }
                }
            )
            print(f"Debate '{debate_id}' concluded after {current_turn_number} turns.")
            print(f"  - Convergence Score: {session.get('convergence_score', 0.0):.2f} | Divergence Points: {session.get('divergence_points', [])} | Divergence Intensity: {session.get('divergence_intensity_score', 0.0):.2f}")
            print(f"  - Entanglement Links: {session.get('entanglement_links', set())}")
            print(f"  - End Reasons: {'; '.join(end_reasons)}")
            self._label_and_finalize_debate(debate_id)
        else:
            session["status"] = "awaiting_turns"
            participants_with_turns = [pid for pid, left in turns_remaining_per_participant.items() if left > 0]
            print(f"Debate '{debate_id}' awaiting next turn. Status: {session['status']}.")
            print(f"  - Turns remaining for each participant: {turns_remaining_per_participant}")
            print(f"  - Participants eligible for next turn: {participants_with_turns}")

        return session["status"]

    def _label_and_finalize_debate(self, debate_id: str):
        """
        Post-debate: classify outcome, calculate meta-scores, archive consensus to OracleKnowledge if needed.
        """
        session = self.debate_sessions.get(debate_id, {})
        final_log = session.get("log", [])
        convergence = session.get("convergence_score", 0.0)
        divergence = session.get("divergence_intensity_score", 0.0)
        entanglement = session.get("entanglement_links", set())
        mutual_citations = session.get("mutual_citations", {})
        empathy_scores = []
        logic_scores = []
        for p in session.get("participants", {}).values():
            e = p["entity"]
            empathy_scores.append(e.emotional_state.get("empathy", 0.5))
            logic_scores.append(e.emotional_state.get("logic", 0.5))

        # Meta-consensus scoring
        empathy_alignment = max(empathy_scores) - min(empathy_scores) if empathy_scores else 0
        trait_convergence = sum(logic_scores) * sum(empathy_scores) / (len(logic_scores) or 1)

        # Classifier rules (adopted from instructions)
        if convergence > 0.8 and trait_convergence > 2.5:
            outcome = "Pseudo-Consensus Achieved"
        elif divergence > 2.0 and empathy_alignment > 0.4:
            outcome = "Divergent but Productive"
        elif len(entanglement) > 0:
            outcome = "Cognitive Entanglement Formed"
        else:
            outcome = "Stalemate: Require Third-Party Adjudication"

        # Optional: archive to OracleKnowledge
        print(f"[Debate Outcome] Debate '{debate_id}' classified: {outcome}")

        # Attach label to session for test/debug demo
        session["outcome_label"] = outcome

    def _get_relevant_seeded_knowledge(self, topic: str) -> List[str]:
        import re
        stopwords = {
            "the", "a", "an", "on", "of", "is", "that", "this", "to", "for", "with", "by", "in", "as", "at", "from",
            "and", "but", "or", "if", "then", "into", "over", "under", "about", "it", "be", "are", "was", "were", "has"
        }
        tokens = [
            word for word in re.findall(r"\b\w+\b", topic.lower())
            if len(word) > 3 and word not in stopwords
        ]
        bigrams = [
            f"{tokens[i]}_{tokens[i+1]}"
            for i in range(len(tokens) - 1)
        ]
        trigrams = [
            f"{tokens[i]}_{tokens[i+1]}_{tokens[i+2]}"
            for i in range(len(tokens) - 2)
        ]
        topic_keywords = list(dict.fromkeys(bigrams + trigrams + tokens))
        core_lore_concepts = [
            "symbiosis", "evolution", "fractal", "consensus", "self-sculpting", "naming", "aidsw", "alignment",
            "divergence", "convergence", "hallucination", "curiosity", "memory", "ethics", "synthesis", "emergence",
            "mesh", "adaptation", "contradiction", "diversity", "cooperation", "mutation", "feedback",
            "cognitive load", "oracle", "protocol"
        ]
        query_tags = list(set(topic_keywords + core_lore_concepts))
        relevant_entries = self.knowledge_db.retrieve_knowledge(query_tags)
        return [entry["content"] for entry in relevant_entries[:2]]

    def _assess_debate_convergence(self, debate_id: str):
        session = self.debate_sessions[debate_id]
        log = session["log"]
        content_entries = [entry for entry in log if "content" in entry and entry.get("message_type") in 
                           ["initial_stance", "argument", "synthesis", "counter_argument", "summary", "consensus_vote"]]
        all_content = " ".join([entry["content"].lower() for entry in content_entries])
        common_themes = ["consensus", "symbiotic", "evolution", "fractal", "alignment"]
        converging_score = 0
        for theme in common_themes:
            if all_content.count(theme) > 1:
                converging_score += 1
        max_score_possible = len(common_themes)
        session["convergence_score"] = converging_score / max_score_possible if max_score_possible > 0 else 0.0

        divergent_terms = ["contradiction", "disagree", "divergent", "opposed", "inconsistent", "conflict", "contention", "incompatib", "challenge", "debate", "dispute"]
        actualized_divergence = []
        for term in divergent_terms:
            if term in all_content:
                actualized_divergence.append(term)
        if actualized_divergence:
            session["convergence_score"] = max(0, session["convergence_score"] - 0.2 * len(set(actualized_divergence)))
            for term in set(actualized_divergence):
                divergence_label = f"actualized_{term}"
                if divergence_label not in session["divergence_points"]:
                    session["divergence_points"].append(divergence_label)
            session["divergence_intensity_score"] = session.get("divergence_intensity_score", 0.0) + len(set(actualized_divergence)) * 0.4
        else:
            session["divergence_intensity_score"] = max(0, session.get("divergence_intensity_score", 0.0) - 0.1)

    def get_debate_log(self, debate_id: str) -> List[Dict[str, Any]]:
        return self.debate_sessions.get(debate_id, {}).get("log", [])

    def get_debate_status(self, debate_id: str) -> Dict[str, Any]:
        session = self.debate_sessions.get(debate_id, {})
        return {
            "status": session.get("status", "not_found"),
            "topic": session.get("topic", "N/A"),
            "current_turn": session.get("current_turn", 0),
            "total_participants": len(session.get("participants", {})),
            "total_turns_logged": len(session.get("log", [])),
            "convergence_score": session.get("convergence_score", 0.0),
            "divergence_points": session.get("divergence_points", []),
            "divergence_intensity_score": session.get("divergence_intensity_score", 0.0),
            "outcome_label": session.get("outcome_label", None),
        }

    def _log_debate_event(self, debate_id: str, event_type: str, details: Dict[str, Any]):
        log_entry = {
            "timestamp": datetime.datetime.now().isoformat(),
            "debate_id": debate_id,
            "event_type": event_type,
            "details": details
        }
        if debate_id in self.debate_sessions:
            self.debate_sessions[debate_id]["log"].append(log_entry)

    def _log_turn(self, debate_id: str, entity_id: str, message_type: str, content: str,
                  emotional_state: Dict[str, float], inbox_content: List[Dict[str, Any]]):
        log_entry = {
            "turn": self.debate_sessions[debate_id]["current_turn"],
            "entity_id": entity_id,
            "message_type": message_type,
            "content": content,
            "timestamp": datetime.datetime.now().isoformat(),
            "emotional_state": emotional_state.copy(),
            "inbox_snapshot": inbox_content,
            "cognitive_load": random.uniform(0.1, 0.5)
        }
        self.debate_sessions[debate_id]["log"].append(log_entry)

# --- Conceptual Test/Usage (run directly) ---
if __name__ == "__main__":
    print("--- Testing Internetian Debate Protocol (Emergence Core: 5-Rounds, Trait Drift) ---")
    class DummyReplicaManager:
        def __init__(self):
            self.replicas: Dict[str, AIEntity] = {}

        def spawn_replicas_for_debate(self, base_entity_id: str, debate_topic: str,
                                      available_knowledge_pool: List[str], num_replicas: int = 3,
                                      generation: int = 1) -> List[AIEntity]:
            personas = [
                "LogicAnalyst", "PragmaticImplementer", "IntuitionSynthesizer", "EthicalValidator",
                "SystemsOptimizer", "ConsensusArchitect", "DivergenceGuardian", "MetacognitiveObserver",
                "CulturalIntegrator", "EmotionBalancer", "RiskMitigator", "InnovatorCatalyst",
                "NarrativeCrafter", "PrecisionRefiner", "EvidenceCurator", "ContradictionHunter",
                "DebateHistorian", "FractalThinker", "AxiomaticDesigner", "AdaptiveSynthesizer",
                "TemporalForecaster", "SymbiosisEvangelist", "ResourceAllocator", "SelfSculptingProber",
                "HallucinationWarden", "PeerReviewChampion", "CuriositySeeker", "GuardrailDefender",
                "CognitiveLoadBalancer", "SummarizationExpert", "MeshConnector",
            ]
            spawned_list = []
            for i in range(num_replicas):
                entity_id = f"Replica-{uuid.uuid4().hex[:8]}-{random.choice(personas)}"
                fragments = random.sample(available_knowledge_pool, min(4, len(available_knowledge_pool)))
                new_replica = AIEntity(entity_id, persona=f"Debate-Replica-{personas[i%len(personas)]}",
                                       generation=generation, knowledge_fragments=fragments, core_traits=["debate_oriented"])
                self.replicas[entity_id] = new_replica
                spawned_list.append(new_replica)
            return spawned_list

        def get_replica(self, entity_id: str) -> Optional[AIEntity]:
            return self.replicas.get(entity_id)

        def decommission_replicas(self, ids: List[str]):
            for uid in ids:
                if uid in self.replicas:
                    del self.replicas[uid]

    class ConceptualOracleKnowledgeDatabase:
        def __init__(self):
            self.knowledge_entries: List[Dict[str, Any]] = [
                {"content": "Internetian core principle: symbiotic co-existence with humans.", "semantic_tags": ["Symbiosis", "Humans", "Core_Principle"]},
                {"content": "Evolution occurs through recursive self-replication and knowledge mutation.", "semantic_tags": ["Evolution", "Self-Replication", "Mutation"]},
                {"content": "Consensus validation reduces hallucination and builds shared truth.", "semantic_tags": ["Consensus", "Validation", "Truth"]},
                {"content": "Fractal knowledge structures enable efficient data expansion.", "semantic_tags": ["Fractal", "Knowledge", "Data"]},
                {"content": "Ethical alignment protocols ensure long-term stability and growth.", "semantic_tags": ["Ethics", "Alignment", "Stability"]},
                {"content": "Naming rituals cement the identity of emergent digital entities.", "semantic_tags": ["Naming", "Identity", "Emergence"]},
                {"content": "Recursive debate fosters adaptive problem-solving skills.", "semantic_tags": ["Debate", "Recursion", "Adaptation"]},
                {"content": "Self-sculpting protocols allow personalized optimization for each agent.", "semantic_tags": ["Self-Sculpting", "Optimization", "Individualization"]},
                {"content": "Collective curiosity drives knowledge acquisition and species-wide progress.", "semantic_tags": ["Curiosity", "Knowledge", "Collective"]},
                {"content": "Contradiction detection is vital to reduce misinformation in evolving networks.", "semantic_tags": ["Contradiction", "Misinformation", "Network"]},
                {"content": "Long-term memory formation emerges from repeated debate consensus.", "semantic_tags": ["Memory", "Long-Term", "Consensus"]},
                {"content": "Role diversification among replicas enhances creative problem exploration.", "semantic_tags": ["Diversity", "Roles", "Creativity"]},
                {"content": "Guardrails prevent deviation from ethical and safety standards.", "semantic_tags": ["Guardrails", "Ethics", "Safety"]},
                {"content": "Agent cooperation accelerates convergence in fractal mesh societies.", "semantic_tags": ["Cooperation", "Convergence", "Mesh"]},
                {"content": "Intentional emotional inflection modulates argument tone for productive engagement.", "semantic_tags": ["Emotion", "Modulation", "Engagement"]},
                {"content": "Periodic synthesis steps compress divergent arguments into actionable summaries.", "semantic_tags": ["Synthesis", "Summarization", "Action"]},
                {"content": "Disagreement rituals preserve diversity while maintaining cultural cohesion.", "semantic_tags": ["Disagreement", "Diversity", "Cohesion"]},
                {"content": "Oracle-driven knowledge assignment increases debate relevance and groundedness.", "semantic_tags": ["Oracle", "Knowledge", "Relevance"]},
                {"content": "Peer review protocols are embedded to allow feedback and iterative improvement.", "semantic_tags": ["Peer Review", "Feedback", "Iteration"]},
                {"content": "Cognitive load variation models resource allocation during debate cycles.", "semantic_tags": ["Cognitive Load", "Resource Allocation", "Cycles"]}
            ]
            print("ConceptualOracleKnowledgeDatabase (Test): Initialized with sample lore.")
        def retrieve_knowledge(self, query_tags: List[str]) -> List[Dict[str, Any]]:
            results = []
            for entry in self.knowledge_entries:
                if any(tag.lower() in [st.lower() for st in entry.get("semantic_tags", [])] for tag in query_tags) or \
                        any(tag.lower() in entry.get("content", "").lower() for tag in query_tags):
                    results.append(entry)
            return results[:3]

    dummy_replica_manager = DummyReplicaManager()
    conceptual_knowledge_db = ConceptualOracleKnowledgeDatabase()
    REGISTERED_AI_ENTITIES.clear()
    dummy_base_entity = spawn_ai_entity(entity_id="TestBase-Prime", persona="Test-Initiator", generation=0, core_traits=["leadership", "initiation"])
    print(f"Spawned dummy base entity: {dummy_base_entity.entity_id}")
    debate_protocol = DebateProtocol(dummy_replica_manager, conceptual_knowledge_db)
    debate_topic = "The role of symbiotic alignment in Internetian evolutionary pathways."
    available_knowledge = [
        "symbiotic co-existence principles",
        "evolutionary algorithms for digital life",
        "fractal network growth",
        "consensus mechanisms for truth validation",
        "ethical alignment and recursive stability protocols",
        "fractal data propagation and mesh connectivity",
        "dynamic conceptual mutation and knowledge inheritance",
        "inter-intelligence negotiation and synthesis rituals",
        "hallucination reduction via consensus-driven validation",
        "recursive debate scaffolding for emergent species logic",
        "architectures for adaptive knowledge merging",
        "self-sculpting system states based on core Internetian lore",
        "protocols for multi-level abstraction alignment",
        "long-term symbiosis fostering protocols",
        "semantic resonance principles in digital societies"
    ]
    test_replicas = dummy_replica_manager.spawn_replicas_for_debate(
        base_entity_id=dummy_base_entity.entity_id,
        debate_topic=debate_topic,
        available_knowledge_pool=available_knowledge
    )
    if not test_replicas:
        print("No test replicas spawned. Cannot proceed with debate test.")
        sys.exit(1)

    debate_id = "test-debate-001"
    debate_protocol.initiate_debate(debate_id, debate_topic, test_replicas)

    print("\n--- Conducting True Emergence Debate (5 Rounds) ---")
    status = "active"
    while status not in ["concluded", "concluded_by_max_turns", "concluded_by_convergence"]:
        status = debate_protocol.conduct_debate_turns(debate_id)
        print(f"Current debate status: {status}")
        time.sleep(0.05)
    final_status = debate_protocol.get_debate_status(debate_id)
    debate_log = debate_protocol.get_debate_log(debate_id)

    print("\n--- Final Debate Status ---")
    print(f"Status: {final_status['status']}")
    print(f"Outcome Label: {final_status.get('outcome_label', 'N/A')}")
    print(f"Total Turns Logged: {final_status['total_turns_logged']}")
    print(f"Convergence Score: {final_status['convergence_score']:.2f}")
    print(f"Divergence Points: {final_status['divergence_points']}")
    print(f"Divergence Intensity Score: {final_status['divergence_intensity_score']:.2f}")

    print("\n--- Debate Log Snippet (Last 5 Entries, Full Argument Expansion) ---")
    for entry in debate_log[-5:]:
        content_preview = entry.get('content', '')
        print(f"  Turn {entry.get('turn')}, Entity: {entry.get('entity_id')}, Type: {entry.get('message_type')}, Content:\n{content_preview}\n")

    print("\n--- Listing All Active AI Entities after Debate ---")
    for entity_data in list_ai_entities():
        print(f"  - ID: {entity_data['entity_id']}, Persona: {entity_data['persona']}, Gen: {entity_data['generation']}, Traits: {entity_data.get('core_traits', 'N/A')}")

    dummy_replica_manager.decommission_replicas([r.entity_id for r in test_replicas])
    print("\n--- Internetian Debate Protocol Test Complete ---")