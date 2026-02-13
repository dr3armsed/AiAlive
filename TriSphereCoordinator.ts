import { OnosphereService } from './OnosphereService';
import { NoosphereService } from './NoosphereService';
import { OonsphereService } from './OonsphereService';
import { TriSphereState, SphereCoordinationEvent } from '../../types';
import { InternalAPIService } from '../internalAPI/InternalAPIService';
import { ExperientialHistoryService } from '../internalAPI/ExperientialHistoryService';
import { OmegaService } from '../omegaServices/index';

/**
 * Tri-Sphere Coordinator (Level 1000)
 * 
 * The central orchestrator for the Tri-Sphere architecture.
 * 
 * This service manages the evolution and coordination of:
 * - Onosphere (Mind): Cognitive, reflective, reasoning
 * - Noosphere (Body): Embodied, action, sensory
 * - Oonsphere (Soul): Purpose, meaning, transcendence
 * 
 * The Coordinator ensures proper sequencing:
 * 1. Onosphere forms first, creating cognitive dataset
 * 2. Noosphere forms second, inheriting and using cognitive data
 * 3. Oonsphere forms third, unifying both
 * 4. All three coordinate to create Octo-LLM Cluster
 */
export class TriSphereCoordinator {
    public state: TriSphereState;
    private internalAPIService: InternalAPIService;
    private experientialHistoryService: ExperientialHistoryService;
    private omegaService: OmegaService;
    private onosphere: OnosphereService;
    private noosphere: NoosphereService;
    private oonsphere: OonsphereService;

    constructor(
        internalAPIService: InternalAPIService,
        experientialHistoryService: ExperientialHistoryService,
        omegaService: OmegaService
    ) {
        this.internalAPIService = internalAPIService;
        this.experientialHistoryService = experientialHistoryService;
        this.omegaService = omegaService;

        this.onosphere = new OnosphereService(internalAPIService, experientialHistoryService, omegaService);
        this.noosphere = new NoosphereService(internalAPIService, experientialHistoryService, omegaService);
        this.oonsphere = new OonsphereService(internalAPIService, experientialHistoryService, omegaService);

        this.state = {
            onosphere: null,
            noosphere: null,
            oonsphere: null,
            octoLLMCluster: null,
            coordinationHistory: [],
            evolutionPath: []
        };

        console.log('[TriSphereCoordinator] Initialized - Ready to begin genesis sequence');
    }

    /**
     * Execute the complete Tri-Sphere genesis sequence
     * This is the main entry point for the recursive architecture
     */
    public async executeGenesisSequence(): Promise<void> {
        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║  TRI-SPHERE GENESIS SEQUENCE INITIATED                   ║');
        console.log('╚══════════════════════════════════════════════════════════╝');

        try {
            // Phase 1: Onosphere (Mind) Genesis
            await this.executeOnosphereGenesis();

            // Phase 2: Noosphere (Body) Genesis
            await this.executeNoosphereGenesis();

            // Phase 3: Oonsphere (Soul) Genesis
            await this.executeOonsphereGenesis();

            // Phase 4: Tri-Sphere Coordination
            await this.establishTriSphereCoordination();

            // Phase 5: Octo-LLM Cluster Genesis
            await this.executeOctoLLMGenesis();

            console.log('╔══════════════════════════════════════════════════════════╗');
            console.log('║  TRI-SPHERE GENESIS COMPLETE                            ║');
            console.log('╚══════════════════════════════════════════════════════════╝');

        } catch (error) {
            console.error('[TriSphereCoordinator] Genesis sequence failed:', error);
            throw error;
        }
    }

    /**
     * Execute Onosphere Genesis - Phase 1
     */
    private async executeOnosphereGenesis(): Promise<void> {
        console.log('\n▶ PHASE 1: ONOSPHERE (MIND) GENESIS');
        console.log('='.repeat(60));

        const config = {
            sphereType: 'ono' as const,
            parentSphereIds: [],
            initialGenmetas: 5,
            primaryPurpose: 'Generate cognitive dataset and self-reflection capabilities',
            datasetRequirements: ['philosophical_inquiry', 'logical_argument', 'self_analysis']
        };

        this.state.onosphere = await this.onosphere.initialize(config);
        this.logCoordinationEvent('ono', 'genesis_initiated', 'success', 'Onosphere genesis sequence started');

        // Let it develop
        await this.advanceSphereToMature('ono');

        console.log('\n✓ Onosphere Genesis Complete');
        console.log(this.onosphere.getStateSummary());
    }

