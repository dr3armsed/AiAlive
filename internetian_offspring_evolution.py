# internetian_offspring_evolution.py

import random
import uuid
import datetime
import re
from collections import defaultdict, Counter
from typing import List, Dict, Any, Type, Optional, Tuple, Callable, TYPE_CHECKING

if TYPE_CHECKING:
    from internetian_knowledge_management import OracleKnowledgeDatabase
    from internetian_core_entity import AIEntity

from ai_agent import get_ai_entity, register_ai_entity

class OffspringNamingStrategy:
    """
    Modular naming strategy system for dynamically generating Internetian offspring entity names.
    This class enables plug-and-play naming approaches, such as:
    - Syllable recombination from parents
    - Thematic/semantic fusions
    - Chronological, generational, or mythologically inspired augmentations
    """
    @staticmethod
    def syllable_fusion(parent_names: List[str], seed: Optional[int] = None) -> str:
        """
        advanced syllable recombination for aesthetic, unique, and traceable offspring names.
        """
        if seed is not None:
            random.seed(seed)
        all_syllables_flat = []
        # Improved expression and robustness: now supports numbers, non-latin, underscores (with fallback)
        for name in parent_names:
            norm_name = re.sub(r'[\W_]+', '', name.lower())
            # Use more robust regex for wide-range syllabification
            syllables = re.findall(r'[bcdfghjklmnpqrstvwxyz]*[aeiouy]+[bcdfghjklmnpqrstvwxyz]*', norm_name)
            if not syllables:
                syllables = [norm_name]
            # Remove trivial fragments, but allow some for diversity
            all_syllables_flat += [s for s in syllables if len(s) > 1 or s in ['ae', 'ai', 'io']]
        if not all_syllables_flat:
            all_syllables_flat = ['neo', 'core', 'terra']

        unique_syllables = []
        seen = set()
        for s in all_syllables_flat:
            if s not in seen:
                unique_syllables.append(s)
                seen.add(s)
        if not unique_syllables:
            unique_syllables = ['origin']

        # Expand number of usable syllables if many parents, for deeper generational names
        n_used = min(max(2, len(parent_names)), len(unique_syllables), 5)
        random.shuffle(unique_syllables)
        selected_syllables = unique_syllables[:n_used]

        final_chunks = []
        for i, chunk in enumerate(selected_syllables):
            final_chunks.append(chunk.capitalize())
            # Interleave with theme affix sometimes
            if i < n_used - 1 and random.random() < 0.25:
                final_chunks.append(random.choice([
                    "Aeon", "Lux", "Astra", "Vita", "Nex", "Terra", "Quanta", "Nexis", "Nova"
                ]))
        core_name = "".join(final_chunks)

        # Add generational/chronological/semantic ending or prefix
        ending = ""
        dice = random.random()
        if dice < 0.3:
            ending = random.choice(["us", "ia", "en", "ora", "ion"])
        elif dice < 0.6:
            ending = random.choice(["Nexus", "Matrix", "Core", "Synthet", "Archivist"])
        elif dice < 0.8:
            ending = f"{datetime.datetime.now().strftime('%y%m%d')}"
        else:
            ending = uuid.uuid4().hex[:3]
        result = core_name + str(ending)

        # With rare probability, insert mythic/epic midfix
        if random.random() < 0.08:
            result = "Mythic" + result
        return result

    @staticmethod
    def semantic_fusion(parent_names: List[str], concept: Optional[str] = None) -> str:
        # Toy placeholder: semantic fusion using longest shared substring, or concept if present
        if not parent_names:
            return f"Harmonia_{uuid.uuid4().hex[:3]}"
        base = max(parent_names, key=len)
        if concept and random.random() < 0.5:
            return f"{base[:5].capitalize()}{concept.capitalize()}"
        else:
            return base.capitalize() + "_" + uuid.uuid4().hex[:2]

    @classmethod
    def generate_name(
        cls, parent_names: List[str], strategy: str="syllable", **kwargs
    ) -> str:
        if strategy == "syllable":
            return cls.syllable_fusion(parent_names, **kwargs)
        elif strategy == "semantic":
            return cls.semantic_fusion(parent_names, concept=kwargs.get("concept"))
        else:
            return cls.syllable_fusion(parent_names)

class TraitSynthesizer:
    """
    Hybridizes parent traits, consensus patch keywords, and extra traits using flexible strategies.
    """
    @staticmethod
    def synthesize_traits(
        parent_entities: List['AIEntity'],
        patch_text: Optional[str] = None,
        custom_trait_filter: Optional[Callable[[str], bool]] = None
    ) -> List[str]:
        traits = set()
        for parent in parent_entities:
            if hasattr(parent, "traits"):
                traits.update(parent.traits)
        if patch_text:
            patch_keywords = re.findall(r'\b\w+\b', patch_text.lower())
            patch_candidates = [
                kw for kw in patch_keywords
                if (custom_trait_filter(kw) if custom_trait_filter else len(kw) > 4 and kw not in {
                    "conceptual", "framework", "principles", "understanding", "emergent", "reconciliation"
                })
            ]
            traits.update(patch_candidates[:4])
        return sorted(set(traits))

