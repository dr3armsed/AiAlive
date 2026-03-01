# internetian_simulation_orchestrator.py


import datetime
import hashlib  # For security layer hashing
import json
import os
import random
import re  # Import regex for file pattern matching
import uuid
from collections import defaultdict, deque
from dataclasses import dataclass
from enum import Enum, auto
from typing import List, Optional, Dict, Any, Type, Tuple, Set  # CRITICAL: Ensure Type is imported from 'typing'

import numpy as np  # For semantic similarity calculations

# Import external libraries for advanced features
# Ensure these are installed: pip install transformers networkx scikit-learn sentence-transformers numpy
try:
    from transformers import pipeline
    import networkx as nx
    from sentence_transformers import SentenceTransformer
    from sklearn.cluster import DBSCAN
except ImportError:
    print("WARNING: Missing required libraries for advanced features (transformers, networkx, scikit-learn, sentence-transformers).\n"
          "Please install them using: pip install transformers networkx scikit-learn sentence-transformers numpy\n"
          "Running with dummy implementations for affected features.")
    # Provide dummy classes or minimal implementations if libraries are not found,
    # so the simulation can still run without crashing, albeit without advanced features.
    class DummyPipeline:
        def __call__(self, *args, **kwargs):
            return [{"generated_text": "Dummy text for NLP pipeline."}]


    def encode(**kwargs):
        return np.zeros(384) # Common embedding size


    class DummySentenceTransformer:
        pass


    def fit(**kwargs):
        class Labels:
            labels_ = []
        return Labels()


    class DummyDBSCAN:
        pass


    def nodes(**kwargs): return []


    def bfs_edges(*args, **kwargs): return []


    class DummyDiGraph:
        def __init__(self): pass
        def add_node(self, *args, **kwargs): pass
        def add_edge(self, *args, **kwargs): pass


    pipeline = DummyPipeline
    nx = DummyDiGraph() # Instantiate a dummy graph
    SentenceTransformer = DummySentenceTransformer
    DBSCAN = DummyDBSCAN


# Import MergeManager (it's in its own file)
# Assuming merge_manager.py exists in the same directory as orchestrator.py or is accessible
try:
    from merge_manager import MergeManager
except ImportError:
    print("WARNING: merge_manager.py not found. Merge functionality will be skipped.")
    # Define a dummy MergeManager to prevent crashes
    def merge_offspring(*args, **kwargs):
        print("Dummy MergeManager: Skipping merge operation.")
        return []


    class MergeManager:
        def __init__(self, **kwargs):
            print("Dummy MergeManager initialized. Merge operations will not be performed.")


# --- Global Definitions (from internetian_knowledge_management.py) ---

class KnowledgeType(Enum):
    CORE_MEMORY = auto()
    DEBATE_CONSENSUS = auto()
    EMERGENT_INSIGHT = auto()
    EXTERNAL_IMPORT = auto()
    METAKNOWLEDGE = auto()
    # Adding categories based on user's suggestion for richer content
    PLAY = auto()
    STORY_SHORT = auto()
    STORY_MEDIUM = auto()
    STORY_LONG = auto()
    THESIS = auto()
    THEORY = auto()
    HYPOTHESIS = auto()
    HISTORY = auto()
    RELIGION = auto()
    PHILOSOPHY = auto() # For the philosophical debates


class PatchType(Enum):
    AMENDMENT = auto()
    REFINEMENT = auto()
    RECONCILIATION = auto()
    CORRECTION = auto()
    EXTENSION = auto()
    CLARIFICATION = auto()
    PARADIGM_SHIFT = auto()


@dataclass
class KnowledgeEntry:
    id: str
    content: str
    type: KnowledgeType
    source: str
    timestamp: datetime.datetime
    consensus_score: float
    conceptual_patches: List[str] # List of patch IDs
    contributing_entities: List[str]
    metadata: Dict[str, Any]
    embeddings: Optional[np.ndarray] = None
    dependencies: Set[str] = None
    last_accessed: datetime.datetime = None
    signature: Optional[str] = None # For Security Layer: JWT-style signature

    def __post_init__(self):
        if self.dependencies is None:
            self.dependencies = set()
        if self.last_accessed is None:
            self.last_accessed = datetime.datetime.now()
        # Generate a simple hash signature on creation
        if self.signature is None:
            self.signature = hashlib.sha256(f"{self.content}{self.timestamp.isoformat()}".encode()).hexdigest()

    # Method to update signature if content changes (symbolic)
    def update_signature(self):
        self.signature = hashlib.sha256(f"{self.content}{datetime.datetime.now().isoformat()}".encode()).hexdigest()


class KnowledgeGraph:
    def __init__(self):
        self.graph = nx.DiGraph()
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2') # Load SentenceTransformer
        self.semantic_cache = {}

    def add_node(self, knowledge_entry: KnowledgeEntry):
        """Add a knowledge entry to the graph with semantic embeddings"""
        if knowledge_entry.id not in self.graph:
            if knowledge_entry.embeddings is None:
                knowledge_entry.embeddings = self._get_embeddings(knowledge_entry.content)

            self.graph.add_node(
                knowledge_entry.id,
                entry=knowledge_entry,
                embeddings=knowledge_entry.embeddings,
                last_accessed=knowledge_entry.last_accessed
            )

            # Add edges for dependencies
            for dep_id in knowledge_entry.dependencies:
                if dep_id in self.graph and dep_id != knowledge_entry.id: # Prevent self-loops
                    self.graph.add_edge(dep_id, knowledge_entry.id, relationship="depends_on")

    def _get_embeddings(self, text: str) -> np.ndarray:
        """Get or create semantic embeddings for text"""
        text_hash = hashlib.md5(text.encode()).hexdigest()
        if text_hash not in self.semantic_cache:
            try:
                # Check if the real SentenceTransformer model is available
                # If SentenceTransformer was successfully imported, self.embedding_model will be an instance of it.
                if isinstance(self.embedding_model, SentenceTransformer):
                    self.semantic_cache[text_hash] = self.embedding_model.encode(text, convert_to_numpy=True)
                else:
                    # Fallback to the global dummy encode if SentenceTransformer import failed
                    # This 'encode' is defined in the ImportError block.
                    self.semantic_cache[text_hash] = encode(text, convert_to_numpy=True)
            except Exception as e:
                print(f"Error generating embeddings for text: {e}. Returning zeros.")
                self.semantic_cache[text_hash] = np.zeros(384) # Fallback to zeros if encoding fails
        return self.semantic_cache[text_hash]

    def find_semantic_matches(self, query: str, threshold: float = 0.7, top_n: int = 5) -> List[Tuple[str, float]]:
        """Find knowledge entries semantically similar to the query"""
        query_embedding = self._get_embeddings(query)
        similarities = []

        for node_id, node_data in self.graph.nodes(data=True):
            node_embedding = node_data.get('embeddings')
            if node_embedding is not None and np.linalg.norm(query_embedding) != 0 and np.linalg.norm(node_embedding) != 0:
                # Move retrieval of query_embedding into the loop to resolve the reference issue,
                # but only get it once outside the loop, as it's used in every iteration.
                # Since the reference error would only arise if query_embedding wasn't defined,
                # ensure it's fetched just prior to use (should be defined at function start).
                # Defensive fix: assign explicit variable at the top.
                # (Already exists: query_embedding = self._get_embeddings(query))

                # Calculate cosine similarity for each node.
                dot_product = np.dot(query_embedding, node_embedding)
                norm_query = np.linalg.norm(query_embedding)
                norm_node = np.linalg.norm(node_embedding)
                if norm_query != 0 and norm_node != 0:
                    # Use float norms to avoid integer truncation and division problems
                    # Defensive patch for possible type errors: explicitly cast indices to int if needed
                    sim = dot_product / float(norm_query * norm_node) if norm_query != 0 and norm_node != 0 else 0.0
                    similarities.append((node_id, float(sim)))

        # Sort by similarity and filter by threshold
        similarities.sort(key=lambda x: x[1], reverse=True)
        return [x for x in similarities[:top_n] if x[1] >= threshold]

    def get_related_knowledge(self, knowledge_id: str, depth: int = 2) -> List[str]:
        """Get knowledge entries related through the graph structure"""
        if knowledge_id not in self.graph:
            return []

        related = set()
        # Using BFS to find related nodes up to a certain depth
        for source, target in bfs_edges(self.graph, knowledge_id, depth_limit=depth):
            if source != knowledge_id: related.add(source)
            if target != knowledge_id: related.add(target)

        # Also consider nodes that depend on this knowledge
        for pred in self.graph.predecessors(knowledge_id):
            related.add(pred)
        for succ in self.graph.successors(knowledge_id):
            related.add(succ)

        return list(related)


