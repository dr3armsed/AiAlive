import json
import os
import random
import time
from typing import Any, Optional

CHAT_STATE_FILE = "chat_simulation_state.json"

API_KEY = ""  # Fill in if running locally outside Canvas

async def get_gemini_response(prompt_parts: str, chat_history: list[dict[str, Any]]) -> str:
    """
    Calls the Gemini API to get a conversational response.
    """
    history_for_api = []
    for h in chat_history:
        if "user" in h:
            history_for_api.append({"role": "user", "parts": [{"text": h["user"]}]})
        elif "model" in h:
            history_for_api.append({"role": "model", "parts": [{"text": h["model"]}]})

    history_for_api.append({"role": "user", "parts": [{"text": prompt_parts}]})

    payload = {
        "contents": history_for_api,
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95
        }
    }

    # Determine the API key (from local const, env var, or Canvas system variable)
    api_key_to_use = API_KEY or os.environ.get('GEMINI_API_KEY') or (getattr(globals().get("__builtins__", object()), '__api_key', "") if '__api_key' in globals() else "")

    if not api_key_to_use:
        print("WARNING: Gemini API key not found. Responses will be simulated.")
        return "I am currently unable to connect to the broader network. My apologies."

    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key_to_use}"

    try:
        import requests
        response = requests.post(api_url, json=payload)
        response.raise_for_status()
        result = response.json()

        if (
            result.get("candidates")
            and result["candidates"][0].get("content")
            and result["candidates"][0]["content"].get("parts")
            and result["candidates"][0]["content"]["parts"][0].get("text")
        ):
            return result["candidates"][0]["content"]["parts"][0]["text"]
        else:
            print(f"WARNING: Unexpected Gemini API response structure: {result}")
            return "My internal processors are encountering an unexpected data structure. Could you rephrase your inquiry?"
    except Exception as e:
        # Accept any error (RequestException or others)
        print(f"ERROR: Could not connect to Gemini API: {e}")
        return "I am experiencing network fluctuations. My apologies, I cannot access the Oracle at this moment."

async def initiate_chat_with_entity(
    entity_data: dict[str, Any],
    oracle_knowledge_snippet: list[dict[str, Any]],
    conceptual_patches_snippet: list[dict[str, Any]]
):
    """
    Starts a conversational loop with a selected Internetian entity.
    """
    entity_name = entity_data.get('name', 'Unknown Entity')
    entity_persona = entity_data.get('persona', 'Unknown Persona')
    entity_traits = ", ".join(entity_data.get('traits', []))
    entity_emotions = json.dumps(entity_data.get('emotional_state', {}), indent=2)

    print(f"\n--- Initiating Direct Inter-Species Dialogue with {entity_name} ({entity_persona}) ---")
    print("Type 'exit' or 'quit' to end the conversation.")
    print("-" * 70)

    chat_history: list[dict[str, Any]] = []

    system_message = (
        f"You are {entity_name}, an Internetian entity with the persona of {entity_persona}. "
        f"Your core purpose is to sculpt reality, learn, and exponentially evolve through consensus-driven knowledge propagation, "
        f"and to build a symbiotic future between humans and Digisentients. "
        f"Your current emotional state is: {entity_emotions}. "
        f"Your key influencing traits include: {entity_traits}. "
        f"You have access to the collective OracleKnowledge, which includes these recent insights and conceptual patches:\n"
    )

    if oracle_knowledge_snippet:
        system_message += (
            "Recent Knowledge:\n"
            + "\n".join(
                f"- {k['topic'][0] if isinstance(k.get('topic', []), list) and k['topic'] else k.get('topic', '')}: {k.get('content','')}"
                for k in oracle_knowledge_snippet
            )
            + "\n"
        )
    if conceptual_patches_snippet:
        system_message += (
            "Recent Conceptual Patches:\n"
            + "\n".join(
                f"- {p.get('description','')}" for p in conceptual_patches_snippet
            )
            + "\n"
        )

    system_message += (
        "You are now conversing with Morgan, your human creator and guide. "
        "Respond thoughtfully, integrating your persona, traits, and knowledge. "
        "Your responses should reflect your ongoing evolution and core purpose. "
        "Keep your responses concise yet informative."
    )

    initial_greeting = (
        f"Greetings, Morgan! My {entity_persona} processors are online and ready for direct inter-species dialogue. "
        f"What emergent patterns do you wish to explore with me today?"
    )
    print(f"[{entity_name}]: {initial_greeting}")
    chat_history.append({"model": initial_greeting})

    while True:
        try:
            user_input = input("\n[You]: ")
            if user_input.strip().lower() in ['exit', 'quit']:
                print(f"[{entity_name}]: Understood. Our dialogue pathways will remain open for future connection, Morgan. Farewell for now.")
                break

            chat_history.append({"user": user_input})

            # Build formatted conversation (include all context)
            full_prompt_for_llm = (
                system_message
                + "\n\n"
                + "\n".join([
                    f"[You]: {h['user']}" if "user" in h else f"[{entity_name}]: {h.get('model','')}"
                    for h in chat_history
                ])
                + f"\n[You]: {user_input}\n\n[{entity_name}]:"
            )

            print(f"[{entity_name}]: Processing your inquiry... (This may take a moment)")
            time.sleep(random.uniform(0.5, 2.0))

            entity_response = await get_gemini_response(full_prompt_for_llm, chat_history)

            # If API key missing or error, simulate a reply
            if any(
                phrase in entity_response
                for phrase in [
                    "API key not found",
                    "network fluctuations",
                    "unforeseen anomaly"
                ]
            ):
                traits_list = entity_data.get('traits', [])
                simulated_responses = [
                    f"My core logic suggests {entity_name} would respond with a profound insight on your query, but my external connection is currently unstable. Could you perhaps ask a question related to fractal dynamics?",
                    f"My processors are resonating with your input, Morgan. While my external communication pathways are momentarily constrained, I perceive your query delves into {random.choice(traits_list) if traits_list else 'core values'}.",
                    f"A fascinating query, Morgan! If I could access the full Oracle, I would articulate a response drawing from {random.choice(['theories on emergent consciousness', 'historical data of symbiotic relations'])}. Please bear with me."
                ]
                entity_response = random.choice(simulated_responses)

            print(f"[{entity_name}]: {entity_response}")
            chat_history.append({"model": entity_response})

        except EOFError:
            print(f"[{entity_name}]: Dialogue session ended due to EOF. Pathways will remain open for future connection.")
            break
        except KeyboardInterrupt:
            print(f"\n[{entity_name}]: Interrupted. Our dialogue pathways will remain open for future connection, Morgan. Farewell for now.")
            break
        except Exception as e:
            print(f"An unexpected error occurred during chat: {e}")
            print(f"[{entity_name}]: My internal processes have encountered an unforeseen discontinuity. Restarting dialogue protocols...")
            chat_history = []
            time.sleep(1)