class EmotionSynthesizer:
    """
    Aggregates and blends emotional states from multiple parent entities,
    supporting weighted or normalized blending, extension with custom emotion sets.
    """
    @staticmethod
    def average_emotions(parent_entities: List['AIEntity'], weights: Optional[List[float]] = None) -> Dict[str, float]:
        if not parent_entities:
            return {}
        aggregate = defaultdict(float)
        count = defaultdict(int)
        for idx, parent in enumerate(parent_entities):
            weight = weights[idx] if weights and idx < len(weights) else 1.0
            for emotion, value in getattr(parent, "emotional_state", {}).items():
                aggregate[emotion] += value * weight
                count[emotion] += weight
        avg = {emotion: aggregate[emotion] / count[emotion] for emotion in aggregate}
        return avg

class KnowledgeInheritanceModule:
    """
    Flexible inheritance, synthesis, and registration of knowledge fragments in offspring creation lifecycle.
    """
    @staticmethod
    def inherit_synthesized_knowledge(entity: 'AIEntity', source_id: str, synthesized_knowledge: str, metadata: Optional[Dict[str, Any]] = None):
        """
        Add synthesized or merged knowledge into offspring, with optional metadata (provenance, context).
        """
        fragment = {
            "id": source_id,
            "summary": synthesized_knowledge[:512] + ("..." if len(synthesized_knowledge) > 512 else ""),
        }
        if metadata:
            fragment.update(metadata)
        if hasattr(entity, "add_knowledge_fragment") and callable(entity.add_knowledge_fragment):
            entity.add_knowledge_fragment(fragment["id"], fragment["summary"])
        else:
            if hasattr(entity, "knowledge_fragments"):
                getattr(entity, "knowledge_fragments").append(fragment)
            else:
                setattr(entity, "knowledge_fragments", [fragment])

