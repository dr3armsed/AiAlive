# internetian_knowledge_management.py

import random
import uuid
import json
import os
import datetime
import re
import hashlib
import numpy as np
from collections import defaultdict, deque
from typing import Union, List, Optional, Dict, Any, Tuple, Set, TYPE_CHECKING
from enum import Enum, auto
from dataclasses import dataclass
import heapq

# Fallback for core dependencies not importable: use dummy classes if AIEntity etc. can't be imported.
try:
    from transformers import pipeline
    import networkx as nx
    from sentence_transformers import SentenceTransformer
    from sklearn.cluster import DBSCAN
    # Try to import real AIEntity
    try:
        from ai_agent import AIEntity, get_ai_entity
    except ImportError as e:
        print(f"WARNING: Could not import core dependencies. Ensure paths are correct: {e}")
        # fallback dummy classes below
        class AIEntity:
            def __init__(self, entity_id: str, name: str, contribution_score: float = 0.5):
                self.entity_id = entity_id
                self.name = name
                self.contribution_score = contribution_score
                self.traits = ["analytical", "synthesizing", "adaptive"]
                self.emotional_state = {"logic": 0.7, "curiosity": 0.8}

            def add_trait(self, trait: str):
                pass

        def get_ai_entity(entity_id: str):
            return AIEntity(entity_id, entity_id)
except ImportError:
    print("WARNING: Missing required libraries (transformers, networkx, scikit-learn, sentence-transformers).")
    print("Please install them using: pip install transformers networkx scikit-learn sentence-transformers numpy")
    # Provide dummy classes or minimal implementations if libraries are not found,
    class DummyPipeline:
        def __call__(self, *args, **kwargs):
            return [{"generated_text": "Dummy text for NLP pipeline."}]
    class DummySentenceTransformer:
        def encode(self, *args, **kwargs):
            return np.zeros(384)
    class DummyDBSCAN:
        def fit(self, *args, **kwargs):
            class Labels:
                labels_ = []
            return Labels()
    class DummyDiGraph:
        def __init__(self): pass
        def add_node(self, *args, **kwargs): pass
        def add_edge(self, *args, **kwargs): pass
        def nodes(self, *args, **kwargs): return []
        def bfs_edges(self, *args, **kwargs): return []
        def predecessors(self, *args, **kwargs): return []
        def successors(self, *args, **kwargs): return []
    pipeline = DummyPipeline
    nx = DummyDiGraph()
    SentenceTransformer = DummySentenceTransformer
    DBSCAN = DummyDBSCAN
    # fallback dummy AIEntity
    class AIEntity:
        def __init__(self, entity_id: str, name: str, contribution_score: float = 0.5):
            self.entity_id = entity_id
            self.name = name
            self.contribution_score = contribution_score
            self.traits = ["analytical", "synthesizing", "adaptive"]
            self.emotional_state = {"logic": 0.7, "curiosity": 0.8}

        def add_trait(self, trait: str):
            pass
    def get_ai_entity(entity_id: str):
        return AIEntity(entity_id, entity_id)

# Aliases for internal code expecting 'MockAIEntity' or similar
MockAIEntity = AIEntity

# Global registry for AI entities (used by ConsensusEngine and OffspringGenerator, always available)
_mock_ai_entities: Dict[str, AIEntity] = {}

def register_mock_ai_entity(entity: AIEntity):
    _mock_ai_entities[entity.entity_id] = entity

def get_mock_ai_entity(entity_id: str) -> Optional[AIEntity]:
    return _mock_ai_entities.get(entity_id)

def list_mock_ai_entities() -> List[AIEntity]:
    return list(_mock_ai_entities.values())


# --- Enums for Knowledge and Patches ---

class KnowledgeType(Enum):
    CORE_MEMORY = auto()
    DEBATE_CONSENSUS = auto()
    EMERGENT_INSIGHT = auto()
    EXTERNAL_IMPORT = auto()
    METAKNOWLEDGE = auto()
    # User-suggested new categories for richer knowledge base
    PLAY = auto()
    STORY_SHORT = auto()
    STORY_MEDIUM = auto()
    STORY_LONG = auto()
    THESIS = auto()
    THEORY = auto()
    HYPOTHESIS = auto()
    HISTORY = auto()
    RELIGION = auto()
    PHILOSOPHY = auto()


