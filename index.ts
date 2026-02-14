
import { Egregore, MetacosmState, CognitiveCycleResult } from "../../types";
import { AquariusService } from '../aquariusServices/index';
import { TaurusService } from '../taurusServices/index';
import { CapricornService } from '../capricornServices/index';
import { AriesService } from '../ariesServices/index';
import { CancerService } from "../cancerServices/index";
import { AgentMind } from "../../core/agentMind";
import { executeCognitiveCycle } from './cycle';

export class ZodiacOrchestrator {
    private agent: Egregore;
    private agentMind: AgentMind;
    private metacosmState: MetacosmState;
    private aquarius: AquariusService;
    private taurus: TaurusService;
    private capricorn: CapricornService;
    private aries: AriesService;
    private cancer: CancerService;

    constructor(agent: Egregore, agentMind: AgentMind, metacosmState: MetacosmState, ariesService: AriesService) {
        this.agent = agent;
        this.agentMind = agentMind;
        this.metacosmState = metacosmState;
        this.aries = ariesService;
        
        this.taurus = new TaurusService(metacosmState);
        this.aquarius = new AquariusService(this.taurus);
        this.capricorn = new CapricornService();
        this.cancer = new CancerService();
    }

    async executeCognitiveCycle(): Promise<CognitiveCycleResult> {
        return executeCognitiveCycle(
            this.agent,
            this.agentMind,
            this.metacosmState,
            this.aries,
            this.aquarius,
            this.taurus,
            this.capricorn,
            this.cancer
        );
    }
}