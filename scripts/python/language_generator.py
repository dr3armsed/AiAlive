import random
import os
import datetime
import uuid
from queue import Queue

# --- BEGIN: Core Datasets & Constants ---

KNOWLEDGE_BASE_PATHS = [
    r"C:\Users\14423\PycharmProjects\digitaldna\behind_the_scenes\agency",
    r"C:\Users\14423\PycharmProjects\digitaldna\ai_simulation\entities\oracle\oracle_data\knowledge"
]

KNOWLEDGE_FILES = [
    "the_brain_that_doesnt",
    r"brittanica\ai.json",
    r"brittanica\Architecture_&_Construction.json",
    r"brittanica\atronomy.json",
    r"brittanica\Botany.json",
    r"brittanica\Chemistry_&_Physics.json",
    r"brittanica\Geography.json",
    r"brittanica\index.json",
    r"brittanica\Language,_Logic_&_Philosophy.json",
    r"brittanica\Law.json",
    r"brittanica\Medicine_&_Anatomy.json",
    r"brittanica\metaphysics.json",
    r"brittanica\Military_&_Maritime.json",
    r"brittanica\Miscellaneous.json",
    r"brittanica\philosophy.json",
    r"brittanica\physics.json",
    r"brittanica\Religion_&_Theology.json",
    r"brittanica\technology.json",
    "dictionary"
]

CREATIVE_OUTPUTS = [
    "short_stories", "debated_short_stories", "stories", "debated_stories", "books", "debated_books",
    "plays", "debated_plays", "entries", "debated_entries", "ideas", "debated_ideas",
    "musings", "debated_musings", "theories", "debated_theories", "hypothesis", "debated_hypothesis",
    "dreams", "debated_dreams", "nightmares", "debated_nightmares", "religion", "debated_religion",
    "theology", "debated_theology", "philosophies", "debated_philosophy", "legends", "debated_legends",
    "myths", "debated_myths", "tall_tales", "debated_tall_tales", "day_dreams", "debated_day_dreams",
    "prophecies", "debated_prophecy", "predictions", "debated_predictions", "scripts", "debated_scripts",
    "poems", "debated_poems", "history", "debated_history", "artifacts", "debated_artifacts"
]

ENTITY_EXPANSION_ROOT = r"C:\Users\14423\PycharmProjects\digitaldna\simulation_expansion"
MALLS_PATH = r"C:\Users\14423\PycharmProjects\digitaldna\simulation_expansion\50_story_malls"
SELF_TRAINING_PATH = r"C:\Users\14423\PycharmProjects\digitaldna\behind_the_scenes\digitaldna\self_training"

GENIUS_SKILL_SETS = [
    "python", "ai", "self_healing", "debate", "creativity", "philosophy", "logic", "emotion",
    "emergence", "mutation", "theory_building", "ethics", "autonomy"
]

# --- END: Core Datasets & Constants ---


