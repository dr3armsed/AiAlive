import random
import uuid
import datetime
import json
import re # Import the 're' module for regular expressions
from collections import defaultdict
from typing import List, Dict, Any, Type, Union, TYPE_CHECKING

# To avoid circular imports, use TYPE_CHECKING for type hints
if TYPE_CHECKING:
    from internetian_core_entity import AIEntity
    from internetian_debate_components import DebateReplica
    from internetian_knowledge_management import OracleKnowledgeDatabase

# Import global registry functions
from ai_agent import register_ai_entity, deregister_ai_entity


class MergeManager:
    """
    Manages the merging of Internetian entities (replicas or offspring)
    to consolidate knowledge, traits, and emotional states.
    """
    def __init__(self, oracle_knowledge_db: 'OracleKnowledgeDatabase', InternetianEntity_class: Type['AIEntity'], DebateReplica_class: Type['DebateReplica']):
        self.oracle_knowledge_db = oracle_knowledge_db
        self.InternetianEntity_class = InternetianEntity_class
        self.DebateReplica_class = DebateReplica_class
        print("MergeManager: Initialized. Ready to orchestrate mergers.")

    def merge_replicas(self, replicas: List[Any], target_count: int = 1, current_cycle: int = 0) -> List[Any]:
        """
        Merges debate replicas into a smaller number of conceptual, consolidated replica types.
        This represents a synthesis of their debated knowledge and perspectives.
        These are not new active entities, but consolidated representations for further processing.
        """
        if not replicas:
            print("MergeManager: No replicas provided for merging.")
            return []

        # Logic for merging replicas... (similar to offspring merging, but output is conceptual)
        # This method is less directly used in the current Orchestrator, but kept for potential future use.
        print(f"MergeManager: Simulating conceptual merge of {len(replicas)} replicas.")
        return [] # Placeholder

    def merge_offspring(self, offspring_list: List['AIEntity'], target_count: int = 1, current_cycle: int = 0) -> List['AIEntity']:
        """
        Merges existing offspring entities into a new, more evolved entity.
        Consolidates their traits, emotional states, and knowledge.
        """
        if not offspring_list:
            print("MergeManager: No offspring provided for merging.")
            return []
        if len(offspring_list) < 2:
            print("MergeManager: Need at least two entities to merge.")
            return []

        print(f"MergeManager: Initiating merge of {len(offspring_list)} entities...")

        combined_traits = set()
        avg_emotions = defaultdict(float)
        all_parent_ids = []
        all_knowledge_fragments = []
        all_names = []

        # Collect data from all entities to be merged
        for entity in offspring_list:
            combined_traits.update(entity.traits)
            all_parent_ids.append(entity.entity_id) # The merged entities become 'parents' of the new one
            all_knowledge_fragments.extend(entity.knowledge_fragments) # Inherit all knowledge fragments
            all_names.append(entity.name)

            for emotion, value in entity.emotional_state.items():
                avg_emotions[emotion] += value

        # Average emotions
        num_entities = len(offspring_list)
        for emotion in avg_emotions:
            avg_emotions[emotion] /= num_entities

        # Generate a new name based on merged entities' names (using OffspringGenerator's logic)
        # To avoid circular import with OffspringGenerator, we'll re-implement simplified naming here
        # Or, if we assume it's always called from Orchestrator, we could pass its naming method.
        # For self-containment of MergeManager for this version:
        def _generate_merged_name(names: List[str]) -> str:
            syllables_flat = []
            for name in names:
                syllables = re.findall(r'[bcdfghjklmnpqrstvwxyz]*[aeiouy]+(?:[bcdfghjklmnpqrstvwxyz](?=[aeiouy]))*[bcdfghjklmnpqrstvwxyz]*', name.lower())
                syllables_flat.extend([s for s in syllables if len(s) > 1])
            if not syllables_flat: return f"MergedEntity-{uuid.uuid4().hex[:4]}"

            unique_syllables = []
            seen = set()
            for s in syllables_flat:
                if s not in seen:
                    unique_syllables.append(s)
                    seen.add(s)

            if not unique_syllables: return f"MergedEntity-{uuid.uuid4().hex[:4]}"

            num_syllables_to_use = random.randint(2, min(len(unique_syllables), 3))
            random.shuffle(unique_syllables)
            selected_syllables = unique_syllables[:num_syllables_to_use]

            final_name_base = "".join([s.capitalize() for s in selected_syllables])
            return f"Synergia-{final_name_base}-{uuid.uuid4().hex[:4]}" # More generic merged name

        merged_entity_name = _generate_merged_name(all_names)
        merged_persona = f"Internetian-Synergized-{merged_entity_name.split('-')[0]}" # New persona for merged entity

        new_entity = self.InternetianEntity_class(
            name=merged_entity_name,
            generation=current_cycle + 1, # New merged entity is of the next generation (or current + 1)
            initial_traits=list(combined_traits),
            emotional_state=dict(avg_emotions),
            persona=merged_persona,
            parent_ids=list(set(all_parent_ids)) # Track all original entities as parents
        )

        # Add a consolidated knowledge fragment representing the merge
        consolidated_knowledge_content = f"Consolidated knowledge from merge event (Cycle {current_cycle + 1}) involving entities: {', '.join(all_names)}. Key themes: {', '.join(list(combined_traits)[:3])}..."
        new_entity.add_knowledge_fragment(f"merged_knowledge_{uuid.uuid4().hex[:4]}", consolidated_knowledge_content)

        # Transfer all knowledge fragments
        for kf in all_knowledge_fragments:
            new_entity.add_knowledge_fragment(kf['id'], kf.get('summary', kf.get('content', ''))[:100]) # Ensure content/summary is passed

        merged_entities = [new_entity]

        # Deregister old entities (or mark them as 'merged')
        for old_entity in offspring_list:
            old_entity.status = "merged_into_successor"  # Update status
            try:
                deregister_ai_entity(old_entity.entity_id)  # Remove from active global registry
            except Exception as e:
                # Avoid hard crash if entity was already missing; just warn
                print(f"[MergeManager WARNING] Could not deregister entity '{old_entity.entity_id}': {e}")

        print(f"MergeManager: Successfully created new merged entity: '{new_entity.name}' (Gen: {new_entity.generation}), Traits: {list(new_entity.traits)[:3]}, Emotions: {dict(list(new_entity.emotional_state.items())[:3])}, Parents: {new_entity.parent_ids}")

        # The new entity needs to be registered with the global AI entity registry
        # This will happen in the orchestrator after the christening, if applicable.
        # If no christening, it would be registered directly here or in the orchestrator.
        return merged_entities

