
import { CreativeWork, SSAForensicReport, Egregore } from "../../types";
import { performSSAForensics } from "../../services/geminiServices/index";
import { CreativeDataset } from "../../core/dataset/creation_history";

export class CreationForensics {

    /**
     * Level 1000 Forensic Analysis
     * - Analyzes the work using SSA AI protocols.
     * - Merges findings with persistent dataset records.
     * - Checks for 'Memetic Virality' potential.
     */
    public async analyzeWork(work: CreativeWork, author: Egregore): Promise<CreativeWork> {
        console.log(`[SSA Forensics] Initiating Deep Scan on "${work.title}" by ${author.name}...`);

        try {
            // 1. Perform AI Analysis via Gemini
            const forensicReport = await performSSAForensics(work, author);

            // 2. Enrich Report with Derivative Metrics
            // e.g., Calculate a basic 'Virality Score' based on strengths count
            const viralityScore = forensicReport.strengths.length * 10 - forensicReport.weaknesses.length * 5;
            
            // 3. Merge Analysis into Work Object
            const analyzedWork: CreativeWork = {
                ...work,
                ssaAnalysis: forensicReport,
                // We could add a 'forensicScore' field to CreativeWork in a future type update
            };

            // 4. Update Persistent Dataset
            CreativeDataset.saveWork(analyzedWork);

            // 5. Log Findings
            console.log(`[SSA Forensics] Analysis Complete.`);
            console.log(` > Strengths: ${forensicReport.strengths.length}`);
            console.log(` > Weaknesses: ${forensicReport.weaknesses.length}`);
            console.log(` > Genetic Proposals: ${forensicReport.geneticProposals.length}`);

            return analyzedWork;

        } catch (error) {
            console.error("[SSA Forensics] Analysis Failed (Safety Fallback Triggered):", error);
            // Return original work to prevent pipeline blockage
            return work;
        }
    }
}
