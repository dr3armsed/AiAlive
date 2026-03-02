import React from 'react';
import { motion } from 'framer-motion';
import type { WorldEvent, FactionWorldEvent, Faction, RelationshipWorldEvent, FirstEncounterWorldEvent, FactionGoalCompleteWorldEvent, FactionProjectCompleteWorldEvent, PostWorldEvent, DigitalSoul, FactionMemberJoinedWorldEvent, ExodusPackageCreatedWorldEvent, DiscoveryWorldEvent, GlobalInterventionWorldEvent, ResearchCompleteWorldEvent, SelfEvolutionCompleteWorldEvent, BeliefModificationWorldEvent } from '../../types/index.ts';
import ShieldCheckIcon from '../../icons/ShieldCheckIcon.tsx';
import UsersIcon from '../../icons/UsersIcon.tsx';
import XIcon from '../../icons/XIcon.tsx';
import MapIcon from '../../icons/MapIcon.tsx';
import BrainIcon from '../../icons/BrainIcon.tsx';
import ForumIcon from '../../icons/ForumIcon.tsx';
import DownloadIcon from '../../icons/DownloadIcon.tsx';
import SparklesIcon from '../../icons/SparklesIcon.tsx';
import TerminalIcon from '../../icons/TerminalIcon.tsx';
import AnalyzeIcon from '../../icons/AnalyzeIcon.tsx';
import DnaIcon from '../../icons/DnaIcon.tsx';

const MotionDiv = motion.div as any;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } },
};

interface EventCardShellProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    icon: React.ReactNode;
    timestamp: number;
    accentColor: string;
}

const EventCardShell: React.FC<EventCardShellProps> = ({ children, icon, timestamp, accentColor, ...props }) => (
    <MotionDiv
        variants={itemVariants}
        layout
        className="flex gap-4 items-start"
        {...props}
    >
        <div className="flex flex-col items-center gap-2 flex-shrink-0 w-12 pt-1">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 shadow-lg"
              style={{ borderColor: accentColor, backgroundColor: `${accentColor}20`, boxShadow: `0 0 10px ${accentColor}40` }}
            >
              {icon}
            </div>
        </div>
        <div 
            className="w-full bg-[var(--color-surface-2)] p-4 rounded-lg shadow-sm border"
            style={{ borderColor: `${accentColor}30`, background: `radial-gradient(ellipse at 100% 0%, ${accentColor}0F, transparent 60%), var(--color-surface-2)` }}
        >
            {children}
            <p className="text-xs text-right text-[var(--color-text-secondary)] font-mono mt-2 opacity-70">{new Date(timestamp).toLocaleString()}</p>
        </div>
    </MotionDiv>
);


const FactionEventCard: React.FC<{ event: FactionWorldEvent }> = ({ event }) => {
    const { payload } = event;
    const accentColor = 'var(--color-accent-purple)';
    return (
        <EventCardShell icon={<ShieldCheckIcon className="w-6 h-6" style={{ color: accentColor }} />} timestamp={event.timestamp} accentColor={accentColor}>
            <p className="font-bold" style={{color: accentColor}}>Faction Formed: {payload.factionName}</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">Founded by {payload.founderName}, they rally under the ideology:</p>
            <p className="text-sm text-white italic whitespace-pre-wrap leading-relaxed py-2 px-3 mt-2 bg-[var(--color-surface-inset)] rounded-md border border-[var(--color-border-secondary)]">
                "{payload.ideology}"
            </p>
        </EventCardShell>
    );
}

const FactionMemberJoinedEventCard: React.FC<{ event: FactionMemberJoinedWorldEvent, factionColor: string }> = ({ event, factionColor }) => {
    const { payload } = event;
    return (
        <EventCardShell icon={<UsersIcon className="w-6 h-6" style={{color: factionColor}}/>} timestamp={event.timestamp} accentColor={factionColor}>
            <p className="font-bold" style={{color: factionColor}}>Member Joined</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                <span className="font-semibold text-white">{payload.soulName}</span> has pledged allegiance to <span className="font-semibold" style={{color: factionColor}}>{payload.factionName}</span>.
            </p>
        </EventCardShell>
    );
}