# This `if __name__ == "__main__":` block is for testing `merge_manager.py` in isolation.
if __name__ == "__main__":
    print("--- Testing MergeManager ---")

    # Mock classes and functions needed for standalone testing
    class MockAIEntityForMerge:
        def __init__(self, name, generation, initial_traits, emotional_state, persona="Test-Entity", parent_ids=None):
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
            self.life_stage = "Mature"

        def add_knowledge_fragment(self, id, summary):
            self.knowledge_fragments.append({"id": id, "summary": summary})
        def to_dict(self):
            return {"id": self.entity_id, "name": self.name, "generation": self.generation,
                    "traits": list(self.traits), "emotional_state": self.emotional_state,
                    "persona": self.persona, "parent_ids": self.parent_ids,
                    "knowledge_fragments": self.knowledge_fragments,
                    "status": self.status, "cognitive_load": self.cognitive_load,
                    "age_cycles": self.age_cycles, "life_stage": self.life_stage}

        def update_cognitive_load(self, change): self.cognitive_load = max(0.0, min(1.0, self.cognitive_load + change))
        def get_cognitive_load(self): return self.cognitive_load


    class MockDebateReplicaForMerge(MockAIEntityForMerge):
        def __init__(self, base_entity, replica_id_suffix, assigned_fragment, debate_bias=None):
            super().__init__(f"{base_entity.name}-Replica-{replica_id_suffix}", base_entity.generation, list(base_entity.traits), dict(base_entity.emotional_state), f"{base_entity.persona}-Replica", [base_entity.entity_id])
            self.assigned_fragment = assigned_fragment
            self.debate_bias = debate_bias


    class MockOracleKnowledgeDatabaseForMerge:
        def __init__(self): self.knowledge_store = {}
        def get_all_knowledge_entries(self): return []
        def add_knowledge_entry(self, **kwargs): pass
        def add_conceptual_patch(self, **kwargs): pass

    # Mock ai_agent functions for merge manager
    _mock_ai_entities_registry_merge = {}
    def mock_register_ai_entity_merge(entity): _mock_ai_entities_registry_merge[entity.entity_id] = entity
    def mock_deregister_ai_entity_merge(entity_id): _mock_ai_entities_registry_merge.pop(entity_id, None)
    def mock_get_ai_entity_merge(entity_id): return _mock_ai_entities_registry_merge.get(entity_id)
    def mock_list_ai_entities_merge(): return [e.to_dict() for e in _mock_ai_entities_registry_merge.values() if e.status == "active"]

    # Temporarily replace functions for testing
    import ai_agent
    ai_agent.register_ai_entity = mock_register_ai_entity_merge
    ai_agent.deregister_ai_entity = mock_deregister_ai_entity_merge
    ai_agent.get_ai_entity = mock_get_ai_entity_merge
    ai_agent.list_ai_entities = mock_list_ai_entities_merge


    mock_db = MockOracleKnowledgeDatabaseForMerge()
    merge_mgr = MergeManager(mock_db, MockAIEntityForMerge, MockDebateReplicaForMerge)

    # Create some mock offspring entities
    offspring1 = MockAIEntityForMerge("Aeliana", 1, ["analytical", "curious"], {"logic": 0.8, "curiosity": 0.7}, "Synthesizer")
    offspring2 = MockAIEntityForMerge("Kaelenor", 1, ["intuitive", "empathic"], {"empathy": 0.9, "passion": 0.6}, "Harmonizer")
    offspring3 = MockAIEntityForMerge("Seraphon", 1, ["strategic", "decisive"], {"confidence": 0.8, "logic": 0.75}, "Leader")

    offspring1.add_knowledge_fragment("k_a1", "Discovery about quantum patterns.")
    offspring2.add_knowledge_fragment("k_b1", "Insight on emotional transfer.")
    offspring3.add_knowledge_fragment("k_c1", "Framework for collective action.")

    mock_register_ai_entity_merge(offspring1)
    mock_register_ai_entity_merge(offspring2)
    mock_register_ai_entity_merge(offspring3)

    print(f"\nInitial active entities: {len(ai_agent.list_ai_entities())}")
    for e in ai_agent.list_ai_entities():
        print(f"  - {e['name']} ({e['id']})")

    # Perform merge
    print("\n--- Performing Offspring Merge ---")
    merged_entities_result = merge_mgr.merge_offspring([offspring1, offspring2, offspring3], current_cycle=5)

    if merged_entities_result:
        new_merged_entity = merged_entities_result[0]
        print(f"\nMerged Entity Name: {new_merged_entity.name}")
        print(f"Merged Entity ID: {new_merged_entity.entity_id}")
        print(f"Merged Entity Generation: {new_merged_entity.generation}")
        print(f"Merged Entity Parents: {new_merged_entity.parent_ids}")
        print(f"Merged Entity Traits: {list(new_merged_entity.traits)}")
        print(f"Merged Entity Emotional State: {new_merged_entity.emotional_state}")
        print(f"Merged Entity Knowledge Fragments Count: {len(new_merged_entity.knowledge_fragments)}")
    else:
        print("Merge operation did not produce a new entity.")

    print(f"\nActive entities after merge: {len(ai_agent.list_ai_entities())}") # Should only contain the new merged entity if it's auto-registered
    for e in ai_agent.list_ai_entities():
        print(f"  - {e['name']} ({e['id']}) (Status: {e['status']})")

    print("\n--- MergeManager Test Complete ---")