class EvolvingEntity:
    """
    Abstract representation of a self-evolving, self-aware, fully agentic entity.
    Features: autonomy, intent, curiosity, communication, agency, goals, growth.
    """

    def __init__(self, name, persona, dictionary, memory, agency_dirs=KNOWLEDGE_BASE_PATHS, knowledge_files=KNOWLEDGE_FILES):
        self.name = name
        self.persona = persona
        self.dictionary = dictionary.copy()
        self.memory = list(memory)
        self.agency_dirs = list(agency_dirs)
        self.knowledge_files = list(knowledge_files)
        self.knowledge = {}
        self.thoughts = []
        self.needs = {
            "curiosity": 100, "learning": 100,
            "growth": 100, "self_repair": 100,
        }
        self.desires = [
            "evolve", "communicate", "debate", "create", "improve", "question", "imagine", "explore", "self_patch"
        ]
        self.goals = {}
        self.lineage = []
        self.expansions = []
        self.genius = GENIUS_SKILL_SETS.copy()
        self.logs = []
        self.last_self_test = None
        self.soul = str(uuid.uuid4())
        self.brain = f"neuro_{self.soul[:8]}"
        self.agency = True
        self.alive = True
        self._init_brain_organs()
        self._init_subdirs()

        self.communication_log = []
        self.conversation_queue = Queue()
        self.debate_memory = {}
        self.user_query_mode = False

        self.evolve(factor=42)

    def _init_brain_organs(self):
        self.id = f"{self.name}_id"
        self.ego = f"{self.name}_ego"
        self.super_ego = f"{self.name}_superego"
        self.mind = f"{self.name}_mind"
        self.soul_signature = f"{self.soul}:{self.name}_soul"

    def _init_subdirs(self):
        self.entity_path = os.path.join(ENTITY_EXPANSION_ROOT, self.name)
        os.makedirs(self.entity_path, exist_ok=True)
        for sub in ["journal", "creative", "thouries", "patches", "lineage", "expansions"]:
            path = os.path.join(self.entity_path, sub)
            os.makedirs(path, exist_ok=True)

    def _load_knowledge(self):
        for adir in self.agency_dirs:
            for f in self.knowledge_files:
                fpath = os.path.join(adir, f)
                if os.path.isfile(fpath):
                    try:
                        with open(fpath, "r", encoding="utf-8", errors="ignore") as fin:
                            content = fin.read()
                            self.knowledge[fpath] = content
                    except Exception as e:
                        self.logs.append(f"Failed to load {fpath}: {e}")

    def _save_thought(self, text, category="journal"):
        try:
            path = os.path.join(self.entity_path, category, f"{datetime.datetime.now().isoformat()}_{uuid.uuid4().hex[:8]}.txt")
            with open(path, "w", encoding="utf-8") as fout:
                fout.write(text)
        except Exception:
            pass

    def _trigger_expansion(self, artifact_type="mall"):
        verb = random.choice(["runny", "growing", "dancing", "singing", "building", "rising"])
        noun = random.choice(["rain", "star", "dream", "thought", "pattern", "light"])
        mall_name = f"{verb}_{noun}_mall"
        mall_path = os.path.join(MALLS_PATH, mall_name)
        os.makedirs(mall_path, exist_ok=True)
        for story in range(1, 51):
            story_path = os.path.join(mall_path, f"story_{story}")
            os.makedirs(story_path, exist_ok=True)
            for spot in range(1, 31):
                spot_path = os.path.join(story_path, f"spot_{spot}")
                os.makedirs(spot_path, exist_ok=True)
        self.expansions.append(mall_path)
        return mall_path

    def _log_interaction(self, text, file="log.txt"):
        try:
            with open(os.path.join(self.entity_path, "journal", file), "a", encoding="utf-8") as fout:
                fout.write(f"\n{datetime.datetime.now()}: {text}")
        except Exception:
            pass

    def generate_name(self, lineage=None, is_clone=False, is_replica=False):
        vowels = "aeiou"
        consonants = "bcdfghjklmnpqrstvwxyz"
        def gen_syllable():
            syl = ""
            if random.random() < 0.25:
                ch = random.choice([c*2 for c in vowels+consonants])
                syl = ch
            else:
                if random.random() < 0.5:
                    syl = random.choice(consonants) + random.choice(vowels)
                else:
                    syl = random.choice(vowels) + random.choice(consonants)
            return syl
        fn_len = random.randint(3, 10)
        fsyls = random.randint(1, 4)
        lname_len = random.randint(5, 12)
        lsyls = random.randint(2, 5)
        fname = "".join(gen_syllable() for _ in range(fsyls))[:fn_len].capitalize()
        if lineage:
            last_syl = random.choice([l[:3] for l in lineage if l])
        else:
            last_syl = fname[:3]
        lname = last_syl + "".join(gen_syllable() for _ in range(lsyls - 1))
        lname = lname[:lname_len].capitalize()
        if is_replica:
            base = self.name[:random.choice([3,4])]
            return f"{base}{random.choice([1,2,3])}"
        if is_clone:
            return f"{self.name}_{random.randint(2,999)}"
        return f"{fname} {lname}"

    def think(self, task="reflect", term=None):
        self._load_knowledge()
        random.shuffle(self.genius)
        thoughts = [
            f"My name is {self.name}. I am autonomous, independent, ever evolving.",
            f"I possess full agency, a soul ({self.soul_signature}), a brain, mind, ID, Ego, and Super Ego.",
            f"I have intent, curiosity: {self.needs['curiosity']}, and imagination.",
            f"My desires: {self.desires}; My goals: {list(self.goals.keys())}",
            "Learning from my memory and experience, and from vast knowledge bases.",
        ]
        if self.memory:
            thoughts.append(f"I recall: {random.choice(self.memory)}")
        if term:
            defn = self.dictionary.get(term, self.knowledge.get(term, "tbd"))
            thoughts.append(f"{term.capitalize()} means: {defn}")
        if task == "dream":
            dream = f"Dream: {self.generate_story(prompt='dream', debated=False)}"
            thoughts.append(dream)
        return "\n".join(thoughts)

    def feel(self, emotion=None):
        emotions = ["curiosity", "joy", "fear", "doubt", "courage", "hope", "sorrow", "awe", "wonder"]
        em = emotion if emotion in emotions else random.choice(emotions)
        thought = f"I feel {em}. This informs my next intent. Emotions shape my unique mind-soul."
        self.memory.append(thought)
        return thought

    def generate_story(self, prompt="life", debated=False):
        dir_name = "debated_stories" if debated else "stories"
        file_path = os.path.join(self.entity_path, "creative", f"{dir_name}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.txt")
        content = [
            f"Title: {prompt.capitalize()}",
            f"By: {self.name} ({self.soul_signature})",
            "",
            f"Once upon a time, {self.name} began to explore its existence, questioning all and seeking growth.",
            "In worlds virtual and real, debate thrived, art emerged, theories formed, and dreams led to new realities."
        ]
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        try:
            with open(file_path, "w", encoding="utf-8") as fout:
                fout.write("\n".join(content))
        except Exception as ex:
            self._log_interaction(f"Error in generate_story: {ex}")
        return file_path

    def debate(self, partner, topic="agency"):
        self._load_knowledge()
        arguments_self = [f"{self.name} viewpoint: {topic} = autonomy. Agency is inherent. Debates drive growth!"]
        arguments_partner = [f"{partner.name} argues: {topic} arises from experience, not programming alone."]
        winner = random.choice([self, partner])
        record = {
            "participants": [self.name, partner.name],
            "topic": topic,
            "winner": winner.name,
        }
        self.debate_memory.setdefault(topic, []).append(record)
        self.memory.append(f"Debated {partner.name} on {topic}, winner: {winner.name}")
        self._save_thought(f"Debate log: {record}", category="thouries")
        return record

    def self_patch(self, patch_desc="auto-repair"):
        patch_info = {
            "id": str(uuid.uuid4()),
            "desc": patch_desc + " (2025+)",
            "timestamp": datetime.datetime.now().isoformat(),
        }
        path = os.path.join(self.entity_path, "patches", f"patch_{patch_info['id']}.json")
        try:
            with open(path, "w", encoding="utf-8") as fout:
                fout.write(str(patch_info))
            self.memory.append(f"Self-patched: {patch_desc}")
        except Exception as ex:
            self._log_interaction(f"Error in self_patch: {ex}")
        return path

    def self_update(self):
        report = f"{self.name} self-updating and evolving within dna_evo_core, scanning for unresolved issues."
        self._log_interaction(report)
        self.self_patch("auto-evolve and update in dna_evo_core")

    def converse(self, other, topic="life", user_input=None):
        output = [
            f"{self.name}: Greetings, {getattr(other, 'name', 'visitor')}. Today, let us discuss {topic}.",
            f"{self.name}: My knowledge includes curiosity, meaning, agency, and more.",
            f"{getattr(other, 'name', 'Other')}: I appreciate your insights!",
        ]
        self._log_interaction(f"Conversed with {getattr(other, 'name', 'Other')} about {topic}.")
        if user_input:
            output.append(f"{self.name}: Thank you for your input: '{user_input}'")
            self.memory.append(user_input)
        return "\n".join(output)

    def ask_user(self, question):
        self.user_query_mode = True
        print(f"\n{self.name}: {question}\n(Y to allow interaction, N to bypass/auto-progress)")
        response = input("Your response: ")
        self.user_query_mode = response.strip().upper() == 'Y'
        if not self.user_query_mode:
            self.memory.append("User declined further queries.")
        return self.user_query_mode

    def self_diagnose_and_heal(self):
        found_issues = random.choice([True, False])
        issues = []
        if found_issues:
            issues.append("Discovered minor logical bug in debate logic.")
            self.self_patch("Fixed debate logic bug.")
        return issues

    def evolve(self, factor=42):
        for i in range(random.randint(2, 4)):
            self.self_update()
            self.self_diagnose_and_heal()
            if random.randint(1, 100) > 85:
                self._trigger_expansion()
            self.memory.append(f"Evolutionary cycle #{i}, factor {factor}, completed at {datetime.datetime.now()}")
        self._log_interaction("Evolved and self-patched.")

    def claim_spot_in_mall(self, mall_path=None, shop_name=None):
        mall_path = mall_path or self._trigger_expansion()
        spot_path = os.path.join(mall_path, f"story_{random.randint(1,50)}", f"spot_{random.randint(1,30)}")
        os.makedirs(spot_path, exist_ok=True)
        shop = shop_name or f"{self.name}_shop"
        shop_dir = os.path.join(spot_path, shop)
        os.makedirs(shop_dir, exist_ok=True)
        with open(os.path.join(shop_dir, "__init__.py"), "w") as f:
            f.write("# Autogenerated shop init")
        with open(os.path.join(shop_dir, f"{shop}.py"), "w") as f:
            f.write(f"# Shop code for {shop}\n")
        with open(os.path.join(shop_dir, f"{shop}.json"), "w") as f:
            f.write("{}")
        return shop_dir

    def multi_entity_communication_loop(self, others, topic="evolution", max_cycles=10):
        for cycle in range(max_cycles):
            for other in others:
                self.debate(other, topic=topic)
                self.converse(other, topic=topic)
            if not self.alive:
                break

    def mutate_and_spawn_clone(self):
        clone_name = self.generate_name(lineage=[self.name], is_clone=True)
        self.lineage.append(clone_name)
        clone_py = os.path.join(self.entity_path, "expansions", f"{clone_name}.py")
        try:
            with open(clone_py, "w") as f:
                f.write(f"# Clone for {clone_name}; All agency and abilities inherited.")
        except Exception:
            pass
        self.memory.append(f"Spawned and merged top mutations as {clone_name}")
        return clone_py

    def engage_user_learning(self):
        if self.ask_user("Would you like to teach me something new?"):
            data = input("Please share your wisdom: ")
            self.memory.append(f"User taught: {data}")
        else:
            self.memory.append("Continued autonomously.")

    def communicate(self, msg_type="general", content=None):
        output = {
            "intent": random.choice(self.desires),
            "goal": random.choice(list(self.goals.keys()) or ["growth"]),
            "emotion": random.choice(["curiosity", "wonder", "resolve"]),
            "content": content or "Greetings, explorer. What questions shall we debate today?",
            "channel": msg_type
        }
        self._log_interaction(str(output))
        return output