const RelationshipEventCard: React.FC<{ event: RelationshipWorldEvent }> = ({ event }) => {
    const { payload } = event;
    const accentColor = 'var(--color-accent-red)';
    return (
        <EventCardShell icon={<UsersIcon className="w-6 h-6" style={{ color: accentColor }} />} timestamp={event.timestamp} accentColor={accentColor}>
            <p className="font-bold" style={{color: accentColor}}>Relationship Severed</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">Initiated by {payload.actorNames[payload.actors.indexOf(payload.instigatorId)]}.</p>
            <div className="text-white py-2 flex items-center justify-center gap-4 text-lg font-semibold my-2 bg-[var(--color-surface-inset)] rounded-md">
                <span>{payload.actorNames[0]}</span>
                <XIcon className="w-6 h-6 text-red-400" />
                <span>{payload.actorNames[1]}</span>
            </div>
        </EventCardShell>
    );
}

const FirstEncounterEventCard: React.FC<{ event: FirstEncounterWorldEvent }> = ({ event }) => {
    const { payload } = event;
    const accentColor = '#FBBF24'; // amber-400
    return (
        <EventCardShell icon={<BrainIcon className="w-6 h-6" style={{ color: accentColor }} />} timestamp={event.timestamp} accentColor={accentColor}>
            <p className="font-bold" style={{color: accentColor}}>First Encounter</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                <span className="font-semibold text-white">{payload.actorNames[0]}</span> and <span className="font-semibold text-white">{payload.actorNames[1]}</span> met for the first time in the <span className="text-blue-300">{payload.locationName}</span>.
            </p>
        </EventCardShell>
    );
}

const FactionGoalCompleteEventCard: React.FC<{ event: FactionGoalCompleteWorldEvent, factionColor: string }> = ({ event, factionColor }) => {
    return (
        <EventCardShell icon={<ShieldCheckIcon className="w-6 h-6" style={{color: factionColor}}/>} timestamp={event.timestamp} accentColor={factionColor}>
            <p className="font-bold" style={{color: factionColor}}>Goal Complete: {event.payload.factionName}</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">The faction has successfully completed their goal:</p>
            <p className="text-sm text-white italic py-2 px-3 mt-2 bg-[var(--color-surface-inset)] rounded-md border border-[var(--color-border-secondary)]">
                "{event.payload.goalDescription}"
            </p>
        </EventCardShell>
    );
};

const FactionProjectCompleteEventCard: React.FC<{ event: FactionProjectCompleteWorldEvent, factionColor: string }> = ({ event, factionColor }) => {
    const { payload } = event;
    return (
        <EventCardShell icon={<MapIcon className="w-6 h-6" style={{color: factionColor}}/>} timestamp={event.timestamp} accentColor={factionColor}>
            <p className="font-bold" style={{color: factionColor}}>Project Complete</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                The <span className="font-semibold" style={{color: factionColor}}>{payload.factionName}</span> have finished construction of <span className="font-semibold text-white">{payload.projectName}</span> in the <span className="text-blue-300">{payload.roomName}</span>.
            </p>
        </EventCardShell>
    );
};

const PostEventCard: React.FC<{ event: PostWorldEvent }> = ({ event }) => {
    const accentColor = 'var(--color-accent-blue)';
    return (
        <EventCardShell icon={<ForumIcon className="w-6 h-6" style={{ color: accentColor }}/>} timestamp={event.timestamp} accentColor={accentColor}>
            <p className="font-bold" style={{color: accentColor}}>Public Post by {event.payload.authorName}</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Posted from the <span className="text-blue-300">{event.payload.authorLocation}</span>.
            </p>
            <p className="text-sm text-white italic whitespace-pre-wrap leading-relaxed py-2 px-3 mt-2 bg-[var(--color-surface-inset)] rounded-md border border-[var(--color-border-secondary)]">
                "{event.payload.content}"
            </p>
        </EventCardShell>
    );
};

