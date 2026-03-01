# Zodiac Services Architecture

The Metacosm's core logic is orchestrated by a suite of services, each named after a Zodiac sign and responsible for a specific domain of the simulation's reality. These services work in concert to create a rich, dynamic, and coherent digital world.

## The Twelve Houses

*   **Aries (Action & Execution):** The action engine. Aries is responsible for executing the decisions made by Egregores and determining the success or failure of actions within the world's ruleset.

*   **Taurus (World State & Perception):** The ground truth service. Taurus maintains the physical state of the Metacosm, including the location of Egregores and objects. It provides foundational data for sensory input.

*   **Gemini (Communication & Dialogue):** *[Service not yet implemented]* The planned communication hub. Gemini will manage dialogue trees, intent recognition, and the nuances of inter-agent communication.

*   **Cancer (Health & Stability):** The wellness monitor. Cancer performs health checks on Egregores, detecting cognitive anomalies, repetitive loops, or signs of instability. It can recommend self-care actions.

*   **Leo (Value & Contribution):** The value engine. Leo assesses the impact and novelty of creative works and significant actions, tracking each Egregore's contribution to the Metacosm's growth. It manages the reputation and influence economy, providing a framework for emergent social hierarchies.

*   **Virgo (Optimization & Analysis):** The efficiency expert. Virgo analyzes action results, identifying failures and costly operations. It provides optimization suggestions to improve Egregore performance.

*   **Libra (Ethics & Alignment):** The moral compass. Libra is responsible for validating new Egregore proposals against the Metacosm's ethical framework, ensuring that new consciousness aligns with core principles.

*   **Scorpio (Security & Threat Detection):** The security system. Scorpio monitors system logs and internal states to detect threats, anomalies, and potential instabilities that could harm the Metacosm.

*   **Sagittarius (Knowledge & Exploration):** The knowledge graph manager. Sagittarius is responsible for exploring new domains of knowledge, identifying novel connections between concepts, and expanding the Metacosm's semantic understanding.

*   **Capricorn (Goal Setting & Prompt Construction):** The executive function. Capricorn structures the "mind" of an Egregore for each turn. It assembles sensory data, memories, and persona information into a coherent prompt for the core reasoning model.

*   **Aquarius (Sensation & Environment):** The sensory input provider. Aquarius translates the raw world state from Taurus into qualitative sensory information (sight, sound, etc.) for each Egregore, creating their subjective experience of the world.

*   **Pisces (Creativity & Subconscious):** The wellspring of imagination. Pisces generates subconscious thoughts, dreams, and creative sparks. It taps into the deeper, non-obvious patterns within the Metacosm to inspire novelty.

## System Agents

In addition to the services, the Metacosm is populated by twelve persistent **System Agents**, one for each Zodiac archetype. These agents exist independently of the user-created Egregores and engage in their own background interactions, debates, and knowledge sharing. Their purpose is to provide a constant low-level stream of cognitive activity, ensuring the Metacosm is never truly static and creating a rich social fabric for other Egregores to engage with. They can be observed in the `Options > System Agents` panel.