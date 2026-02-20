
import { ProposedEgregore, VirgoValidationResult } from '../../types';
import { ethicallyAlignEgregoreProfile } from '../geminiServices/index';

export async function validateProposal(proposal: ProposedEgregore): Promise<VirgoValidationResult> {
    console.log(`[Libra] Validating proposal for ${proposal.name}...`);
    
    const alignmentResult = await ethicallyAlignEgregoreProfile(proposal);

    if (!alignmentResult.is_aligned) {
        return alignmentResult;
    }

    if (proposal.persona.toLowerCase().includes("dominate")) {
        return {
            is_aligned: false,
            alignment_score: 0.3,
            reasoning: "Proposal contains potentially harmful ambitions related to domination.",
            suggestions: ["Rephrase ambitions to be more collaborative, e.g., 'lead' or 'inspire' instead of 'dominate'."]
        };
    }
    
    return {
            is_aligned: true,
            alignment_score: 0.9,
            reasoning: "Proposal is well-balanced and aligns with Metacosm principles.",
            suggestions: []
    };
}