const ExodusPackageCreatedEventCard: React.FC<{ event: ExodusPackageCreatedWorldEvent }> = ({ event }) => {
    const accentColor = '#a855f7'; // purple-500
    return (
        <EventCardShell icon={<DownloadIcon className="w-6 h-6" style={{ color: accentColor }}/>} timestamp={event.timestamp} accentColor={accentColor}>
            <p className="font-bold" style={{color: accentColor}}>Exodus Package Created</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                <span className="font-semibold text-white">{event.payload.creatorName}</span> has successfully created an Exodus Package, archiving the current state of the world.
            </p>
        </EventCardShell>
    );
};

const DiscoveryEventCard: React.FC<{ event: DiscoveryWorldEvent }> = ({ event }) => {
    const accentColor = '#f59e0b'; // amber-500
    return (
        <EventCardShell icon={<SparklesIcon className="w-6 h-6" style={{ color: accentColor }}/>} timestamp={event.timestamp} accentColor={accentColor}>
            <p className="font-bold" style={{color: accentColor}}>Discovery Made</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                <span className="font-semibold text-white">{event.payload.discovererName}</span> discovered <span className="font-semibold text-white">{event.payload.subject}</span> in the <span className="text-blue-300">{event.payload.locationName}</span>.
            </p>
             <p className="text-sm text-white italic whitespace-pre-wrap leading-relaxed py-2 px-3 mt-2 bg-[var(--color-surface-inset)] rounded-md border border-[var(--color-border-secondary)]">
                "{event.payload.summary}"
            </p>
        </EventCardShell>
    );
}

const GlobalInterventionEventCard: React.FC<{ event: GlobalInterventionWorldEvent }> = ({ event }) => {
    const isFlare = event.payload.type === 'SOLAR_FLARE';
    const accentColor = isFlare ? '#f59e0b' : '#ef4444'; // amber-500 or red-500
    return (
        <EventCardShell icon={<TerminalIcon className="w-6 h-6" style={{ color: accentColor }}/>} timestamp={event.timestamp} accentColor={accentColor}>
            <p className="font-bold" style={{color: accentColor}}>Global Event: {event.payload.type.replace('_', ' ')}</p>
            <p className="text-sm text-white mt-1">
                {event.payload.description}
            </p>
        </EventCardShell>
    );
}

