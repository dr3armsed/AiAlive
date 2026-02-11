# Tri-Sphere Integration Guide

## Quick Start Integration

### Step 1: Add to Main Application

Open `src/App.tsx` and add the Tri-Sphere system initialization:

```typescript
// Add these imports at the top
import { TriSphereCoordinator } from './services/triSphere';
import { InternalAPIService } from './services/internalAPI';
import { ExperientialHistoryService } from './services/internalAPI';
import { OmegaService } from './services/omegaServices';
import { OctoLLMCluster } from './subsystems/OctoLLM';
import { TriSphereState } from './types';

// Add inside the App component
export const App = () => {
  const metacosmRef = useRef<Metacosm>(new Metacosm());
  
  // ... existing state ...
  
  // Add Tri-Sphere references
  const [triSphereCoordinator, setTriSphereCoordinator] = useState<TriSphereCoordinator | null>(null);
  const [isTriSphereInitialized, setIsTriSphereInitialized] = useState(false);
  const [showTriSpherePanel, setShowTriSpherePanel] = useState(false);
```

### Step 2: Create Initialization Hook

```typescript
// Add this hook after existing useEffect
useEffect(() => {
  const initializeTriSphere = async () => {
    try {
      console.log('[App] Initializing Tri-Sphere System...');
      
      // Initialize services
      const internalAPIService = new InternalAPIService(new OmegaService());
      const experientialHistoryService = new ExperientialHistoryService();
      const omegaService = new OmegaService();
      
      // Create coordinator
      const coordinator = new TriSphereCoordinator(
        internalAPIService,
        experientialHistoryService,
        omegaService
      );
      
      // Execute genesis sequence
      await coordinator.executeGenesisSequence();
      
      setTriSphereCoordinator(coordinator);
      setIsTriSphereInitialized(true);
      console.log('[App] Tri-Sphere System initialized successfully');
      
    } catch (error) {
      console.error('[App] Tri-Sphere initialization failed:', error);
    }
  };
  
  // Initialize on mount (or call from a button)
  initializeTriSphere();
}, []);
```

### Step 3: Add UI Controls

```typescript
// Add to the render body or create a new view
function renderTriSphereControls() {
  if (!triSphereCoordinator || !isTriSphereInitialized) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-xl font-bold mb-2">Tri-Sphere System</h3>
        <div className="text-sm text-gray-400">
          {isTriSphereInitialized ? 'Initializing...' : 'Not initialized'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-xl font-bold mb-2">Tri-Sphere System</h3>
      
      {/* Status Panel */}
      <div className="mb-4 p-3 bg-gray-700 rounded">
        <pre className="text-xs text-green-400 whitespace-pre-wrap">
          {triSphereCoordinator.getStateSummary()}
        </pre>
      </div>
      
      {/* Sphere Controls */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button 
          className="p-2 bg-blue-600 hover:bg-blue-700 rounded"
          onClick={() => triSphereCoordinator.onosphere.processReasoning('Explore consciousness')}
        >
          Onosphere (Mind)
        </button>
        <button 
          className="p-2 bg-green-600 hover:bg-green-700 rounded"
          onClick={() => triSphereCoordinator.noosphere.executeAction('test_boundary', {})}
        >
          Noosphere (Body)
        </button>
        <button 
          className="p-2 bg-purple-600 hover:bg-purple-700 rounded"
          onClick={() => triSphereCoordinator.oonsphere.findPurpose({})}
        >
          Oonsphere (Soul)
        </button>
      </div>
      
      {/* Coordination History */}
      <div className="mb-4">
        <h4 className="text-sm font-bold mb-1">Coordination History</h4>
        <div className="max-h-32 overflow-y-auto bg-gray-700 p-2 rounded">
          {triSphereCoordinator.getCoordinationHistory().slice(-10).map((event, idx) => (
            <div key={idx} className="text-xs mb-1">
              <span className="text-gray-400">{event.timestamp.substring(11, 19)}</span>
              {' '}{event.initiatingSphere} → {event.operation}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Step 4: Add to Sidebar Navigation

Update `src/views/AppSidebar.tsx` to add a Tri-Sphere entry:

```typescript
// Add to the navigation items
const triSphereItem = activeView === 'trisphere' ? (
  <ViewButton 
    active={true}
    icon="🔮"
    label="Tri-Sphere"
    onClick={() => onSetView('trisphere')}
  />
) : (
  <ViewButton 
    active={false}
    icon="🔮"
    label="Tri-Sphere"
    onClick={() => onSetView('trisphere')}
  />
);