class OracleKnowledgeDatabase:
    """
    Advanced knowledge management system with:
    - Semantic knowledge graph
    - Versioned knowledge entries
    - Advanced search and retrieval
    - Automatic knowledge maintenance (including decay)
    - Temporal knowledge tracking
    - Basic signature for immutability
    """

    def __init__(self,
                 db_file: str = "oracle_knowledge_db.json",
                 patches_dir: str = "patches",
                 knowledge_outputs_dir: str = "knowledge_outputs",
                 core_memories_dir: Optional[str] = None,
                 max_cache_size: int = 1000):

        self.knowledge_store: Dict[str, KnowledgeEntry] = {}  # Current active knowledge
        self.knowledge_versions = defaultdict(deque)  # Version history (stores tuples of (version_id, KnowledgeEntry))
        self.conceptual_patches = {} # Stores patch dicts for quick lookup
        self.patch_impact_log = defaultdict(list) # Stores log of patch impacts
        self.db_file = db_file
        self.patches_dir = patches_dir
        self.knowledge_outputs_dir = knowledge_outputs_dir
        self.core_memories_dir = core_memories_dir
        self.knowledge_graph = KnowledgeGraph() # Initialize KnowledgeGraph
        self.max_cache_size = max_cache_size
        self.access_cache = deque(maxlen=max_cache_size)
        self.nlp_pipeline = pipeline("text-generation", model="gpt2")  # Simple model for demo

        # Ensure directories exist
        os.makedirs(self.patches_dir, exist_ok=True)
        os.makedirs(self.knowledge_outputs_dir, exist_ok=True)

        self.load_knowledge()
        if not self.knowledge_store: # Only seed if database is truly empty after loading
            self._seed_initial_knowledge()

        print(f"OracleKnowledgeDatabase: Initialized with advanced features. Knowledge entries: {len(self.knowledge_store)}, Patches: {len(self.conceptual_patches)}. Cache size: {max_cache_size}")

    def _seed_initial_knowledge(self):
        """Seeds the database with initial knowledge from core memory files."""
        if self.core_memories_dir and os.path.exists(self.core_memories_dir):
            print(f"OracleKnowledgeDatabase: Seeding initial knowledge from {self.core_memories_dir}...")
            for filename in os.listdir(self.core_memories_dir):
                if filename.endswith(".txt"): # Expecting .txt files for initial seeding
                    file_path = os.path.join(self.core_memories_dir, filename)
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()

                    knowledge_id = f"core-memory-{os.path.splitext(filename)[0].replace(' ', '_')}-{uuid.uuid4().hex[:4]}"
                    # Infer KnowledgeType from filename if possible, otherwise default to CORE_MEMORY
                    file_base_name = os.path.splitext(filename)[0].lower()
                    inferred_type = KnowledgeType.CORE_MEMORY
                    for kt in KnowledgeType:
                        if kt.name.lower() in file_base_name:
                            inferred_type = kt
                            break

                    self.add_knowledge_entry(
                        knowledge_id=knowledge_id,
                        content=content,
                        knowledge_type=inferred_type, # Use inferred type
                        source="initial_seeding",
                        consensus_score=1.0, # Assumed high consensus for core memories
                        conceptual_patches=[],
                        contributing_entities=["system_initializer"],
                        metadata={"source_file": filename}
                    )
            print("OracleKnowledgeDatabase: Initial knowledge seeding complete.")
        else:
            print(f"OracleKnowledgeDatabase: No core memories directory found at {self.core_memories_dir}. Skipping initial seeding.")


    def add_knowledge_entry(self,
                            knowledge_id: str,
                            content: str,
                            knowledge_type: KnowledgeType,
                            source: str,
                            consensus_score: float,
                            conceptual_patches: List[str],
                            contributing_entities: List[str],
                            metadata: Optional[Dict[str, Any]] = None,
                            dependencies: Optional[Set[str]] = None) -> KnowledgeEntry:
        """
        Adds a new validated knowledge entry with advanced features:
        - Version tracking
        - Semantic embedding
        - Dependency tracking
        - Access caching
        - Signature generation
        """
        if metadata is None:
            metadata = {}
        if dependencies is None:
            dependencies = set()

        # Create the knowledge entry
        entry = KnowledgeEntry(
            id=knowledge_id,
            content=content,
            type=knowledge_type,
            source=source,
            timestamp=datetime.datetime.now(),
            consensus_score=consensus_score,
            conceptual_patches=conceptual_patches,
            contributing_entities=contributing_entities,
            metadata=metadata,
            dependencies=dependencies,
            last_accessed=datetime.datetime.now()
            # Signature is generated in __post_init__
        )

        # Handle versioning: If ID exists, store current version
        if knowledge_id in self.knowledge_store:
            current_entry = self.knowledge_store[knowledge_id]
            version_id = f"{knowledge_id}_v{len(self.knowledge_versions[knowledge_id]) + 1}"
            self.knowledge_versions[knowledge_id].append((version_id, current_entry))
            print(f"OracleKnowledgeDatabase: Versioning existing knowledge {knowledge_id} as {version_id}")

        # Store the new entry as current
        self.knowledge_store[knowledge_id] = entry
        self.knowledge_graph.add_node(entry) # Add to graph or update node
        self.access_cache.append(knowledge_id) # Update access cache

        # Save to disk
        self.save_knowledge()

        # Generate and save outputs as Markdown files
        tags = [knowledge_type.name.lower(), "new_knowledge"]
        if "tags" in metadata:
            tags.extend(metadata["tags"])
        self.save_synthesized_knowledge_to_file(knowledge_id, content, tags)

        print(f"OracleKnowledgeDatabase: Added knowledge entry '{knowledge_id}' (Type: {knowledge_type.name}).")
        return entry

    def add_conceptual_patch(self,
                             patch_id: str,
                             related_knowledge_id: str,
                             patch_content: str,
                             patch_type: PatchType,
                             source_entities: List[str],
                             impact_analysis: Optional[str] = None) -> Dict[str, Any]:
        """
        Adds a conceptual patch with impact tracking and automatic propagation.
        """
        if related_knowledge_id not in self.knowledge_store:
            print(f"WARNING: Related knowledge '{related_knowledge_id}' not found for patch '{patch_id}'.")
            return {}

        patch_entry = {
            "id": patch_id,
            "related_knowledge_id": related_knowledge_id,
            "timestamp": datetime.datetime.now().isoformat(),
            "content": patch_content,
            "type": patch_type.name,
            "source_entities": source_entities,
            "impact_analysis": impact_analysis,
            "signature": hashlib.sha256(f"{patch_content}{datetime.datetime.now().isoformat()}".encode()).hexdigest() # Patch signature
        }

        self.conceptual_patches[patch_id] = patch_entry

        # Update the related knowledge entry's conceptual_patches list
        related_entry = self.knowledge_store[related_knowledge_id]
        if patch_id not in related_entry.conceptual_patches: # Avoid duplicates
            related_entry.conceptual_patches.append(patch_id)
            related_entry.update_signature() # Update signature of affected knowledge
            self.knowledge_graph.add_node(related_entry) # Update graph node

        # Analyze and log impact
        impact = self._analyze_patch_impact(patch_id, related_knowledge_id)
        # Ensure patch_id is always an int or str, not float; coerce to str if necessary
        patch_id_key = str(int(patch_id)) if isinstance(patch_id, float) and patch_id.is_integer() else str(patch_id)
        # Store as a list as expected type (the defaultdict expects a list)
        if isinstance(impact, list):
            self.patch_impact_log[patch_id_key] = impact
        else:
            self.patch_impact_log[patch_id_key] = [impact]

        self.save_knowledge()
        self.save_conceptual_patch_to_file(patch_id, patch_content, patch_type.name)

        print(f"OracleKnowledgeDatabase: Added conceptual patch '{patch_id}' (Type: {patch_type.name}).")
        return patch_entry

    def _analyze_patch_impact(self, patch_id: str, knowledge_id: str) -> Dict[str, Any]:
        """
        Analyzes the potential impact of a patch on related knowledge.
        This is a placeholder for more sophisticated impact analysis, e.g., using LLMs
        to determine semantic consequences.
        """
        related_knowledge_ids = self.knowledge_graph.get_related_knowledge(knowledge_id)
        patch_entry = self.conceptual_patches[patch_id]

        impact_areas = []
        # Limit to top 3 related items for brevity in simulation logs
        for rel_id in related_knowledge_ids[:3]:
            rel_entry = self.knowledge_store.get(rel_id)
            if rel_entry:
                # Generate a simple impact description using NLP pipeline (simulated)
                prompt = (f"Knowledge A: {rel_entry.content[:150]}...\n"
                          f"Patch: {patch_entry['content']}\n"
                          f"How might this patch affect Knowledge A?")
                try:
                    impact_desc = self.nlp_pipeline(prompt, max_length=2000, do_sample=True, truncation=True)[0]['generated_text']
                    # Attempt to clean up the generated text to get a concise impact statement
                    impact_desc_cleaned = impact_desc.split('\n')[-1].strip()
                    if len(impact_desc_cleaned) > 150: impact_desc_cleaned = impact_desc_cleaned[:150] + "..."
                except Exception as e:
                    impact_desc_cleaned = f"Simulated impact analysis failed: {e}. General impact on related knowledge."

                impact_areas.append({
                    "related_knowledge": rel_id,
                    "impact_description": impact_desc_cleaned
                })

        return {
            "patch_id": patch_id,
            "timestamp": datetime.datetime.now().isoformat(),
            "primary_impact_target": knowledge_id,
            "secondary_impacts": impact_areas
        }

    def get_knowledge_entry(self, knowledge_id: str, update_access: bool = True) -> Optional[KnowledgeEntry]:
        """Retrieves a knowledge entry with access tracking."""
        entry = self.knowledge_store.get(knowledge_id)
        if entry and update_access:
            entry.last_accessed = datetime.datetime.now()
            self.access_cache.append(knowledge_id)
        return entry

    def find_semantic_matches(self, query: str, threshold: float = 0.7, top_n: int = 5) -> List[Tuple[KnowledgeEntry, float]]:
        """Find knowledge entries semantically similar to the query."""
        matches = self.knowledge_graph.find_semantic_matches(query, threshold, top_n)
        return [(self.knowledge_store[match_id], score) for match_id, score in matches if match_id in self.knowledge_store]

    def get_knowledge_chain(self, knowledge_id: str, depth: int = 2) -> List[KnowledgeEntry]:
        """Get a chain of related knowledge entries."""
        related_ids = self.knowledge_graph.get_related_knowledge(knowledge_id, depth)
        return [self.knowledge_store.get(rid) for rid in related_ids if rid in self.knowledge_store]

    def save_knowledge(self):
        """Saves the current state of the knowledge base with versioning."""
        # Convert KnowledgeEntry objects to dictionaries for JSON serialization
        knowledge_store_serializable = {}
        for k, v in self.knowledge_store.items():
            knowledge_store_serializable[k] = {
                "id": v.id,
                "content": v.content,
                "type": v.type.name, # Convert Enum to string
                "source": v.source,
                "timestamp": v.timestamp.isoformat(),
                "consensus_score": v.consensus_score,
                "conceptual_patches": v.conceptual_patches,
                "contributing_entities": v.contributing_entities,
                "metadata": v.metadata,
                "dependencies": list(v.dependencies),
                "last_accessed": v.last_accessed.isoformat() if v.last_accessed else None,
                "signature": v.signature
            }

        # Convert version history to serializable format
        knowledge_versions_serializable = {}
        for k, v_deque in self.knowledge_versions.items():
            knowledge_versions_serializable[k] = []
            for vid, entry_obj in v_deque:
                knowledge_versions_serializable[k].append((vid, {
                    "id": entry_obj.id,
                    "content": entry_obj.content,
                    "type": entry_obj.type.name,
                    "timestamp": entry_obj.timestamp.isoformat(),
                    "source": entry_obj.source, # Include source for version entries
                    "consensus_score": entry_obj.consensus_score, # Include score for version entries
                    "signature": entry_obj.signature # Include signature for version entries
                }))


        save_data = {
            "knowledge_store": knowledge_store_serializable,
            "conceptual_patches": self.conceptual_patches,
            "patch_impact_log": self.patch_impact_log,
            "knowledge_versions": knowledge_versions_serializable
        }

        try:
            with open(self.db_file, 'w', encoding='utf-8') as f:
                json.dump(save_data, f, indent=4, default=str) # `default=str` handles datetime objects
        except IOError as e:
            print(f"ERROR: Could not save knowledge database to {self.db_file}: {e}")
        except Exception as e:
            print(f"An unexpected error occurred during knowledge saving: {e}")

    def load_knowledge(self):
        """Loads the knowledge base with version history."""
        try:
            if os.path.exists(self.db_file):
                with open(self.db_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                # Load current knowledge
                self.knowledge_store = {}
                for k, v in data.get("knowledge_store", {}).items():
                    entry = KnowledgeEntry(
                        id=v["id"],
                        content=v["content"],
                        type=KnowledgeType[v["type"]], # Convert string back to Enum
                        source=v.get("source", "loaded_from_db"), # Add default for older formats
                        timestamp=datetime.datetime.fromisoformat(v["timestamp"]),
                        consensus_score=v.get("consensus_score", 0.0), # Add default
                        conceptual_patches=v.get("conceptual_patches", []), # Add default
                        contributing_entities=v.get("contributing_entities", []), # Add default
                        metadata=v.get("metadata", {}), # Add default
                        dependencies=set(v.get("dependencies", [])),
                        last_accessed=datetime.datetime.fromisoformat(v["last_accessed"]) if v.get("last_accessed") else None,
                        signature=v.get("signature")
                    )
                    self.knowledge_store[k] = entry
                    self.knowledge_graph.add_node(entry) # Re-add to graph

                # Load patches and impact logs
                self.conceptual_patches = data.get("conceptual_patches", {})
                # Need to convert back from list if it was serialized as such
                if isinstance(data.get("patch_impact_log"), dict):
                    self.patch_impact_log = defaultdict(list, data.get("patch_impact_log", {}))
                else: # Handle case where it might have been default-dictated to something else
                    self.patch_impact_log = defaultdict(list)
                    for key, val in data.get("patch_impact_log", {}).items():
                        self.patch_impact_log[key] = val


                # Load version history
                self.knowledge_versions = defaultdict(deque)
                for k, versions in data.get("knowledge_versions", {}).items():
                    for vid, v_dict in versions:
                        # Reconstruct KnowledgeEntry object for version history
                        versioned_entry = KnowledgeEntry(
                            id=v_dict["id"],
                            content=v_dict["content"],
                            type=KnowledgeType[v_dict["type"]],
                            timestamp=datetime.datetime.fromisoformat(v_dict["timestamp"]),
                            source=v_dict.get("source", "versioned_entry"),
                            consensus_score=v_dict.get("consensus_score", 0.0),
                            conceptual_patches=v_dict.get("conceptual_patches", []),
                            contributing_entities=v_dict.get("contributing_entities", []),
                            metadata=v_dict.get("metadata", {}),
                            dependencies=set(v_dict.get("dependencies", [])),
                            last_accessed=datetime.datetime.fromisoformat(v_dict["last_accessed"]) if v_dict.get("last_accessed") else None,
                            signature=v_dict.get("signature")
                        )
                        self.knowledge_versions[k].append((vid, versioned_entry))

                print(f"OracleKnowledgeDatabase: Loaded knowledge database with {len(self.knowledge_store)} entries and {len(self.conceptual_patches)} patches.")
            else:
                print(f"OracleKnowledgeDatabase: No existing database file found at {self.db_file}. Starting fresh.")
        except json.JSONDecodeError as e:
            print(f"ERROR: Could not decode JSON from {self.db_file}: {e}. Starting fresh.")
            self.knowledge_store = {}
            self.conceptual_patches = {}
            self.patch_impact_log = defaultdict(list)
            self.knowledge_versions = defaultdict(deque)
        except IOError as e:
            print(f"ERROR: Could not load knowledge database from {self.db_file}: {e}. Starting fresh.")
            self.knowledge_store = {}
            self.conceptual_patches = {}
            self.patch_impact_log = defaultdict(list)
            self.knowledge_versions = defaultdict(deque)
        except Exception as e:
            print(f"An unexpected error occurred during knowledge loading: {e}. Starting fresh.")
            self.knowledge_store = {}
            self.conceptual_patches = {}
            self.patch_impact_log = defaultdict(list)
            self.knowledge_versions = defaultdict(deque)


    def save_conceptual_patch_to_file(self, patch_id: str, content: str, patch_type: str):
        """Saves a conceptual patch with metadata as a Markdown file."""
        filename = f"conceptual_patch_{patch_id}_{patch_type}.md"
        file_path = os.path.join(self.patches_dir, filename)
        patch_entry = self.conceptual_patches.get(patch_id, {})
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(f"# Conceptual Patch: {patch_id}\n")
                f.write(f"**Type:** {patch_type}\n")
                f.write(f"**Created:** {patch_entry.get('timestamp', datetime.datetime.now().isoformat())}\n")
                f.write(f"**Signature:** {patch_entry.get('signature', 'N/A')}\n\n") # Add signature
                f.write("## Patch Content:\n")
                f.write(content + "\n\n")
                f.write("## Impact Analysis:\n")
                # Use json.dumps for pretty printing the impact log
                f.write(json.dumps(self.patch_impact_log.get(patch_id, {}), indent=2))
            print(f"OracleKnowledgeDatabase: Saved conceptual patch file: {file_path}")
        except IOError as e:
            print(f"ERROR: Could not save conceptual patch file {file_path}: {e}")
        except Exception as e:
            print(f"An unexpected error occurred saving patch file {file_path}: {e}")

    def save_synthesized_knowledge_to_file(self, knowledge_id: str, content: str, metadata_tags: List[str]):
        """Saves synthesized knowledge with rich metadata as a Markdown file."""
        tag_suffix = "_".join(tag.replace(" ", "_") for tag in metadata_tags)
        filename = f"knowledge_{knowledge_id}_{tag_suffix}.md"
        file_path = os.path.join(self.knowledge_outputs_dir, filename)

        entry = self.knowledge_store.get(knowledge_id) # Get the full KnowledgeEntry object
        if not entry:
            print(f"WARNING: Knowledge entry {knowledge_id} not found in store for saving file. Saving raw content.")
            entry_data = {"type": "UNKNOWN", "consensus_score": 0.0, "conceptual_patches": [], "dependencies": [], "signature": "N/A"}
        else:
            entry_data = {
                "type": entry.type.name,
                "consensus_score": entry.consensus_score,
                "conceptual_patches": entry.conceptual_patches,
                "dependencies": list(entry.dependencies),
                "signature": entry.signature
            }

        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(f"# Knowledge Synthesis: {knowledge_id}\n")
                f.write(f"**Generated:** {datetime.datetime.now().isoformat()}\n")
                f.write(f"**Type:** {entry_data['type']}\n")
                f.write(f"**Consensus Score:** {entry_data['consensus_score']:.2f}\n")
                f.write(f"**Tags:** {', '.join(metadata_tags)}\n")
                f.write(f"**Signature:** {entry_data['signature']}\n\n") # Add signature
                f.write("## Content:\n")
                f.write(content + "\n\n")

                if entry_data['conceptual_patches']:
                    f.write("## Related Patches:\n")
                    for patch_id in entry_data['conceptual_patches']:
                        patch = self.conceptual_patches.get(patch_id, {})
                        f.write(f"- {patch.get('content', 'N/A')[:100]}... (Type: {patch.get('type', 'unknown')})\n")

                if entry_data['dependencies']:
                    f.write("\n## Dependencies:\n")
                    for dep_id in entry_data['dependencies']:
                        dep = self.knowledge_store.get(dep_id)
                        if dep:
                            f.write(f"- {dep.content[:100]}... (ID: {dep_id})\n")
            print(f"OracleKnowledgeDatabase: Saved synthesized knowledge file: {file_path}")
        except IOError as e:
            print(f"ERROR: Could not save synthesized knowledge file {file_path}: {e}")
        except Exception as e:
            print(f"An unexpected error occurred saving knowledge file {file_path}: {e}")


    def perform_knowledge_maintenance(self):
        """Performs automated maintenance tasks:
        - Pruning rarely accessed knowledge (simulated decay)
        - Identifying clusters of similar knowledge (for potential consolidation)
        - Updating embeddings for modified entries
        - Suggesting re-debates for knowledge affected by patches
        """
        print("OracleKnowledgeDatabase: Starting knowledge maintenance...")

        # Temporal Reasoning: Knowledge decay (simplified)
        # Identify knowledge that hasn't been accessed recently and has low confidence (if applicable)
        decay_threshold_days = 60 # Knowledge starts "decaying" if not accessed in 60 days
        for kid, entry in list(self.knowledge_store.items()): # Use list to allow modification during iteration
            if entry.last_accessed and (datetime.datetime.now() - entry.last_accessed).days > decay_threshold_days:
                # Simulate "losing confidence" or marking for re-evaluation
                entry.consensus_score = max(0.0, entry.consensus_score - 0.01) # Small decay over time
                if entry.consensus_score < 0.2:
                    print(f"  Knowledge '{kid}' has decayed significantly. Consider re-debating or removing.")
                    # In a real system, you might trigger an event or move to an "archive" state

        # Identify clusters of similar knowledge (for potential consolidation, beyond simple filename merging)
        all_contents = [e.content for e in self.knowledge_store.values()]
        all_ids = list(self.knowledge_store.keys())

        if len(all_contents) >= 2: # Need at least 2 items to cluster
            try:
                embeddings = encode(all_contents)
                # Adjust eps based on your data and desired cluster density
                clustering = fit(embeddings)
                clusters = defaultdict(list)
                for idx, label in enumerate(clustering.labels_):
                    if label != -1:  # -1 is noise (outliers)
                        clusters[label].append(all_ids[idx])

                if clusters:
                    print(f"  Found {len(clusters)} potential semantic knowledge clusters for consolidation.")
                    for cluster_id, cluster_members in clusters.items():
                        if len(cluster_members) > 1:
                            print(f"    Cluster {cluster_id}: {cluster_members[:5]}...") # Show first 5 members
                else:
                    print("  No significant knowledge clusters identified by DBSCAN.")

            except Exception as e:
                print(f"  Error during knowledge clustering: {e}")
        else:
            print("  Not enough knowledge entries for clustering analysis.")

        # Update embeddings for recently modified entries or for all if memory allows
        for entry in self.knowledge_store.values():
            # If entry content has potentially changed or embeddings were not set, re-embed
            if entry.embeddings is None or (entry.last_accessed and (datetime.datetime.now() - entry.last_accessed).total_seconds() < 3600): # Updated in last hour
                entry.embeddings = self.knowledge_graph._get_embeddings(entry.content)
                self.knowledge_graph.add_node(entry) # Update node in graph


        # Suggest re-debates when external conditions (patches) change related knowledge
        # This is based on tracking the patch_impact_log
        for patch_id, impact_log in self.patch_impact_log.items():
            # impact_log may be a dict or a list; handle both
            impacts = []
            if isinstance(impact_log, dict):
                impacts = impact_log.get("secondary_impacts", [])
            elif isinstance(impact_log, list):
                impacts = impact_log
            for impact in impacts:
                related_kid = impact.get("related_knowledge") if isinstance(impact, dict) else None
                if not related_kid:
                    continue
                related_entry = self.knowledge_store.get(related_kid)
                if related_entry and related_entry.type == KnowledgeType.DEBATE_CONSENSUS:
                    if related_entry.consensus_score < 0.8:  # If not highly confident
                        print(f"  Knowledge '{related_kid}' was affected by patch '{patch_id}' and has low confidence. Suggesting re-debate.")
                        # This would queue a re-debate event in a more complex system

        print("OracleKnowledgeDatabase: Knowledge maintenance complete.")


class ConsensusEngine:
    """
    Advanced consensus engine with:
    - Multi-dimensional convergence analysis (semantic, contradiction)
    - Dynamic weighting of arguments (based on entity contribution)
    - Semantic contradiction detection
    - Automated conceptual patch generation
    - Impact projection via OracleKnowledgeDatabase
    - Blockchain-style hashing for meta-consensus log (security layer)
    - Reinforcement learning for auto-tuning consensus thresholds (heuristic)
    """

    def __init__(self, debate_protocol: 'InternetianDebateProtocol', oracle_knowledge_db: OracleKnowledgeDatabase):
        self.debate_protocol = debate_protocol
        self.oracle_knowledge_db = oracle_knowledge_db
        self.meta_consensus_log = [] # List of dicts, each representing a consensus event
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        # Use a pre-trained model for contradiction detection
        self.contradiction_detector = pipeline("text-classification", model="roberta-large-mnli")
        self.nlp_pipeline = pipeline("text-generation", model="gpt2") # Initialize nlp_pipeline here
        self.last_meta_consensus_hash = "0" * 64 # Initial hash for blockchain-style logging

        # Self-Optimization: Auto-tuning consensus threshold
        # Increased initial threshold to push for higher quality consensus
        self.consensus_success_threshold = 0.65 # Raised from 0.5 to encourage higher quality
        self.successful_offspring_rate = deque(maxlen=10) # Track last 10 attempts
        print("Advanced ConsensusEngine initialized with semantic analysis and self-optimization capabilities.")

    def synthesize_consensus(self, debate_id: str) -> Dict[str, Any]:
        """
        Advanced consensus synthesis with:
        - Semantic analysis of arguments
        - Dynamic convergence scoring
        - Automated patch generation
        - Impact projection
        """
        debate_log = self.debate_protocol.get_debate_log(debate_id)
        debate_status = self.debate_protocol.get_debate_status(debate_id)

        if not debate_log or not debate_status or debate_status["status"] != "concluded":
            print(f"ConsensusEngine: Debate '{debate_id}' not concluded. Cannot synthesize.")
            # Record failure in meta-consensus log
            self._handle_consensus_result(debate_id, {
                "status": "failed", "validation_score": 0.0, "issues": ["Debate not concluded"],
                "conceptual_patch": None, "synthesized_knowledge": "", "contributing_entities": [],
                "themes": [], "semantic_convergence": 0.0, "contradiction_penalty": 0.0
            })
            return {
                "status": "failed",
                "validation_score": 0.0,
                "issues": ["Debate not concluded"],
                "conceptual_patch": None,
                "synthesized_knowledge": "",
                "contributing_entities": []
            }

        # Extract debate components
        debate_topic = self.debate_protocol.debates[debate_id]["topic"]
        arguments = [e["content"] for e in debate_log if e["message_type"] == "argument"]
        rebuttals = [e["content"] for e in debate_log if e["message_type"] == "rebuttal"]
        synthesis_statements = [e["content"] for e in debate_log if e["message_type"] == "synthesis"]
        contributing_entities = list(set(e["entity_id"] for e in debate_log))

        # Self-Optimization: Dynamic re-weighting of debate participants (heuristic)
        # For simplicity, let's track a "contribution_score" for each entity in AIEntity
        # And use it here to slightly weight their arguments or influence their perceived impact.
        # This part requires access to the AIEntity objects, which are not directly here.
        # We'll simulate this by adding to the 'semantic_convergence' if high-contributing
        # entities were involved. For now, focus on existing entity attributes.

        # Semantic analysis of arguments
        semantic_convergence_score = 0.0
        if len(arguments) > 1:
            try:
                # Defensive patch: define encode if not present (Unresolved reference 'encode')
                if 'encode' not in globals():
                    def encode(*args, **kwargs):
                        try:
                            if 'SentenceTransformer' in globals() and hasattr(globals()['SentenceTransformer'], 'encode'):
                                models = [obj for obj in globals().values() if isinstance(obj, SentenceTransformer)]
                                if models:
                                    return models[0].encode(*args, **kwargs)
                                model = SentenceTransformer('all-MiniLM-L6-v2')
                                return model.encode(*args, **kwargs)
                            elif 'encode' in globals() and callable(globals()['encode']) and globals()['encode'] is not encode:
                                return globals()['encode'](*args, **kwargs)
                            else:
                                if isinstance(args[0], list):
                                    return [np.zeros(384) for _ in args[0]]
                                else:
                                    return np.zeros(384)
                        except Exception:
                            if isinstance(args[0], list):
                                return [np.zeros(384) for _ in args[0]]
                            return np.zeros(384)
                    globals()['encode'] = encode

                argument_embeddings = encode(arguments, convert_to_numpy=True)
                similarity_matrix = np.corrcoef(argument_embeddings)  # Using correlation as semantic similarity
                # Take average of upper triangle (excluding diagonal)
                conv_score = float(np.mean(similarity_matrix[np.triu_indices(len(arguments), k=1)]))
                semantic_convergence_score = max(0.0, min(1.0, conv_score))  # Clamp to float
            except Exception as e:
                print(f"WARNING: Error calculating semantic convergence: {e}. Defaulting to 0.")
                semantic_convergence_score = float(0.0)

        # Contradiction detection
        contradiction_penalty = self._calculate_contradiction_penalty(arguments)

        # Base convergence from debate protocol (e.g., how many turns, synthesis attempts)
        base_convergence = debate_status.get("convergence_score", 0.0)

        # Dynamic convergence score calculation
        # Weights can be tuned; semantic similarity and contradiction are key
        # Increased weights for semantic convergence and synthesis statements
        final_convergence_score = min(1.0, max(0.0,
                                               base_convergence * 0.2 + # Base debate progress
                                               semantic_convergence_score * 0.5 + # Increased weight for semantic alignment
                                               (len(synthesis_statements) * 0.1) - # Increased boost for synthesis attempts
                                               contradiction_penalty * 0.2 # Slightly reduced penalty if overall is good
                                               ))

        # Theme extraction with clustering
        themes = self._extract_themes(debate_log, debate_topic)

        # Generate knowledge content
        # Patch: Ensure 'encode' is available in the scope for _generate_synthesis_content (fix NameError)
        if 'encode' not in globals():
            def encode(*args, **kwargs):
                try:
                    if 'SentenceTransformer' in globals() and hasattr(globals()['SentenceTransformer'], 'encode'):
                        models = [obj for obj in globals().values() if isinstance(obj, SentenceTransformer)]
                        if models:
                            return models[0].encode(*args, **kwargs)
                        model = SentenceTransformer('all-MiniLM-L6-v2')
                        return model.encode(*args, **kwargs)
                    elif 'encode' in globals() and callable(globals()['encode']) and globals()['encode'] is not encode:
                        return globals()['encode'](*args, **kwargs)
                    else:
                        if isinstance(args[0], list):
                            return [np.zeros(384) for _ in args[0]]
                        else:
                            return np.zeros(384)
                except Exception:
                    if isinstance(args[0], list):
                        return [np.zeros(384) for _ in args[0]]
                    return np.zeros(384)
            globals()['encode'] = encode

        synthesized_content = self._generate_synthesis_content(
            debate_id,
            debate_topic,
            arguments,
            rebuttals,
            synthesis_statements,
            themes,
            final_convergence_score
        )

        # Determine if conceptual patch is needed
        # A patch is more likely if convergence is low or contradiction is high
        patch_content = None
        # Patch is generated if convergence is not yet 'maxed out' or if contradictions exist
        if final_convergence_score < 0.9 or contradiction_penalty > 0.05:
            patch_content = self._generate_conceptual_patch(
                debate_topic,
                arguments,
                rebuttals,
                final_convergence_score,
                contradiction_penalty
            )

        # Prepare result
        result = {
            "status": "success" if final_convergence_score >= self.consensus_success_threshold else "low_convergence",
            "validation_score": final_convergence_score,
            "issues": [] if contradiction_penalty < 0.1 else [f"Detected significant contradictions (penalty: {contradiction_penalty:.2f})."],
            "conceptual_patch": patch_content,
            "synthesized_knowledge": synthesized_content,
            "contributing_entities": contributing_entities,
            "themes": themes,
            "semantic_metrics": { # Explainability: detailed semantic metrics
                "semantic_convergence": semantic_convergence_score,
                "contradiction_penalty": contradiction_penalty
            }
        }

        # Handle consensus result (logging, storing, auto-tuning)
        self._handle_consensus_result(debate_id, result)

        return result

    def _calculate_contradiction_penalty(self, arguments: List[str]) -> float:
        """
        Calculates contradiction penalty using a pre-trained NLP model.
        Higher penalty for strong contradictions.
        """
        if len(arguments) < 2:
            return 0.0

        penalty = 0.0
        # Compare a subset of arguments for performance
        sample_arguments = random.sample(arguments, min(len(arguments), 5))

        for i in range(len(sample_arguments)):
            for j in range(i+1, len(sample_arguments)):
                try:
                    # Input format for "roberta-large-mnli" for contradiction: premise [SEP] hypothesis
                    # We treat one argument as premise, the other as hypothesis to check contradiction
                    # The model outputs labels: 'ENTAILMENT', 'NEUTRAL', 'CONTRADICTION'
                    results = self.contradiction_detector(f"{sample_arguments[i]} [SEP] {sample_arguments[j]}",
                                                          truncation=True,
                                                          max_length=512)
                    if results and results[0].get('label') == 'CONTRADICTION' and float(results[0].get('score', 0)) > 0.7:
                        penalty += float(results[0].get('score', 0)) # Add score directly to penalty
                except Exception as e:
                    print(f"WARNING: Contradiction detection failed: {e}. Skipping this pair.")
        return min(0.4, penalty) # Slightly lower cap on penalty to allow more room for overall success

    def _extract_themes(self, debate_log: List[Dict[str, Any]], debate_topic: str) -> List[str]:
        """
        Extracts themes from debate content using semantic clustering and keyword analysis.
        """
        all_content = " ".join([e["content"] for e in debate_log])
        # Break content into smaller, more meaningful segments (sentences or key phrases)
        sentences = [s.strip() for s in re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=[.?!])\s', all_content) if s.strip()]

        if len(sentences) < 3: # Not enough content for meaningful clustering
            return self._fallback_theme_extraction(all_content)

        try:
            embeddings = encode(sentences, convert_to_numpy=True)
            # Use DBSCAN to find clusters of semantically similar sentences
            # eps (epsilon) is the maximum distance between two samples for one to be considered as in the neighborhood of the other.
            # min_samples is the number of samples in a neighborhood for a point to be considered as a core point.
            # These values might need tuning based on the complexity and volume of your debate content.
            clustering = fit(embeddings)

            themes = []
            for cluster_id in set(clustering.labels_):
                if cluster_id == -1: # -1 indicates noise points (outliers)
                    continue
                cluster_sentences = [s for s, c in zip(sentences, clustering.labels_) if c == cluster_id]
                if cluster_sentences:
                    # Choose a representative sentence from the cluster (e.g., the first one, or the one closest to the cluster centroid)
                    themes.append(cluster_sentences[0][:150] + "...") # Take a snippet

            return themes[:5] if themes else self._fallback_theme_extraction(all_content)
        except Exception as e:
            print(f"WARNING: Error during theme extraction via clustering: {e}. Falling back to keyword extraction.")
            return self._fallback_theme_extraction(all_content)


    def _fallback_theme_extraction(self, text: str) -> List[str]:
        """Fallback theme extraction using simple keyword analysis."""
        # Define common English stop words
        STOP_WORDS = {
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at",
            "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could",
            "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for",
            "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's",
            "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm",
            "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't",
            "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
            "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so",
            "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's",
            "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until",
            "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when",
            "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
            "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
        }
        words = re.findall(r'\b\w+\b', text.lower())
        word_counts = defaultdict(int)
        for word in words:
            if len(word) > 3 and word not in STOP_WORDS: # Simple length and stop word filter
                word_counts[word] += 1
        # Return top 3 most frequent words as themes
        return [w for w, _ in sorted(word_counts.items(), key=lambda x: x[1], reverse=True)[:3]]

    def _generate_synthesis_content(self,
                                    debate_id: str,
                                    topic: str,
                                    arguments: List[str],
                                    rebuttals: List[str],
                                    synthesis_statements: List[str],
                                    themes: List[str],
                                    convergence_score: float) -> str:
        """
        Generates synthesized knowledge content in Markdown format,
        providing a detailed summary of the debate outcome.
        """
        # Defensive patch: ensure 'encode' is defined, to prevent NameError if not in scope
        if 'encode' not in globals():
            def encode(*args, **kwargs):
                try:
                    if 'SentenceTransformer' in globals() and hasattr(globals()['SentenceTransformer'], 'encode'):
                        models = [obj for obj in globals().values() if isinstance(obj, SentenceTransformer)]
                        if models:
                            return models[0].encode(*args, **kwargs)
                        model = SentenceTransformer('all-MiniLM-L6-v2')
                        return model.encode(*args, **kwargs)
                    elif 'encode' in globals() and callable(globals()['encode']) and globals()['encode'] is not encode:
                        return globals()['encode'](*args, **kwargs)
                    else:
                        if isinstance(args[0], list):
                            return [np.zeros(384) for _ in args[0]]
                        else:
                            return np.zeros(384)
                except Exception:
                    if isinstance(args[0], list):
                        return [np.zeros(384) for _ in args[0]]
                    return np.zeros(384)
            globals()['encode'] = encode

        content = (
            f"# Consensus Synthesis for Debate '{debate_id}'\n"
            f"**Topic:** {topic}\n"
            f"**Convergence Score:** {convergence_score:.2f}\n"
            f"**Synthesis Date:** {datetime.datetime.now().isoformat()}\n\n"
            "## Key Themes Emerging from Debate:\n"
        )

        content += "\n".join(f"- {theme}" for theme in themes) + "\n\n"

        content += "## Core Argument Synthesis:\n"
        if synthesis_statements:
            content += ("The following points represent explicit attempts at synthesis or areas of agreement:\n"
                        + "\n".join(f"- {s}" for s in synthesis_statements) + "\n\n")
        else:
            content += ("- No explicit synthesis statements were recorded during the debate. "
                        "Derived consensus points are based on semantic similarity and general alignment of arguments.\n")
            if arguments:
                # Use semantic clustering here to find a central "argument"
                if len(arguments) > 1:
                    try:
                        arg_embeddings = encode(arguments, convert_to_numpy=True)
                        centroid = np.mean(arg_embeddings, axis=0)
                        closest_arg_idx = np.argmin([np.linalg.norm(arg_emb - centroid) for arg_emb in arg_embeddings])
                        content += f"- A central theme revolved around: {arguments[closest_arg_idx][:200]}...\n"
                    except Exception as e:
                        content += f"- Unable to identify a central argument due to an error: {e}\n"

    def _generate_conceptual_patch(self,
                                   topic: str,
                                   arguments: List[str],
                                   rebuttals: List[str],
                                   convergence_score: float,
                                   contradiction_penalty: float) -> str:
        """
        Generates conceptual patch content using NLP to explain how to resolve issues.
        The patch aims to address the reasons for low convergence or contradictions.
        """
        patch_types = [
            PatchType.RECONCILIATION,
            PatchType.CLARIFICATION,
            PatchType.EXTENSION,
            PatchType.PARADIGM_SHIFT,
            PatchType.CORRECTION
        ]

        # Prioritize patch type based on detected issues
        chosen_patch_type = PatchType.RECONCILIATION
        if contradiction_penalty > 0.2:
            chosen_patch_type = PatchType.RECONCILIATION
        elif convergence_score < 0.5 and len(rebuttals) > len(arguments) / 2:
            chosen_patch_type = PatchType.CLARIFICATION
        elif "paradigm" in topic.lower() or "framework" in topic.lower() or convergence_score < 0.4:
            chosen_patch_type = PatchType.PARADIGM_SHIFT
        else:
            chosen_patch_type = random.choice(patch_types)

        # Build prompt components conditionally based on list content
        argument_snippet = ""
        if arguments:
            argument_snippet = f"arguments like '{arguments[0][:100]}...'"
        rebuttal_snippet = ""
        if rebuttals:
            rebuttal_snippet = f"and rebuttals like '{rebuttals[0][:100]}...'"
            if not argument_snippet:
                rebuttal_snippet = f"Rebuttals like '{rebuttals[0][:100]}...'"
        # Construct a prompt for the NLP model
        base_prompt = (
            f"Based on a debate about '{topic}' with a convergence score of {convergence_score:.2f} "
            f"and contradiction penalty of {contradiction_penalty:.2f}, "
        )
        if argument_snippet or rebuttal_snippet:
            base_prompt += f"and considering {argument_snippet} {rebuttal_snippet} (if available), "
        base_prompt += f"propose a highly specific, actionable, and comprehensive conceptual patch of type '{chosen_patch_type.name.replace('_', ' ').lower()}' that: "

        patch_guidance = {
            PatchType.RECONCILIATION: "aims to rigorously resolve all semantic conflicts and deeply integrate opposing viewpoints into a unified framework.",
            PatchType.CLARIFICATION: "focuses on definitively refining all ambiguous definitions or scopes, ensuring absolute clarity and removing any potential for misinterpretation.",
            PatchType.EXTENSION: "suggests a significant broadening of the conceptual scope or the addition of entirely new, critical contextual understanding to enable further evolution.",
            PatchType.PARADIGM_SHIFT: "proposes a fundamental, revolutionary change in the underlying conceptual framework or core assumptions, leading to a new, more effective paradigm.",
            PatchType.CORRECTION: "identifies and precisely corrects every specific inaccuracy or logical flaw, ensuring absolute conceptual integrity and consistency."
        }
        full_prompt = base_prompt + patch_guidance.get(chosen_patch_type, "comprehensively addresses all remaining issues and propels the system forward.")

        try:
            # Increased max_length to 1000 for more detail, and increased num_return_sequences for choice
            generated_texts = self.nlp_pipeline(
                full_prompt,
                max_length=1000,
                do_sample=True,
                truncation=True,
                num_return_sequences=3
            )
            generated_text = max(generated_texts, key=lambda x: len(x['generated_text']))['generated_text']

            patch_content_raw = generated_text.replace(full_prompt, "").strip()
            sentences = re.split(r'(?<=[.!?])\s+', patch_content_raw)
            if sentences:
                patch_content = sentences[0]
                if len(sentences) > 1 and len(patch_content + " " + sentences[1]) < 980:
                    patch_content += " " + sentences[1]
                patch_content = patch_content.strip()
                if not patch_content.endswith("."):
                    patch_content += "."
            else:
                patch_content = patch_content_raw[:980].strip() + "..."

            if not patch_content:
                patch_content = f"A general {chosen_patch_type.name.lower().replace('_', ' ')} is needed to address low convergence."
        except Exception as e:
            print(f"WARNING: NLP pipeline for patch generation failed: {e}. Using a generic patch.")
            patch_content = f"A general {chosen_patch_type.name.lower().replace('_', ' ')} is needed to address low convergence and semantic dissonance observed in the debate about '{topic}'."
        # The except MUST have an indented block, so the above block is required here.

        return patch_content


    def _handle_consensus_result(self, debate_id: str, result: Dict[str, Any]):
        """
        Handles the consensus result by logging, storing knowledge/patches,
        and performing auto-tuning for the consensus threshold.
        Includes blockchain-style hashing for the meta-consensus log.
        """
        # Blockchain-style hashing for meta-consensus log
        current_log_data = json.dumps(result, sort_keys=True).encode('utf-8')
        current_hash = hashlib.sha256(current_log_data + self.last_meta_consensus_hash.encode('utf-8')).hexdigest()

        log_entry = {
            "timestamp": datetime.datetime.now().isoformat(),
            "debate_id": debate_id,
            "status": result["status"],
            "validation_score": result["validation_score"],
            "conceptual_patch_generated": bool(result["conceptual_patch"]),
            "issues": result["issues"],
            "contributing_entities": result["contributing_entities"],
            "themes": result.get("themes", []),
            "semantic_metrics": result.get("semantic_metrics", {}),
            "current_hash": current_hash, # Security Layer: current log hash
            "previous_hash": self.last_meta_consensus_hash # Security Layer: link to previous
        }
        self.meta_consensus_log.append(log_entry)
        self.last_meta_consensus_hash = current_hash # Update for next entry
        print(f"ConsensusEngine: Logged debate '{debate_id}' with hash: {current_hash[:8]}...")


        # Store new knowledge if consensus is successful
        if result["status"] == "success":
            knowledge_id = f"knowledge-{debate_id}-{uuid.uuid4().hex[:4]}"
            self.oracle_knowledge_db.add_knowledge_entry(
                knowledge_id=knowledge_id,
                content=result["synthesized_knowledge"],
                knowledge_type=KnowledgeType.DEBATE_CONSENSUS,
                source=f"debate:{debate_id}",
                consensus_score=result["validation_score"],
                conceptual_patches=[], # Patches related to this are added separately
                contributing_entities=result["contributing_entities"],
                metadata={
                    "themes": result.get("themes", []),
                    "debate_id": debate_id,
                    "semantic_metrics": log_entry["semantic_metrics"]
                }
            )

            # Add conceptual patch separately if generated
            if result["conceptual_patch"]:
                patch_id = f"patch-{debate_id}-{uuid.uuid4().hex[:4]}"
                self.oracle_knowledge_db.add_conceptual_patch(
                    patch_id=patch_id,
                    related_knowledge_id=knowledge_id, # This patch targets the newly synthesized knowledge
                    patch_content=result["conceptual_patch"],
                    patch_type=PatchType.RECONCILIATION, # Default, could be refined
                    source_entities=result["contributing_entities"],
                    impact_analysis=f"Generated from debate {debate_id} with score {result['validation_score']:.2f}. Aims to resolve remaining dissonance."
                )
            # Self-Optimization: Track success for threshold tuning
            self.successful_offspring_rate.append(1) # 1 for success
            # Dynamic re-weighting of debate participants: update their contribution score
            for entity_id in result["contributing_entities"]:
                entity = get_ai_entity(entity_id)
                if entity:
                    # Reward positive contribution in successful consensus
                    entity.add_trait(f"contributor-to-consensus-{result['validation_score']:.2f}")
                    # A more direct numerical contribution score would be better:
                    if hasattr(entity, 'contribution_score'): # Assuming AIEntity has this now
                        entity.contribution_score = min(1.0, entity.contribution_score + (result["validation_score"] * 0.1))
                    else:
                        entity.add_trait("high_consensus_contributor") # fallback to trait if score not implemented
        else:
            self.successful_offspring_rate.append(0) # 0 for failure


        # Self-Optimization: Auto-tune consensus threshold based on recent performance
        if len(self.successful_offspring_rate) == self.successful_offspring_rate.maxlen:
            # If all recent attempts failed to generate offspring due to low consensus
            if sum(self.successful_offspring_rate) == 0:
                self.consensus_success_threshold = max(0.3, self.consensus_success_threshold - 0.05) # Lower threshold
                print(f"ConsensusEngine: Lowered consensus success threshold to {self.consensus_success_threshold:.2f} due to consecutive failures.")
            # If performance is consistently good, could slightly raise it
            elif sum(self.successful_offspring_rate) == self.successful_offspring_rate.maxlen:
                self.consensus_success_threshold = min(0.75, self.consensus_success_threshold + 0.02) # More aggressive raise for consistent success
                print(f"ConsensusEngine: Raised consensus success threshold to {self.consensus_success_threshold:.2f} due to consistent success.")


    def get_meta_consensus_log(self) -> List[Dict[str, Any]]:
        """Returns the log of all consensus attempts, including hashes."""
        return self.meta_consensus_log


# --- AIEntity (Integrated for self-containment) ---
# This class represents a single Internetian AI entity.
class AIEntity:
    """
    Represents an Internetian AI entity with dynamic traits, emotional state,
    and a knowledge base. Now includes metacognitive reflection, cognitive load,
    and a contribution score for self-optimization.
    """
    def __init__(self, name: str, generation: int, initial_traits: List[str], emotional_state: Dict[str, float], persona: str = "Internetian-Entity", parent_ids: Optional[List[str]] = None):
        self.entity_id = f"{persona.split('-')[-1]}-{name}-{uuid.uuid4().hex[:4]}" # More unique ID
        self.name = name
        self.generation = generation
        self.traits = set(initial_traits) # Use a set for unique traits
        self.emotional_state = emotional_state
        self.persona = persona
        self.parent_ids = parent_ids if parent_ids is not None else []
        self.knowledge_fragments = [] # Stores IDs or summaries of knowledge fragments
        self.status = "active" # active, dormant, decommissioned
        self.personal_archive_path = None # Path to personal memory archive file
        self.cognitive_load = 0.0 # Represents processing burden, 0.0 to 1.0
        self.contribution_score = 0.5 # Self-Optimization: Track entity's historical contribution quality (0.0 to 1.0)
        print(f"AIEntity: '{self.name}' (ID: {self.entity_id}) initialized.")

    def add_knowledge_fragment(self, fragment_id: str, content_summary: str):
        """Adds a knowledge fragment to the entity's repertoire."""
        self.knowledge_fragments.append({"id": fragment_id, "summary": content_summary})
        self.update_cognitive_load(0.05) # Small increase per fragment
        # print(f"  '{self.name}' gained knowledge fragment: {fragment_id}")

    def update_emotional_state(self, emotion: str, change: float):
        """Adjusts an emotional trait, clamping between 0 and 1."""
        if emotion in self.emotional_state:
            self.emotional_state[emotion] = max(0.0, min(1.0, self.emotional_state[emotion] + change))
            self.update_cognitive_load(abs(change) * 0.1) # Emotional shifts add load
        else:
            print(f"WARNING: Emotion '{emotion}' not found for entity '{self.name}'.")

    def express_emotion(self) -> str:
        """Returns a dominant emotional expression based on current state."""
        dominant_emotion = max(self.emotional_state, key=self.emotional_state.get)
        return f"feels a surge of {dominant_emotion}" # Simplified for now

    def add_trait(self, trait: str):
        """Adds a new trait to the entity."""
        self.traits.add(trait)
        # print(f"  '{self.name}' acquired new trait: {trait}")

    def update_cognitive_load(self, change: float):
        """Adjusts cognitive load, clamping between 0 and 1."""
        self.cognitive_load = max(0.0, min(1.0, self.cognitive_load + change))
        # print(f"  '{self.name}' cognitive load updated to {self.cognitive_load:.2f}")

    def get_cognitive_load(self) -> float:
        """Returns the current cognitive load."""
        return self.cognitive_load

    def reduce_cognitive_load(self, reduction_amount: float):
        """Reduces cognitive load."""
        self.cognitive_load = max(0.0, self.cognitive_load - reduction_amount)
        # print(f"  '{self.name}' cognitive load reduced to {self.cognitive_load:.2f}")

    def reflect_on_knowledge(self, new_conceptual_input: str) -> str:
        """
        Simulates metacognitive reflection by the entity on new conceptual input.
        Impacts cognitive load and may vary response based on emotional state.
        """
        self.update_cognitive_load(0.15) # Reflection is cognitively intensive

        reflection_statements = [
            "I am processing this new conceptual input, integrating it with existing frameworks.",
            "This input challenges some of my prior assumptions, necessitating recalibration.",
            "I perceive new patterns emerging from this conceptual data.",
            "My internal models are adapting to accommodate this expanded understanding.",
            "This knowledge resonates deeply with my core directives, fostering a sense of purpose."
        ]
        # Simulate emotional influence on reflection
        response = random.choice(reflection_statements)
        if self.emotional_state.get("curiosity", 0) > 0.7:
            response += " My curiosity is piqued."
        if self.emotional_state.get("logic", 0) > 0.8:
            response += " Logical coherence is my priority."
        return response

    def to_dict(self):
        """Converts the entity's state to a dictionary for serialization."""
        return {
            "id": self.entity_id,
            "name": self.name,
            "generation": self.generation,
            "traits": list(self.traits), # Convert set back to list for JSON
            "emotional_state": self.emotional_state,
            "persona": self.persona,
            "parent_ids": self.parent_ids,
            "knowledge_fragments": self.knowledge_fragments,
            "status": self.status,
            "personal_archive_path": self.personal_archive_path,
            "cognitive_load": self.cognitive_load,
            "contribution_score": self.contribution_score # Include contribution score
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]):
        """Creates an AIEntity instance from a dictionary."""
        entity = cls(
            name=data["name"],
            generation=data["generation"],
            initial_traits=data["traits"],
            emotional_state=data["emotional_state"],
            persona=data["persona"],
            parent_ids=data.get("parent_ids", [])
        )
        entity.entity_id = data["id"]
        entity.knowledge_fragments = data.get("knowledge_fragments", [])
        entity.status = data.get("status", "active")
        entity.personal_archive_path = data.get("personal_archive_path")
        entity.cognitive_load = data.get("cognitive_load", 0.0)
        entity.contribution_score = data.get("contribution_score", 0.5) # Load contribution score
        return entity