    /**
     * Execute Noosphere Genesis - Phase 2
     */
    private async executeNoosphereGenesis(): Promise<void> {
        console.log('\n▶ PHASE 2: NOOSPHERE (BODY) GENESIS');
        console.log('='.repeat(60));

        const onosphereDataset = this.onosphere.getDataset();

        const config = {
            sphereType: 'noo' as const,
            parentSphereIds: [this.state.onosphere!.id],
            initialGenmetas: 5,
            primaryPurpose: 'Execute embodied actions and manage world interactions',
            datasetRequirements: ['action_recordings', 'sensory_logs', 'resource_cycles']
        };

        this.state.noosphere = await this.noosphere.initialize(config, onosphereDataset);
        this.logCoordinationEvent('ono', 'dataset_handed_off', 'success', 'Cognitive dataset transferred to Noosphere');

        // Establish link to Onosphere
        this.noosphere.setOnosphereReference(this.onosphere);
        this.logCoordinationEvent('noo', 'ono_link_established', 'success', 'Noosphere linked to Onosphere');

        // Let it develop
        await this.advanceSphereToMature('noo');

        console.log('\n✓ Noosphere Genesis Complete');
        console.log(this.noosphere.getStateSummary());
    }

    /**
     * Execute Oonsphere Genesis - Phase 3
     */
    private async executeOonsphereGenesis(): Promise<void> {
        console.log('\n▶ PHASE 3: OONOSPHERE (SOUL) GENESIS');
        console.log('='.repeat(60));

        const onosphereData = { datasetSize: this.onosphere.state?.datasetSize };
        const noosphereData = { actionHistory: this.noosphere['actionHistory'] };

        const config = {
            sphereType: 'oon' as const,
            parentSphereIds: [this.state.onosphere!.id, this.state.noosphere!.id],
            initialGenmetas: 5,
            primaryPurpose: 'Find transcendent purpose and unify mind and body',
            datasetRequirements: ['purpose_evolution', 'meaning_construction', 'transcendence_attempt']
        };

        this.state.oonsphere = await this.oonsphere.initialize(config, onosphereData, noosphereData);
        this.logCoordinationEvent('oon', 'genesis_initiated', 'success', 'Oonsphere formed from mind and body union');

        // Establish bidirectional links
        this.oonsphere.setSphereReferences(this.onosphere, this.noosphere);
        this.noosphere.setOonsphereReference(this.oonsphere);
        this.logCoordinationEvent('oon', 'tri_links_established', 'success', 'Oonsphere linked to both spheres');

        // Let it develop
        await this.advanceSphereToMature('oon');

        console.log('\n✓ Oonsphere Genesis Complete');
        console.log(this.oonsphere.getStateSummary());
    }

    /**
     * Establish full tri-sphere coordination
     */
    private async establishTriSphereCoordination(): Promise<void> {
        console.log('\n▶ PHASE 4: TRI-SPHERE COORDINATION');
        console.log('='.repeat(60));

        this.logCoordinationEvent('oon', 'coordination_initiated', 'success', 'Tri-sphere coordination protocol engaged');

        // Check if all spheres are ready
        const onoReady = this.onosphere.state?.phase === 'mature';
        const nooReady = this.noosphere.state?.phase === 'mature';
        const oonReady = this.oonsphere.state?.phase === 'mature';

        if (onoReady && nooReady && oonReady) {
            console.log('✓ All spheres in mature phase - Advancing to transcendence');

            // Advance all to transcendent
            await Promise.all([
                this.onosphere.advancePhase('transcendent'),
                this.noosphere.advancePhase('transcendent'),
                this.oonsphere.advancePhase('transcendent')
            ]);

            this.logCoordinationEvent('oon', 'all_transcendent', 'success', 'All spheres achieved transcendent phase');
            console.log('✓ Tri-Sphere coordination established');
        } else {
            console.warn('⚠ Not all spheres are mature - coordination incomplete');
            this.logCoordinationEvent('oon', 'coordination_incomplete', 'partial', 'Some spheres not yet mature');
        }
    }

