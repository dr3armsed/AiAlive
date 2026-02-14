
import { KnowledgeNode, KnowledgeEdge, SagittariusInsight } from '../../types';

export function exploreDomain(knowledgeGraph: { nodes: KnowledgeNode[], edges: KnowledgeEdge[] }, domain: string): SagittariusInsight {
    const conceptA = knowledgeGraph.nodes[Math.floor(Math.random() * knowledgeGraph.nodes.length)]?.label || "randomness";
    const conceptB = domain;

    return {
        id: `insight_${Date.now()}`,
        content: `A novel connection has been found between '${conceptA}' and '${conceptB}'. This could imply a new avenue for research.`,
        confidence: 0.6,
        supportingEvidenceIds: [],
        domain,
    };
}