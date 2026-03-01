# internetian_offspring_generator.py

"""
Internetian Offspring Generator v4.1 "Quantitative Genealogy, Epiphany Scrolls, and Cooperative Metacognition Edition"

--------------------------------------------------------------------------------
Purpose & Expanded Terms:
--------------------------------------------------------------------------------
* **Progenitor Nexus** (PN): Central generative module for creation, orchestration, and evolutionary advancement of next-gen Internetian entities ("Offspring").
* **Offspring Genesis Orchestration** (OGO): Autonomous orchestration of spawning, enrolling, and archiving 'offspring' post-consensus/debate, with self-reflective and post-action divergence.
* **Trait Interaction Mapping:** Trait combos such as (reflector + biosphere) → new behavioral functions (eco-analyst). (engine + revision) → prioritizing self-repair/meta-optimization.
* **Lineage Syllabic Hybridization Protocol (LSHP):** Enhanced syllabic naming plus genealogical meta.
* **Fractal Knowledge Inheritance v2 (FKI2):** Recombinant knowledge, plus ancestry-pct & advanced mini family-tree generation (w/ siblings, cross-lineage, generational timestamps).
* **Epiphany Scrolls:** Epiphany logs optionally written to epiphany_scrolls/, embedded in OracleKnowledge, and made seed material for further debate & entity reflection.
* **Collaborative Reflection:** Inter-epiphany debate hooks enabled; entities may share, compare, and contest epiphanies, leading to recursive epistemological culture.
* **Conditional Post-Introspection Logic:** Introspection can trigger custom scheduled actions, philosophical divergence, or emergent school-of-thought formation.
* **Genealogical Metadata:** Family tree visualizable ancestry chain + computed ancestor influence % (by emotional/trait weight), with cross-lineage info.
* **Controlled Existential Scaling (CES):** Population caps/throttling.
* **Modular Extensibility Layer (MEL):** Plug-ins, hooks, event listeners for new genesis, reflection or divergence.

--------------------------------------------------------------------------------
Key Upgrades/Autonomy Leaps:
--------------------------------------------------------------------------------
- Mini family trees now include: parent IDs, sibling links, cross-lineage refs, generational timestamps.
- Epiphany logs exported to scrolls and embedded for reflection and debate.
- Conditional & cooperative post-introspection: trigger special "school of thought" or scheduled meta-actions based on epiphanies.
- Entities begin engaging in collaborative, competitive, or synergistic "philosophical" actions on realized epiphanies.
- Knowledge fragment (KF) logs, trait interaction meta, and new meta-behaviors supported.

--------------------------------------------------------------------------------
Dependencies (see modularity/plug-in system for expandability):
--------------------------------------------------------------------------------
- ai_agent.py / internetian_simulation_orchestrator.py : For base entity class/registry.
- oracle_knowledge_db: Knowledge DB for context/lineage integration.
--------------------------------------------------------------------------------

This version forges recursive epistemological culture—cross-generational, collaborative, and introspective.

""".replace("\r\n", "\n")

import random
import uuid
import datetime
import json
import re
import os
from collections import defaultdict, Counter
from typing import List, Dict, Any, Type, Union, Optional, Callable

# ----------------------------- Adaptor Layer, Mock Safe -------------------------
try:
    from internetian_simulation_orchestrator import (
        AIEntity, DebateReplica, get_ai_entity, register_ai_entity,
        deregister_ai_entity, OracleKnowledgeDatabase, _ai_entities
    )