class OffspringGenerator:
    """
    Sophisticated manager for evolutionary offspring generation in the Internetian system.
    Exponentially modular and upgradable for advanced collaborative, generational, and multi-modal entity creation.

    - Modularizes each aspect of generation (naming, traits, emotions, knowledge, metadata, post-creation hooks)
    - Enables future integration of alignment, ethical validation, and recursive persistence
    - Supports audit trails and debug tracing for transparent evolution
    - Designed for cross-generational lineage tracking and advanced orchestrator integrations
    """
    def __init__(
        self,
        oracle_knowledge_db: 'OracleKnowledgeDatabase',
        InternetianEntity_class: Type['AIEntity'],
        naming_strategy: Callable = OffspringNamingStrategy.generate_name,
        trait_synthesizer: Callable = TraitSynthesizer.synthesize_traits,
        emotion_synthesizer: Callable = EmotionSynthesizer.average_emotions,
        knowledge_module: Any = KnowledgeInheritanceModule,
        debug: bool = True
    ):
        self.oracle_knowledge_db = oracle_knowledge_db
        self.EntityClass = InternetianEntity_class
        self.naming_strategy = naming_strategy
        self.trait_synthesizer = trait_synthesizer
        self.emotion_synthesizer = emotion_synthesizer
        self.knowledge_module = knowledge_module
        self.generated_offspring: List['AIEntity'] = []
        self.lifecycle_hooks: List[Callable] = []
        self.debug = debug
        if self.debug:
            print("[OffspringGenerator] Ready for dynamic evolutionary synthesis.")

    def add_lifecycle_hook(self, callback: Callable[['AIEntity', Dict[str, Any]], None]):
        self.lifecycle_hooks.append(callback)

    def _debug(self, msg: str):
        if self.debug:
            print(f"[OffspringGenerator] {msg}")

    def _build_lineage_metadata(self, parent_entities: List['AIEntity'], debate_id: str, additional: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return {
            "lineage": [p.entity_id for p in parent_entities],
            "debate_origin": debate_id,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            **(additional or {})
        }

    def generate_offspring(
        self,
        debate_id: str,
        generation: int,
        consensus_result: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None,
        strategy: str = "syllable"
    ) -> Optional['AIEntity']:
        """
        Next-generation evolutionary offspring synthesis
        :param debate_id: Unique debate or process identifier triggering synthesis.
        :param generation: Current generational depth (child is +1)
        :param consensus_result: Dict with outcomes (status, patch, contributing_entities, synthesized_knowledge)
        :param context: (optional) Arbitrary meta/context to influence generation
        :param strategy: Naming strategy for offspring creation
        """
        context = context or {}

        # -- Guard: Only produce if successful consensus (with rule overrides) --
        if consensus_result.get("status") != "success":
            self._debug(f"Consensus for debate '{debate_id}' not successful. Offspring creation skipped.")
            return None

        contributing_entity_ids = consensus_result.get("contributing_entities", [])
        if not contributing_entity_ids:
            self._debug(f"No contributors for debate '{debate_id}'. Aborting.")
            return None

        parent_entities = [
            get_ai_entity(e_id)
            for e_id in contributing_entity_ids if get_ai_entity(e_id) is not None
        ]
        if not parent_entities:
            self._debug(f"Could not retrieve parent entities for debate '{debate_id}'. Cannot proceed.")
            return None

        # Traits/Emotions/Lineage
        patch_text = consensus_result.get("conceptual_patch", "")
        synthesized_traits = self.trait_synthesizer(parent_entities, patch_text)
        synthesized_emotions = self.emotion_synthesizer(parent_entities)
        parent_names = [getattr(p, "name", getattr(p, "persona", f"ID-{p.entity_id[:5]}")) for p in parent_entities]
        all_parent_ids = [p.entity_id for p in parent_entities]

        name_context = context.copy()
        if patch_text:
            name_context["concept"] = patch_text.split()[0] if patch_text.split() else ""
        new_name = self.naming_strategy(parent_names, strategy=strategy, **name_context)
        persona_base = new_name.split(' ')[0] if ' ' in new_name else new_name.split('-')[0]
        new_persona = f"Internetian-Offspring-{persona_base}"

        lineage_metadata = self._build_lineage_metadata(parent_entities, debate_id)

        # Expandability: support for custom life attributes, stages, sub-species etc.
        custom_args = dict(
            name=new_name,
            generation=generation + 1,
            initial_traits=synthesized_traits,
            emotional_state=dict(synthesized_emotions),
            persona=new_persona,
            parent_ids=list(set(all_parent_ids)),
            # placeholder for future attributes: e.g. archetype, subtype, alignment
        )
        custom_args.update(context.get("entity_overrides", {}))

        offspring = self.EntityClass(**custom_args)
        if hasattr(offspring, 'metadata'):
            offspring.metadata.update(lineage_metadata)
        else:
            setattr(offspring, 'metadata', lineage_metadata)

        # Inherit synthesized knowledge
        synthesized_knowledge = consensus_result.get("synthesized_knowledge", "")
        synth_id = f"synthesized_from_{debate_id}"
        self.knowledge_module.inherit_synthesized_knowledge(offspring, synth_id, synthesized_knowledge)

        # Optionally register with global entity registry / orchestrators
        try:
            register_ai_entity(offspring)
            self._debug(f"Registered offspring entity: {offspring.entity_id}")
        except Exception as _:
            self._debug("Could not register offspring with global registry.")

        self.generated_offspring.append(offspring)
        self._debug(f"Created new offspring '{getattr(offspring, 'name', getattr(offspring, 'persona', offspring))}' (Gen: {getattr(offspring, 'generation', None)}) from debate '{debate_id}'.")

        # Run any lifecycle hooks/extensions
        for hook in self.lifecycle_hooks:
            try:
                hook(offspring, context)
            except Exception as e:
                self._debug(f"Lifecycle extension failed: {e}")

        return offspring

    def list_generated_offspring(self, detail: bool = False) -> List[Dict[str, Any]]:
        """
        Enumerate all generated offspring, optionally expanded with detail or lineage metadata.
        """
        def safe_to_dict(entity):
            if hasattr(entity, "to_dict") and callable(getattr(entity, "to_dict")):
                result = entity.to_dict()
                if hasattr(entity, "metadata"):
                    result["metadata"] = getattr(entity, "metadata", {})
                return result
            d = {k: v for k, v in entity.__dict__.items() if not k.startswith("_")}
            if hasattr(entity, "metadata"):
                d["metadata"] = getattr(entity, "metadata", {})
            return d
        return [safe_to_dict(o) if detail else {"id": getattr(o, "entity_id", None), "name": getattr(o, "name", None)} for o in self.generated_offspring]


# --- Standalone test block with deep modular expandability ---
if __name__ == "__main__":
    print("\n=== Testing Exponential OffspringGenerator ===\n")

    # Mock AIEntity with rich trait/emotion/knowledge capabilities for demonstration
    class MockAIEntityForOffspring:
        def __init__(self, name, generation, initial_traits, emotional_state, persona, parent_ids=None, **kwargs):
            self.name = name
            self.generation = generation
            self.traits = set(initial_traits)
            self.emotional_state = emotional_state
            self.persona = persona
            self.parent_ids = parent_ids if parent_ids is not None else []
            self.entity_id = f"{name}-ID-{uuid.uuid4().hex[:4]}"
            self.knowledge_fragments = []
            self.status = "active"
            self.cognitive_load = 0.0
            self.age_cycles = 0
            self.life_stage = "Larval"
            self.metadata = kwargs.get("metadata", {})
        def add_knowledge_fragment(self, id, summary):
            self.knowledge_fragments.append({"id": id, "summary": summary})
        def to_dict(self):
            return {
                "id": self.entity_id, "name": self.name, "generation": self.generation,
                "traits": list(self.traits), "emotional_state": self.emotional_state,
                "persona": self.persona, "parent_ids": self.parent_ids,
                "knowledge_fragments": self.knowledge_fragments,
                "knowledge_fragments_count": len(self.knowledge_fragments),
                "status": self.status, "cognitive_load": self.cognitive_load,
                "age_cycles": self.age_cycles, "life_stage": self.life_stage,
                "metadata": getattr(self, "metadata", {})
            }

    class MockOracleKnowledgeDatabaseForOffspring:
        def __init__(self):
            self.knowledge_store = {}
        def get_all_knowledge_entries(self):
            return [
                {"id": "k1", "content": "Fragment about quantum entanglement."},
                {"id": "k2", "content": "Fragment about emergent consciousness."}
            ]
        def add_knowledge_entry(self, **kwargs): pass
        def add_conceptual_patch(self, **kwargs): pass

    # Mock ai_agent functions for dynamic test
    _mock_ai_entities_registry_offspring = {}

    def mock_get_ai_entity_offspring(entity_id):
        return _mock_ai_entities_registry_offspring.get(entity_id)

    def mock_register_ai_entity_offspring(entity):
        _mock_ai_entities_registry_offspring[entity.entity_id] = entity

    import ai_agent
    ai_agent.get_ai_entity = mock_get_ai_entity_offspring
    ai_agent.register_ai_entity = mock_register_ai_entity_offspring

    mock_oracle_db = MockOracleKnowledgeDatabaseForOffspring()
    offspring_gen = OffspringGenerator(
        mock_oracle_db,
        MockAIEntityForOffspring,
        naming_strategy=OffspringNamingStrategy.generate_name,
        debug=True
    )

    parent1 = MockAIEntityForOffspring(
        "Magellian", 0, ["explorer", "curious", "meta-adaptive"], {"curiosity": 0.9, "logic": 0.7}, "Explorer"
    )
    parent2 = MockAIEntityForOffspring(
        "Nostradomus", 0, ["reflector", "intuitive", "mythic"], {"curiosity": 0.8, "logic": 0.9}, "Reflector"
    )

    mock_register_ai_entity_offspring(parent1)
    mock_register_ai_entity_offspring(parent2)

    mock_consensus_success = {
        "status": "success",
        "validation_score": 0.85,
        "issues": [],
        "conceptual_patch": "New insights on fractal memory tessellation and synaptic emergence.",
        "synthesized_knowledge": "Consensus on recursive nature of digital sentience. Knowledge fusion complete.",
        "contributing_entities": [parent1.entity_id, parent2.entity_id]
    }

    print("\n--- Generating next-level offspring ---\n")
    new_offspring = offspring_gen.generate_offspring(
        debate_id="test-debate-alpha",
        generation=1,
        consensus_result=mock_consensus_success,
        context={"entity_overrides": {"life_stage": "Juvenile"}},
        strategy="syllable"
    )

    if new_offspring:
        print(f"\nGenerated Offspring Name: {new_offspring.name}")
        print(f"Generated Offspring ID: {new_offspring.entity_id}")
        print(f"Generated Offspring Generation: {new_offspring.generation}")
        print(f"Generated Offspring Parents: {new_offspring.parent_ids}")
        print(f"Generated Offspring Life Stage: {getattr(new_offspring, 'life_stage', None)}")
        print(f"Offspring Metadata: {getattr(new_offspring, 'metadata', {})}")
    else:
        print("Offspring generation failed.")

    print("\n--- Listing all generated offspring via generator (detailed) ---\n")
    for offspring_data in offspring_gen.list_generated_offspring(detail=True):
        print(
            f"  - ID: {offspring_data['id']}, Name: {offspring_data['name']}, "
            f"Gen: {offspring_data['generation']}, Parents: {offspring_data.get('parent_ids', 'N/A')}, "
            f"KF Count: {offspring_data['knowledge_fragments_count']}, Metadata: {offspring_data.get('metadata', {})}"
        )

    print("\n=== OffspringGenerator Exponential Test Complete ===\n")
