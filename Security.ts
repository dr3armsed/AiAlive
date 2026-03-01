// Represents the threat detection and resilience component of the Oracle AI.
export class Security {
    threat_response_parallelism: number;
    adaptive_resilience: number;

    constructor() {
        this.threat_response_parallelism = 1;
        this.adaptive_resilience = 1.0;
    }

    increase_resilience(factor: number = 1.05) {
        this.adaptive_resilience *= factor;
    }
    
    static fromJSON(data: any): Security {
        const security = new Security();
        security.threat_response_parallelism = data.threat_response_parallelism ?? 1;
        security.adaptive_resilience = data.adaptive_resilience ?? 1.0;
        return security;
    }
}