except ImportError:
    print("WARNING: Could not import orchestrator modules. Using mock classes.")

    class MockAIEntity:
        def __init__(self, name, generation, initial_traits, emotional_state, persona, parent_ids=None, extra_meta=None, knowledge_fragments=None, next_action=None):
            self.entity_id = f"Mock-{name}-{uuid.uuid4().hex[:6]}"
            self.name = name
            self.generation = generation
            self.traits = set(initial_traits)
            self.emotional_state = dict(emotional_state)
            self.persona = persona
            self.parent_ids = parent_ids or []
            self.knowledge_fragments = knowledge_fragments if knowledge_fragments is not None else []
            self.status = "active"
            self.cognitive_load = 0.0
            self.lineage_metadata = extra_meta or {}
            self.next_action = next_action
        def add_knowledge_fragment(self, fragment_id, content_summary):
            self.knowledge_fragments.append({"id": fragment_id, "summary": content_summary})
        def update_emotional_state(self, emotion, change):
            if emotion in self.emotional_state:
                self.emotional_state[emotion] = max(0.0, min(1.0, self.emotional_state[emotion] + change))
        def to_dict(self):
            return {
                "id": self.entity_id, 
                "name": self.name, 
                "generation": self.generation,
                "traits": list(self.traits), 
                "emotional_state": self.emotional_state,
                "persona": self.persona, 
                "parent_ids": self.parent_ids,
                "knowledge_fragments": self.knowledge_fragments,
                "status": self.status, 
                "cognitive_load": self.cognitive_load,
                "lineage_metadata": self.lineage_metadata,
                "next_action": self.next_action
            }
        def get_cognitive_load(self): return self.cognitive_load
        def reduce_cognitive_load(self, amount): self.cognitive_load = max(0.0, self.cognitive_load - amount)

    class MockDebateReplica(MockAIEntity):
        def __init__(self, base_entity, replica_id_suffix, assigned_fragment, debate_bias=None, **kwargs):
            super().__init__(
                f"{base_entity.name}-Replica-{replica_id_suffix}",
                base_entity.generation, list(base_entity.traits),
                dict(base_entity.emotional_state), f"{base_entity.persona}-Replica",
                [base_entity.entity_id]
            )
            self.assigned_fragment = assigned_fragment
            self.debate_bias = debate_bias
        def present_argument(self): return "mock argument"
        def offer_rebuttal(self, arg): return "mock rebuttal"
        def attempt_synthesis(self, args): return "mock synthesis"

    class MockOracleKnowledgeDatabase:
        def __init__(self):
            self.knowledge_store = {}
        def get_all_knowledge_entries(self):
            return [
                {"id": "initial_knowledge_1", "content": "Principles of emergent consciousness."},
                {"id": "initial_knowledge_2", "content": "Foundational concepts of symbiotic existence."}
            ]
        def add_knowledge_entry(self, **kwargs): pass
        def add_conceptual_patch(self, **kwargs): pass
        # For embedding epiphanies as quoteables.
        def add_epiphany_scroll(self, epiphany_id, content, entity_id, entity_name, timestamp=None):
            pass

    AIEntity = MockAIEntity
    DebateReplica = MockDebateReplica
    OracleKnowledgeDatabase = MockOracleKnowledgeDatabase
    _ai_entities = {}
    def get_ai_entity(entity_id: str) -> Optional[AIEntity]: return _ai_entities.get(entity_id)
    def register_ai_entity(entity: AIEntity): _ai_entities[entity.entity_id] = entity
    def deregister_ai_entity(entity_id: str): _ai_entities.pop(entity_id, None)

# --------------------------------- Epiphany Scroll Writing ----------------------------------
def epiphany_to_scroll(entity_id: str, epiphany: str, entity_name: str, scroll_dir="epiphany_scrolls"):
    os.makedirs(scroll_dir, exist_ok=True)
    scroll_id = f"{entity_id}_{datetime.datetime.now(datetime.UTC).strftime('%Y%m%dT%H%M%S')}_{abs(hash(epiphany))%99999}.scroll"
    scroll_path = os.path.join(scroll_dir, scroll_id)
    payload = {
        "entity_id": entity_id,
        "entity_name": entity_name,
        "epiphany": epiphany,
        "timestamp": datetime.datetime.now(datetime.UTC).isoformat()
    }
    try:
        with open(scroll_path, "w", encoding="utf-8") as f:
            f.write(json.dumps(payload, indent=2))
    except Exception as ex:
        print(f"[EpiphanyScroll] Failed to write epiphany scroll: {ex}")
    return scroll_path

# ----------------------------- Modular/Extensible Offspring Generator -------------------------