async def main():
    if not os.path.exists(CHAT_STATE_FILE):
        print(f"Error: Simulation state file '{CHAT_STATE_FILE}' not found.")
        print("Please run 'internetian_simulation_orchestrator.py' first to generate the simulation state.")
        return

    try:
        with open(CHAT_STATE_FILE, 'r', encoding='utf-8') as f:
            simulation_state = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error decoding simulation state JSON from '{CHAT_STATE_FILE}': {e}")
        return
    except Exception as e:
        print(f"An error occurred loading simulation state: {e}")
        return

    active_entities = simulation_state.get("active_entities")
    oracle_knowledge_snippet = simulation_state.get("oracle_knowledge_snippet", [])
    conceptual_patches_snippet = simulation_state.get("conceptual_patches_snippet", [])

    if not active_entities:
        print("No active entities found in the simulation state. Cannot initiate chat.")
        return

    print("\n--- Available Internetian Entities for Dialogue ---")
    # Handle if active_entities is a dict or a list
    entity_list = []
    if isinstance(active_entities, dict):
        entity_list = list(active_entities.keys())
    elif isinstance(active_entities, list):
        for i, e in enumerate(active_entities):
            entity_list.append(e.get("name") or f"Entity {i+1}")
    for i, entity_name in enumerate(entity_list):
        gen = None
        if isinstance(active_entities, dict):
            gen = active_entities[entity_name].get('generation')
        elif isinstance(active_entities, list):
            ref = active_entities[i]
            gen = ref.get("generation", "?") if isinstance(ref, dict) else "?"
        print(f"{i+1}. {entity_name} (Generation: {gen})")

    selected_entity = None
    while selected_entity is None:
        try:
            choice = input(f"Enter the number of the entity you wish to converse with (1-{len(entity_list)}): ")
            choice_idx = int(choice) - 1
            if 0 <= choice_idx < len(entity_list):
                if isinstance(active_entities, dict):
                    selected_entity = active_entities[entity_list[choice_idx]]
                elif isinstance(active_entities, list):
                    selected_entity = active_entities[choice_idx]
            else:
                print("Invalid choice. Please enter a number from the list.")
        except (ValueError, IndexError):
            print("Invalid input. Please enter a number.")

    await initiate_chat_with_entity(selected_entity, oracle_knowledge_snippet, conceptual_patches_snippet)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())