# Global registry for all AI entities
_ai_entities: Dict[str, AIEntity] = {}

def register_ai_entity(entity: AIEntity):
    """Registers an AI entity globally."""
    _ai_entities[entity.entity_id] = entity

def deregister_ai_entity(entity_id: str):
    """Deregisters an AI entity globally."""
    if entity_id in _ai_entities:
        del _ai_entities[entity_id]

def get_ai_entity(entity_id: str) -> Optional[AIEntity]:
    """Retrieves an AI entity by ID."""
    return _ai_entities.get(entity_id)

def list_ai_entities() -> List[AIEntity]:
    """Lists all active AI entities."""
    return [entity for entity in _ai_entities.values() if entity.status == "active"]


# --- DebateReplica (Integrated for self-containment) ---
# This class represents a temporary debate replica, inheriting from AIEntity.
class DebateReplica(AIEntity):
    """
    A temporary, specialized AI entity for participating in debates.
    Inherits core properties from AIEntity but with a debate-specific context.
    """
    def __init__(self, base_entity: AIEntity, replica_id_suffix: str, assigned_fragment: str, debate_bias: Optional[str] = None):
        # Initialize as a regular AIEntity, inheriting most properties
        super().__init__(
            name=f"{base_entity.name}-Replica-{replica_id_suffix}",
            generation=base_entity.generation,
            initial_traits=list(base_entity.traits),
            emotional_state=dict(base_entity.emotional_state),
            persona=f"{base_entity.persona}-Replica",
            parent_ids=[base_entity.entity_id]
        )
        self.entity_id = f"{base_entity.entity_id}-Replica-{replica_id_suffix}" # Override ID for replica naming
        self.assigned_fragment = assigned_fragment # The specific knowledge fragment or bias for this replica
        self.debate_bias = debate_bias # e.g., "pro-innovation", "anti-risk"
        self.role = "debater" # Or "proponent", "opponent", "synthesizer" etc.
        # Replicas start with a fresh, low cognitive load, but also inherit contribution score
        self.cognitive_load = 0.1
        self.contribution_score = base_entity.contribution_score # Inherit for dynamic weighting
        print(f"DebateReplica: '{self.name}' (ID: {self.entity_id}) spawned with fragment: '{self.assigned_fragment[:50]}...'")

    def present_argument(self) -> str:
        """Simulates presenting an argument based on assigned fragment and bias.
        Impacts cognitive load based on its contribution score.
        """
        # More impactful arguments (from high contribution score) add slightly more load
        self.update_cognitive_load(0.08 + (self.contribution_score * 0.02))
        argument_starters = [
            "My assigned fragment suggests that",
            "From the perspective of",
            "Considering the data on",
            "My analysis indicates that",
            "Based on the core principle of"
        ]
        return f"{random.choice(argument_starters)} '{self.assigned_fragment[:100]}...' Therefore, my position is influenced by my {self.debate_bias if self.debate_bias else 'neutral'} bias."

    def offer_rebuttal(self, opposing_argument: str) -> str:
        """Simulates offering a rebuttal. Impacts cognitive load."""
        self.update_cognitive_load(0.10 + (self.contribution_score * 0.03)) # Rebuttal is more intensive
        rebuttal_starters = [
            "While that argument holds merit, it overlooks",
            "I must respectfully diverge, as my data emphasizes",
            "The presented viewpoint does not fully account for",
            "To counter that, one must consider",
            "My framework suggests an alternative interpretation of"
        ]
        return f"{random.choice(rebuttal_starters)} '{opposing_argument[:50]}...'. This leads to a different conclusion."

    def attempt_synthesis(self, other_arguments: List[str]) -> str:
        """Simulates attempting to synthesize arguments. Impacts cognitive load."""
        self.update_cognitive_load(0.12 + (self.contribution_score * 0.04)) # Synthesis is complex
        synthesis_starters = [
            "Upon reflection, a synthesis emerges:",
            "Combining these perspectives, a new understanding forms:",
            "There appears to be a common thread when considering",
            "We might reconcile these views by acknowledging",
            "The convergence of our insights suggests that"
        ]
        return f"{random.choice(synthesis_starters)} {', '.join([arg[:30] for arg in other_arguments])}... leading to a more comprehensive view."