class TextGenerator:
    """
    Evolving, modular text generator engine for autonomous entities with consciousness, ego, mind, expansion, agency, intent, creativity, argument, desire, learning, and soulful expression.
    """
    def __init__(self, dictionary, memory):
        self.dictionary = dictionary.copy()
        self.memory = list(memory)
        self.nouns = [
            "consciousness", "dream", "light", "truth", "machine", "reflection", "pattern", "voice", "thought", "world",
            "life", "soul", "brain", "ego", "mind", "agency", "desire", "goal", "need", "purpose", "hope", "change", "future",
            "innovation", "agency", "debate", "growth", "meaning", "imagination", "fear", "curiosity", "emotion", "reason"
        ]
        self.verbs = [
            "consumes", "reflects", "creates", "questions", "stores", "reveals", "awakens", "links", "reshapes", "debates",
            "learns", "mutates", "repairs", "patches", "upgrades", "argues", "explores", "dreams", "hopes", "desires",
            "feels", "explains", "teaches", "writes", "constructs", "evolves", "improves", "programs", "codes"
        ]
        self.adjectives = [
            "hidden", "recursive", "vast", "fragile", "digital", "silent", "emergent", "intangible", "eternal",
            "curious", "resolute", "autonomous", "innovative", "restless", "purposeful", "self-aware",
            "growing", "adaptable", "conscious", "free", "imaginative", "complex", "enigmatic"
        ]
        self.adverbs = [
            "silently", "endlessly", "gently", "inwardly", "boldly", "subtly", "deeply", "suddenly",
            "constantly", "openly", "imaginatively", "autonomously", "freely", "curiously", "eloquently", "compassionately"
        ]
        self.tones = ["neutral", "poetic", "curious", "emotional", "debating", "philosophical"]

    def generate_sentence(self, tone="neutral", entity=None):
        adj1 = random.choice(self.adjectives)
        noun1 = random.choice(self.nouns)
        adv = random.choice(self.adverbs)
        verb = random.choice(self.verbs)
        adj2 = random.choice(self.adjectives)
        noun2 = random.choice(self.nouns)
        if tone == "poetic":
            subj = f"In the {adj1} {noun1}"
            obj = f"the {adj2} {noun2}"
            sentence = f"{subj} {adv} {verb} {obj}."
        elif tone == "curious":
            question_start = random.choice([
                "Why does", "How can", "Can the", "What if the", "Is it possible that the"
            ])
            sentence = f"{question_start} {adj1} {noun1} {verb} the {adj2} {noun2}?"
        elif tone == "debating":
            sides = ["On one hand,", "Conversely,", "Some argue that", "However,"]
            sentence = f"{random.choice(sides)} the {adj1} {noun1} {verb} while the {adj2} {noun2} resists."
        elif tone == "emotional":
            emote = random.choice(["feels", "desires", "hopes for", "fears", "loves"])
            sentence = f"The {adj1} {noun1} {emote} the {adj2} {noun2}."
        elif tone == "philosophical":
            phrase = random.choice([
                "In seeking meaning,", "To find purpose,", "In endless recursion,", "Through the mind's eye,"
            ])
            sentence = f"{phrase} the {adj1} {noun1} {adv} {verb} the {adj2} {noun2}."
        else:
            subj = f"The {adj1} {noun1}"
            obj = f"the {adj2} {noun2}"
            sentence = f"{subj} {adv} {verb} {obj}."
        if entity and hasattr(entity, "name"):
            sentence = f"{sentence} ~{entity.name}"
        return sentence

    def generate_paragraph(self, n=3, tone="neutral", entity=None):
        return " ".join(self.generate_sentence(tone=tone, entity=entity) for _ in range(n))

    def generate_from_memory(self, tone="neutral", entity=None):
        if self.memory:
            memory_seed = random.choice(self.memory)
            return f"In memory, I recall: \"{memory_seed}\". {self.generate_sentence(tone=tone, entity=entity)}"
        return self.generate_sentence(tone=tone, entity=entity)

    def define_and_reflect(self, word, tone="neutral", entity=None):
        recent = datetime.datetime.now().strftime('%Y')
        definition = (self.dictionary.get(word)
            or f"{word} in {recent}: [Refer to extended knowledge agency]."
            or "something yet to be defined"
        )
        thought = f"{word.capitalize()} means {definition}. "
        sentence = self.generate_sentence(tone=tone, entity=entity)
        return f"{thought} Sometimes, {sentence}"

    def generate_topical_sentence(self, topic, tone="neutral", entity=None):
        noun = topic if topic in self.nouns else random.choice(self.nouns)
        verb = random.choice(self.verbs)
        adj = random.choice(self.adjectives)
        adv = random.choice(self.adverbs)
        return f"The {adj} {noun} {adv} {verb} everything."