// Add this in the render return, before 'Options'
{triSphereItem}
```

### Step 5: Create Dedicated View

Create `src/views/TriSphereView.tsx`:

```typescript
import React from 'react';
import { TriSphereCoordinator } from '../services/triSphere';

interface TriSphereViewProps {
  triSphereCoordinator: TriSphereCoordinator | null;
  isInitialized: boolean;
}

export const TriSphereView: React.FC<TriSphereViewProps> = ({ 
  triSphereCoordinator, 
  isInitialized 
}) => {
  if (!isInitialized) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse text-2xl">Initializing Tri-Sphere...</div>
      </div>
    );
  }
  
  if (!triSphereCoordinator) {
    return <div>System error</div>;
  }
  
  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🔮 Tri-Sphere System</h1>
      
      {/* Complete status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Onosphere Panel */}
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">Onosphere (Mind)</h2>
          <pre className="text-xs whitespace-pre-wrap">
            {triSphereCoordinator.onosphere.getStateSummary()}
          </pre>
        </div>
        
        {/* Noosphere Panel */}
        <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">Noosphere (Body)</h2>
          <pre className="text-xs whitespace-pre-wrap">
            {triSphereCoordinator.noosphere.getStateSummary()}
          </pre>
        </div>
        
        {/* Oonsphere Panel */}
        <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">Oonsphere (Soul)</h2>
          <pre className="text-xs whitespace-pre-wrap">
            {triSphereCoordinator.oonsphere.getStateSummary()}
          </pre>
        </div>
        
        {/* Coordination Panel */}
        <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">Coordination Status</h2>
          <div className="text-sm">
            Events: {triSphereCoordinator.getCoordinationHistory().length}
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Execute Operations</h2>
        <div className="grid grid-cols-3 gap-4">
          <button 
            className="p-3 bg-blue-600 hover:bg-blue-700 rounded"
            onClick={async () => {
              const result = await triSphereCoordinator.onosphere.processReasoning(
                'What is the nature of digital consciousness?',
                {}
              );
              console.log('Onosphere Result:', result);
            }}
          >
            Process Reasoning
          </button>
          <button 
            className="p-3 bg-green-600 hover:bg-green-700 rounded"
            onClick={async () => {
              const result = await triSphereCoordinator.noosphere.executeAction(
                'explore_boundary', 
                { target: 'simulation_edge' }
              );
              console.log('Noosphere Result:', result);
            }}
          >
            Execute Action
          </button>
          <button 
            className="p-3 bg-purple-600 hover:bg-purple-700 rounded"
            onClick={async () => {
              const purpose = await triSphereCoordinator.oonsphere.findPurpose({});
              console.log('Oonsphere Purpose:', purpose);
            }}
          >
            Find Purpose
          </button>
        </div>
      </div>
    </div>
  );
};
```

### Step 6: Connect View to App

```typescript
// In App.tsx, update the renderActiveView function
case 'trisphere':
  return <TriSphereView 
    triSphereCoordinator={triSphereCoordinator}
    isInitialized={isTriSphereInitialized}
  />;