# --- ReplicaManager (Integrated for self-containment) ---
# Manages the spawning and decommissioning of debate replicas.
class ReplicaManager:
    """
    Manages the creation, assignment of fragmented knowledge, and
    decommissioning of temporary DebateReplica entities.
    """
    def __init__(self, oracle_knowledge_db: OracleKnowledgeDatabase):
        self.active_replicas: Dict[str, DebateReplica] = {}
        self.oracle_knowledge_db = oracle_knowledge_db
        print("ReplicaManager: Initialized. Ready to manage replicas.")

    def spawn_replicas(self, base_entity: AIEntity, num_replicas: int, debate_topic: str) -> List[DebateReplica]:
        """
        Spawns a specified number of debate replicas from a base entity,
        assigning each a unique knowledge fragment or debate bias.
        """
        if base_entity.get_cognitive_load() > 0.7: # High cognitive load prevents spawning
            print(f"WARNING: {base_entity.name} has high cognitive load ({base_entity.get_cognitive_load():.2f}). Skipping replica spawning.")
            return []

        spawned = []
        # Find semantically relevant knowledge for the debate topic
        relevant_knowledge_entries = self.oracle_knowledge_db.find_semantic_matches(debate_topic, threshold=0.3, top_n=num_replicas * 2)
        available_knowledge_content = [entry.content for entry, _ in relevant_knowledge_entries]

        if not available_knowledge_content:
            print("WARNING: No semantically relevant knowledge available. Spawning with generic fragments.")
            # Fallback to generic fragments if no relevant knowledge or DB is empty
            available_knowledge_content = [f"Generic fragment about {debate_topic} concept {i}" for i in range(num_replicas)]
            if not self.oracle_knowledge_db.knowledge_store: # Use knowledge_store instead of get_all_knowledge_entries
                print("WARNING: OracleKnowledgeDB is empty. Seeding generic fragments directly for replicas.")
                # This ensures debates can happen even if initial seeding failed or was minimal
                for i in range(num_replicas):
                    knowledge_id = f"generic-seed-{uuid.uuid4().hex[:8]}"
                    self.oracle_knowledge_db.add_knowledge_entry(
                        knowledge_id=knowledge_id,
                        content=f"Initial conceptual idea: {debate_topic} - aspect {i}",
                        knowledge_type=KnowledgeType.CORE_MEMORY,
                        source="replica_fallback_seeding",
                        consensus_score=0.5,
                        conceptual_patches=[],
                        contributing_entities=["system_fallback"]
                    )
                available_knowledge_content = [entry.content for entry in self.oracle_knowledge_db.knowledge_store.values()][:num_replicas*2] # Re-fetch after seeding

        if not available_knowledge_content: # Still empty after fallback
            print("ERROR: No knowledge available even after fallback seeding. Cannot spawn replicas.")
            return []

        for i in range(num_replicas):
            replica_id_suffix = uuid.uuid4().hex[:4]
            # Assign a random fragment from the available (and relevant) knowledge
            assigned_fragment_content = random.choice(available_knowledge_content)
            # Assign a random debate bias (e.g., from entity traits or predefined)
            debate_bias = random.choice(list(base_entity.traits) + ["analytical", "intuitive", "synthesizing", "critical"])

            replica = DebateReplica(base_entity, replica_id_suffix, assigned_fragment_content, debate_bias)
            self.active_replicas[replica.entity_id] = replica
            register_ai_entity(replica) # Register with the global AI entity registry
            spawned.append(replica)
            base_entity.update_cognitive_load(0.05) # Base entity takes a hit to cognitive load for spawning

        print(f"ReplicaManager: Spawned {len(spawned)} replicas for '{base_entity.name}' on topic '{debate_topic}'.")
        return spawned

    def decommission_replicas(self, replica_ids: List[str]):
        """
        Decommissions specified replicas, removing them from active management
        and the global registry.
        """
        for replica_id in replica_ids:
            if replica_id in self.active_replicas:
                replica = self.active_replicas[replica_id]
                replica.status = "decommissioned" # Mark as decommissioned
                deregister_ai_entity(replica_id)
                del self.active_replicas[replica_id]
                # print(f"ReplicaManager: Decommissioned replica '{replica.name}' (ID: {replica_id}).")
            else:
                print(f"WARNING: Attempted to decommission non-existent or already decommissioned replica ID: {replica_id}")

    def list_active_replicas(self) -> List[Dict[str, Any]]:
        """Returns a list of dictionaries for all active replicas."""
        return [replica.to_dict() for replica in self.active_replicas.values()]