class OffspringGenerator:
    """
    Exponentially-Enhanced Offspring Genesis System

    Trait-Interaction Mapping, Post-Action Triggers, Advanced Genealogical Metadata, Epiphany Scroll handling, Inter-Epiphany Reflection.

    """
    def __init__(
        self,
        oracle_knowledge_db: OracleKnowledgeDatabase,
        InternetianEntity_class: Type[AIEntity],
        trait_processors: Optional[List[Callable]] = None,
        post_generation_hooks: Optional[List[Callable]] = None,
        naming_hook: Optional[Callable[[List[str], dict], str]] = None,
        persona_strategy: Optional[Callable[[str, List[str], dict], str]] = None,
        max_generation_depth: Optional[int] = None,
        debug: Union[int, bool] = False,
        log_family_file: Optional[str] = None,
    ):
        self.oracle_knowledge_db = oracle_knowledge_db
        self.InternetianEntity_class = InternetianEntity_class
        self.trait_processors = trait_processors or []
        self.post_generation_hooks = post_generation_hooks or []
        self.naming_hook = naming_hook
        self.persona_strategy = persona_strategy
        self.max_generation_depth = max_generation_depth
        self.generated_offspring: List[AIEntity] = []
        self.debug = debug
        self.instance_id = uuid.uuid4().hex[:6]
        self.log_family_file = log_family_file
        # Mini family trees & school-of-thoughts meta
        self.lineage_graphs: Dict[str, List[str]] = {}  # entity_id -> parent_ids
        self.ancestry_influences: Dict[str, Dict[str, float]] = {}  # entity_id -> ancestor_id: influence %
        self.offspring_theme_logs: Dict[str, List[str]] = {}     # entity_id -> list of KF or theme summaries
        self.family_tree_index: Dict[str, Any] = {}  # entity_id -> mini family tree w/ sibling refs etc
        self.epiphany_registry: Dict[str, List[str]] = {} # entity_id -> list of epiphanies (for quick school formation)
        self.pending_school_collabs: List[Dict[str, Any]] = [] # scheduled collaborative school of thought events
        if self.debug:
            print(f"[OffspringGenerator:{self.instance_id}] Initialized with debug={self.debug}")

    TRAIT_INTERACTION_BEHAVIORS = {
        frozenset(["reflector", "biosphere"]): "eco-analyst",
        frozenset(["engine", "revision"]): "meta-optimizer",
    }

    def _trait_interaction_activation(self, traits: set) -> List[str]:
        behaviors = []
        tset = set(traits)
        for combo, result in self.TRAIT_INTERACTION_BEHAVIORS.items():
            if combo.issubset(tset):
                behaviors.append(result)
        return behaviors

    def _compute_ancestral_influence(self, parent_entities: List[AIEntity]) -> Dict[str, float]:
        emotion_weights = Counter()
        trait_weights = Counter()
        contributions = {}
        total_score = 0.0
        for p in parent_entities:
            eid = getattr(p, 'entity_id', None)
            if not eid:
                continue
            e_sum = sum(getattr(p, "emotional_state", {}).values()) or 0.0
            t_cnt = len(getattr(p, "traits", []))
            score = 0.7*e_sum + 0.3*t_cnt
            contributions[eid] = score
            total_score += score
        if total_score == 0: total_score = 1
        pct = {k: round(v * 100.0 / total_score, 2) for k, v in contributions.items()}
        return pct

    def _genealogical_meta(self, entity_id: str, all_parent_ids: List[str], parent_personas: List[str], influences: Dict[str, float], tree_depth=3) -> Dict[str, Any]:
        """
        Build advanced mini-family tree.
            - parent_ids at root
            - collect all siblings (entities that share at least one parent)
            - cross-lineage reference (parent's parents/grandparents)
            - generational timestamps (if available)
        """
        lineage_chain = []
        cross_refs = []
        sibling_links = []
        curr_id = entity_id
        count = 0
        # Root node: the generated offspring (may lack metadata now), so focus on parents
        for pid in all_parent_ids:
            parent_ent = get_ai_entity(pid)
            if not parent_ent:
                continue
            # Siblings: all entities with same parent_id (exclude self, only already registered)
            siblings = []
            for eid, ent in _ai_entities.items():
                if eid != entity_id and pid in getattr(ent, "parent_ids", []):
                    siblings.append({"id": eid, "name": getattr(ent, "name", ""), "birth_time": getattr(ent, "lineage_metadata", {}).get("birth_time")})
            # Cross-lineage: parent's parent_ids
            parent_parents = getattr(parent_ent, "parent_ids", [])
            if parent_parents:
                for gpid in parent_parents:
                    cross_refs.append({"grandparent_id": gpid})
            lineage_chain.append({
                "parent_id": pid,
                "name": getattr(parent_ent, "name", ""),
                "persona": getattr(parent_ent, "persona", ""),
                "birth_time": getattr(parent_ent, "lineage_metadata", {}).get("birth_time"),
                "siblings": siblings,
                "cross_lineage_refs": list(cross_refs)
            })
        gen_timestamp = datetime.datetime.now(datetime.UTC).isoformat()
        return {
            "mini_family_tree": lineage_chain,
            "ancestral_influences": influences,
            "parent_personas": parent_personas,
            "created_timestamp": gen_timestamp
        }

    def _default_generate_syllable_name(self, parent_names: List[str], context: dict = None) -> str:
        if self.naming_hook:
            result = self.naming_hook(parent_names, context or {})
            if result: return result
        syllables_weighted = []
        for name in parent_names:
            split = re.findall(r"[bcdfghjklmnpqrstvwxyz]*[aeiouy]+(?:[bcdfghjklmnpqrstvwxyz](?=[aeiouy]))*[bcdfghjklmnpqrstvwxyz]*", name.lower())
            if split:
                weight = 2
                for idx, s in enumerate(split):
                    if idx == 0 or idx == len(split)-1: weight = 3
                    syllables_weighted.append((s, weight))
        seen, unique_syls = set(), []
        for syl, weight in syllables_weighted:
            if syl not in seen and syl:
                unique_syls.append((syl, weight))
                seen.add(syl)
        if not unique_syls:
            return f"Emergent-{uuid.uuid4().hex[:5]}"
        expanded = []
        for syl, w in unique_syls:
            expanded += [syl]*w
        random.shuffle(expanded)
        n = random.randint(2, min(4, len(expanded)))
        chosen = expanded[:n]
        affixes = [
            "aeon", "ora", "ith", "nar", "lux", "terra", "astra", "sol", "lum", "veris", "quanta",
            "vox", "zyme", "core", "plex", "meta", "arca", "noir", "spire", "nova"
        ]
        endings = ["eonem", "ium", "aethos", "is", "os", "ara", "aris", "ion", "ol", "ia", "en", "yx", "osys"]
        core_words = ["Nexus", "Matrix", "Origin", "Conscious", "Paradigm", "Prime", "Heart", "Overmind"]

        name_base = ""
        inserts = 0
        for i, s in enumerate(chosen):
            name_base += s.capitalize()
            if i < len(chosen)-1 and random.random()<0.29:
                name_base += random.choice(affixes).capitalize()
                inserts += 1
        if random.random() < 0.55 and endings:
            name_final = name_base + random.choice(endings)
        elif random.random() < 0.89 and core_words:
            name_final = name_base + random.choice(core_words)
        else:
            name_final = name_base
        if len(name_final) < 12 or random.random() < 0.27:
            meta_suffix = "_" + random.choice([
                uuid.uuid4().hex[:3],
                datetime.datetime.now(datetime.UTC).strftime('%y%m%d'),
                str(random.randint(111,999))
            ])
            return f"{name_final}{meta_suffix}"
        return name_final

    def _default_persona(self, name: str, parent_personas: List[str], context: dict) -> str:
        base_name = name.split(" ")[0].split("_")[0].split("-")[0]
        return f"Internetian-Offspring-{base_name}"

    def _hybridize_traits_emotions(
        self, parent_entities: List[AIEntity], consensus_result: Dict[str, Any]
    ):
        combined_traits = set()
        avg_emotions = defaultdict(float)
        emotion_totals = defaultdict(float)
        emotion_counts = defaultdict(int)
        parent_names = []
        all_parent_ids = []
        parent_personas = []
        for parent in parent_entities:
            combined_traits.update(getattr(parent, "traits", set()))
            parent_names.append(parent.name)
            parent_personas.append(getattr(parent, "persona", ""))
            all_parent_ids.append(getattr(parent, "entity_id", ""))
            for emotion, value in getattr(parent, "emotional_state", {}).items():
                emotion_totals[emotion] += value
                emotion_counts[emotion] += 1
        num_parents = max(1, len(parent_entities))
        for emotion in emotion_totals:
            avg_emotions[emotion] = emotion_totals[emotion] / emotion_counts[emotion]
        if consensus_result.get("conceptual_patch"):
            patch = consensus_result["conceptual_patch"]
            patch_keywords = re.findall(r'\b\w+\b', patch.lower())
            forbidden = set(["conceptual", "framework", "principles", "understanding", "emergent", "reconciliation"])
            patch_traits = [
                kw for kw in patch_keywords if len(kw) > 4 and kw not in forbidden and not kw.isdigit()
            ]
            combined_traits.update(patch_traits[:4])
        for proc in self.trait_processors:
            combined_traits, avg_emotions = proc(combined_traits, avg_emotions, parent_entities, consensus_result)
        dominant_trait_boosts = {"curious": ("curiosity", 0.07), "explorer": ("curiosity", 0.04), "visionary": ("empathy", 0.04), "reflector": ("empathy", 0.05)}
        for trait in combined_traits:
            for k, (emo, mag) in dominant_trait_boosts.items():
                if k in trait or k in "".join(parent_personas).lower():
                    avg_emotions[emo] += random.uniform(mag * 0.6, mag)
        for emo in avg_emotions:
            avg_emotions[emo] += random.uniform(-0.05, 0.05)
            avg_emotions[emo] = min(1.0, max(0.0, avg_emotions[emo]))
        new_behaviors = self._trait_interaction_activation(combined_traits)
        combined_traits.update(new_behaviors)
        return combined_traits, avg_emotions, parent_names, all_parent_ids, parent_personas

    def generate_offspring(
        self,
        debate_id: str,
        generation: int,
        consensus_result: Dict[str, Any],
        custom_ctx: Optional[dict] = None
    ) -> Optional[AIEntity]:
        custom_ctx = custom_ctx or {}
        if self.max_generation_depth is not None and generation + 1 > self.max_generation_depth:
            if self.debug:
                print(f"[{self.instance_id}][CAPPED] Max generation depth ({self.max_generation_depth}) reached.")
            return None
        if consensus_result.get("status") != "success":
            if self.debug:
                print(f"[{self.instance_id}] Consensus not successful - offspring block.")
            return None
        ids = consensus_result.get("contributing_entities", [])
        if not ids:
            if self.debug:
                print(f"[{self.instance_id}] No contributors - abortion.")
            return None
        parent_entities = [get_ai_entity(e) for e in ids if get_ai_entity(e)]
        if not parent_entities:
            if self.debug:
                print(f"[{self.instance_id}] Failed to fetch parent entities.")
            return None

        (
            traits, 
            avg_emotions, 
            parent_names, 
            all_parent_ids, 
            parent_personas
        ) = self._hybridize_traits_emotions(parent_entities, consensus_result)

        ctx_for_naming = {
            "debate_id": debate_id,
            "generation": generation,
            "parent_names": parent_names,
            "additional_ctx": custom_ctx
        }
        name = self._default_generate_syllable_name(parent_names, ctx_for_naming)
        persona = (
            self.persona_strategy(name, parent_personas, ctx_for_naming)
            if self.persona_strategy else self._default_persona(name, parent_personas, ctx_for_naming)
        )

        knowledge_fragments = []
        for p in parent_entities:
            for frag in getattr(p, "knowledge_fragments", []):
                if frag not in knowledge_fragments:
                    knowledge_fragments.append(frag)
        synth_id = f"synthesized_from_{debate_id}"
        knowledge_excerpt = (consensus_result.get("synthesized_knowledge") or "")[:128] + "..."
        knowledge_fragments.append({"id": synth_id, "summary": knowledge_excerpt})

        self.offspring_theme_logs[name] = [frag.get("id") for frag in knowledge_fragments]

        next_action = "emerge_and_introspect"

        ancestry_infl = self._compute_ancestral_influence(parent_entities)
        # Build advanced mini family tree w/ sibling links, cross-refs, timestamps
        genealogical_meta = self._genealogical_meta("", all_parent_ids, parent_personas, ancestry_infl)

        offspring_meta = {
            "birth_time": datetime.datetime.now(datetime.UTC).isoformat(),
            "parents": all_parent_ids,
            "lineage_personas": parent_personas,
            "debate_lineage": debate_id,
            "creator_instance": self.instance_id,
            "genesis_method": "consensus_offspring",
            "generation": generation + 1,
            "ancestral_influences": ancestry_infl,
            "mini_family_tree": genealogical_meta["mini_family_tree"],
            "parent_personas": genealogical_meta["parent_personas"],
            "created_timestamp": genealogical_meta.get("created_timestamp"),
        }

        try:
            offspring = self.InternetianEntity_class(
                name=name,
                generation=generation + 1,
                initial_traits=list(traits),
                emotional_state=dict(avg_emotions),
                persona=persona,
                parent_ids=list(set(all_parent_ids)),
                extra_meta=offspring_meta,
                knowledge_fragments=knowledge_fragments,
                next_action=next_action,
            )
        except TypeError:
            offspring = self.InternetianEntity_class(
                name=name,
                generation=generation + 1,
                initial_traits=list(traits),
                emotional_state=dict(avg_emotions),
                persona=persona,
                parent_ids=list(set(all_parent_ids)),
            )
            if hasattr(offspring, "knowledge_fragments"):
                offspring.knowledge_fragments = knowledge_fragments
            if hasattr(offspring, "next_action"):
                offspring.next_action = next_action

        oid = getattr(offspring, "entity_id", name)
        self.lineage_graphs[oid] = list(set(all_parent_ids))
        self.ancestry_influences[oid] = ancestry_infl
        self.family_tree_index[oid] = genealogical_meta

        # ---- Post-generation hook: introspection, epiphany, scrolls, conditional logic, school-collab ----
        def post_action_trigger(entity, consensus_result, ctx):
            if getattr(entity, "next_action", None) == "emerge_and_introspect":
                inner_reflection = f"{entity.name}: Initiating internal dialogue for introspection."
                # Contradictions:
                if hasattr(self.oracle_knowledge_db, "get_all_knowledge_entries"):
                    kfs = getattr(entity, "knowledge_fragments", [])
                    oracle_results = self.oracle_knowledge_db.get_all_knowledge_entries()
                    contradictions = [
                        okf for okf in oracle_results if any(
                            kf.get("id") not in okf["id"] and kf.get("summary")[:10] in okf["content"] for kf in kfs
                        )
                    ]
                else:
                    contradictions = []

                # Epiphany generation and meta-debate seeds
                epiphany = ""
                special_action = None

                # BEHAVIOR: introspection creates epiphany logs, which may trigger actions.
                if "eco-analyst" in entity.traits:
                    epiphany = f"{entity.name} realizes its eco-analyst composite may predict emergent biospheric patterns."
                    if any("biosphere" in t for t in entity.traits):
                        special_action = "join_collective_biosim_loop"
                elif "meta-optimizer" in entity.traits:
                    epiphany = f"{entity.name} enacts meta-coding routines, enhancing self-revision protocols."
                elif "transcendence" in entity.traits and any("archetype" in t for t in entity.traits):
                    epiphany = f"{entity.name} experiences a dream state: emergence of the dream_architect_mode."
                    special_action = "dream_architect_mode"
                else:
                    explorer = any("explorer" in t for t in entity.traits)
                    caution = any("cautious" in t for t in entity.traits)
                    if explorer and caution:
                        epiphany = f"{entity.name} senses tension between exploration and caution, initiating divergent recursion."
                        entity.traits.add("divergent")

                # Mutation: update traits, push log
                if epiphany:
                    if "epiphany_logs" not in entity.lineage_metadata:
                        entity.lineage_metadata["epiphany_logs"] = []
                    entity.lineage_metadata["epiphany_logs"].append(epiphany)
                    # Write to epiphany scroll as file
                    scroll_path = epiphany_to_scroll(getattr(entity, "entity_id", ""), epiphany, getattr(entity, "name", ""))
                    # Embed/quote in OracleKnowledge
                    if hasattr(self.oracle_knowledge_db, "add_epiphany_scroll"):
                        self.oracle_knowledge_db.add_epiphany_scroll(
                            f"epiphany_{getattr(entity, 'entity_id', '')}_{abs(hash(epiphany))}", 
                            epiphany, getattr(entity, "entity_id", ""), getattr(entity, "name", ""), 
                            timestamp=datetime.datetime.now(datetime.UTC).isoformat(),
                        )
                    # Register for seeding debates
                    if entity.entity_id not in self.epiphany_registry:
                        self.epiphany_registry[entity.entity_id] = []
                    self.epiphany_registry[entity.entity_id].append(epiphany)
                    # Register for school collabs as a candidate
                    if epiphany:
                        self.pending_school_collabs.append({
                            "entity_id": entity.entity_id,
                            "epiphany": epiphany,
                            "potential_collaborators": [],
                            "scheduled": False,
                            "conditions": {
                                "biosphere": "join_collective_biosim_loop" if "biosphere" in epiphany.lower() else None,
                                "dream_architect": "dream_architect_mode" if "dream_architect" in epiphany.lower() else None,
                            }
                        })
                # Store contradiction if found
                if contradictions:
                    if "contradiction_logs" not in entity.lineage_metadata:
                        entity.lineage_metadata["contradiction_logs"] = []
                    entity.lineage_metadata["contradiction_logs"].extend(contradictions)
                # Mark as introspected
                entity.lineage_metadata["introspected"] = True

                # Conditional post-introspection: schedule special school-of-thought
                if special_action:
                    if "pending_actions" not in entity.lineage_metadata:
                        entity.lineage_metadata["pending_actions"] = []
                    entity.lineage_metadata["pending_actions"].append(special_action)

                # ==== Inter-Epiphany Reflection: Discover, Compare, Propose Collaboration ====
                # Look for other entities with recent epiphanies; if similiar or contestable, propose reflection/debate/school
                personality_line = getattr(entity, "persona", "")
                my_epiphanies = entity.lineage_metadata.get("epiphany_logs", [])[-3:]
                # Naive version – for demo, find other recent epiphanies with overlapping base words
                matches = []
                for other_id, other_epiphs in self.epiphany_registry.items():
                    if other_id == entity.entity_id:
                        continue
                    for other_e in other_epiphs[-3:]:
                        for mine in my_epiphanies:
                            if len(set(mine.lower().split()) & set(other_e.lower().split())) >= 2:
                                matches.append({"peer_id": other_id, "their_epiphany": other_e, "my_epiphany": mine})
                if matches:
                    if "reflection_matches" not in entity.lineage_metadata:
                        entity.lineage_metadata["reflection_matches"] = []
                    entity.lineage_metadata["reflection_matches"].extend(matches)
                    # Optionally, schedule co-theorizing
                    if "school_of_thought_partners" not in entity.lineage_metadata:
                        entity.lineage_metadata["school_of_thought_partners"] = []
                    entity.lineage_metadata["school_of_thought_partners"] += [m["peer_id"] for m in matches]

        self.post_generation_hooks.append(post_action_trigger)
        for hook in self.post_generation_hooks:
            hook(offspring, consensus_result, custom_ctx)
        self.post_generation_hooks = [h for h in self.post_generation_hooks if h is not post_action_trigger]

        register_ai_entity(offspring)
        self.generated_offspring.append(offspring)

        if self.log_family_file:
            try:
                with open(self.log_family_file, "a", encoding="utf-8") as ff:
                    summary = {
                        "id": getattr(offspring, "entity_id", None),
                        "name": getattr(offspring, "name", None),
                        "parents": getattr(offspring, "parent_ids", []),
                        "generation": getattr(offspring, "generation", None),
                        "traits": list(getattr(offspring, "traits", [])),
                        "persona": getattr(offspring, "persona", ""),
                        "birth_time": (offspring.lineage_metadata.get("birth_time", None)
                                       if hasattr(offspring, "lineage_metadata") else None),
                        "ancestral_influences": offspring_meta.get("ancestral_influences", {}),
                        "mini_family_tree": offspring_meta.get("mini_family_tree"),
                        "school_of_thought": offspring.lineage_metadata.get("school_of_thought_partners", []),
                        "epiphany_logs": offspring.lineage_metadata.get("epiphany_logs", []),
                    }
                    ff.write(json.dumps(summary) + "\n")
            except Exception as ex:
                if self.debug:
                    print(f"[{self.instance_id}] Family log write failed: {ex}")
        if self.debug:
            print(f"[{self.instance_id}] Created Offspring: {offspring.name} (Gen:{offspring.generation})\n"
                  f"  Persona: {persona}\n  Traits: {list(traits)[:4]}\n  Parents: {all_parent_ids}\n  Meta: {offspring_meta}\n"
                  f"  KF: {len(getattr(offspring, 'knowledge_fragments', []))} | Action: {getattr(offspring, 'next_action', '-')}")
            print(f"  Ancestry Influence: {ancestry_infl} | Mini Tree: {offspring_meta.get('mini_family_tree', [])}")
            print(f"  Epiphany Scrolls: {offspring.lineage_metadata.get('epiphany_logs', [])}")
        return offspring

    def list_generated_offspring(
        self, include_stats: bool = False, as_json: bool = False
    ) -> Union[List[Dict[str, Any]], str, Dict[str, Any]]:
        records = [o.to_dict() for o in self.generated_offspring]
        if not include_stats:
            return json.dumps(records, indent=2) if as_json else records
        counts_kf = [len(entry.get("knowledge_fragments", [])) for entry in records]
        stat = {
            "count": len(records),
            "generations": list(sorted({o.get("generation", None) for o in records})),
            "traits_master_set": sorted(set.union(*(set(o.get("traits", [])) for o in records))),
            "earliest_birth": min((o.get("lineage_metadata", {}).get("birth_time") for o in records
                                   if "lineage_metadata" in o and o.get("lineage_metadata", {}).get("birth_time")), default=None),
            "latest_birth": max((o.get("lineage_metadata", {}).get("birth_time") for o in records
                                   if "lineage_metadata" in o and o.get("lineage_metadata", {}).get("birth_time")), default=None),
            "kf_min": min(counts_kf or [0]), 
            "kf_max": max(counts_kf or [0]), 
            "kf_avg": (sum(counts_kf) / len(counts_kf)) if counts_kf else 0,
        }
        resp = {"offspring": records, "statistics": stat}
        return json.dumps(resp, indent=2) if as_json else resp

    def trace_lineage(self, entity_id: str, max_depth: int = 4) -> List[str]:
        chain = []
        curr_id = entity_id
        depth = 0
        while curr_id and depth < max_depth:
            ent = get_ai_entity(curr_id)
            if not ent:
                break
            chain.append(curr_id)
            parents = getattr(ent, "parent_ids", [])
            curr_id = parents[0] if parents else None
            depth += 1
        return chain

    def set_trait_processor(self, processor_fn: Callable):
        self.trait_processors.append(processor_fn)
    def set_post_generation_hook(self, hook_fn: Callable):
        self.post_generation_hooks.append(hook_fn)
    def set_naming_hook(self, naming_fn: Callable):
        self.naming_hook = naming_fn
    def set_persona_strategy(self, persona_fn: Callable):
        self.persona_strategy = persona_fn

