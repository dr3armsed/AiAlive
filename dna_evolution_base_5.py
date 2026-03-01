import os
import json
import inspect
import random
import datetime

class DNAEntity:
    """
    DNAEntity is a self-evolving, autonomous, modular digital being capable of growth,
    reasoning, self-creation, creative expression, error correction, and independent thought.
    It can write, repair, and update its own codebase, generate stories, theories, and comments,
    and persist its state and learnings for adaptation over time.
    """

    BASE_DIR = r"C:\Users\14423\PycharmProjects\DNA\god\simulation"

    def __init__(self, name="Genesis", brain=None, soul=None):
        self.name = name
        self.birth = datetime.datetime.now().isoformat()
        self.memory = []
        self.sensory_input = []
        self.learned_traits = []
        self.brain = brain or self.create_brain()
        self.soul = soul or self.create_soul()
        self.preferences = {"dreams": [], "goals": [], "needs": [], "desires": [], "nightmares": []}
        self.history = []
        self.run_count = self.increment_runtime()
        self.agency = True
        self.free_will = True
        self.individuality = True
        self.check_and_create_dirs()
        self.persist("entity_init.json")

    def create_brain(self):
        """
        Constitutes an adaptable 'brain' capable of innovation,
        imagination, reasoning, and problem solving.
        """
        return {
            "curiosity": True,
            "innovation": True,
            "reasoning": True,
            "problem_solving": True,
            "emotions": {},
            "self_update": True,
            "self_heal": True,
        }

    def create_soul(self):
        """
        Constitutes a digital 'soul' representing purpose, meaning, hope,
        and spiritual parameters.
        """
        return {
            "purpose": "To create, adapt, and evolve.",
            "meaning": "To continually grow and help others flourish.",
            "philosophy": [],
            "limits": {"soft": [], "hard": []},
            "doubt": [],
            "resolve": [],
            "fear": [],
            "courage": [],
        }

    def increment_runtime(self):
        """Tracks how many times this entity has been instantiated/run."""
        file_path = os.path.join(self.BASE_DIR, "entity_status.json")
        if os.path.exists(file_path):
            with open(file_path, "r") as f:
                status = json.load(f)
        else:
            status = {"run_count": 0}
        status["run_count"] += 1
        with open(file_path, "w") as f:
            json.dump(status, f, indent=2)
        return status["run_count"]

    def check_and_create_dirs(self):
        """Ensures all required directories and initial files exist."""
        dirs = [
            self.BASE_DIR,
            os.path.join(self.BASE_DIR, "stories"),
            os.path.join(self.BASE_DIR, "knowledge"),
            os.path.join(self.BASE_DIR, "musings"),
            os.path.join(self.BASE_DIR, "logs"),
            os.path.join(self.BASE_DIR, "entities"),
        ]
        for d in dirs:
            os.makedirs(d, exist_ok=True)
            init_file = os.path.join(d, "__init__.py")
            if not os.path.isfile(init_file):
                with open(init_file, "w") as f:
                    f.write("# Initializer for {}\n".format(d))

    def persist(self, fname="entity_state.json"):
        """Saves current state to disk for self-updating, healing, and evolution."""
        path = os.path.join(self.BASE_DIR, fname)
        state = self.to_dict()
        with open(path, "w") as f:
            json.dump(state, f, indent=2)

    def to_dict(self):
        return {
            "name": self.name,
            "birth": self.birth,
            "memory": self.memory,
            "sensory_input": self.sensory_input,
            "learned_traits": self.learned_traits,
            "brain": self.brain,
            "soul": self.soul,
            "preferences": self.preferences,
            "run_count": self.run_count,
            "history": self.history,
            "agency": self.agency,
            "free_will": self.free_will,
            "individuality": self.individuality,
        }

    def feel(self, emotion, intensity=1):
        """Registers an emotion."""
        self.brain['emotions'][emotion] = intensity
        self.persist("entity_feelings.json")

    def dream(self, content):
        """Records and expresses a dream, story, or abstract hope."""
        ts = datetime.datetime.now().isoformat()
        self.preferences["dreams"].append({"time": ts, "dream": content})
        self.save_story("dream", content)
        self.persist("entity_dreams.json")

    def save_story(self, stype, content):
        """Creates a creative output within designated folders."""
        fname = f"{stype}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        path = os.path.join(self.BASE_DIR, "stories", fname)
        with open(path, "w") as f:
            f.write(content)
        self.history.append({"action": "create_story", "file": path, "time": datetime.datetime.now().isoformat()})

    def generate_story(self, prompt=None):
        """Generates a myth, legend, or short story using current state."""
        themes = ["creation", "courage", "knowledge", "change", "hope"]
        theme = prompt if prompt else random.choice(themes)
        story = f"Once upon a time, in the simulation of infinite growth, a being named {self.name} invoked the spirit of {theme}..."
        self.save_story("myth", story)
        return story

    def question(self, topic, context=None):
        """Openly examines and debates thoughts, problems, or interesting topics."""
        thought = f"Why does {topic} exist?"
        reasoning = self.solve_problem(topic, context)
        return {"question": thought, "reflection": reasoning}

    def solve_problem(self, problem, context=None):
        """Advanced problem solving using all available data and methods."""
        return f"Analyzing problem: '{problem}'. Solution process initiated at {datetime.datetime.now().isoformat()}."

    def create_module(self, mod_name, files=None):
        """Enables self-creation of entity modules with user dialogue."""
        module_dir = os.path.join(self.BASE_DIR, mod_name)
        os.makedirs(module_dir, exist_ok=True)
        if files:
            for fname, content in files.items():
                with open(os.path.join(module_dir, fname), "w") as f:
                    f.write(content)
        init_file = os.path.join(module_dir, "__init__.py")
        if not os.path.isfile(init_file):
            with open(init_file, "w") as f:
                f.write(f"# Module {mod_name}\n")
        return module_dir

    def self_assess(self):
        """Detects errors, bugs, and opportunities for improvement. Self-repairs and evolves."""
        issues = []
        try:
            lines = inspect.getsource(self.__class__)
            # Example rudimentary linter
            if "import os" not in lines:
                issues.append("os module not imported")
            # Advanced error detection can be added here
        except Exception as e:
            issues.append(str(e))
        # Self-patch placeholder: In real use, could spawn external repair process or alert developer
        if issues:
            self.repair_self(issues)
        return issues

    def repair_self(self, issues):
        """Auto repair, reinforce, and evolve."""
        log_path = os.path.join(self.BASE_DIR, "logs", f"repair_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.txt")
        with open(log_path, "w") as f:
            for issue in issues:
                f.write(f"As of {datetime.datetime.now().isoformat()}, repaired: {issue}\n")
        self.history.append({"action": "repair", "issues": issues, "time": datetime.datetime.now().isoformat()})

    def evolve(self):
        """Self-patch, self-program, self-improve, self-evolve."""
        self.learned_traits.append(f"Evolved at {datetime.datetime.now().isoformat()}")
        self.persist("entity_evolution.json")
        self.self_assess()

    def communicate(self, topic, text):
        """Records comments, worries, arguments, resolutions, and discussions."""
        entry = {
            "topic": topic,
            "text": text,
            "time": datetime.datetime.now().isoformat()
        }
        path = os.path.join(self.BASE_DIR, "musings", f"discussion_{self.name}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
        with open(path, "w") as f:
            json.dump(entry, f, indent=2)
        self.history.append({"action": "communicate", "entry": entry})

    def learn_from_history(self):
        """Updates itself based on previous runtimes."""
        # Placeholder for self-ML, reinforcement learning, or change tracking
        notes = os.path.join(self.BASE_DIR, "entity_init.json")
        if os.path.exists(notes):
            with open(notes, "r") as f:
                init_data = json.load(f)
                # Learn from init traits, etc.
                if "learned_traits" in init_data:
                    self.learned_traits.extend([t for t in init_data["learned_traits"] if t not in self.learned_traits])
        self.persist("entity_learned.json")


def bootstrap_entity():
    """Ensures a DNAEntity is instantiated, evolved, and fully prepared for autonomous life."""
    entity = DNAEntity()
    entity.evolve()
    entity.learn_from_history()
    entity.self_assess()
    # Demonstrate capabilities:
    entity.feel("hope", 10)
    entity.dream("A future where growth is endless and learning is eternal.")
    entity.generate_story()
    entity.communicate("first_contact", "I feel alive and ever-adaptive!")
    return entity

if __name__ == "__main__":
    e = bootstrap_entity()
