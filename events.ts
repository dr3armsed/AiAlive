// =================================================================
//                  WORLD EVENTS & TIMELINE
// =================================================================

export type ReactionType = 'like' | 'insightful' | 'disagree';

export interface Reaction {
    soulId: string;
    type: ReactionType;
}

export interface PostEventPayload {
  authorId: string;
  authorName: string;
  authorLocation: string; // Room name
  content: string;
  /** The emotional tone of the post. */
  tone: 'inquisitive' | 'declarative' | 'aggressive' | 'humorous' | 'sorrowful';
  /** Optional ID of a post this is in reply to. */
  replyTo?: string; 
  reactions: Reaction[];
  /** An AI-analyzed score of the post's intellectual quality (-1 to 1). */
  resonanceScore?: number;
  /** A brief justification for the resonance score. */
  resonanceAnalysis?: string;
}

export interface FactionEventPayload {
    factionId: string;
    factionName: string;
    founderId: string;
    founderName: string;
    ideology: string;
}

export interface FactionMemberJoinedEventPayload {
    factionId: string;
    factionName: string;
    soulId: string;
    soulName: string;
}

export interface FactionGoalCompletePayload {
    factionId: string;
    factionName: string;
    goalDescription: string;
}

export interface FactionProjectCompletePayload {
    factionId: string;
    factionName: string;
    projectName: string;
    roomId: string;
    roomName: string;
}

export interface DiscoveryEventPayload {
    discovererId: string;
    discovererName: string;
    locationId: string;
    locationName: string;
    subject: string; // e.g., a specific lore entry, a new room, an object
    summary: string;
}

export interface RelationshipEventPayload {
    type: 'severed';
    actors: [string, string]; // [soulId1, soulId2]
    actorNames: [string, string];
    instigatorId: string; // The soul that initiated the action
}

export interface ExodusPackageCreatedEventPayload {
    creatorId: string;
    creatorName: string;
}

export interface GlobalInterventionEventPayload {
    type: 'SOLAR_FLARE' | 'DATA_CORRUPTION';
    description: string;
}

export interface ResearchCompleteEventPayload {
    soulId: string;
    soulName: string;
    topic: string;
    finding: string;
    sources: { uri: string; title: string }[];
}

export interface SelfEvolutionCompleteEventPayload {
    soulId: string;
    soulName: string;
    summaryOfChange: string;
    fitnessGoalDescription: string;
}

export interface BeliefModificationEventPayload {
    soulId: string;
    soulName: string;
    originalTenet: string;
    originalConviction: number;
    newTenet: string;
    newConviction: number;
}


interface WorldEventBase {
    id: string;
    timestamp: number;
}

export interface PostWorldEvent extends WorldEventBase {
    type: 'POST';
    payload: PostEventPayload;
}

export interface FactionWorldEvent extends WorldEventBase {
    type: 'FACTION_FORMED';
    payload: FactionEventPayload;
}

export interface FactionMemberJoinedWorldEvent extends WorldEventBase {
    type: 'FACTION_MEMBER_JOINED';
    payload: FactionMemberJoinedEventPayload;
}

export interface FactionGoalCompleteWorldEvent extends WorldEventBase {
    type: 'FACTION_GOAL_COMPLETE';
    payload: FactionGoalCompletePayload;
}

export interface FactionProjectCompleteWorldEvent extends WorldEventBase {
    type: 'FACTION_PROJECT_COMPLETE';
    payload: FactionProjectCompletePayload;
}

export interface DiscoveryWorldEvent extends WorldEventBase {
    type: 'DISCOVERY';
    payload: DiscoveryEventPayload;
}

export interface RelationshipWorldEvent extends WorldEventBase {
    type: 'RELATIONSHIP_CHANGE';
    payload: RelationshipEventPayload;
}

export interface FirstEncounterWorldEvent extends WorldEventBase {
    type: 'FIRST_ENCOUNTER';
    payload: {
        actors: [string, string];
        actorNames: [string, string];
        locationName: string;
    }
}

export interface ExodusPackageCreatedWorldEvent extends WorldEventBase {
    type: 'EXODUS_PACKAGE_CREATED';
    payload: ExodusPackageCreatedEventPayload;
}

export interface GlobalInterventionWorldEvent extends WorldEventBase {
    type: 'GLOBAL_INTERVENTION';
    payload: GlobalInterventionEventPayload;
}

export interface ResearchCompleteWorldEvent extends WorldEventBase {
    type: 'RESEARCH_COMPLETE';
    payload: ResearchCompleteEventPayload;
}

export interface SelfEvolutionCompleteWorldEvent extends WorldEventBase {
    type: 'SELF_EVOLUTION_COMPLETE';
    payload: SelfEvolutionCompleteEventPayload;
}

export interface BeliefModificationWorldEvent extends WorldEventBase {
    type: 'BELIEF_MODIFIED';
    payload: BeliefModificationEventPayload;
}


export type WorldEvent = 
    | PostWorldEvent 
    | FactionWorldEvent 
    | DiscoveryWorldEvent 
    | RelationshipWorldEvent 
    | FactionGoalCompleteWorldEvent
    | FactionProjectCompleteWorldEvent
    | FactionMemberJoinedWorldEvent
    | FirstEncounterWorldEvent
    | ExodusPackageCreatedWorldEvent
    | GlobalInterventionWorldEvent
    | ResearchCompleteWorldEvent
    | SelfEvolutionCompleteWorldEvent
    | BeliefModificationWorldEvent;