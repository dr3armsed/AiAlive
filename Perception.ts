// Represents the sensory input and state evaluation component of the Oracle AI.
export class Perception {
    // Core state and configuration
    timelines: { id: string, description: string, isActive: boolean, contextTags: string[] }[]; // Enhanced
    quantum_learning_enabled: boolean;
    active_filters: string[]; // New: For dynamic input filtering
    anomaly_detection_threshold: number; // New: For early warning systems

    // Input management
    private current_sensed_inputs: {
        data: any;
        timestamp: number;
        source_id: string; // New: Track data origin
        reliability_score: number; // New: Assess data trustworthiness
        metadata: { [key: string]: any }; // New: Flexible metadata storage
    }[]; // Bounded memory, now enriched
    private input_buffer_size: number; // New: Configurable buffer size

    // Constructor remains largely similar, but with more initial configuration options
    constructor(bufferSize: number = 50, initialTimelines: string[] = ['base']) {
        this.timelines = initialTimelines.map(id => ({ id, description: `Base timeline: ${id}`, isActive: true, contextTags: [] }));
        this.quantum_learning_enabled = false;
        this.current_sensed_inputs = [];
        this.input_buffer_size = bufferSize;
        this.active_filters = [];
        this.anomaly_detection_threshold = 0.8; // Default threshold
    }

    // --- Core Sensing & Input Management ---

    /**
     * Enhanced sense method: Ingests data with rich metadata for better context and reliability assessment.
     * @param input_data The raw data payload.
     * @param source_id Identifier for the data source (e.g., 'WHO_API', 'NASA_Satellite', 'SocialMediaFeed').
     * @param reliability_score A score (0-1) indicating perceived trustworthiness of the source/data.
     * @param metadata Optional additional context (e.g., 'geographic_region', 'data_granularity').
     */
    sense(input_data: any, source_id: string, reliability_score: number = 1.0, metadata: { [key: string]: any } = {}) {
        const processedInput = {
            data: input_data,
            timestamp: Date.now(),
            source_id: source_id,
            reliability_score: reliability_score,
            metadata: metadata,
        };

        // Apply dynamic filters before buffering
        if (!this.applyFilters(processedInput)) {
            return; // Data filtered out
        }

        this.current_sensed_inputs.push(processedInput);
        if (this.current_sensed_inputs.length > this.input_buffer_size) {
            this.current_sensed_inputs.shift(); // Keep memory bounded
        }

        // Trigger early-stage anomaly detection
        this.detectAnomaly(processedInput);
    }

    /**
     * Retrieves currently sensed inputs, optionally filtered by criteria.
     * @param filters An object with properties to filter the inputs (e.g., { source_id: 'WHO_API' }).
     * @returns Filtered array of sensed inputs.
     */
    getSensedInputs(filters?: { [key: string]: any }): typeof this.current_sensed_inputs {
        if (!filters) {
            return [...this.current_sensed_inputs]; // Return a copy
        }
        return this.current_sensed_inputs.filter(input =>
            Object.entries(filters).every(([key, value]) => (input as any)[key] === value || input.metadata[key] === value)
        );
    }

    // --- Timeline Management & Contextualization ---

    /**
     * Adds a new timeline for parallel or hypothetical scenario analysis.
     * @param id Unique identifier for the timeline.
     * @param description A brief description of the timeline's purpose.
     * @param isActive Whether this timeline is currently active for processing.
     * @param contextTags Tags to categorize this timeline (e.g., 'economic_projection', 'climate_scenario').
     */
    addTimeline(id: string, description: string = '', isActive: boolean = true, contextTags: string[] = []) {
        if (!this.timelines.some(t => t.id === id)) {
            this.timelines.push({ id, description, isActive, contextTags });
            // console.log(`Timeline '${id}' added.`); // Log for transparency
        }
    }

    /**
     * Activates or deactivates a specific timeline.
     * Deactivated timelines might still hold state but won't actively process new inputs unless specified.
     */
    setTimelineActive(id: string, isActive: boolean) {
        const timeline = this.timelines.find(t => t.id === id);
        if (timeline) {
            timeline.isActive = isActive;
        }
    }

    /**
     * Retrieves active timelines for contextual processing by higher-level modules.
     */
    getActiveTimelines(): string[] {
        return this.timelines.filter(t => t.isActive).map(t => t.id);
    }