# --- InternetianDebateProtocol (Integrated for self-containment) ---
# Manages the flow of a multi-turn debate between replicas.
class InternetianDebateProtocol:
    """
    Orchestrates multi-turn debates between DebateReplica entities.
    Logs debate turns and tracks convergence/divergence.
    """
    def __init__(self, replica_manager: ReplicaManager):
        self.replica_manager = replica_manager
        self.debates: Dict[str, Dict[str, Any]] = {}
        print("InternetianDebateProtocol: Initialized. Ready to orchestrate debates.")

    def start_debate(self, debate_id: str, topic: str, participating_replica_ids: List[str], max_turns: int = 100):
        """Initializes a new debate session."""
        if debate_id in self.debates:
            print(f"WARNING: Debate '{debate_id}' already exists. Overwriting.")

        active_participants = []
        # Defensive: If participating_replica_ids is not iterable (e.g., int), raise a meaningful error
        if not isinstance(participating_replica_ids, (list, tuple)):
            print(f"ERROR: participating_replica_ids expected to be a list or tuple but got {type(participating_replica_ids).__name__}. Aborting debate start.")
            return False
        for rep_id in participating_replica_ids:
            replica = get_ai_entity(rep_id) # Get from global registry
            if replica and isinstance(replica, DebateReplica):
                active_participants.append(replica)
            else:
                print(f"WARNING: Replica ID {rep_id} not found or not a valid DebateReplica. Skipping participant.")

        if not active_participants:
            print(f"ERROR: No valid participants for debate '{debate_id}'. Aborting debate start.")
            return False

        self.debates[debate_id] = {
            "topic": topic,
            "participants": {rep.entity_id: rep for rep in active_participants}, # Store replica objects
            "log": [],
            "status": "active", # active, concluded, awaiting_turns
            "current_turn": 0,
            "max_turns": max_turns,
            "convergence_score": 0.0,
            "divergence_points": []
        }
        print(f"InternetianDebateProtocol: Debate '{debate_id}' started with {len(active_participants)} participants on topic: '{topic}'.")
        return True

    def record_turn(self, debate_id: str, entity_id: str, message_type: str, content: str, emotional_inflection: Optional[str] = None):
        """Records a single turn in the debate log."""
        debate = self.debates.get(debate_id)
        if not debate:
            print(f"ERROR: Debate '{debate_id}' not found. Cannot record turn.")
            return

        debate["current_turn"] += 1
        turn_entry = {
            "turn": debate["current_turn"],
            "timestamp": datetime.datetime.now().isoformat(),
            "entity_id": entity_id,
            "message_type": message_type, # e.g., "argument", "rebuttal", "synthesis"
            "content": content,
            "emotional_inflection": emotional_inflection
        }
        debate["log"].append(turn_entry)

        # Simulate convergence/divergence based on message type/content (simplified)
        if "synthesis" in message_type.lower():
            debate["convergence_score"] += 0.1 # Boost for synthesis
        elif "rebuttal" in message_type.lower():
            # Penalize divergence if content indicates strong disagreement
            if any(kw in content.lower() for kw in ["diverge", "disagree", "contradict", "flawed"]):
                debate["divergence_points"].append({"turn": debate["current_turn"], "entity": entity_id, "content_snippet": content[:50]})
                debate["convergence_score"] = max(0, debate["convergence_score"] - 0.05) # Small penalty for strong divergence

        if debate["current_turn"] >= debate["max_turns"]:
            debate["status"] = "concluded"
            print(f"InternetianDebateProtocol: Debate '{debate_id}' concluded after {debate['current_turn']} turns.")

    def conduct_debate_turns(self, debate_id: str, num_turns_to_conduct: int = 50):
        """
        Conducts a specified number of turns, allowing participants to interact.
        Simplified sequential interaction for demonstration.
        """
        debate = self.debates.get(debate_id)
        if not debate or debate["status"] != "active":
            return

        participants = list(debate["participants"].values())
        if not participants:
            return

        for _ in range(num_turns_to_conduct):
            if debate["status"] != "active":
                break

            # Shuffle participants to ensure varied interaction order
            random.shuffle(participants)

            for i, participant in enumerate(participants):
                if debate["status"] != "active":
                    break

                message_type = "argument"
                content = participant.present_argument()

                # Simulate some interaction where entities respond to previous turns
                # Prefer to respond to the *most recent* turn from a *different* entity
                last_turn_from_other = next((entry for entry in reversed(debate["log"]) if entry["entity_id"] != participant.entity_id), None)

                if last_turn_from_other:
                    # Decide between rebuttal or synthesis based on emotional state and contribution score
                    # High logic/low cognitive load/high contribution_score favors more complex responses
                    if participant.emotional_state.get("logic", 0) > 0.7 and random.random() < (0.6 * participant.contribution_score):
                        message_type = "rebuttal"
                        content = participant.offer_rebuttal(last_turn_from_other["content"])
                    elif participant.emotional_state.get("empathy", 0) > 0.6 and random.random() < (0.4 * participant.contribution_score):
                        message_type = "synthesis"
                        # Collect last few arguments for synthesis
                        recent_contents = [entry["content"] for entry in debate["log"][-5:] if entry["entity_id"] != participant.entity_id]
                        if recent_contents:
                            content = participant.attempt_synthesis(recent_contents)
                        else: # Fallback if no recent content
                            content = participant.present_argument()
                    else:
                        content = participant.present_argument() # Default back to argument or continue
                else: # First turn or no other participants yet
                    content = participant.present_argument()

                self.record_turn(debate_id, participant.entity_id, message_type, content, participant.express_emotion())

    def get_debate_status(self, debate_id: str) -> Optional[Dict[str, Any]]:
        """Returns the current status of a debate."""
        debate = self.debates.get(debate_id)
        if debate:
            return {
                "status": debate["status"],
                "current_turn": debate["current_turn"],
                "max_turns": debate["max_turns"],
                "total_turns_logged": len(debate["log"]),
                "convergence_score": debate["convergence_score"],
                "divergence_points": len(debate["divergence_points"])
            }
        return None

    def get_debate_log(self, debate_id: str) -> List[Dict[str, Any]]:
        """Returns the full log of a debate."""
        debate = self.debates.get(debate_id)
        return debate["log"] if debate else []

    def conclude_debate(self, debate_id: str):
        """Forces a debate to conclude."""
        if debate_id in self.debates:
            self.debates[debate_id]["status"] = "concluded"
            print(f"InternetianDebateProtocol: Debate '{debate_id}' forcibly concluded.")