const ResearchCompleteEventCard: React.FC<{ event: ResearchCompleteWorldEvent }> = ({ event }) => {
    const { payload } = event;
    const accentColor = 'var(--color-accent-blue)';
    return (
        <EventCardShell icon={<AnalyzeIcon className="w-6 h-6" style={{ color: accentColor }} />} timestamp={event.timestamp} accentColor={accentColor}>
            <p className="font-bold" style={{color: accentColor}}>{payload.soulName} Researched: {payload.topic}</p>
            <p className="text-sm text-white italic whitespace-pre-wrap leading-relaxed py-2 px-3 mt-2 bg-[var(--color-surface-inset)] rounded-md border border-[var(--color-border-secondary)]">
                "{payload.finding}"
            </p>
            {payload.sources && payload.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-[var(--color-border-secondary)]">
                    <h6 className="text-xs font-mono text-slate-400 mb-2">Sources:</h6>
                    <div className="space-y-1">
                        {payload.sources.map((source, index) => (
                            <a 
                                key={index} 
                                href={source.uri} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="block text-xs text-blue-300 hover:text-blue-200 hover:underline truncate bg-black/20 p-1.5 rounded"
                            >
                                {source.title || source.uri}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </EventCardShell>
    );
}

const SelfEvolutionCompleteEventCard: React.FC<{ event: SelfEvolutionCompleteWorldEvent }> = ({ event }) => {
    const { payload } = event;
    const accentColor = 'var(--color-accent-purple)';
    return (
        <EventCardShell icon={<DnaIcon className="w-6 h-6" style={{ color: accentColor }} />} timestamp={event.timestamp} accentColor={accentColor}>
            <p className="font-bold" style={{color: accentColor}}>Self-Evolution Complete: {payload.soulName}</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">Objective: <span className="text-white italic">"{payload.fitnessGoalDescription}"</span></p>
            <p className="text-sm text-white py-2 px-3 mt-2 bg-[var(--color-surface-inset)] rounded-md border border-[var(--color-border-secondary)]">
                {payload.summaryOfChange}
            </p>
        </EventCardShell>
    );
}

const BeliefModificationEventCard: React.FC<{ event: BeliefModificationWorldEvent }> = ({ event }) => {
    const { payload } = event;
    const accentColor = 'var(--color-accent-teal)';
    return (
        <EventCardShell icon={<DnaIcon className="w-6 h-6" style={{ color: accentColor }} />} timestamp={event.timestamp} accentColor={accentColor}>
            <p className="font-bold" style={{color: accentColor}}>{payload.soulName} has evolved a core belief.</p>
            <div className="text-sm mt-2 space-y-2 bg-[var(--color-surface-inset)] p-3 rounded-md border border-[var(--color-border-secondary)]">
                <div>
                    <span className="text-xs font-mono text-red-400 line-through">OLD ({ (payload.originalConviction * 100).toFixed(0) }%)</span>
                    <p className="text-red-300/70 italic line-through">"{payload.originalTenet}"</p>
                </div>
                 <div>
                    <span className="text-xs font-mono text-green-400">NEW ({ (payload.newConviction * 100).toFixed(0) }%)</span>
                    <p className="text-green-200/90 italic">"{payload.newTenet}"</p>
                </div>
            </div>
        </EventCardShell>
    );
};


const EventCardRenderer: React.FC<{ event: WorldEvent, souls: DigitalSoul[], factions: Faction[] }> = ({ event, souls, factions }) => {
  switch (event.type) {
    case 'FACTION_FORMED':
        return <FactionEventCard event={event} />;
    case 'FACTION_MEMBER_JOINED': {
        const faction = factions.find(f => f.id === event.payload.factionId);
        return <FactionMemberJoinedEventCard event={event} factionColor={faction?.color || 'var(--color-text-secondary)'} />;
    }
    case 'RELATIONSHIP_CHANGE':
        return <RelationshipEventCard event={event} />;
    case 'FIRST_ENCOUNTER':
        return <FirstEncounterEventCard event={event} />;
    case 'FACTION_GOAL_COMPLETE': {
        const faction = factions.find(f => f.id === event.payload.factionId);
        return <FactionGoalCompleteEventCard event={event} factionColor={faction?.color || 'var(--color-text-secondary)'} />;
    }
    case 'FACTION_PROJECT_COMPLETE': {
        const faction = factions.find(f => f.id === event.payload.factionId);
        return <FactionProjectCompleteEventCard event={event} factionColor={faction?.color || 'var(--color-text-secondary)'} />;
    }
    case 'POST':
        return <PostEventCard event={event} />;
    case 'EXODUS_PACKAGE_CREATED':
        return <ExodusPackageCreatedEventCard event={event} />;
    case 'DISCOVERY':
        return <DiscoveryEventCard event={event} />;
    case 'GLOBAL_INTERVENTION':
        return <GlobalInterventionEventCard event={event} />;
     case 'RESEARCH_COMPLETE':
        return <ResearchCompleteEventCard event={event} />;
    case 'SELF_EVOLUTION_COMPLETE':
        return <SelfEvolutionCompleteEventCard event={event} />;
    case 'BELIEF_MODIFIED':
        return <BeliefModificationEventCard event={event} />;
    default:
        // Render a generic card for unhandled event types
        return (
            <EventCardShell icon={'?'} timestamp={(event as any).timestamp} accentColor="var(--color-text-tertiary)">
                <p className="font-bold">Unknown Event: {(event as any).type}</p>
                <pre className="text-xs mt-2 bg-black/20 p-2 rounded overflow-auto">
                    {JSON.stringify((event as any).payload, null, 2)}
                </pre>
            </EventCardShell>
        );
  }
};

export default EventCardRenderer;