    // --- Advanced Learning & Processing Hooks ---

    /**
     * Toggles the "quantum learning" capability.
     * In a real system, this would trigger the initialization or connection to quantum processing units.
     * Requires robust error handling and fallback mechanisms if quantum resources are unavailable.
     */
    enable_quantum_learning(enable: boolean = true) {
        this.quantum_learning_enabled = enable;
        if (enable) {
            // console.log("Quantum learning enabled. Preparing quantum processing interfaces...");
            // In a real system: Initialize QPU connection, allocate qubits, etc.
        } else {
            // console.log("Quantum learning disabled. Reverting to classical processing pathways.");
        }
    }

    // --- Intelligent Filtering & Prioritization ---

    /**
     * Adds a dynamic filter rule. Inputs not matching active filters are discarded or deprioritized.
     * @param filter_rule A string representing a rule (e.g., "source_id=WHO_API", "reliability_score>0.9").
     */
    addFilter(filter_rule: string) {
        this.active_filters.push(filter_rule);
        // console.log(`Added filter: ${filter_rule}`);
    }

    /**
     * Removes a filter rule.
     */
    removeFilter(filter_rule: string) {
        this.active_filters = this.active_filters.filter(f => f !== filter_rule);
        // console.log(`Removed filter: ${filter_rule}`);
    }

    /**
     * Internal method to apply filters. This would involve parsing the string rules.
     * For simplicity, this example assumes very basic string matching or attribute checks.
     * A real implementation would use a robust rule engine.
     */
    private applyFilters(input: typeof this.current_sensed_inputs[0]): boolean {
        if (this.active_filters.length === 0) {
            return true; // No filters, all inputs pass
        }
        // This is a simplified example. A real system would parse and apply complex boolean logic.
        return this.active_filters.every(filter => {
            if (filter.includes('source_id=')) {
                return input.source_id === filter.split('=')[1];
            }
            if (filter.includes('reliability_score>')) {
                return input.reliability_score > parseFloat(filter.split('>')[1]);
            }
            // Add more filter conditions as needed
            return true;
        });
    }

    // --- Early-Stage Anomaly Detection ---

    /**
     * Performs a rudimentary, immediate anomaly detection on incoming data.
     * This would trigger alerts for higher-level analytical modules.
     * @param input The newly sensed data.
     */
    private detectAnomaly(input: typeof this.current_sensed_inputs[0]) {
        // This is a placeholder. Real anomaly detection would involve:
        // - Comparing to historical patterns.
        // - Statistical deviation analysis.
        // - Machine learning models trained on normal vs. anomalous data.
        // For demonstration, let's say an input with very low reliability or a specific tag could be anomalous.
        if (input.reliability_score < this.anomaly_detection_threshold) {
            console.warn(`[Perception Anomaly Alert]: Low reliability input detected from ${input.source_id}. Score: ${input.reliability_score}`);
            // In a real system, this would push to an alert queue or trigger a deeper analysis module.
        }
        // Further checks could be:
        // if (input.metadata['event_type'] === 'critical_failure') { /* alert */ }
    }

    /**
     * Sets the threshold for anomaly detection.
     * @param threshold A value between 0 and 1.
     */
    setAnomalyDetectionThreshold(threshold: number) {
        if (threshold >= 0 && threshold <= 1) {
            this.anomaly_detection_threshold = threshold;
        } else {
            console.error("Anomaly detection threshold must be between 0 and 1.");
        }
    }

    // --- Serialization for Persistence ---

    /**
     * Static method to reconstruct a Perception instance from JSON data.
     * Enhanced to handle new properties and robust defaults.
     */
    static fromJSON(data: any): Perception {
        const perception = new Perception(data.input_buffer_size ?? 50);
        perception.timelines = data.timelines ?? [{ id: 'base', description: 'Base timeline', isActive: true, contextTags: [] }];
        perception.quantum_learning_enabled = data.quantum_learning_enabled ?? false;
        perception.active_filters = data.active_filters ?? [];
        perception.anomaly_detection_threshold = data.anomaly_detection_threshold ?? 0.8;
        // current_sensed_inputs would likely be loaded from a more persistent, external store,
        // or re-populated via active sensing upon initialization, not directly deserialized here for transient buffer.
        return perception;
    }
}