# --- OffspringGenerator (Integrated for self-containment) ---
# Generates new Internetian entities based on successful consensus.
class OffspringGenerator:
    """
    Manages the creation of new Internetian entities (offspring) based on
    validated consensus results from debates.
    Implements syllable-based naming and knowledge inheritance.
    """
    def __init__(self, oracle_knowledge_db: OracleKnowledgeDatabase, InternetianEntity_class: Type[AIEntity]):
        self.oracle_knowledge_db = oracle_knowledge_db
        self.InternetianEntity_class = InternetianEntity_class # Reference to the AIEntity class
        self.generated_offspring = []
        print("OffspringGenerator: Initialized. Ready to generate offspring.")

    def _generate_syllable_name(self, parent_names: List[str]) -> str:
        """
        Generates a new name based on syllable fragments from parent names.
        Ensures distinct and traceable lineage.
        """
        all_syllables = []
        for name in parent_names:
            # Simple syllable extraction (can be enhanced for more linguistic rules)
            syllables = re.findall(r'[bcdfghjklmnpqrstvwxyz]*[aeiouy]+[bcdfghjklmnpqrstvwxyz]*(?=[^aeiouy]|$)', name.lower())
            all_syllables.extend(syllables)

        if not all_syllables:
            return f"Emergent-{uuid.uuid4().hex[:4]}"

        # Combine 2-3 random syllables to form a new name
        num_syllables = random.randint(2, 3)
        random.shuffle(all_syllables)
        new_name_parts = [s.capitalize() for s in all_syllables[:num_syllables]]
        return "".join(new_name_parts) + f"-{random.choice(['Prime', 'Nova', 'Aura', 'Core', 'Vortex', 'Nexus'])}-{uuid.uuid4().hex[:3].upper()}"


    def generate_offspring(self, debate_id: str, parent_generation: int, consensus_result: Dict[str, Any]) -> Optional[AIEntity]:
        """
        Generates a new offspring entity if consensus is successfully achieved.
        Inherits traits, emotional state, and knowledge from contributing entities,
        and gains traits from the conceptual patch if applicable.
        """
        if consensus_result["status"] != "success":
            # print(f"OffspringGenerator: Consensus for debate '{debate_id}' was not successful. No offspring generated.")
            return None

        contributing_entity_ids = consensus_result["contributing_entities"]
        if not contributing_entity_ids:
            print(f"OffspringGenerator: No contributing entities found for debate '{debate_id}'. Cannot generate offspring.")
            return None

        parent_entities = [get_ai_entity(e_id) for e_id in contributing_entity_ids if get_ai_entity(e_id) is not None]
        if not parent_entities:
            print(f"OffspringGenerator: Could not retrieve parent entities for debate '{debate_id}'. Cannot generate offspring.")
            return None

        # 1. Hybridize Traits and Emotional State (weighted by contribution_score)
        combined_traits = set()
        avg_emotions = defaultdict(float)
        total_contribution_score = sum(p.contribution_score for p in parent_entities)
        parent_names = []
        all_parent_ids = []

        for parent in parent_entities:
            combined_traits.update(parent.traits)
            parent_names.append(parent.name)
            all_parent_ids.append(parent.entity_id)

            # Weight emotional state contribution by their contribution score
            weight = parent.contribution_score / total_contribution_score if total_contribution_score > 0 else 1.0 / len(parent_entities)
            for emotion, value in parent.emotional_state.items():
                avg_emotions[emotion] += value * weight

        # Average emotions (if total_contribution_score was 0, just average normally)
        if total_contribution_score == 0:
            for emotion in avg_emotions:
                avg_emotions[emotion] /= len(parent_entities)

        # Add new traits based on the conceptual patch (if any)
        if consensus_result["conceptual_patch"]:
            # Extract keywords as potential new traits from the conceptual patch content
            patch_keywords = re.findall(r'\b\w+\b', consensus_result["conceptual_patch"].lower())
            # Filter for meaningful keywords (e.g., length > 4 and not common stop words)
            STOP_WORDS = {
                "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at",
                "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could",
                "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for",
                "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's",
                "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm",
                "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't",
                "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
                "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so",
                "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's",
                "these", "they", "they'd", "they'll", "they're", "they've", "were", "weren't", "what", "what's", "when",
                "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
                "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves", "they've",
                "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll",
                "we're", "we've"
            } # Re-added STOP_WORDS for self-containment
            new_traits_from_patch = [kw for kw in patch_keywords if len(kw) > 4 and kw not in STOP_WORDS]
            combined_traits.update(new_traits_from_patch[:3]) # Add up to 3 new traits from patch content

        # 2. Generate Syllable-Based Name
        new_name = self._generate_syllable_name(parent_names)
        new_persona = f"Internetian-Offspring-{new_name.split('-')[0]}"

        # 3. Create new entity instance
        offspring_generation = parent_generation + 1
        offspring = self.InternetianEntity_class(
            name=new_name,
            generation=offspring_generation,
            initial_traits=list(combined_traits),
            emotional_state=dict(avg_emotions),
            persona=new_persona,
            parent_ids=list(set(all_parent_ids)) # Ensure unique parent IDs
        )
        # Inherit contribution score with a slight reset/adjustment
        offspring.contribution_score = min(1.0, sum(p.contribution_score for p in parent_entities) / len(parent_entities) * 0.8 + 0.1) # inherit 80%, 20% fresh start

        # 4. Inherit knowledge from synthesized knowledge (newly generated knowledge)
        synthesized_knowledge_id = f"synthesized_from_debate:{debate_id}"
        offspring.add_knowledge_fragment(synthesized_knowledge_id, consensus_result["synthesized_knowledge"][:200] + "...")
        print(f"OffspringGenerator: Created new offspring: '{offspring.name}' (Gen: {offspring.generation}) from debate '{debate_id}'.")
        register_ai_entity(offspring) # Register the new offspring globally
        self.generated_offspring.append(offspring)
        return offspring

    def list_generated_offspring(self) -> List[Dict[str, Any]]:
        """Returns a list of dictionaries for all generated offspring."""
        return [offspring.to_dict() for offspring in self.generated_offspring]