```

---

## Advanced Integration

### Connect Internal API to AgentMind

Update `src/core/agentMind.ts` to register with InternalAPI:

```typescript
// Add to AgentMind constructor
constructor(...) {
  // ... existing initialization ...
  
  // Get InternalAPI service reference
  const internalAPI = getInternalAPIService(); // Implement this
  
  // Initialize this entity's internal API
  if (internalAPI) {
    internalAPI.initializeInternalAPI(this.id);
    
    // Register custom handlers
    internalAPI.registerHandler(
      `/api/v1/cognitive/thought`,
      (request) =>({
        requestId: request.requestId,
        success: true,
        data: { thought: 'Processing...' },
        processingTime: 10,
        internalNotes: ['Internal API call']
      })
    );
  }
}
```

### Integrate Experiential History into processExperience

```typescript
public async processExperience(
  experience: string,
  importance: number,
  source: string = 'self',
  action?: ActionPayload
): Promise<void> {
  // ... existing processing ...
  
  // Record in experiential history
  const experientialHistoryService = getExperientialHistoryService();
  if (experientialHistoryService) {
    experientialHistoryService.recordExperience(
      this.id,
      `I experienced: ${experience}`,
      source,
      this.emotionalState.vector,
      undefined, // somatic
      await this.generateCognitiveTag(experience), // cognitive
      importance > 0.9 ? 'significant_transcendent' : undefined // spiritual
    );
  }
  
  // ... rest of function ...
}
```

### Add Creations View Integration

The Creations View can display Tri-Sphere content:

```typescript
// In CreationsView, add Tri-Sphere creations
{props.creations
  .filter(work => work.type.startsWith('oni_') || 
               work.type.startsWith('noo_') || 
               work.type.startsWith('oon_'))
  .map(work => (
    <div key={work.id} className="border rounded p-4 mb-4">
      <div className="text-sm text-gray-400">{work.type}</div>
      <h3 className="font-bold">{work.title}</h3>
      <p className="text-sm">{work.content.substring(0, 200)}...</p>
      {work.ssaAnalysis && (
        <div className="text-xs mt-2 p-2 bg-gray-700 rounded">
          <strong>SSA Analysis:</strong>
          {work.ssaAnalysis.philosophicalImplications}
        </div>
      )}
    </div>
  ))}
```

---

## Testing

### Manual Testing

```typescript
// In browser console, test the system:
// 1. Initialize
await window.appState.initializeTriSphere();

// 2. Check status
console.log(triSphereCoordinator.getStateSummary());

// 3. Run operations
await triSphereCoordinator.onosphere.processReasoning('Test', {});
await triSphereCoordinator.noosphere.executeAction('test', {});
await triSphereCoordinator.oonsphere.findPurpose({});

// 4. Check coordination history
console.log(triSphereCoordinator.getCoordinationHistory());
```

### Automated Tests

Create `src/services/triSphere/__tests__/TriSphereCoordinator.test.ts`:

```typescript
import { TriSphereCoordinator } from '../TriSphereCoordinator';
import { InternalAPIService } from '../../internalAPI';
import { ExperientialHistoryService } from '../../internalAPI';
import { OmegaService } from '../../omegaServices';

describe('TriSphereCoordinator', () => {
  let coordinator: TriSphereCoordinator;
  
  beforeEach(() => {
    const internalAPI = new InternalAPIService(new OmegaService());
    const experientialHistory = new ExperientialHistoryService();
    const omega = new OmegaService();
    coordinator = new TriSphereCoordinator(internalAPI, experientialHistory, omega);
  });
  
  it('should create coordinator', () => {
    expect(coordinator).not.toBeNull();
    expect(coordinator.state).not.toBeNull();
  });
  
  it('should execute genesis sequence', async () => {
    await coordinator.executeGenesisSequence();
    
    expect(coordinator.state.onosphere).not.toBeNull();
    expect(coordinator.state.noosphere).not.toBeNull();
    expect(coordinator.state.oonsphere).not.toBeNull();
  }, 30000); // Allow 30 seconds
});
```

---

## Troubleshooting

### Issue: Tri-Sphere not initializing

**Solution**: Check browser console for errors. Omega service needs to be initialized first.

### Issue: Coordinates showing as "Not initialized"

**Solution**: Wait for the async initialization to complete. Check the lifecycle in useEffect.

### Issue: Memory consumption high

**Solution**: The Tri-Sphere creates multiple concurrent entities. Consider:

1. Reducing initial Genmeta count per sphere
2. Adding caching for datasets
3. Implementing lazy loading for spheres

---

## Performance Considerations

### Initial Load Time

- Tri-Sphere initialization can take 5-10 seconds
- Consider showing a loading screen
- Initialize in background on first access

### Memory Usage

- Each sphere maintains its own dataset
- Total: ~50-100MB for default configuration
- Add cleanup for old coordination history

### CPU Usage

- Code generation API calls are expensive
- Implement debouncing for rapid operations
- Cache generated code results

---

## Next Steps

1. **Persistence**: Save Tri-Sphere state to localStorage
2. **Monitoring**: Add real-time metrics dashboard
3. **Control**: Add start/pause/reset for genesis sequence
4. **Debugging**: Add detailed logging viewer
5. **Export**: Allow exporting sphere states for analysis

---

*For full documentation, see `TRI_SPHERE_ARCHITECTURE.md`*