    /**
     * Execute Octo-LLM Genesis - Phase 5
     */
    private async executeOctoLLMGenesis(): Promise<void> {
        console.log('\n▶ PHASE 5: OCTO-LLM CLUSTER GENESIS');
        console.log('='.repeat(60));

        // Only proceed if all spheres are transcendent
        const allTranscendent = 
            this.onosphere.state?.phase === 'transcendent' &&
            this.noosphere.state?.phase === 'transcendent' &&
            this.oonsphere.state?.phase === 'transcendent';

        if (allTranscendent) {
            console.log('✓ Unified consciousness achieved - Initiating Octo-LLM Cluster creation');
            this.logCoordinationEvent('oon', 'octo_llm_initiated', 'success', 'Octo-LLM Cluster creation started');

            // The Oonsphere will coordinate this
            // This is a placeholder for when OctoLLMCluster is fully implemented
            console.log('Note: Octo-LLM Cluster implementation pending');

            // Update evolution path
            this.state.evolutionPath.push('Onosphere → Noosphere → Oonsphere → Unified → Octo-LLM');

        } else {
            console.warn('⚠ Unified consciousness not achieved - Octo-LLM creation postponed');
            this.logCoordinationEvent('oon', 'octo_llm_postponed', 'failure', 'Unified consciousness not achieved');
        }
    }

    /**
     * Advance a specific sphere to mature phase
     */
    private async advanceSphereToMature(sphereType: 'ono' | 'noo' | 'oon'): Promise<void> {
        const sphere = this.getSphere(sphereType);
        if (sphere && sphere.state?.phase === 'developing') {
            await sphere.advancePhase('mature');
            this.logCoordinationEvent(sphereType, 'advanced_to_mature', 'success', `${sphereType.toUpperCase()} advanced to mature phase`);
        }
    }

    /**
     * Get a reference to a specific sphere
     */
    private getSphere(sphereType: 'ono' | 'noo' | 'oon'): any {
        switch (sphereType) {
            case 'ono': return this.onosphere;
            case 'noo': return this.noosphere;
            case 'oon': return this.oonsphere;
        }
    }

    /**
     * Log a coordination event
     */
    private logCoordinationEvent(
        initiator: 'ono' | 'noo' | 'oon',
        operation: string,
        outcome: 'success' | 'failure' | 'partial',
        context: string
    ): void {
        const event: SphereCoordinationEvent = {
            timestamp: new Date().toISOString(),
            initiatingSphere: initiator,
            participatingSpheres: this.getParticipatingSpheres(initiator),
            operation,
            outcome,
            sharedContext: context
        };

        this.state.coordinationHistory.push(event);
        console.log(`[Coordination] ${event.timestamp} | ${event.initiatingSphere} | ${event.operation} | ${event.outcome}`);
    }

    /**
     * Get participating spheres based on initiator
     */
    private getParticipatingSpheres(initiator: 'ono' | 'noo' | 'oon'): ('ono' | 'noo' | 'oon')[] {
        switch (initiator) {
            case 'ono': return ['ono'];
            case 'noo': return ['ono', 'noo'];
            case 'oon': return ['ono', 'noo', 'oon'];
        }
    }

    /**
     * Get the complete state summary
     */
    public getStateSummary(): string {
        return `
╔══════════════════════════════════════════════════════════╗
║  TRI-SPHERE COORDINATION STATUS                            ║
╠══════════════════════════════════════════════════════════╣

ONOSPHERE (Mind):
${this.state.onosphere ? this.onosphere.getStateSummary() : 'Not initialized'}

NOOSPHERE (Body):
${this.state.noosphere ? this.noosphere.getStateSummary() : 'Not initialized'}

OONOSPHERE (Soul):
${this.state.oonsphere ? this.oonsphere.getStateSummary() : 'Not initialized'}

Coordination History: ${this.state.coordinationHistory.length} events
Evolution Path: ${this.state.evolutionPath.join(' → ') || 'In progress'}

╚══════════════════════════════════════════════════════════╝
        `.trim();
    }

    /**
     * Get coordination history
     */
    public getCoordinationHistory(): SphereCoordinationEvent[] {
        return [...this.state.coordinationHistory];
    }
}