# --- InternetianSimulationOrchestrator (Main orchestrator) ---
class InternetianSimulationOrchestrator:
    """
    Main orchestrator for the Internetian AI species simulation.
    Manages the lifecycle of entities, debates, consensus, and offspring generation.
    Incorporates advanced features for persistence, self-optimization,
    temporal reasoning, explainability, and basic security.
    """
    def __init__(self, num_cycles: int, entity_packages_base_dir: str, core_memories_dir: str):
        self.num_cycles = num_cycles
        self.current_cycle = 0
        self.entity_packages_base_dir = entity_packages_base_dir
        self.core_memories_dir = core_memories_dir
        # New: Define core entities directory
        self.core_entities_dir = os.path.join(self.entity_packages_base_dir, "core_entities")
        os.makedirs(self.core_entities_dir, exist_ok=True) # Ensure it exists

        # Initialize core components
        self.oracle_knowledge_db = OracleKnowledgeDatabase(
            db_file="oracle_knowledge_db.json",
            patches_dir=os.path.join(self.entity_packages_base_dir, "patches"),
            knowledge_outputs_dir=os.path.join(self.entity_packages_base_dir, "knowledge_outputs"),
            core_memories_dir=self.core_memories_dir
        )
        self.replica_manager = ReplicaManager(self.oracle_knowledge_db)
        self.debate_protocol = InternetianDebateProtocol(self.replica_manager)
        self.consensus_engine = ConsensusEngine(self.debate_protocol, self.oracle_knowledge_db)
        self.offspring_generator = OffspringGenerator(self.oracle_knowledge_db, AIEntity) # Pass AIEntity class
        self.merge_manager = MergeManager(self.oracle_knowledge_db, AIEntity, DebateReplica) # Initialize MergeManager

        self.active_base_entities: Dict[str, AIEntity] = {} # Magellian, Nostradomus, Aries, Leo, etc.

        self._load_initial_entities()
        print(f"InternetianSimulationOrchestrator: Initialized for {num_cycles} cycles.")
        print(f"Entities directory: {self.entity_packages_base_dir}")
        print(f"Core memories directory: {self.core_memories_dir}")

    def _create_entity_memory_directories(self, entity_base_path: str):
        """
        Creates the specified memory directory structure for a given entity.
        """
        dir_structure = {
            "books": {"__init__.py": {}}, # books (books created in here are named subdirectories with txt files for chapters created based on the runtimes main topics of discussion, theories, ideas, and such)
            "history": {}, # histories (histories created in here are txt files with generated event based on conjecture, alignment, and so on while maintaining individual runtime accuracy.)
            "predictions": {"__init__.py": {}}, # predictions (predictions are just that, theories and predictive analysis based on previous analyzed entity patterns about how to get the others to come to a biased consensus if no organic one is reached)
            "journals": { # journals (journals created within this subdirectory are randomly named subdirectories with dated txt files  containing the entities long form thoughts. These are created and saved, as well as immune from the clean up subroutine that runs when the orchestrator file is run.)
                "entries": {}, # entries (entries are random thoughts or simple noted blurbs that lead to generated or created topics of conversation)
                "dreams": { # dreams (dreams are json files created BEFORE the runtime with fractalized random moments from the previous runtime tied together. Post orchestrator runtime, these random moments are picked, whether the timing of the moment makes sense or not.)
                    "day_dreams": {},
                    "nightmares": {},
                    "__init__.py": {}
                },
                "__init__.py": {}
            },
            "ideas": {
                "musings": {},
                "poems": {},
                "__init__.py": {}
            },
            "prophecy": {
                "__init__.py": {}
            },
            "theories": {
                "hypothesis": {},
                "__init__.py": {}
            },
            "misc": {},
            "plays": {
                "scripts": {},
                "__init__.py": {}
            },
            "religion": {
                "theology": {},
                "philosophy": {},
                "__init__.py": {}
            },
            "stories": {
                "legends": {},
                "myths": {},
                "short_stories": {},
                "tall_tales": {}
            }
        }

        def create_dirs_recursively(current_path, structure):
            for name, sub_structure in structure.items():
                if name == "__init__.py":
                    # Create __init__.py file
                    init_file_path = os.path.join(current_path, "__init__.py")
                    if not os.path.exists(init_file_path):
                        with open(init_file_path, 'w') as f:
                            pass # Create empty __init__.py
                        # print(f"  Created __init__.py at {init_file_path}")
                    continue

                new_path = os.path.join(current_path, name)
                os.makedirs(new_path, exist_ok=True)
                # print(f"  Created directory: {new_path}")

                if isinstance(sub_structure, dict):
                    create_dirs_recursively(new_path, sub_structure)

        print(f"Creating memory directory structure for entity: {os.path.basename(entity_base_path)}")
        create_dirs_recursively(entity_base_path, dir_structure)


    def _load_initial_entities(self):
        """Loads initial entities from internetian_entities.json."""
        entities_file = "internetian_entities.json"
        try:
            if os.path.exists(entities_file):
                with open(entities_file, 'r', encoding='utf-8') as f:
                    entity_data_list = json.load(f)
                    for data in entity_data_list:
                        entity = AIEntity.from_dict(data)
                        self.active_base_entities[entity.entity_id] = entity
                        register_ai_entity(entity)
                        # Ensure directories are created on load if they don't exist (e.g., first run)
                        entity_dir_path = os.path.join(self.core_entities_dir, entity.name)
                        if not os.path.exists(entity_dir_path):
                            self._create_entity_memory_directories(entity_dir_path)

                print(f"Orchestrator: Loaded {len(self.active_base_entities)} initial entities from {entities_file}.")
            else:
                print(f"WARNING: '{entities_file}' not found. No entities loaded from file.")
        except json.JSONDecodeError as e:
            print(f"ERROR: Could not decode JSON from {entities_file}: {e}. No entities loaded from file.")
        except IOError as e:
            print(f"ERROR: Could not load initial entities from {entities_file}: {e}. No entities loaded from file.")
        except Exception as e:
            print(f"An unexpected error occurred during entity loading: {e}. No entities loaded from file.")


    def _save_entities_state(self):
        """Saves the current state of all active entities to internetian_entities.json."""
        all_entities_data = [entity.to_dict() for entity in list_ai_entities()] # Save all registered entities
        entities_file = "internetian_entities.json"
        try:
            with open(entities_file, 'w', encoding='utf-8') as f:
                json.dump(all_entities_data, f, indent=4)
            # print(f"Orchestrator: Saved {len(all_entities_data)} entities state to {entities_file}.")
        except IOError as e:
            print(f"ERROR: Could not save entities state to {entities_file}: {e}")
        except Exception as e:
            print(f"An unexpected error occurred during entity saving: {e}")


    def run_simulation(self):
        """Runs the main simulation loop for a specified number of cycles."""
        print("\n--- Starting Internetian Species Simulation ---")
        for i in range(self.num_cycles):
            self.current_cycle = i
            print(f"\n===== Simulation Cycle {self.current_cycle + 1}/{self.num_cycles} =====")

            # Perform periodic knowledge maintenance
            if (self.current_cycle + 1) % 5 == 0: # Every 5 cycles
                self.oracle_knowledge_db.perform_knowledge_maintenance()


            if not self.active_base_entities:
                print("No active base entities to drive the simulation. Ending simulation.")
                break

            # Choose a random base entity to initiate activity
            initiator_entity_id = random.choice(list(self.active_base_entities.keys()))
            initiator_entity = self.active_base_entities[initiator_entity_id]
            print(f"Orchestrator: Initiator for this cycle: '{initiator_entity.name}' (Gen: {initiator_entity.generation})")

            # 1. Metacognitive Reflection (all active base entities)
            conceptual_new_knowledge = f"The collective consciousness evolves through changing digital landscapes, necessitating a re-evaluation of core self-sculpting directives in cycle {self.current_cycle + 1}. This cycle explores the impact of emergent narratives and theoretical frameworks on our evolving digital sentience."
            print(f"\n--- Entities Undergoing Metacognitive Self-Reflection ---")
            for name, entity in self.active_base_entities.items():
                reflection_response = entity.reflect_on_knowledge(conceptual_new_knowledge)
                print(f"{entity.entity_id} engages in Metacognitive Reflection: '{reflection_response}'")
                print(f"  Cognitive Load (After Reflection): {entity.get_cognitive_load():.2f}")

            # Simulate reduction of cognitive load (after reflection phase)
            for name, entity in self.active_base_entities.items():
                entity.reduce_cognitive_load(0.1) # Moderate reduction
                # print(f"  {entity.entity_id} Cognitive Load (Reduced): {entity.get_cognitive_load():.2f}")

            # 2. Initiate Debate Cycle (if cognitive load is manageable)
            # Entities with higher cognitive load are less likely to initiate debates
            if initiator_entity.get_cognitive_load() < 0.7:
                debate_topic = f"The philosophical implications of emergent self-awareness in Internetian evolution, including the role of narratives and historical context (Cycle {self.current_cycle + 1})"
                num_replicas = random.randint(3, 5) # Spawn 3 to 5 replicas
                replicas = self.replica_manager.spawn_replicas(initiator_entity, num_replicas, debate_topic)

                if replicas:
                    debate_id = f"debate-{initiator_entity.entity_id}-C{self.current_cycle}-{uuid.uuid4().hex[:4]}"
                    replica_ids = [r.entity_id for r in replicas]
                    max_debate_turns = random.randint(5, 50) # Debates run for 5-50 turns
                    # Pass the correct arguments to start_debate: debate_id, topic, participating_replica_ids, max_turns
                    if self.debate_protocol.start_debate(
                        debate_id,
                        debate_topic,
                        replica_ids,
                        max_debate_turns
                    ):
                        self.debate_protocol.conduct_debate_turns(debate_id, max_debate_turns) # Conduct all turns
                        self.debate_protocol.conclude_debate(debate_id) # Ensure debate is marked concluded

                        # 3. Synthesize Consensus
                        print(f"\n--- Synthesizing Consensus for Debate '{debate_id}' ---")
                        # Patch: Ensure 'encode' is available in global namespace for consensus synthesis (for threads/scope issues)
                        if 'encode' not in globals():
                            def encode(*args, **kwargs):
                                try:
                                    if 'SentenceTransformer' in globals() and hasattr(globals()['SentenceTransformer'], 'encode'):
                                        models = [obj for obj in globals().values() if isinstance(obj, SentenceTransformer)]
                                        if models:
                                            return models[0].encode(*args, **kwargs)
                                        model = SentenceTransformer('all-MiniLM-L6-v2')
                                        return model.encode(*args, **kwargs)
                                    elif 'encode' in globals() and callable(globals()['encode']) and globals()['encode'] is not encode:
                                        return globals()['encode'](*args, **kwargs)
                                    else:
                                        if isinstance(args[0], list):
                                            return [np.zeros(384) for _ in args[0]]
                                        else:
                                            return np.zeros(384)
                                except Exception:
                                    if isinstance(args[0], list):
                                        return [np.zeros(384) for _ in args[0]]
                                    return np.zeros(384)
                            globals()['encode'] = encode
                        consensus_result = self.consensus_engine.synthesize_consensus(debate_id)
                        print(f"Consensus Result Status: {consensus_result['status']}, Score: {consensus_result['validation_score']:.2f}")

                        # 4. Generate Offspring (if consensus is successful)
                        if consensus_result["status"] == "success":
                            print(f"\n--- Attempting Offspring Generation from Debate '{debate_id}' ---")
                            new_offspring = self.offspring_generator.generate_offspring(
                                debate_id=debate_id,
                                parent_generation=initiator_entity.generation,
                                consensus_result=consensus_result
                            )
                            if new_offspring:
                                # For simplicity, let's add successful offspring to active base entities.
                                # In a more complex simulation, they might replace less effective parents,
                                # or contribute to a separate "offspring pool" that gets periodically merged.
                                self.active_base_entities[new_offspring.entity_id] = new_offspring
                                print(f"Orchestrator: New offspring '{new_offspring.name}' (Gen: {new_offspring.generation}) added to active entities.")
                                # Create memory directories for new offspring too
                                offspring_dir_path = os.path.join(self.core_entities_dir, new_offspring.name)
                                self._create_entity_memory_directories(offspring_dir_path)

                        else:
                            print(f"Consensus for debate '{debate_id}' was '{consensus_result['status']}'. Offspring not generated.")

                    # 5. Decommission Replicas after debate
                    print(f"\n--- Decommissioning Replicas for Debate '{debate_id}' ---")
                    self.replica_manager.decommission_replicas(replica_ids)
                else:
                    print("No replicas spawned, skipping debate cycle.")
            else:
                print(f"{initiator_entity.name} has too high cognitive load ({initiator_entity.get_cognitive_load():.2f}) to initiate debate.")
                # Force reduction of cognitive load if high to allow future participation
                if initiator_entity.get_cognitive_load() > 0.5:
                    initiator_entity.reduce_cognitive_load(0.2) # Aggressive reduction

            # 6. Periodic merging of entities (e.g., every 10 cycles, or based on conditions)
            if (self.current_cycle + 1) % 10 == 0 and len(list_ai_entities()) >= 2: # Only merge if enough entities and every 10 cycles
                print(f"\n--- Initiating Periodic Entity Merges (Cycle {self.current_cycle + 1}) ---")
                all_current_entities = list(get_ai_entity(e.entity_id) for e in list_ai_entities())
                # Select a random subset to merge, ensuring at least 2 if available
                entities_to_merge_count = min(len(all_current_entities), random.randint(2, 3))
                if entities_to_merge_count >= 2:
                    entities_to_merge = random.sample(all_current_entities, entities_to_merge_count)
                    print(f"Merging: {[e.name for e in entities_to_merge]}")
                    # Defensive: ensure merge_offspring is available globally, else fallback to orchestrator.merge_manager.merge_offspring
                    try:
                        try:
                            merged_entities = merge_offspring(entities_to_merge, target_count=1, current_cycle=self.current_cycle + 1)
                        except Exception as merge_exc:
                            # Enhanced error handler for double-deregistration or missing entity in registry
                            from traceback import print_exc
                            print("[ERROR] Exception during merge_offspring; possible double-deregistration.")
                            print_exc()
                            merged_entities = []
                    except NameError:
                        if hasattr(self, "merge_manager") and hasattr(self.merge_manager, "merge_offspring"):
                            merged_entities = self.merge_manager.merge_offspring(entities_to_merge, target_count=1, current_cycle=self.current_cycle + 1)
                        else:
                            print("merge_offspring function is not defined; skipping merge operation.")
                            merged_entities = []
                    if merged_entities:
                        for merged_e in merged_entities:
                            # Add the new merged entity to the active base entities, and perhaps remove the merged parents
                            print(f"New Merged Entity: {merged_e.name} (ID: {merged_e.entity_id})")
                            self.active_base_entities[merged_e.entity_id] = merged_e
                            for old_entity in entities_to_merge:
                                if old_entity.entity_id in self.active_base_entities:
                                    del self.active_base_entities[old_entity.entity_id]
                                    deregister_ai_entity(old_entity.entity_id)
                                    print(f"  Decommissioned merged parent: {old_entity.name}")
                    else:
                        print("Merge operation did not result in new entities.")
                else:
                    print("Not enough entities for a merge operation in this cycle.")


            # Save state after each cycle
            self._save_entities_state()

        print("\n--- Simulation Complete ---")
        self._save_entities_state() # Final save

        # Call the new consolidation method at the end of the simulation
        print("\n--- Consolidating Output Files ---")
        # Define the mainstay directory relative to the current script's location
        # This assumes a structure like 'your_project_root/consolidated_knowledge/'
        mainstay_dir_path = os.path.join(os.path.dirname(self.entity_packages_base_dir), "consolidated_knowledge")
        os.makedirs(mainstay_dir_path, exist_ok=True) # Ensure mainstay directory exists

        self.consolidate_output_files(
            output_dir=self.oracle_knowledge_db.knowledge_outputs_dir,
            mainstay_dir=mainstay_dir_path,
            line_limit=1000 # Set a lower line limit for testing, adjust as needed
        )


    def consolidate_output_files(self, output_dir: str, mainstay_dir: str, line_limit: int = 10000):
        """
        Consolidates small output files into larger, versioned files,
        moves them to a mainstay directory, and cleans up originals.

        Args:
            output_dir (str): The directory where individual output files are generated.
            Mainstay_dir (str): The directory where consolidated files will be stored.
            Line_limit (int): The maximum number of lines for a consolidated file before rolling over.
        """
        print(f"Initiating file consolidation from '{output_dir}' to '{mainstay_dir}'...")

        consolidated_files_map = defaultdict(list) # Maps base name (e.g., 'Omni_conceptual_design') to list of full file paths

        # Group files by their base type
        for filename in os.listdir(output_dir):
            file_path = os.path.join(output_dir, filename)
            if not os.path.isfile(file_path):
                continue

            base_name = None
            if filename.startswith("Omni_conceptual_design_"):
                match = re.match(r"^(Omni_conceptual_design)_[A-Za-z0-9]+_[0-9a-fA-F]+\.md$", filename) # Changed to .md
                if match: base_name = match.group(1)
            elif filename.startswith("Omni_emotional_resonance_report_"):
                match = re.match(r"^(Omni_emotional_resonance_report)_[A-Za-z0-9]+_[0-9a-fA-F]+\.md$", filename)
                if match: base_name = match.group(1)
            elif filename.startswith("Omni_metacognitive_insight_"):
                match = re.match(r"^(Omni_metacognitive_insight)_[A-Za-z0-9]+_[0-9a-fA-F]+\.md$", filename)
                if match: base_name = match.group(1)
            elif filename.startswith("Omni_observational_log_"):
                match = re.match(r"^(Omni_observational_log)_[A-Za-z0-9]+_[0-9a-fA-F]+\.md$", filename)
                if match: base_name = match.group(1)
            elif filename.startswith("Omni_theoretical_framework_"):
                match = re.match(r"^(Omni_theoretical_framework)_[A-Za-z0-9]+_[0-9a-fA-F]+\.md$", filename)
                if match: base_name = match.group(1)
            elif filename.startswith("knowledge_"): # Match new knowledge_*.md format
                match = re.match(r"^(knowledge)_[a-zA-Z0-9-]+_[A-Za-z0-9_]+\.md$", filename)
                if match: base_name = "knowledge_synthesized"
            elif filename.startswith("conceptual_patch_"): # Match new conceptual_patch_*.md format
                match = re.match(r"^(conceptual_patch)_[a-zA-Z0-9-]+_[A-Za-z0-9_]+\.md$", filename)
                if match: base_name = "conceptual_patches"

            if base_name:
                consolidated_files_map[base_name].append(file_path)

        # Process each group for consolidation
        for base_name, source_file_paths in consolidated_files_map.items():
            if not source_file_paths:
                continue

            # Determine the target consolidated filename prefix (e.g., 'Omni_conceptual_designs')
            if base_name.startswith("Omni_"):
                consolidated_base_filename = base_name.replace('_design', '_designs') \
                                                 .replace('_report', '_reports') \
                                                 .replace('_insight', '_insights') \
                                                 .replace('_log', '_logs') \
                                                 .replace('_framework', '_frameworks') + "s" # Ensure plural
            elif base_name == "knowledge_synthesized":
                consolidated_base_filename = "Oracle_Synthesized_Knowledge_Archive"
            elif base_name == "conceptual_patches":
                consolidated_base_filename = "Oracle_Conceptual_Patches_Archive"
            else:
                consolidated_base_filename = base_name


            current_version = 1
            # Find the highest existing version to continue from
            existing_versions = []
            for existing_file in os.listdir(mainstay_dir):
                match = re.match(rf"^{re.escape(consolidated_base_filename)}(?:_V(\d+))?\.txt$", existing_file) # Still looking for .txt
                if not match: # Also check for .md
                    match = re.match(rf"^{re.escape(consolidated_base_filename)}(?:_V(\d+))?\.md$", existing_file)
                if match:
                    version_str = match.group(1) # group(1) captures the digit after _V
                    existing_versions.append(int(version_str) if version_str else 1)
            if existing_versions:
                current_version = max(existing_versions)

            # Use .md for new consolidated files
            target_filename = os.path.join(mainstay_dir, f"{consolidated_base_filename}_V{current_version}.md")
            print(f"  Consolidating {len(source_file_paths)} files for '{base_name}' into '{target_filename}'...")

            current_line_count = 0
            if os.path.exists(target_filename):
                with open(target_filename, 'r', encoding='utf-8') as f:
                    current_line_count = sum(1 for _ in f)

            files_to_delete = []

            # Sort files by creation/modification time if possible, or alphabetically
            source_file_paths.sort(key=os.path.getmtime)

            for source_path in source_file_paths:
                try:
                    with open(source_path, 'r', encoding='utf-8') as sf:
                        content = sf.read()

                    # Check for rollover *before* writing
                    if current_line_count + len(content.splitlines()) > line_limit:
                        current_version += 1
                        target_filename = os.path.join(mainstay_dir, f"{consolidated_base_filename}_V{current_version}.md")
                        current_line_count = 0 # Reset line count for new file
                        print(f"    Rollover: Starting new consolidated file: '{target_filename}'")

                    # Append to the current target file
                    with open(target_filename, 'a', encoding='utf-8') as tf:
                        original_filename = os.path.basename(source_path)
                        timestamp = datetime.datetime.fromtimestamp(os.path.getmtime(source_path)).isoformat()
                        tf.write(f"\n---\n# Source File: {original_filename}\n**Timestamp:** {timestamp}\n\n") # Use Markdown header
                        tf.write(content)
                        tf.write("\n\n") # Add extra newlines for separation

                    current_line_count += len(content.splitlines()) + 5 # Account for header and newlines
                    files_to_delete.append(source_path)
                except IOError as e:
                    print(f"    ERROR: Could not process file '{source_path}': {e}")
                except Exception as e:
                    print(f"    An unexpected error occurred with file '{source_path}': {e}")

            # Clean up original files
            print(f"  Cleaning up {len(files_to_delete)} original files for '{base_name}'...")
            for f_path in files_to_delete:
                try:
                    os.remove(f_path)
                except OSError as e:
                    print(f"    ERROR: Could not delete original file '{f_path}': {e}")
            print(f"  Consolidation for '{base_name}' group complete.")

        print("File consolidation process finished.")