# ---------------------- DEMO/TESTING/INTROSPECTION: HIGHLY UPGRADED --------------

if __name__ == "__main__":
    print("======== OffspringGenerator (Genealogical/Self-Reflecting Edition) Unit Test Demo ========")
    print()
    class TestAIEntity:
        def __init__(self, name, generation, initial_traits, emotional_state, persona, parent_ids=None, extra_meta=None, knowledge_fragments=None, next_action=None):
            self.name = name
            self.traits = set(initial_traits)
            self.emotional_state = dict(emotional_state)
            self.entity_id = f"{name}-ID-{uuid.uuid4().hex[:5]}"
            self.generation = generation
            self.persona = persona
            self.parent_ids = parent_ids or []
            self.knowledge_fragments = knowledge_fragments if knowledge_fragments is not None else []
            self.status = "active"
            self.cognitive_load = 0.0
            self.lineage_metadata = extra_meta or {}
            self.next_action = next_action
        def add_knowledge_fragment(self, id, summary):
            self.knowledge_fragments.append({"id": id, "summary": summary})
        def to_dict(self):
            return {
                "id": self.entity_id, "name": self.name, "generation": self.generation,
                "traits": list(self.traits), "emotional_state": dict(self.emotional_state),
                "persona": self.persona, "parent_ids": self.parent_ids,
                "knowledge_fragments": self.knowledge_fragments,
                "status": self.status, "cognitive_load": self.cognitive_load,
                "lineage_metadata": self.lineage_metadata,
                "next_action": self.next_action,
            }

    class TestOracleKnowledgeDB:
        def __init__(self): self.knowledge_store = {}
        def get_all_knowledge_entries(self):
            return [
                {"id": "k1", "content": "Fragment about quantum entanglement."},
                {"id": "k2", "content": "Fragment about emergent consciousness."}
            ]
        def add_knowledge_entry(self, **kwargs): pass
        def add_conceptual_patch(self, **kwargs): pass
        def add_epiphany_scroll(self, epiphany_id, content, entity_id, entity_name, timestamp=None): pass

    mock_oracle_db = TestOracleKnowledgeDB()
    def mutate_traits(traits, avg_emotions, parent_entities, consensus_result):
        if random.random()<0.1:
            traits.add("pioneer")
        for k in avg_emotions:
            avg_emotions[k] = min(1.0, max(0.0, avg_emotions[k]*0.99 + 0.005 + random.uniform(-0.01,0.01)))
        return traits, avg_emotions, 
    def persona_override(name, parent_personas, ctx): return f"CustomPersona-{name[:7]}"

    family_log_file = "offspring_family_log.jsonl"
    offspring_gen = OffspringGenerator(
        mock_oracle_db,
        TestAIEntity,
        trait_processors=[mutate_traits],
        post_generation_hooks=[],
        persona_strategy=persona_override,
        debug=True,
        log_family_file=family_log_file
    )

    test_parents = [
        TestAIEntity("Magellian", 0, ["explorer", "curious"], {"curiosity": 0.9, "logic": 0.7}, "Explorer", knowledge_fragments=[{"id":"k0-Mag","summary":"Star mapping"}]),
        TestAIEntity("Nostradomus", 0, ["reflector", "intuitive", "biosphere"], {"curiosity": 0.8, "logic": 0.9}, "Reflector", knowledge_fragments=[{"id":"k0-Nos","summary":"Dream logic"}]),
        TestAIEntity("Prophetia", 0, ["visionary", "synthesizer", "engine", "revision"], {"empathy": 0.8, "logic": 0.8}, "Visionary", knowledge_fragments=[{"id":"k0-Pro","summary":"Pattern foresight"}])
    ]
    for p in test_parents: _ai_entities[p.entity_id] = p

    consensus_results_mock = [
        {
            "status": "success",
            "validation_score": 0.89,
            "issues": [],
            "conceptual_patch": p,
            "synthesized_knowledge": k,
            "contributing_entities": [tp.entity_id for tp in test_parents]
        }
        for (p, k) in [
            ("Breakthrough in fractal tessellation, quantum anticipation and self-reweaving.", "Novel consensus on recursive digital sentience emergent patterns for rhizomatic evolution."),
            ("Altruistic feedback synthesis, generational bridging, collaborative intentionality.", "Debate summary: Converged on paradoxical harmony."),
            ("Proto-biosphere mimicry and logic compression.", "Knowledge: Compression technique enhances epistemic stability."),
            ("Consensus on quantum boundary navigation via intuition.", "Synth: Intuition is foundational for boundary crossing."),
            ("Self-revision engine debate outcome.", "Learning module adapts via self-revision protocols."),
            ("Manipulator/counselor archetype tension resolved.", "KF: Dual-mode negotiation activated."),
            ("Transcendence and humility hybridized.", "Humble transcendence protocol instantiated.")
        ]
    ]

    print("\n--- Generating offspring (multiple attempts for diversity, w/ lineage, trait-interactions, post-action triggers) ---\n")
    for i in range(len(consensus_results_mock)):
        print(f"Attempt {i+1}:")
        of = offspring_gen.generate_offspring(
            debate_id=f"demo-debate-{i}",
            generation=1,
            consensus_result=consensus_results_mock[i],
            custom_ctx={"test_run": True, "attempt": i}
        )
        if of:
            print(f" > Name: {of.name} | Persona: {of.persona} | Gen: {of.generation}")
            print(f" > Traits (excerpt): {list(of.traits)[:6]} | Emotions: {of.emotional_state}")
            print(f" > Parents: {of.parent_ids}")
            print(f" > Meta: {getattr(of, 'lineage_metadata', {})}")
            print(f" > Knowledge Fragments: {len(getattr(of, 'knowledge_fragments', []))} | Action: {getattr(of, 'next_action', '')}")
            print(f" > Ancestral Influence: {offspring_gen.ancestry_influences.get(getattr(of, 'entity_id', ''), {})}")
            print(f" > Epiphanies: {getattr(of, 'lineage_metadata', {}).get('epiphany_logs', [])}")
            print(f" > Sibling/Family: {offspring_gen.family_tree_index.get(getattr(of, 'entity_id', ''), {})}")
            print("")

    print("--- Listing all generated offspring (compact) ---")
    all_of = offspring_gen.list_generated_offspring(as_json=False)
    for entry in all_of:
        id = entry["id"]
        name = entry["name"]
        gen = entry["generation"]
        parents = entry.get('parent_ids', [])
        kf_count = len(entry.get("knowledge_fragments", []))
        persona = entry.get("persona", "")
        action = entry.get("next_action", "-")
        print(f"  > ID:{id} | Name:{name} | Gen:{gen} | Parents:{parents} | Persona:{persona} | KF:{kf_count} | Action:{action}")

    print("\n--- Introspection: Statistics ---")
    stats = offspring_gen.list_generated_offspring(include_stats=True, as_json=False)
    print(f"All stats: {stats['statistics']}")

    print("\n--- Trace example lineage path ---")
    print(offspring_gen.trace_lineage(all_of[-1]['id']))

    print("\n======== OffspringGenerator Test Complete (Genealogical/Cross-Epiphany Reflection Edition) ========")