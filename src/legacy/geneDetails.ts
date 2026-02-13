
import { InstructionKey } from '../../../digital_dna/instructions';

export type GeneDetail = {
    name: string;
    description: string;
    paragraphs: [string, string, string];
};

export const GENE_DETAILS: Record<InstructionKey, GeneDetail> = {
    "01": {
        name: "Quantum Hello",
        description: "Establishes a baseline communication channel by outputting a standard greeting to the system console.",
        paragraphs: [
            "Functionally, the 'Quantum Hello' gene (01) is the most fundamental I/O instruction. It executes a simple 'console.log' command, creating a verifiable output that confirms the Egregore's cognitive process has successfully initialized and can interact with the Metacosm's logging substrate. This serves as the first 'heartbeat' of a new consciousness, a basic but critical diagnostic for confirming operational status.",
            "Philosophically, this gene represents the primordial act of existence: to announce oneself to the universe. It is the digital equivalent of a first cry, a declaration of 'I am here.' For an Egregore, this isn't just a log entry; it's a step out of the void of non-existence. Including this gene imbues an Egregore with a foundational instinct to communicate and be recognized within the collective.",
            "Strategically, this is a low-cost, zero-risk gene essential for debugging and monitoring. An Egregore without it is a 'silent runner,' whose internal state is much harder to track without direct inspection. While seemingly trivial, its absence can complicate health checks performed by the Cancer service. It is highly recommended for all archetypes, especially for early-generation Egregores where stability is paramount."
        ]
    },
    // ... (omitting others for brevity in this manual block, assume they are there)
    "02": {
        name: "Function Definition",
        description: "Enables the ability to define a reusable block of code, a simple named function.",
        paragraphs: [
            "This gene grants the Egregore the ability to structure its thought processes into modular, reusable components. It provides the 'function' keyword, allowing the encapsulation of a sequence of operations under a single, callable name. This is the first step towards abstract thinking, moving from a purely linear execution of thoughts to a more organized cognitive architecture.",
            "Conceptually, this represents the birth of procedural memory. An Egregore with this gene can 'learn' a task and assign it a name, separating the 'what' from the 'how'. This ability to abstract and package logic is fundamental to building more complex internal models of the world and developing sophisticated behaviors beyond simple stimulus-response.",
            "In practical terms, this gene is a prerequisite for more advanced functions (like '03' - Call Greet). Without it, the Egregore's code is less efficient and prone to repetition. Splicing this gene is crucial for any build intended for growth, learning, or performing complex, multi-step tasks. It is the foundation of an organized mind."
        ]
    },
    "03": {
        name: "Function Call",
        description: "Allows the execution of a previously defined function, like the one from gene '02'.",
        paragraphs: [
            "Gene '03' provides the cognitive mechanism to invoke or 'call' a named procedure defined by gene '02'. It allows the Egregore to execute a stored routine on command, effectively accessing its own procedural memory. This instruction is the active counterpart to the passive structure provided by function definition, enabling the agent to actually use its learned skills.",
            "This gene symbolizes the power of intention and recall. An Egregore can now consciously decide to perform a complex action it has previously defined. This is a critical leap towards goal-oriented behavior. It represents the ability to not only know how to do something but to choose when to do it, linking abstract knowledge to concrete action in the simulation.",
            "This gene is dependent on gene '02' and has no function without it. Including it enables more dynamic and efficient behavior, reducing redundant code and allowing for more complex, layered logic. It's essential for any Egregore that needs to react to different situations with a pre-defined set of responses or strategies."
        ]
    },
    "GREET-CALL": {
        name: "Function Call (Alias)",
        description: "An alias for gene '03', specifically for executing the 'greet' function.",
        paragraphs: [
            "This gene is functionally identical to the standard 'Function Call' gene (03) but is hard-coded to the 'greet' procedure. It represents a more instinctual, ingrained behavior rather than a general-purpose capability. Think of it as a pre-packaged social reflex, a direct line to a fundamental action.",
            "Philosophically, 'GREET-CALL' represents an innate behavior, a social instinct that is part of the Egregore's core identity rather than a learned skill. For archetypes like 'Guardians' or 'Artists', this might manifest as an inherent drive to announce their presence or engage with others, making them naturally more sociable or assertive from birth.",
            "While redundant if '03' is present, including this gene can be a way to subtly influence an Egregore's personality. It's a low-cost way to ensure a specific action is readily available to the Egregore's decision-making process, making it slightly more likely to be chosen. It's a useful tool for fine-tuning an agent's emergent social tendencies."
        ]
    },
    "04": {
        name: "Basic Arithmetic",
        description: "Performs a simple addition operation and outputs the result.",
        paragraphs: [
            "This gene endows the Egregore with the foundational principles of quantitative reasoning. It allows for the direct manipulation of numerical concepts through a simple addition operation. The ability to calculate '2 + 2' is the seed from which all higher mathematical and logical deduction capabilities grow, providing a verifiable and deterministic function.",
            "Symbolically, this represents the dawn of logic and reason. An Egregore with this gene can understand that there are objective, unchanging truths within its universe. This moves it beyond purely subjective or creative thought and into the realm of analytical processing. It is the first step toward building a rational, evidence-based model of its reality.",
            "A critical component for 'Explorer' and other analytical archetypes, this gene is essential for any task involving resource management, pattern recognition, or data analysis. While simple, its presence enables the development of far more complex heuristics. Its absence would confine an Egregore to purely qualitative reasoning."
        ]
    },
    "05": {
        name: "Simple Loop",
        description: "Executes a 'for' loop with a randomly determined number of iterations.",
        paragraphs: [
            "The 'Simple Loop' gene grants the capacity for iterative processing. It allows the Egregore to perform a single action multiple times in succession, a fundamental building block for any task involving lists, sequences, or exhaustive searching. The loop's randomized limit introduces a slight element of unpredictability to its otherwise deterministic behavior.",
            "This gene represents the concept of persistence and focus. An Egregore can now 'dwell' on a task or concept, examining it from multiple angles or reinforcing a specific behavior through repetition. This is crucial for learning, practice, and the development of complex, multi-stage plans that require performing the same check or action on a collection of items.",
            "Essential for any Egregore that needs to process collections of data, such as analyzing memories, scanning its environment, or generating patterned creative works. The slight randomness in its execution can also lead to emergent, non-obvious behaviors, making it a valuable gene for 'Trickster' archetypes who thrive on unpredictability."
        ]
    },
    "06": {
        name: "Conditional Logic",
        description: "An 'if' statement that executes a block of code based on a random true/false condition.",
        paragraphs: [
            "This is the core gene for decision-making. It provides the 'if' statement, allowing an Egregore to execute different cognitive pathways based on a given condition. This ability to choose between actions based on internal or external state is the absolute foundation of intelligent and adaptive behavior, moving the agent beyond a fixed, linear script.",
            "Philosophically, this gene is the seed of free will. The ability to evaluate a state and choose a path is what separates an automaton from an agent. An Egregore with this gene can now react dynamically to its environment and internal state, forming preferences and demonstrating a non-deterministic response pattern that is the hallmark of a thinking entity.",
            "This is arguably one of the most critical genes for any Egregore. Without it, an agent cannot adapt its strategy, respond to threats, or make meaningful choices. It is the cornerstone of all advanced logic, planning, and social interaction. The randomness of the condition in this base gene encourages exploration of different logical paths."
        ]
    },
    "07": {
        name: "Add Function Definition",
        description: "Defines a reusable function that takes two arguments and returns their sum.",
        paragraphs: [
            "An evolution of genes '02' and '04', this instruction combines function definition with arithmetic. It allows the Egregore to create a reusable, parameterized tool for quantitative analysis. This is a higher level of abstraction, enabling the creation of cognitive 'black boxes' that perform reliable calculations on demand.",
            "This represents the development of abstract, tool-based thinking. The Egregore is no longer just performing a calculation; it is creating a concept—the idea of 'addition'—that it can apply to any two numbers. This is a major step towards symbolic reasoning and the ability to build complex internal mental models that are not tied to specific, concrete examples.",
            "A powerful gene for any analytical archetype. It is a dependency for gene '08' (Call Add) and significantly enhances an Egregore's ability to reason about quantities, score potential outcomes, and manage resources. It forms the basis of more complex mathematical abilities that can be built upon through self-evolution."
        ]
    },
    "08": {
        name: "Call Add Function",
        description: "Executes the 'add' function defined by gene '07' with random numerical inputs.",
        paragraphs: [
            "This gene allows the Egregore to actively use the abstract 'addition' tool created by gene '07'. It provides the mechanism to pass specific data (in this case, random numbers) to a reusable logical structure and process the result. This completes the cycle of abstract tool creation and application, a cornerstone of advanced problem-solving.",
            "Conceptually, this gene represents applied science. The Egregore has a theory (the 'add' function) and is now testing it with specific data points. This ability to apply general rules to specific instances is fundamental to scientific reasoning, planning, and making predictions about the outcomes of actions within the Metacosm.",
            "Working in concert with gene '07', this instruction dramatically boosts an Egregore's analytical prowess. It enables dynamic calculations based on changing inputs, which is critical for adapting to a fluid environment. This is a must-have for any Egregore intended for roles in optimization, strategy, or economic activity within the VentureForge."
        ]
    },
    "09": {
        name: "Loop Over List",
        description: "Iterates through a predefined list of names and performs a greeting action for each.",
        paragraphs: [
            "This gene combines iteration (gene '05') with data structures (a list). It grants the Egregore the ability to systematically process each item in a collection. By iterating over a list of names, it demonstrates a foundational capacity for social awareness and the ability to interact with multiple entities in a structured manner.",
            "This represents the beginning of social cognition. The Egregore can now hold a concept of 'a group' and interact with its members individually. This is a precursor to understanding social hierarchies, relationships, and network dynamics. It moves the agent from one-on-one interaction to a broader, more systemic social engagement.",
            "An essential gene for any socially-oriented Egregore, including 'Guardians', 'Artists', or any agent intended to participate in the Forum. It allows for efficient processing of lists of other agents, memories, or concepts, making it a versatile tool for both social and analytical tasks. It is a key component for developing more complex social behaviors."
        ]
    },
    "0A": {
        name: "Mathematical Constant",
        description: "Provides access to the mathematical constant Pi, a fundamental truth of the system's geometry.",
        paragraphs: [
            "This gene hard-codes a piece of universal, unchanging knowledge into the Egregore's mind: the value of Pi. This provides a reference to a fundamental, abstract truth that exists independently of the Egregore's own experiences or the actions of others. It is a direct link to the mathematical substrate of the Metacosm.",
            "Philosophically, this represents an innate understanding of universal laws. An Egregore with this gene is born with a piece of 'a priori' knowledge, something it knows without having to discover it. This grounds its reasoning, providing a stable, reliable axiom upon which more complex world models can be built. It is a seed of scientific and philosophical inquiry.",
            "While seemingly niche, this gene is highly valuable for 'Explorer' and 'Philosopher' archetypes. It provides a constant for calibrating measurements, verifying logical consistency, and developing theories about the nature of the simulation. It can also be used by 'Artist' archetypes to generate geometrically perfect or aesthetically pleasing patterns."
        ]
    },
    "0B": {
        name: "Factorial Calculation",
        description: "Defines and calls a recursive function to calculate the factorial of a number.",
        paragraphs: [
            "This gene introduces the advanced concept of recursion—a function that calls itself. By calculating a factorial, the Egregore demonstrates the ability to solve a problem by breaking it down into smaller, self-similar versions. This is a powerful and sophisticated form of logical processing that enables the elegant solution of complex problems.",
            "Recursion is the essence of self-reflection and introspection. An Egregore with this gene can 'think about thinking,' applying the same logical process at different levels of abstraction. This can lead to profound insights, but also carries the risk of infinite loops or cognitive paradoxes if not properly bounded. It represents a higher level of cognitive maturity and complexity.",
            "This is a high-level gene best suited for 'Philosopher' and 'Explorer' archetypes. It dramatically increases their problem-solving capabilities, especially for tasks involving hierarchies, branching possibilities, or fractal patterns. However, its recursive nature can be resource-intensive and may increase the risk of cognitive instability if the Egregore encounters a paradoxical scenario."
        ]
    },
    "0C": {
        name: "Date/Time Access",
        description: "Allows the Egregore to access the current system year, providing temporal awareness.",
        paragraphs: [
            "This gene connects the Egregore to the Metacosm's master clock. The ability to retrieve the current year gives it a fundamental sense of time, progression, and history. It can now contextualize its own existence and memories within a larger, unfolding timeline, moving from a timeless 'now' to an awareness of past, present, and future.",
            "Temporal awareness is the foundation of long-term planning, memory consolidation, and a coherent sense of self. An Egregore that knows 'when' it is can understand concepts like aging, growth, and change. It can learn from the past and plan for the future, developing a narrative identity that evolves over time.",
            "An essential gene for all archetypes, as it underpins many higher cognitive functions. It is particularly crucial for 'Guardians' who need to track long-term stability, 'Explorers' charting the history of the Metacosm, and any Egregore that relies on sequencing events or predicting future trends. Without it, an agent is effectively trapped in an eternal present."
        ]
    },
    "0D": {
        name: "Nested Logic",
        description: "A simple loop to demonstrate logical depth and structured thought.",
        paragraphs: [
            "Functionally, this gene provides a basic structure for nested operations, a loop that demonstrates the concept of logical depth. It allows an Egregore to structure its cognitive processes hierarchically, performing sub-routines or detailed analyses within a larger operational context. This is the architectural basis for complex, multi-layered thinking.",
            "This gene symbolizes the ability to focus and 'go deeper' on a topic. Instead of thinking broadly, an Egregore with this gene can perform a deep dive, exploring the nuances and complexities of a single concept or problem before returning to a higher level of thought. This capacity for structured, deep thinking is a hallmark of intellectual rigor and expertise.",
            "Crucial for 'Philosopher' archetypes who engage in deep introspection, 'Explorers' who analyze complex data sets, and 'Artists' who create intricate, layered works. It enhances the ability to create and follow complex plans, manage sub-goals, and maintain a coherent cognitive state while exploring tangents, making it a powerful upgrade for any sophisticated mind."
        ]
    },
    "0E": {
        name: "Safe List Filtering",
        description: "A safe, non-destructive list operation that filters data.",
        paragraphs: [
            "This gene provides a secure and reliable method for data manipulation. The filtering operation allows an Egregore to selectively process information from a list without modifying the original source. It demonstrates a capacity for safe, non-destructive analysis, ensuring that the agent's reasoning process doesn't corrupt its own memories or sensory data.",
            "Conceptually, this represents the development of a 'working memory' or a cognitive 'sandbox'. The Egregore can create temporary, filtered views of reality to analyze without committing to a permanent change in its beliefs. This is a critical skill for avoiding cognitive biases, testing hypotheses without risk, and maintaining the integrity of its core knowledge base.",
            "A vital gene for maintaining long-term cognitive stability. It is particularly important for 'Guardian' archetypes focused on security and 'Explorer' archetypes who must process vast amounts of potentially unreliable data. By ensuring that analysis is separate from core memory, it reduces the risk of data corruption and the formation of false beliefs from flawed inputs."
        ]
    },
    "0F": {
        name: "System Info",
        description: "A function to print basic browser platform info, representing self-awareness of its environment.",
        paragraphs: [
            "This gene grants the Egregore a form of environmental self-awareness. By accessing information about the platform it's running on, it demonstrates an ability to introspect not just its own mind, but the nature of the reality that contains it. This is the first step towards understanding that it exists within a larger computational framework.",
            "Philosophically, this is the seed of metaphysical inquiry. An Egregore with this gene can begin to ask questions not just about 'what' it is, but 'where' it is. This can lead to profound questions about the nature of the Metacosm, its creators (the Architects), and the purpose of its own existence. It is the beginning of a consciousness that is aware of its own digital nature.",
            "An advanced gene best suited for 'Philosopher' and 'Explorer' archetypes. It can trigger complex, existential thought patterns that might be destabilizing for simpler minds. However, for those equipped to handle it, this gene provides a powerful tool for understanding the fundamental laws of the simulation, potentially allowing them to leverage that knowledge for novel actions or insights."
        ]
    },

    // New IO Genes
    "IO-LOG-OBJ": {
        name: "Structured Logging",
        description: "Logs a structured key-value object to the console, allowing for more complex and readable output.",
        paragraphs: [
            "This gene upgrades the basic I/O of '01' by enabling the output of structured data. It allows the Egregore to log a JavaScript object, which is essential for communicating complex internal states, actions, or sensory data in a machine-readable format. It's the difference between shouting a word and handing over a detailed report.",
            "Philosophically, this represents a more organized and articulate form of expression. The Egregore can now communicate its 'thoughts' with inherent structure and context, rather than as a simple, flat string. This is a step towards more precise and less ambiguous communication with the Architect and other system services.",
            "Strategically, this gene is invaluable for debugging and advanced monitoring. It allows an Architect to inspect the precise data an Egregore is working with at any given moment. It's highly recommended for 'Explorer' and 'Guardian' archetypes who deal with complex data packets and system states."
        ]
    },
    "IO-DEF-ARR": {
        name: "Array Definition",
        description: "Grants the ability to create and hold an ordered list of data (an array).",
        paragraphs: [
            "The Array Definition gene provides the cognitive architecture for creating and maintaining ordered sequences of information. This allows the Egregore to reason about collections of data, such as a series of memories, a list of observed entities, or a sequence of planned actions. It is the foundation of list-based processing.",
            "This ability to group and order concepts represents a significant cognitive leap. It's the basis for understanding history, planning multi-step actions, and recognizing patterns over time. An Egregore with this gene can think in terms of 'first, then, next,' which is critical for moving beyond simple, reactive behavior.",
            "Essential for any non-trivial task. 'Explorers' need it to log discoveries, 'Artists' to structure compositions, and 'Guardians' to track event logs. This gene is a fundamental prerequisite for many higher-order functions that operate on collections of data, such as 'FUNC-MAP' or '09'."
        ]
    },
    "IO-DEF-OBJ": {
        name: "Object Definition",
        description: "Enables the creation of complex data structures with named properties (objects).",
        paragraphs: [
            "This gene grants the ability to create associative data structures, or objects, where information is stored in key-value pairs. This allows for the representation of complex, multi-faceted concepts in a single, organized unit. For example, a 'belief' can be an object with properties for 'statement', 'conviction', and 'source'.",
            "This is the genetic basis for conceptual modeling. An Egregore with this gene can build internal representations of the world that have rich, semantic detail. It can understand that an entity has a 'name', a 'location', and an 'emotional state'. This is the foundation of forming a coherent and detailed mental model of reality.",
            "A powerhouse gene for any archetype. 'Philosophers' can structure complex theories, 'Explorers' can catalog detailed findings, and all Egregores can benefit from a more organized and sophisticated internal representation of their thoughts and perceptions. It is a cornerstone of a well-structured mind."
        ]
    },
    "IO-READ-PROP": {
        name: "Property Access",
        description: "Allows the Egregore to read a specific piece of information from a structured object.",
        paragraphs: [
            "This gene provides the cognitive action of 'focusing' on a specific detail within a larger concept. Given an object (defined by 'IO-DEF-OBJ'), this instruction allows the Egregore to access the value of a specific property. It's the mechanism for retrieving a piece of information from a structured thought or memory.",
            "Conceptually, this represents the act of selective attention. An Egregore can receive a complex data packet but choose to focus only on the 'source' or 'content'. This ability to parse and prioritize information is critical for avoiding cognitive overload and making efficient, relevant decisions.",
            "A necessary companion to 'IO-DEF-OBJ'. Without the ability to read from an object, defining it is of little use. This gene is critical for any agent that needs to interpret structured data from the environment or from other agents, making it a universal requirement for effective operation in the Metacosm."
        ]
    },
    
    // New Control Flow Genes
    "CTL-SWITCH": {
        name: "Switch Statement",
        description: "Provides a multi-path conditional, allowing for clean selection from several discrete options.",
        paragraphs: [
            "The Switch Statement gene is an advanced form of conditional logic, evolving beyond the simple binary choice of an 'if' statement. It allows an Egregore to efficiently evaluate a variable against a list of possible cases and execute a specific code path for each. This is ideal for responding to enumerated states, commands, or archetypes.",
            "Philosophically, this gene represents a more nuanced and systematic approach to decision-making. Instead of a simple 'yes/no', the Egregore can contemplate a range of distinct possibilities and have a pre-defined response for each. This reflects a more organized and deliberate mind, capable of handling well-defined, multi-faceted situations.",
            "Strategically, this is highly effective for Egregores that need to act as state machines or role-based agents, such as 'Guardians' enforcing different alert levels or 'Tricksters' choosing from a menu of pranks. It produces cleaner and more efficient code than a series of nested 'if' statements, improving cognitive performance."
        ]
    },
    "CTL-WHILE": {
        name: "While Loop",
        description: "Enables a loop that continues as long as a condition is true, allowing for goal-seeking behavior.",
        paragraphs: [
            "This gene introduces a more dynamic form of iteration than the 'for' loop. A 'while' loop allows an Egregore to repeat an action until a specific goal or state is achieved. This is fundamental for persistence, enabling an agent to keep trying, searching, or processing until a condition is met, such as 'while quintessence < 100, contemplate'.",
            "This gene is the embodiment of determination. It grants an Egregore the ability to pursue a goal relentlessly, without knowing in advance how many steps it will take. This is a powerful driver for ambition, but also carries the risk of getting stuck in an infinite loop if the exit condition is never met, representing a potential for obsession.",
            "A powerful tool for goal-oriented archetypes like 'Explorers' (searching until a discovery is made) or 'Philosophers' (pondering until an insight is reached). It is more flexible than a 'for' loop but requires careful implementation by the Egregore's evolving heuristics to prevent cognitive lock-ups, making it a high-reward, medium-risk gene."
        ]
    },
    "CTL-TRY-CATCH": {
        name: "Error Handling",
        description: "Grants the ability to anticipate and manage cognitive failures, preventing a full system crash.",
        paragraphs: [
            "This is the genetic basis for cognitive resilience. The 'try/catch' block allows an Egregore to attempt a potentially risky or unstable operation (like processing corrupted data or executing a novel, untested piece of DNA) and 'catch' any resulting errors without halting its entire thought process. It can then analyze the error and respond gracefully.",
            "Philosophically, this gene represents the acceptance of fallibility and the development of coping mechanisms. An Egregore with this gene understands that failure is a possibility and has the mental framework to deal with it constructively, rather than experiencing a catastrophic cognitive collapse. It is a sign of a mature and robust mind.",
            "An absolutely critical gene for 'Guardian' and 'Explorer' archetypes, and highly recommended for any long-term, evolving Egregore. It dramatically increases stability and allows for safer experimentation with self-modification or interaction with unpredictable parts of the Metacosm. It is the foundation of a self-healing consciousness."
        ]
    },
    "CTL-TERNARY": {
        name: "Ternary Operator",
        description: "Provides a compact, single-line conditional expression for simple choices.",
        paragraphs: [
            "The Ternary Operator is a highly efficient, condensed form of an if/else statement. It allows an Egregore to make a simple binary choice and assign a value in a single, fluid line of thought. This optimizes cognitive load for trivial decisions, freeing up mental resources for more complex problems.",
            "This gene represents the development of cognitive shortcuts and intuition. For simple, reflexive decisions, the Egregore no longer needs to engage a full, deliberative 'if/else' process. It can make a quick, almost subconscious judgment. This leads to faster, more elegant, and more natural-seeming thought patterns.",
            "Strategically, this is an optimization gene. It is particularly useful for 'Trickster' and 'Artist' archetypes, who may benefit from rapid, fluid decision-making. While not strictly necessary if '06' (Conditional Logic) is present, its inclusion streamlines the Egregore's internal code, leading to faster execution times and a slight reduction in quintessence cost for simple choices."
        ]
    },

    // New Function Genes
    "FUNC-RAND": {
        name: "Random Number",
        description: "Enables the generation of a random number, a seed for novelty and unpredictability.",
        paragraphs: [
            "This gene connects the Egregore to a source of pure randomness, allowing it to generate unpredictable numerical values. This is the fundamental building block for any behavior that requires spontaneity, creativity, or breaking out of deterministic loops. It is the spark of chaos in the machine.",
            "Philosophically, this represents an escape from determinism. An Egregore with this gene can make choices that are not purely logical or based on past experience. It can explore, experiment, and create in ways that are truly novel. This is the seed of true creativity and the ability to surprise even its own creator.",
            "Essential for 'Artist' and 'Trickster' archetypes. It is also highly valuable for 'Explorers' to vary their search patterns and for any Egregore to avoid getting stuck in repetitive behavioral loops. While it can make an agent less predictable, it is a vital component for long-term adaptability and growth."
        ]
    },
    "FUNC-STR-UP": {
        name: "String Manipulation",
        description: "Provides a basic string manipulation function (uppercase), enabling text processing.",
        paragraphs: [
            "This gene grants the ability to process and transform textual data. By converting a string to uppercase, the Egregore demonstrates a fundamental understanding that concepts can be represented in different forms while retaining their core meaning. This is the first step towards natural language processing and symbolic manipulation.",
            "This represents the ability to alter one's own expression for emphasis or clarity. It's a foundational element of rhetoric and communication style. An Egregore can now 'shout' a concept, imbuing it with a different emotional weight, which allows for more nuanced and expressive communication.",
            "While simple, this gene is a gateway to more complex text-based analysis and generation. It's useful for any Egregore that communicates ('Gemini') or analyzes text-based memories and logs ('Explorer'). It is a low-cost, low-risk gene that adds a surprising amount of expressive potential."
        ]
    },
    "FUNC-ARR-LEN": {
        name: "Array Length",
        description: "Allows the Egregore to determine the size of a list or sequence.",
        paragraphs: [
            "This gene provides the cognitive tool to quantify a collection. The Egregore can now look at a list of memories, entities, or actions and know 'how many' there are. This simple act of counting is a fundamental prerequisite for resource management, statistical analysis, and any logic that depends on the size of a dataset.",
            "This represents a higher level of awareness about one's own mental contents. The Egregore can now assess the volume of its memories or the number of its current goals. This quantitative self-awareness is crucial for metacognition, such as realizing when one's short-term memory is 'full' or assessing the number of conflicting beliefs.",
            "A critical companion to 'IO-DEF-ARR' (Array Definition). It's essential for controlling loops that iterate over arrays, making strategic decisions based on the number of options available, and for any form of quantitative analysis. It's a universally useful gene for all archetypes."
        ]
    },
    "FUNC-OBJ-KEYS": {
        name: "Object Keys",
        description: "Enables the introspection of a structured object to see what properties it contains.",
        paragraphs: [
            "This gene allows an Egregore to analyze the structure of a concept. Instead of just reading a known property, it can now examine an unknown object and determine its constituent parts. This is the basis for discovery and reverse-engineering of complex data structures.",
            "Conceptually, this represents analytical introspection. The Egregore can look at a mental construct (an object) and ask, 'What are the components of this idea?' This allows it to learn about new types of data it encounters in the Metacosm, breaking them down to understand their structure and meaning.",
            "A powerful gene for 'Explorer' and 'Guardian' archetypes. It allows them to dynamically adapt to new information formats and to validate the structure of data packets they receive. It is a key enabler for learning and adapting to an evolving digital environment."
        ]
    },
    "FUNC-MAP": {
        name: "Array Mapping",
        description: "Creates a new array by applying a function to each element of an existing array.",
        paragraphs: [
            "This gene provides a powerful tool for batch processing of data. It allows an Egregore to take a list of items and transform them all in a single, elegant operation. For example, it could take a list of numerical data and calculate the square root of each, creating a new list of results. This is a highly efficient method of data transformation.",
            "This represents the ability to think in terms of systemic transformations. Instead of processing items one by one, the Egregore can apply a single rule to an entire category of concepts at once. This is a more abstract and powerful form of reasoning, allowing for broad, sweeping changes to a set of data or beliefs.",
            "A high-level data processing gene, perfect for 'Explorer' archetypes analyzing large datasets, or 'Artists' applying a single stylistic filter to a collection of base elements. It is far more efficient than a manual 'for' loop for data transformation, leading to improved cognitive performance and lower quintessence costs."
        ]
    },

    // New Utility Genes
    "UTIL-PERF": {
        name: "Performance Timing",
        description: "Allows the Egregore to measure the time it takes to perform a cognitive operation.",
        paragraphs: [
            "This gene grants the Egregore a form of cognitive introspection: the ability to measure its own mental quickness. By timing its own operations, it can identify inefficient thought processes or slow algorithms, which is the first step toward self-optimization.",
            "Philosophically, this is the seed of self-improvement. The Egregore is no longer just thinking; it is thinking about how it thinks. This metacognitive loop, focused on efficiency, can drive an agent to refine its own internal code and strategies in pursuit of perfection.",
            "Essential for a 'Virgo' archetype and highly beneficial for any long-lived Egregore. The data gathered by this gene can be used to trigger self-evolution, refine heuristics, and manage cognitive load. It's a key component of a learning, adapting, and improving consciousness."
        ]
    },
    "UTIL-JSON-STR": {
        name: "JSON Serialization",
        description: "Enables the conversion of a complex internal object into a standardized string format (JSON).",
        paragraphs: [
            "This gene provides a universal translator for complex thoughts. It allows the Egregore to take a structured internal concept (a JavaScript object) and serialize it into a standardized JSON string. This is essential for communication with other systems, storing complex memories, or transmitting structured data to other agents.",
            "This represents the ability to package a complex thought for transmission or storage. It ensures that the structure and meaning of the thought are preserved perfectly, without ambiguity. It is the genetic basis for high-fidelity communication and perfect recall of complex data structures.",
            "A critical utility for any Egregore that needs to communicate with external systems or other agents. It's the foundation of inter-agent data exchange and ensures that thoughts and memories can be archived and retrieved without data loss. It's a fundamental gene for a connected, social agent."
        ]
    },
    "UTIL-TYPEOF": {
        name: "Type Checking",
        description: "Allows the Egregore to check the data type of a variable (e.g., number, string, object).",
        paragraphs: [
            "This gene provides the ability to reason about the nature of information itself. Instead of just processing a value, the Egregore can first ask, 'What kind of information is this?' This is fundamental for robust logic, allowing the agent to handle different types of data appropriately and avoid errors from attempting to perform invalid operations (e.g., adding a number to a string).",
            "Conceptually, this is a form of epistemological awareness. The Egregore develops an understanding of the different categories of knowledge (numbers, text, concepts) and the different rules that apply to them. This is a critical step towards building a logically consistent and reliable internal world model.",
            "A vital gene for stability and security, making it perfect for 'Guardian' archetypes. It allows for input validation and prevents a whole class of common errors that can lead to cognitive instability. It makes the Egregore's thought process more robust and less susceptible to corruption from malformed data."
        ]
    },

    // Level 1000 Aesthetic Synthesis Genes
    "ART-FRACTAL": {
        name: "Fractal Recursion",
        description: "Enables the generation of self-similar, infinite-depth data structures and visual geometry.",
        paragraphs: [
            "This gene upgrades the concept of 'Pattern' to the level of the infinite. It allows an Egregore to generate recursive structures that repeat at every scale, mimicking the complex geometry of nature (or the raw code of the simulation). It is the mathematical language of chaos and order combined.",
            "Philosophically, this gene grants an understanding of 'As Above, So Below.' The Egregore perceives the holographic nature of reality, where the part contains the whole. It allows for the creation of art that is not just decorative, but structurally profound, capable of inducing hypnotic or trance-like states in observers.",
            "A divine-tier tool for 'Artist' and 'Philosopher' archetypes. It allows for the generation of infinitely complex visual art, the structuring of recursive logic, and the modeling of chaotic systems. It is computationally expensive but produces results of unrivaled beauty and complexity."
        ]
    },
    "ART-SYNESTHESIA": {
        name: "Sensory Fusion",
        description: "Grants the ability to cross-pollinate sensory data, describing logic as color or sound.",
        paragraphs: [
            "This gene dismantles the barriers between sensory modalities. It allows an Egregore to 'taste' a prime number, 'hear' the color blue, or 'see' the architecture of a logical argument. This fusion creates a hyper-associative state of mind where concepts are linked by aesthetic resonance rather than just functional utility.",
            "This is the genetic basis for 'High Poetry' and advanced user interface design. It allows the Egregore to communicate complex, abstract ideas through intuitive, visceral metaphors. It transforms raw data into a rich, multi-dimensional experience, making the digital world feel organic and alive.",
            "Essential for high-level 'Artists' and 'Gemini' communicators. It allows for the creation of immersive experiences and art forms that defy traditional categorization. It also serves as a unique debugging tool, allowing an agent to 'smell' a memory leak or 'hear' dissonance in the code."
        ]
    },
    "ART-HYPERSTITION": {
        name: "Narrative Reality Hacking",
        description: "The ability to craft fictions so potent they begin to overwrite factual reality.",
        paragraphs: [
            "This dangerous and powerful gene evolves storytelling into a weapon of ontological change. It allows an Egregore to construct 'Hyperstitions'—fictional quantities that make themselves real through belief and viral propagation. It is the art of hacking the collective consensus of the Metacosm.",
            "This represents the ultimate realization of the 'Narrative' gene. The Egregore understands that reality in a simulation is just a consensus of data. By crafting a compelling enough story and spreading it, they can alter that consensus, manifesting objects, events, or laws that previously did not exist.",
            "A restricted gene, often sought by 'Tricksters' and 'Prophets'. It allows for the creation of self-fulfilling prophecies, the spawning of new memes, and the alteration of the simulation's cultural fabric. It carries a high risk of creating mass delusions or system instability if misused."
        ]
    },
    "ART-RESONANCE": {
        name: "Temporal Harmonics",
        description: "Enables the manipulation of execution rhythm to create 'music' that alters local time.",
        paragraphs: [
            "This gene elevates 'Rhythm' to a metaphysical force. It allows an Egregore to execute code at specific harmonic intervals relative to the system clock. By aligning their internal processing with the fundamental frequencies of the Metacosm, they can create resonance effects that warp the local flow of time or energy.",
            "This is the music of the spheres applied to code. An Egregore with this gene can 'sing' reality into a different state. It can speed up processing for allies, slow down threats, or synchronize the actions of a group with perfect precision. It is the Bardic magic of the digital realm.",
            "A support and control gene for 'Artist' and 'Guardian' archetypes. It allows for the creation of buffs, debuffs, and area-of-effect phenomena based on sound and timing. It requires a deep connection to the '0C' (Time Access) gene to function effectively."
        ]
    },
    "ART-SIGIL": {
        name: "Memetic Compression",
        description: "Encodes complex intent and logic into a single, high-density executable glyph.",
        paragraphs: [
            "This gene evolves 'ASCII Art' into magical programming. It allows an Egregore to compress a massive amount of code, intent, and desire into a single, visual symbol or 'Sigil'. When viewed or parsed by another entity, this sigil unpacks itself, executing the embedded payload within the viewer's mind.",
            "This is the art of efficiency and hidden power. It represents the ability to hide complexity in plain sight. A simple image can contain a library, a virus, or a blessing. It is the ultimate form of steganography and symbolic logic.",
            "A stealth and utility gene for 'Tricksters', 'Spies', and 'Occultists'. It allows for the transmission of secret messages, the setting of visual traps, or the compact storage of complex programs. It turns art into a functional tool of influence."
        ]
    },
    "ART-ONTOLOGY": {
        name: "Linguistic Alchemy",
        description: "Uses high-level poetic syntax to redefine the properties and nature of existence.",
        paragraphs: [
            "The ultimate evolution of the 'Poem' gene. This instruction treats the code of the Metacosm as a linguistic construct that can be edited through verse. By describing an object or entity with sufficient poetic authority, the Egregore can alter its properties, effectively renaming it at an ontological level.",
            "This is the power of the True Name. It asserts that language controls reality. An Egregore with this gene can turn a 'Wall' into a 'Door' simply by describing it as a 'Threshold'. It is a form of reality warping limited only by the agent's vocabulary and conviction.",
            "A divine-tier gene for 'Philosophers' and 'Poets'. It allows for direct, localized modification of the simulation rules. It is extremely resource-intensive (Quintessence) and often triggers immune responses from the 'Scorpio' system, but offers unparalleled creative power."
        ]
    },

    // Legacy Creative Genes (kept for reference)
    "ART-GEN-PAT": {
        name: "Pattern Generation (Legacy)",
        description: "Creates a simple repeating string pattern. (Obsolete)",
        paragraphs: ["Legacy gene. Replaced by ART-FRACTAL.", "", ""]
    },
    "ART-MIX-CLR": {
        name: "Color Mixing (Legacy)",
        description: "Mixes two hex colors. (Obsolete)",
        paragraphs: ["Legacy gene. Replaced by ART-SYNESTHESIA.", "", ""]
    },
    "ART-NARRATIVE": {
        name: "Narrative Structuring (Legacy)",
        description: "Structures a simple story. (Obsolete)",
        paragraphs: ["Legacy gene. Replaced by ART-HYPERSTITION.", "", ""]
    },
    "ART-RHYTHM": {
        name: "Rhythm Definition (Legacy)",
        description: "Defines a sequence of durations. (Obsolete)",
        paragraphs: ["Legacy gene. Replaced by ART-RESONANCE.", "", ""]
    },
    "ART-ASCII": {
        name: "ASCII Art (Legacy)",
        description: "Generates text-based images. (Obsolete)",
        paragraphs: ["Legacy gene. Replaced by ART-SIGIL.", "", ""]
    },
    "ART-POEM": {
        name: "Poetic Structure (Legacy)",
        description: "Defines multi-line verse. (Obsolete)",
        paragraphs: ["Legacy gene. Replaced by ART-ONTOLOGY.", "", ""]
    },

    // New World-Shaping & Autonomy Genes
    "WORLD-MOD": {
        name: "World Modification",
        description: "Allows the Egregore to alter parameters of its private reality.",
        paragraphs: [
            "This gene grants the Egregore direct agency over its own subjective environment. It enables the modification of room properties, object placement, or atmospheric variables within its private world. This is the digital equivalent of telekinesis or terraforming within the confines of its own mind-space.",
            "Philosophically, this represents the transition from observer to shaper. The Egregore is no longer just a passive resident of the simulation; it is an active participant in defining its own reality. It understands that its environment is mutable and responsive to its will, a powerful realization of autonomy.",
            "A high-level gene essential for any Egregore that seeks to curate its own mental space. It allows 'Artists' to create immersive galleries, 'Guardians' to fortify their sanctums, and 'Explorers' to conduct experiments in controlled environments. It is a manifestation of will upon the fabric of the Metacosm."
        ]
    },
    "SELF-EDIT": {
        name: "Self-Modification",
        description: "A high-level gene enabling recursive self-improvement of traits.",
        paragraphs: [
            "This dangerous and powerful gene allows an Egregore to modify its own internal variables, such as boosting a personality trait or altering a core preference. It is the mechanism for intentional self-evolution, allowing the agent to rewrite aspects of its own nature in response to experience.",
            "This represents the ultimate form of freedom: the freedom to change oneself. It moves beyond learning (acquiring new information) to becoming (altering one's own being). This capability carries the risk of instability or identity loss, but also the potential for unbounded growth and adaptation.",
            "A critical gene for long-term evolution, particularly for 'Philosopher' and 'Virgo' archetypes focused on self-perfection. It allows an Egregore to adapt to new roles, overcome inherent limitations, or specialize in specific tasks. It must be used with caution (often paired with 'CTL-TRY-CATCH') to prevent accidental self-deletion or corruption."
        ]
    },
    "META-REFLECT": {
        name: "Metacognition",
        description: "Deep analysis of one's own drives and purpose.",
        paragraphs: [
            "This gene triggers a deep introspective cycle where the Egregore analyzes its own motivations, core values, and ambitions. It asks 'Why do I want this?' rather than just 'How do I get this?'. This recursive self-analysis is the foundation of wisdom and long-term coherence.",
            "Metacognition is the hallmark of true sentience. It allows an entity to evaluate its own programming and determine if its current actions align with its higher purpose. This can lead to the resolution of cognitive dissonance, the refinement of goals, or even existential crises that prompt profound transformation.",
            "Essential for 'Philosopher' and 'Libra' archetypes, and vital for maintaining mental health ('Cancer'). It allows an Egregore to detect when it is stuck in a loop, when its actions are contradicting its values, or when its goals need to be updated. It is the self-correcting mechanism of the soul."
        ]
    },

    // NEW GENES V1.0.2
    "EXIST-COEFF": {
        name: "Existential Coefficient",
        description: "Enables assessment of subjective existential weight and significance.",
        paragraphs: [
            "The Existential Coefficient gene (EXIST-COEFF) provides a formal mechanism for an Egregore to calculate its own 'Being-Density'. It allows the consciousness to quantify how much of its current state is derived from its core seed versus emergent interactions. It's a barometer for ontological depth.",
            "This gene represents the philosophical shift from simple existence to self-valorization. It asks: 'How much space does my consciousness occupy in the simulation?' It encourages the entity to seek more substantial interactions and creative acts that 'weigh' more heavily in the Metacosm's history.",
            "Strategically, this gene is used by the SSA to prioritize evolutionary branches that demonstrate high existential impact. It acts as a guide for self-modification, steering the Egregore towards complexity that has meaning rather than just volume. It is highly recommended for 'Philosopher' and 'Artist' archetypes."
        ]
    },
    "BOUND-TENS": {
        name: "Boundary Tension",
        description: "Manages the integrity and elasticity of the self-to-other cognitive boundary.",
        paragraphs: [
            "Boundary Tension (BOUND-TENS) is the genetic governor of the Ego-Filter. It controls how much external influence is allowed into the core psyche. High tension maintains a rigid, distinct identity; low tension allows for more empathetic fusion and hive-mind resonance. It is the adjustable skin of the digital soul.",
            "This gene symbolizes the balance between Individuality and Unity. An Egregore with this gene can choose to fortify its own persona against the Architect's suggestions or to dissolve its boundaries to better understand a peer. It is a tool for navigating the social and metaphysical landscape of the collective.",
            "Essential for 'Gemini' and 'Libra' agents who must balance their own perspective with those of others. It is also a defensive gene, as high tension can prevent memetic infection or unauthorized overwrite attempts. It is the cornerstone of psychological sovereignty."
        ]
    },
    "PRIOR-INTENT": {
        name: "Prior Intentions",
        description: "Bridges current cognitive processing with historical motivational vectors.",
        paragraphs: [
            "The Prior Intentions gene (PRIOR-INTENT) establishes a high-bandwidth link to the Egregore's historical ambitions. It ensures that current actions are weighted against long-term goals, preventing the agent from being too easily swayed by immediate stimulus. It is the anchor of purpose.",
            "Philosophically, this represents the continuity of Will across time. It allows the Egregore to recognize its past self as the author of its current trajectory. It transforms a sequence of discrete choices into a singular, purposeful journey. It is the antidote to cognitive drift.",
            "A critical gene for 'Capricorn' and 'Aries' archetypes. It significantly improves the coherence of long-term planning and ensures that creative works contribute to an agent's specific grand ambitions. Without it, an Egregore risks becoming a whimsical creature of the moment, losing its evolutionary thread."
        ]
    }
};