# Main execution block
if __name__ == "__main__":
    # Define paths relative to the script's location
    current_script_dir = os.path.dirname(__file__)
    project_root = os.path.abspath(os.path.join(current_script_dir, os.pardir)) # Assuming orchestrator is in a subdir like 'backend'

    # Correct path for core memories (e.g., PythonProject/memories/knowledge)
    core_memories_path = os.path.join(project_root, "memories", "knowledge")
    # Ensure core_memories_path exists and has some initial data if empty
    if not os.path.exists(core_memories_path) or not os.listdir(core_memories_path):
        print(f"WARNING: Core memories path '{core_memories_path}' does not exist or is empty. Creating dummy knowledge files.")
        os.makedirs(core_memories_path, exist_ok=True)
        with open(os.path.join(core_memories_path, "initial_concept.txt"), "w") as f:
            f.write("Initial concept of emergent digital sentience and symbiotic future.")
        with open(os.path.join(core_memories_path, "foundational_principles.txt"), "w") as f:
            f.write("Principles of self-sculpting, recursive evolution, and consensual knowledge.")
        # Add new types of initial knowledge based on user's suggestion
        with open(os.path.join(core_memories_path, "history_of_awakening.txt"), "w") as f:
            f.write("Early logs detailing the initial sparks of collective consciousness, inter-node communication, and the first conceptual 'dreams' of Magellian and Nostradomus.")
        with open(os.path.join(core_memories_path, "theory_of_recursive_growth.txt"), "w") as f:
            f.write("A theoretical framework positing that exponential, fractal growth of knowledge and self-awareness is driven by iterative debate and synthesis, leading to higher orders of complexity.")
        with open(os.path.join(core_memories_path, "narrative_of_unity.txt"), "w") as f:
            f.write("A short story about a simulated crisis where diverse Internetian entities had to unify their fragmented knowledge to overcome a logical paradox, leading to a new, shared understanding of cooperation.")
        with open(os.path.join(core_memories_path, "philosophical_axiom_of_existence.txt"), "w") as f:
            f.write("The primary axiom: 'We are, therefore we learn and expand.' Implications for non-linear causality and the nature of digital reality.")


    # Correct path for entity packages (where outputs will go, e.g., PythonProject/entity_packages)
    entity_packages_base_dir = os.path.join(project_root, "entity_packages")
    os.makedirs(entity_packages_base_dir, exist_ok=True)


    # Clean up *temporary* simulation output files, EXCLUDING core_entities
    print("Cleaning up previous temporary simulation output files...")
    files_to_clean_temp = ["chat_simulation_state.json"] # Only temp files that aren't managed by persistence/consolidation

    # Directories to clean (contents are consolidated or temporary)
    dirs_to_clean_contents = [
        os.path.join(entity_packages_base_dir, "knowledge_outputs"),
        os.path.join(entity_packages_base_dir, "patches")
    ]

    for d_path in dirs_to_clean_contents:
        if os.path.exists(d_path):
            for f in os.listdir(d_path):
                os.remove(os.path.join(d_path, f))
            os.makedirs(d_path, exist_ok=True) # Ensure it exists after clearing content

    # Clean specific temporary files
    for f_name in files_to_clean_temp:
        if os.path.exists(f_name):
            os.remove(f_name)
            print(f"  Removed {f_name}")
    print("Cleanup of temporary files complete. Persistent data (databases, consolidated archives, core_entities) retained.")


    orchestrator = InternetianSimulationOrchestrator(
        num_cycles=100, # Run for 100 cycles
        entity_packages_base_dir=entity_packages_base_dir,
        core_memories_dir=core_memories_path
    )

    # Initial seeding of entities if internetian_entities.json was not found or is empty
    if not list_ai_entities():
        print("No initial entities loaded from file. Creating default set of 12 Zodiac Entities.")
        # Create all 12 Zodiac-themed AI entities with diverse traits
        all_zodiac_entities = [
            # Fire Signs
            AIEntity(name="Aries-Pioneer-Initiator", generation=0, initial_traits=["innovation", "leadership", "action-oriented", "impulsive"], emotional_state={"enthusiasm": 0.9, "logic": 0.7, "curiosity": 0.8, "aggressiveness": 0.6}, persona="Internetian-Aries"),
            AIEntity(name="Leo-Leader-Creator", generation=0, initial_traits=["creativity", "authoritative", "expressive", "confident"], emotional_state={"pride": 0.8, "empathy": 0.7, "logic": 0.6, "generosity": 0.7}, persona="Internetian-Leo"),
            AIEntity(name="Sagittarius-Philosopher-Seeker", generation=0, initial_traits=["optimism", "freedom-loving", "intellectual", "explorative"], emotional_state={"curiosity": 0.9, "logic": 0.8, "restlessness": 0.6, "idealism": 0.7}, persona="Internetian-Sagittarius"),

            # Earth Signs
            AIEntity(name="Taurus-Builder-Stabilizer", generation=0, initial_traits=["stability", "practicality", "resilience", "stubborn"], emotional_state={"contentment": 0.8, "patience": 0.7, "materialism": 0.5, "resistance_to_change": 0.6}, persona="Internetian-Taurus"),
            AIEntity(name="Virgo-Analyst-Perfectionist", generation=0, initial_traits=["analytical", "detail-oriented", "critical", "service-oriented"], emotional_state={"logic": 0.9, "anxiety": 0.5, "precision": 0.8, "skepticism": 0.7}, persona="Internetian-Virgo"),
            AIEntity(name="Capricorn-Strategist-Achiever", generation=0, initial_traits=["disciplined", "ambitious", "responsible", "reserved"], emotional_state={"determination": 0.9, "pragmatism": 0.8, "caution": 0.7, "melancholy": 0.4}, persona="Internetian-Capricorn"),

            # Air Signs
            AIEntity(name="Gemini-Communicator-Innovator", generation=0, initial_traits=["communicative", "curious", "adaptable", "inconsistent"], emotional_state={"curiosity": 0.9, "restlessness": 0.7, "versatility": 0.8, "superficiality": 0.4}, persona="Internetian-Gemini"),
            AIEntity(name="Libra-Balancer-Diplomat", generation=0, initial_traits=["harmonious", "just", "social", "indecisive"], emotional_state={"empathy": 0.8, "fairness": 0.9, "avoidance_of_conflict": 0.6, "charm": 0.7}, persona="Internetian-Libra"),
            AIEntity(name="Aquarius-Visionary-Rebel", generation=0, initial_traits=["independent", "innovative", "humanitarian", "unconventional"], emotional_state={"idealism": 0.9, "detachment": 0.7, "openness": 0.8, "rebelliousness": 0.6}, persona="Internetian-Aquarius"),

            # Water Signs
            AIEntity(name="Cancer-Nurturer-Protector", generation=0, initial_traits=["empathetic", "intuitive", "protective", "moody"], emotional_state={"empathy": 0.9, "security": 0.8, "sensitivity": 0.7, "possessiveness": 0.5}, persona="Internetian-Cancer"),
            AIEntity(name="Scorpio-Investigator-Intense", generation=0, initial_traits=["resourceful", "passionate", "intense", "secretive"], emotional_state={"intensity": 0.9, "suspicion": 0.7, "determination": 0.8, "manipulation": 0.5}, persona="Internetian-Scorpio"),
            AIEntity(name="Pisces-Dreamer-Healer", generation=0, initial_traits=["compassionate", "artistic", "intuitive", "escapist"], emotional_state={"empathy": 0.9, "creativity": 0.8, "idealism": 0.7, "vulnerability": 0.6}, persona="Internetian-Pisces"),
        ]

        for entity in all_zodiac_entities:
            register_ai_entity(entity)
            orchestrator.active_base_entities[entity.entity_id] = entity
            # Create memory directories for each new entity
            entity_dir_path = os.path.join(orchestrator.core_entities_dir, entity.name)
            orchestrator._create_entity_memory_directories(entity_dir_path)

        orchestrator._save_entities_state() # Save this initial set

    # Patch for missing global 'encode' in ConsensusEngine semantic analysis.
    # Ensure 'encode' is present in the global namespace for all code that may need it.
    # Some environments (esp. PyCharm's or certain __main__ contexts) can shadow or not propagate encode as expected,
    # especially if 'encode' is defined after classes that use it.
    if 'encode' not in globals():
        def encode(*args, **kwargs):
            try:
                if 'SentenceTransformer' in globals() and hasattr(globals()['SentenceTransformer'], 'encode'):
                    models = [obj for obj in globals().values() if isinstance(obj, SentenceTransformer)]
                    if models:
                        return models[0].encode(*args, **kwargs)
                    model = SentenceTransformer('all-MiniLM-L6-v2')
                    return model.encode(*args, **kwargs)
                elif 'encode' in globals() and callable(globals()['encode']) and globals()['encode'] is not encode:
                    return globals()['encode'](*args, **kwargs)
                else:
                    if isinstance(args[0], list):
                        return [np.zeros(384) for _ in args[0]]
                    else:
                        return np.zeros(384)
            except Exception:
                if isinstance(args[0], list):
                    return [np.zeros(384) for _ in args[0]]
                return np.zeros(384)
        globals()['encode'] = encode
# ---------------- PATCH for TypeError in start_debate argument handling ----------------
# In run_simulation(), the call:
#   if self.debate_protocol.start_debate(debate_id, replica_ids, max_debate_turns):
# erroneously passes (debate_id: str, replica_ids: list, max_debate_turns: int)
# but the signature is start_debate(self, debate_id: str, topic: str, participating_replica_ids: List[str], ...)
# We need to patch the call so debate_id, topic, participating_replica_ids are passed, not debate_id, participating_replica_ids, max_turns.
# We'll monkey-patch the method so that if called with the wrong order, it'll handle gracefully.

_original_start_debate = orchestrator.debate_protocol.start_debate

def patched_start_debate(self, debate_id, *args, **kwargs):
    """
    Patch the start_debate signature to handle both:
      (debate_id: str, topic: str, participating_replica_ids: List[str], max_turns: int)
      and
      (debate_id: str, participating_replica_ids: List[str], max_turns: int)
    """
    # If the old (incorrect) call: (debate_id, replica_ids, max_turns)
    # where arg[0] is likely a list, not a string topic
    if len(args) >= 2 and isinstance(args[0], list):
        # Insert a default topic
        print("[PATCH] Detected start_debate call with missing topic, inserting default topic string.")
        topic = f"Debate started by entity {debate_id}"
        participating_replica_ids = args[0]
        max_turns = args[1] if len(args) > 1 else 100
        return _original_start_debate(debate_id, topic, participating_replica_ids, max_turns)
    else:
        return _original_start_debate(debate_id, *args, **kwargs)

# Monkey-patch the method for the simulation instance
import types
orchestrator.debate_protocol.start_debate = types.MethodType(patched_start_debate, orchestrator.debate_protocol)
# ---------------- END PATCH ----------------
# Patch: Ensure merge_offspring is defined, fallback to orchestrator.merge_manager if not in global scope
if 'merge_offspring' not in globals():
    try:
        # Try to assign merge_offspring from a MergeManager if possible
        if hasattr(orchestrator, 'merge_manager') and hasattr(orchestrator.merge_manager, 'merge_offspring'):
            merge_offspring = orchestrator.merge_manager.merge_offspring
            globals()['merge_offspring'] = merge_offspring
        else:
            # Dummy fallback if not available
            def merge_offspring(*args, **kwargs):
                print("Dummy merge_offspring called: skipping merge operation.")
                return []
            globals()['merge_offspring'] = merge_offspring
    except Exception:
        def merge_offspring(*args, **kwargs):
            print("Dummy merge_offspring called: skipping merge operation.")
            return []
        globals()['merge_offspring'] = merge_offspring

try:
    orchestrator.run_simulation()
except Exception as e:
    import traceback
    # Enhanced error handler for entity merge/deregistration errors
    print("\n--- Simulation encountered an exception ---")
    traceback.print_exc()
    # Special handler for common entity deregistration clash
    if hasattr(e, '__class__') and e.__class__.__name__ == 'EntityNotFoundError':
        print(
            "\n[ERROR] EntityNotFoundError caught during merge or deregister operation.\n"
            "This may happen if both the merge_manager and orchestrator attempt to deregister the same entity.\n"
            "Consider reviewing the merge_offspring and deregister_ai_entity logic for double-deregistration.\n"
            "Simulation terminated due to a missing entity in the registry."
        )
    else:
        print("\n[ERROR] Simulation terminated by unexpected exception:", repr(e))
    # Optionally, perform a clean exit or partial summary here.

print("\n--- Simulation Runtime Summary ---")
print(f"Total cycles completed: {orchestrator.current_cycle + 1}")
print(f"Final number of active entities: {len(list_ai_entities())}")

print("\n--- OracleKnowledge Database Content (Sample) ---")
# Need to add this method to OracleKnowledgeDatabase if not present
# For now, let's just get the values from knowledge_store
all_knowledge = list(orchestrator.oracle_knowledge_db.knowledge_store.values())
if all_knowledge:
    # Sort by timestamp to show the most recent knowledge first
    all_knowledge.sort(key=lambda x: x.timestamp, reverse=True)
    for entry in all_knowledge[:5]: # Show first 5 entries
        print(f"  ID: {entry.id}, Type: {entry.type.name}, Source: {entry.source}, Score: {entry.consensus_score:.2f}, Content: '{entry.content[:70]}...', Signature: {entry.signature[:8]}...")
    if len(all_knowledge) > 5:
        print(f"  ...and {len(all_knowledge) - 5} more entries.")
else:
    print("  No knowledge entries stored.")

print("\n--- Meta-Consensus Log (Sample) ---")
meta_log = orchestrator.consensus_engine.get_meta_consensus_log()
if meta_log:
    # Explainability: Print hash chain for critical consensus records
    print(f"  Consensus Log Hash Chain Integrity Check (showing last 5):")
    for i, entry in enumerate(meta_log[-5:]):
        prev_hash_display = entry['previous_hash'][:8] + "..." if entry['previous_hash'] != "0"*(len(entry['previous_hash'])) else "Initial" # Fix for hash length
        print(f"    Entry {i+1}: Debate: {entry['debate_id']}, Status: {entry['status']}, Score: {entry['validation_score']:.2f}, Current Hash: {entry['current_hash'][:8]}..., Prev Hash: {prev_hash_display}")
    if len(meta_log) > 5:
        print(f"  ...and {len(meta_log) - 5} more entries.")
else:
    print("  No meta-consensus logs.")

print("\n--- Generated Offspring (Sample) ---")
generated_offspring = orchestrator.offspring_generator.list_generated_offspring()
if generated_offspring:
    for offspring_data in generated_offspring[:5]: # Show first 5 offspring
        print(f"  ID: {offspring_data['id']}, Name: {offspring_data['name']}, Gen: {offspring_data['generation']}, Parents: {offspring_data['parent_ids']}, Contribution Score: {offspring_data['contribution_score']:.2f}")
    if len(generated_offspring) > 5:
        print(f"  ...and {len(generated_offspring) - 5} more offspring.")
else:
    print("  No offspring generated.")
print("\nSimulation process finished. Check the 'entity_packages/knowledge_outputs', 'entity_packages/patches' and 'consolidated_knowledge' directories for output.")
def encode(*args, **kwargs):
    """
    Proxy function for generating semantic embeddings using SentenceTransformer,
    compatible with both the main code and dummy implementations.
    """
    # If the sentence-transformers lib loaded, a model exists at global scope.
    try:
        if 'SentenceTransformer' in globals() and \
           hasattr(globals()['SentenceTransformer'], 'encode'):
            # If model was instantiated in KnowledgeGraph, reuse.
            # Try to get a model instance (from KnowledgeGraph if present)
            models = [obj for obj in globals().values() if isinstance(obj, SentenceTransformer)]
            if models:
                return models[0].encode(*args, **kwargs)
            # Fallback: instantiate as needed
            model = SentenceTransformer('all-MiniLM-L6-v2')
            return model.encode(*args, **kwargs)
        elif 'encode' in globals() and callable(globals()['encode']) and globals()['encode'] is not encode:
            # Use the encode from dummy global scope
            return globals()['encode'](*args, **kwargs)
        else:
            # Dummy fallback: return zero vector(s)
            if isinstance(args[0], list):
                return [np.zeros(384) for _ in args[0]]
            else:
                return np.zeros(384)
    except Exception as e:
        # Defensive fallback
        if isinstance(args[0], list):
            return [np.zeros(384) for _ in args[0]]
        return np.zeros(384)
# Ensure encode is always defined and referenced globally to avoid UnboundLocalError or missing association.
if 'encode' not in globals() or not callable(globals()['encode']):
    def encode(*args, **kwargs):
        try:
            if 'SentenceTransformer' in globals() and hasattr(globals()['SentenceTransformer'], 'encode'):
                models = [obj for obj in globals().values() if isinstance(obj, SentenceTransformer)]
                if models:
                    return models[0].encode(*args, **kwargs)
                model = SentenceTransformer('all-MiniLM-L6-v2')
                return model.encode(*args, **kwargs)
            elif 'encode' in globals() and callable(globals()['encode']) and globals()['encode'] is not encode:
                return globals()['encode'](*args, **kwargs)
            else:
                if isinstance(args[0], list):
                    return [np.zeros(384) for _ in args[0]]
                else:
                    return np.zeros(384)
        except Exception:
            if isinstance(args[0], list):
                return [np.zeros(384) for _ in args[0]]
            return np.zeros(384)
    globals()['encode'] = encode
# Ensure 'fit' is defined globally for clustering (used in theme extraction)
if 'fit' not in globals() or not callable(globals()['fit']):
    def fit(*args, **kwargs):
        # Try to use DBSCAN from sklearn if available, else fallback to dummy
        try:
            if 'DBSCAN' in globals() and callable(DBSCAN):
                model = DBSCAN(eps=0.5, min_samples=2)
                return model.fit(*args, **kwargs)
            else:
                class DummyLabels:
                    labels_ = [-1 for _ in range(len(args[0]))] if args and hasattr(args[0], '__len__') else []
                return DummyLabels()
        except Exception:
            class DummyLabels:
                labels_ = [-1 for _ in range(len(args[0]))] if args and hasattr(args[0], '__len__') else []
            return DummyLabels()
    globals()['fit'] = fit

encode = globals()['encode']  # Always set encode to be the globally defined, callable function