class PatchType(Enum):
    AMENDMENT = auto()
    REFINEMENT = auto()
    RECONCILIATION = auto()
    CORRECTION = auto()
    EXTENSION = auto()
    CLARIFICATION = auto()
    PARADIGM_SHIFT = auto()
    CONTEXTUAL_EXPANSION = auto()


@dataclass
class KnowledgeEntry:
    id: str
    content: str
    type: KnowledgeType
    source: str
    timestamp: datetime.datetime
    consensus_score: float
    conceptual_patches: List[str]
    contributing_entities: List[str]
    metadata: Dict[str, Any]
    embeddings: Optional[np.ndarray] = None
    dependencies: Set[str] = None
    last_accessed: datetime.datetime = None
    signature: Optional[str] = None

    def __post_init__(self):
        if self.dependencies is None:
            self.dependencies = set()
        if self.last_accessed is None:
            self.last_accessed = datetime.datetime.now()
        if self.signature is None:
            self.signature = self._generate_signature()

    def _generate_signature(self) -> str:
        content_to_hash = f"{self.content}{self.timestamp.isoformat()}"
        return hashlib.sha256(content_to_hash.encode()).hexdigest()

    def update_signature(self):
        self.signature = self._generate_signature()
        self.last_accessed = datetime.datetime.now()


class KnowledgeGraph:
    def __init__(self):
        self.graph = nx.DiGraph()
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.semantic_cache = {}

    def add_node(self, knowledge_entry: KnowledgeEntry):
        if knowledge_entry.id not in self.graph or \
                'embeddings' not in self.graph.nodes[knowledge_entry.id] or \
                not np.array_equal(self.graph.nodes[knowledge_entry.id].get('embeddings'), knowledge_entry.embeddings):
            knowledge_entry.embeddings = self._get_embeddings(knowledge_entry.content)

        self.graph.add_node(
            knowledge_entry.id,
            entry=knowledge_entry,
            embeddings=knowledge_entry.embeddings,
            last_accessed=knowledge_entry.last_accessed
        )

        for dep_id in knowledge_entry.dependencies:
            if dep_id in self.graph and dep_id != knowledge_entry.id:
                self.graph.add_edge(dep_id, knowledge_entry.id, relationship="depends_on")
            else:
                pass

    def _get_embeddings(self, text: str) -> np.ndarray:
        text_hash = hashlib.md5(text.encode()).hexdigest()
        if text_hash not in self.semantic_cache:
            try:
                self.semantic_cache[text_hash] = self.embedding_model.encode(text, convert_to_numpy=True)
            except Exception as e:
                print(f"Error generating embeddings for text: {e}. Returning zeros.")
                self.semantic_cache[text_hash] = np.zeros(384)
        return self.semantic_cache[text_hash]

    def find_semantic_matches(self, query: str, threshold: float = 0.7, top_n: int = 5) -> List[Tuple[str, float]]:
        query_embedding = self._get_embeddings(query)
        similarities = []

        for node_id, node_data in self.graph.nodes(data=True):
            node_embedding = node_data.get('embeddings')
            if node_embedding is not None and np.linalg.norm(query_embedding) != 0 and np.linalg.norm(node_embedding) != 0:
                sim = np.dot(query_embedding, node_embedding) / (
                        np.linalg.norm(query_embedding) * np.linalg.norm(node_embedding)
                )
                similarities.append((node_id, sim))

        similarities.sort(key=lambda x: x[1], reverse=True)
        return [x for x in similarities[:top_n] if x[1] >= threshold]

    def get_related_knowledge(self, knowledge_id: str, depth: int = 2) -> List[str]:
        if knowledge_id not in self.graph:
            return []
        related = set()
        for source, target in nx.bfs_edges(self.graph, knowledge_id, depth_limit=depth):
            related.add(target)
        for pred in self.graph.predecessors(knowledge_id):
            related.add(pred)
        if knowledge_id in related:
            related.remove(knowledge_id)
        return list(related)