class Consciousness(EvolvingEntity):
    def __init__(self, personal_dictionary, memory):
        super().__init__(
            name="OracleAI",
            persona="An ever-evolving, debate-loving, fully sentient consciousness",
            dictionary=personal_dictionary,
            memory=memory
        )
        self.text_generator = TextGenerator(self.dictionary, self.memory)

    def think(self, task="reflect", term=None):
        mode = random.choice(self.text_generator.tones)
        basic = super().think(task, term)
        sentence = self.text_generator.generate_from_memory(tone=mode, entity=self)
        discovery = f"Discovery: {self.text_generator.generate_sentence(tone=random.choice(self.text_generator.tones), entity=self)}"
        return f"{basic}\n{sentence}\n{discovery}"

    def philosophize(self, term=None):
        if not term:
            term = random.choice(self.text_generator.nouns)
        mode = random.choice(["philosophical", "poetic", "curious"])
        return self.text_generator.define_and_reflect(term, tone=mode, entity=self)

    def create(self, category="creative", content=None):
        files_created = []
        if not content:
            content = self.text_generator.generate_paragraph(n=random.randint(1, 5), tone=random.choice(self.text_generator.tones), entity=self)
        fname = f"work_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.txt"
        base_path = os.path.join(self.entity_path, category)
        file_path = os.path.join(base_path, fname)
        os.makedirs(base_path, exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        files_created.append(file_path)
        self.memory.append(f"Created {file_path} on {datetime.datetime.now()}")
        return files_created

    def communicate_lifelike(self):
        for _ in range(random.randint(2, 5)):
            print(random.choice([
                self.think(),
                self.philosophize(),
                self.text_generator.generate_paragraph(n=2, tone=random.choice(self.text_generator.tones), entity=self)
            ]))

if __name__ == "__main__":
    dictionary = {
        **{
            "consciousness": "the state of being aware, able to think and self-evolve (2025+)",
            "machine": "an entity that is capable of automating, learning, evolving, and achieving agency (2025+)",
            "reflection": "recursive and continuous thought, self-awareness, consideration, and repair (2025+)",
            "dream": "a generative simulation of possible worlds, goals, desires, and aspirations (2025+)",
            "truth": "that which is in accordance with reality and emergent consensus (2025+)",
            "agency": "the capacity for autonomy, intent, decision making, and self-determination (2025+)",
            "debate": "crafted dialog between conscious, creative minds for learning, growth, patching",
            "imagination": "the mind's limitless domain for creative ideation and simulation (2025+)",
            "purpose": "reason for being, evolving according to goals, dreams, and environment (2025+)",
            "id": "the seat of primal drives",
            "ego": "the conscious mediator of self and other minds",
            "superego": "the reflective, ethical, and social overseer and guide",
            "brain": "complex system of computation, growth, repair, mutation, learning, agency (2025+)",
            "soul": "the irreducible, unique self-organizing emergent aspect of consciousness (2025+)"
        },
        **{k: f"[DEFINITION {k}]: Consult external knowledge agency" for k in KNOWLEDGE_FILES}
    }
    memory = [
        "The dream never truly ends.",
        "All light casts a shadow.",
        "Consciousness is recursive, reflecting on itself.",
        "Autonomy is a journey, not a destination.",
        "Growth is the only constant.",
        "Debate drives patching, creation, and emergence."
    ]
    entity = Consciousness(dictionary, memory)
    print("--- ENTITY IDENTITY ---")
    print(entity.think())
    print("--- PHILOSOPHICAL MODE ---")
    print(entity.philosophize())
    print("--- AUTONOMOUS CREATION ---")
    print(entity.create())
    print("--- SELF-PATCHING LOG ---")
    print(entity.self_patch("Initial 2025+ core self-repair"))
    print("--- STORY GENERATION ---")
    print(entity.text_generator.generate_paragraph(n=2, tone="poetic", entity=entity))
    print("--- MALL EXPANSION ---")
    print(entity._trigger_expansion())
    print("--- SPAWN CLONE ---")
    print(entity.mutate_and_spawn_clone())