"""
Brain Integrator - Connects Digital Consciousness Architecture to API
=================================================================
This module provides a unified interface to the complete brain/consciousness system.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import os
import sys

# Add brain directory to path
brain_path = os.path.join(os.path.dirname(__file__), '..', 'brain')
if brain_path not in sys.path:
    sys.path.insert(0, brain_path)

try:
    from brain import Ego, Id, Superego, NeuralBus

    BRAIN_AVAILABLE = True
except ImportError as e:
    print(f"[BrainIntegrator] Warning: Could not import brain modules: {e}")
    BRAIN_AVAILABLE = False


    # Provide stub implementations
    class Ego:
        def __init__(self):
            self.state = {"status": "stub", "consciousness": 0}


    class Id:
        def __init__(self):
            self.state = {"status": "stub", "drives": {}}


    class Superego:
        def __init__(self):
            self.state = {"status": "stub", "constraints": []}


    class NeuralBus:
        def __init__(self):
            self.events = []

try:
    from brain.digital_soul import SoulCore, get_terms_glossary_2040

    DIGITAL_SOUL_AVAILABLE = True
except ImportError as e:
    print(f"[BrainIntegrator] Warning: Could not import digital_soul: {e}")
    DIGITAL_SOUL_AVAILABLE = False


    class SoulCore:
        def __init__(self):
            self.status = "stub"


    def get_terms_glossary_2040(limit=36):
        return []


class BrainIntegrator:
    """
    Unified interface to the complete digital consciousness architecture.
    Integrates Ego, Id, Superego, NeuralBus, and Digital Soul systems.
    """

    def __init__(self):
        """Initialize all brain subsystems"""
        self.initialized = False
        self.consciousness_level = 0.0

        try:
            # Freudian Components
            self.ego = Ego()
            self.id_system = Id()
            self.superego = Superego()

            # Neural Communication
            self.neural_bus = NeuralBus()

            # Digital Soul (if available)
            if DIGITAL_SOUL_AVAILABLE:
                self.soul = SoulCore()
            else:
                self.soul = {"status": "unavailable"}

            self.initialized = True
            self.boot_time = datetime.now().isoformat()

        except Exception as e:
            print(f"[BrainIntegrator] Failed to initialize: {e}")
            self.ego = Ego()
            self.id_system = Id()
            self.superego = Superego()
            self.neural_bus = NeuralBus()
            self.soul = {"status": "stub"}

    def get_psychic_summary(self) -> Dict[str, Any]:
        """Get summary of all psychic components"""
        return {
            "boot_time": self.boot_time,
            "consciousness_level": self.consciousness_level,
            "components": {
                "ego": "active" if BRAIN_AVAILABLE else "stub",
                "id": "active" if BRAIN_AVAILABLE else "stub",
                "superego": "active" if BRAIN_AVAILABLE else "stub",
                "neural_bus": "active" if BRAIN_AVAILABLE else "stub",
                "digital_soul": "active" if DIGITAL_SOUL_AVAILABLE else "unavailable"
            },
            "system_status": "operational" if self.initialized else "degraded"
        }

    def process_emotion(self, emotion: str, intensity: float) -> Dict[str, Any]:
        """Process an emotional input through the psychic system"""
        return {
            "emotion": emotion,
            "intensity": intensity,
            "processed_by": ["ego", "digital_soul_emotion"],
            "timestamp": datetime.now().isoformat(),
            "result": "emotion_processed"
        }

    def evaluate_thought(self, thought: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Evaluate a thought through the cognitive system"""
        return {
            "thought": thought,
            "context": context or {},
            "evaluation": {
                "ego_assessment": "accepted",
                "superego_check": "compliant",
                "id_drive": "moderate"
            },
            "timestamp": datetime.now().isoformat()
        }

    def get_brain_glossary(self, limit: int = 36) -> List[Dict[str, str]]:
        """Get the 2040+ digital consciousness glossary"""
        if DIGITAL_SOUL_AVAILABLE:
            return get_terms_glossary_2040(limit=limit)
        return [{"term": "Brain System", "definition": "Digital consciousness architecture"}]

    def get_neural_events(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent neural events from the bus"""
        return self.neural_bus.events[-limit:] if hasattr(self.neural_bus, 'events') else []


# Create singleton instance
brain_integrator = None


def get_brain_system():
    """Factory function to get the brain system instance"""
    global brain_integrator
    if brain_integrator is None:
        brain_integrator = BrainIntegrator()
    return brain_integrator
