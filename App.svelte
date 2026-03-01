<script>
    import { writable } from 'svelte/store';

    // Svelte store to hold the world state
    const worldState = writable({
        egregores: [],
        simParams: { speed: 1 },
        worldEvents: [],
    });

    // Create a Broadcast Channel to listen for state updates
    const channel = new BroadcastChannel('egregore-state-bus');

    // Reviver function to handle Maps during JSON parsing
    const reviver = (key, value) => {
        if(typeof value === 'object' && value !== null) {
            if (value.dataType === 'Map') {
                return new Map(value.value);
            }
        }
        return value;
    }

    channel.onmessage = (event) => {
        try {
            const newState = JSON.parse(event.data, reviver);
            worldState.update(current => ({
                ...current,
                ...newState
            }));
        } catch (error) {
            console.error("Svelte Runner: Error parsing state update", error);
        }
    };
    
    // Derived store for the last 5 events
    let latestEvents = [];
    worldState.subscribe(value => {
        latestEvents = value.worldEvents.slice(0, 5);
    });

    const getEventSummary = (event) => {
        if (!event || !event.type) return "Unknown Event";
        switch(event.type) {
            case 'POST': return `Post by ${event.payload.authorName}`;
            case 'FACTION_FORMED': return `Faction Formed: ${event.payload.factionName}`;
            case 'RELATIONSHIP_CHANGE': return `Ties Severed between ${event.payload.actorNames.join(' & ')}`;
            case 'FIRST_ENCOUNTER': return `First Encounter: ${event.payload.actorNames.join(' & ')}`;
            default: return event.type.replace('_', ' ');
        }
    }

</script>

<main class="p-6 h-screen flex flex-col">
    <div class="flex-shrink-0 mb-4">
        <h1 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
            Svelte Shadow Runner
        </h1>
        <p class="font-mono text-sm text-green-400 animate-pulse">STATUS: ONLINE - SYNCHRONIZED</p>
    </div>

    <div class="grid grid-cols-2 gap-6 flex-grow overflow-y-auto">
        <div class="bg-gray-900/50 p-4 rounded-lg border border-[var(--color-border-primary)] flex-grow overflow-y-auto">
            <h2 class="font-bold text-lg mb-2">Egregores ({$worldState.egregores.length})</h2>
            <ul class="space-y-2">
                {#each $worldState.egregores as soul (soul.id)}
                    <li class="bg-gray-800/50 p-3 rounded-md">
                        <p class="font-semibold text-white">{soul.name}</p>
                        <p class="text-xs text-gray-400 capitalize">Mood: {soul.emotionalState?.mood || 'Unknown'}</p>
                    </li>
                {/each}
            </ul>
            {#if $worldState.egregores.length === 0}
                <p class="text-sm text-center text-gray-500 italic py-4">Awaiting genesis signal...</p>
            {/if}
        </div>
         <div class="bg-gray-900/50 p-4 rounded-lg border border-[var(--color-border-primary)] flex-grow overflow-y-auto">
            <h2 class="font-bold text-lg mb-2">Live Event Feed</h2>
            <ul class="space-y-2 font-mono text-sm">
                {#each latestEvents as event (event.id)}
                    <li class="bg-gray-800/50 p-2 rounded-md">
                        <p class="text-cyan-300 truncate">{getEventSummary(event)}</p>
                        <p class="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                    </li>
                {/each}
            </ul>
             {#if latestEvents.length === 0}
                <p class="text-sm text-center text-gray-500 italic py-4">No world events recorded.</p>
            {/if}
        </div>
    </div>

    <footer class="flex-shrink-0 mt-4 text-xs font-mono text-gray-500">
        <p>Simulation Speed: {$worldState.simParams.speed}x</p>
        <p>State bus connection: 'egregore-state-bus'</p>
    </footer>
</main>