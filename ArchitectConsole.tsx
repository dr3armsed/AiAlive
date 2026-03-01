import React from 'react';
import { useMetacosmState, useMetacosmDispatch } from '@/context';
import type { FileAttachment, PrivateChatId, ViewId, ProposedEgregore, ConjureParams, MetacosmState, SpectreState } from '@/types';
import ArchitecturalSanctum from '@/components/ArchitecturalSanctum';
import { AnimatePresence, motion } from 'framer-motion';
import { SanctumIcon, SaveIcon, WorkbenchIcon, MuseumIcon, ObservatoryIcon, SurveillanceIcon, FrfIcon, SystemIntegrityIcon, UsersIcon, ProjectsIcon, BookOpenIcon, PauseIcon, MessageSquareIcon, FactionIcon, DataStructureIcon, SettingsIcon, CoreIcon, BlueprintIcon } from '@/components/icons';
import clsx from 'clsx';
import AiWorkbench from '@/views/AiWorkbench';
import ArtifactMuseum from '@/views/ArtifactMuseum';
import DataObservatory from '@/views/DataObservatory';
import ChatHistoryView from '@/views/ChatHistoryView';
import FRFMatrix from '@/views/FRFMatrix';
import SystemIntegrity from '@/views/SystemIntegrity';
import UserRegistryView from '@/views/UserRegistryView';
import ProjectsView from '@/views/ProjectsView';
import SystemTicker from '@/components/SystemTicker';
import WorksArchiveView from '@/views/WorksArchiveView';
import PublicChatConsole from '@/components/PublicChatConsole';
import ForumView from '@/views/ForumView';
import FactionsView from '@/views/FactionsView';
import SpectreBrowserView from '@/views/SpectreBrowserView';
import SystemOptionsView from '@/views/SystemOptionsView';
import SaveLoadManagerView from '@/views/SaveLoadManagerView';
import ContinuityLogView from '@/views/ContinuityLogView';
import SystemLocusView from '@/views/SystemLocusView';

interface ArchitectConsoleProps {
    onSendToPublicChat: (text: string, files: FileAttachment[]) => void;
    onSendToPrivateChat: (chatId: PrivateChatId, text: string, files: FileAttachment[]) => void;
    onConjure: (params: ConjureParams) => void;
    onPause: () => void;
    onLoadState: (state: Partial<MetacosmState> | null) => void;
    onOpenSpectreLocus: () => void;
    spectreState: SpectreState;
    setSpectreState: React.Dispatch<React.SetStateAction<SpectreState>>;
}

interface NavItemProps {
    viewId: ViewId | string;
    label: string;
    icon: React.ReactNode;
    activeView?: ViewId;
    onClick: (view: ViewId | string) => void;
    isAction?: boolean;
    isActive?: boolean;
}

const NavItem = ({ viewId, label, icon, activeView, onClick, isAction, isActive }: NavItemProps) => (
    <button
        onClick={() => onClick(viewId)}
        className={clsx(
            "flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 group relative",
            (activeView === viewId && !isAction) || isActive ? 'bg-amber-400/20 text-metacosm-accent' : 'text-gray-400 hover:text-white hover:bg-white/10'
        )}
        aria-label={label}
    >
        {icon}
        <span className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
            {label}
        </span>
    </button>
);

function ArchitectConsole({
    onSendToPublicChat,
    onSendToPrivateChat,
    onConjure,
    onPause,
    onLoadState,
    onOpenSpectreLocus,
    spectreState,
    setSpectreState
}: ArchitectConsoleProps) {
    const { activeView, is_blueprint_mode_active } = useMetacosmState();
    const dispatch = useMetacosmDispatch();
    
    const handleNavClick = (viewOrAction: ViewId | string) => {
        if (viewOrAction === 'spectre_locus') {
            onOpenSpectreLocus();
        } else if (viewOrAction === 'blueprint_mode') {
            dispatch({ type: 'TOGGLE_BLUEPRINT_MODE' });
        } else {
            dispatch({ type: 'SET_ACTIVE_VIEW', payload: viewOrAction as ViewId });
        }
    };
    
    const viewComponents: Record<ViewId, React.ReactElement> = {
        sanctum: <ArchitecturalSanctum />,
        workbench: <AiWorkbench onConjure={onConjure} onSendToPrivateChat={onSendToPrivateChat} />,
        museum: <ArtifactMuseum />,
        observatory: <DataObservatory />,
        surveillance: <ChatHistoryView onSendToPrivateChat={onSendToPrivateChat} />,
        frf_matrix: <FRFMatrix />,
        system_integrity: <SystemIntegrity />,
        registry: <UserRegistryView />,
        projects_chronicle: <ProjectsView />,
        works_archive: <WorksArchiveView />,
        factions: <FactionsView />,
        spectre_browser: <SpectreBrowserView />,
        system_options: <SystemOptionsView />,
        save_load_manager: <SaveLoadManagerView onLoadState={onLoadState} />,
        forum: <ForumView />,
        continuity_log: <ContinuityLogView />,
        system_locus: <SystemLocusView />,
    };

    const renderView = () => {
        return viewComponents[activeView] || viewComponents.sanctum;
    };

    return (
        <main className="h-full w-full flex bg-black/50 relative">
            {/* Sidebar Navigation */}
            <nav className="h-full flex flex-col items-center justify-between p-2 bg-black/30 border-r border-white/10 z-10">
                <div className="flex flex-col items-center gap-2">
                    <NavItem viewId="sanctum" label="Architectural Sanctum" icon={<SanctumIcon />} activeView={activeView} onClick={handleNavClick} />
                    <NavItem viewId="blueprint_mode" label="Blueprint Mode" icon={<BlueprintIcon />} onClick={handleNavClick} isActive={is_blueprint_mode_active} isAction />
                    <NavItem viewId="surveillance" label="Private Surveillance" icon={<SurveillanceIcon />} activeView={activeView} onClick={handleNavClick} />
                    <NavItem viewId="forum" label="Public Forum" icon={<MessageSquareIcon />} activeView={activeView} onClick={handleNavClick} />
                    <NavItem viewId="workbench" label="AI Workbench" icon={<WorkbenchIcon />} activeView={activeView} onClick={handleNavClick} />
                    <NavItem viewId="factions" label="Factions" icon={<FactionIcon />} activeView={activeView} onClick={handleNavClick} />
                    <NavItem viewId="museum" label="Legendary Museum" icon={<MuseumIcon />} activeView={activeView} onClick={handleNavClick} />
                    <NavItem viewId="observatory" label="Data Observatory" icon={<ObservatoryIcon />} activeView={activeView} onClick={handleNavClick} />
                    <NavItem viewId="projects_chronicle" label="Projects Chronicle" icon={<ProjectsIcon />} activeView={activeView} onClick={handleNavClick} />
                    <NavItem viewId="works_archive" label="Works Archive" icon={<BookOpenIcon />} activeView={activeView} onClick={handleNavClick} />
                    <NavItem viewId="frf_matrix" label="FRF Matrix" icon={<FrfIcon />} activeView={activeView} onClick={handleNavClick} />
                    <NavItem viewId="system_integrity" label="System Integrity" icon={<SystemIntegrityIcon />} activeView={activeView} onClick={handleNavClick} />
                    <NavItem viewId="continuity_log" label="Continuity Log" icon={<ProjectsIcon />} activeView={activeView} onClick={handleNavClick} />
                    <NavItem viewId="system_locus" label="System Locus" icon={<CoreIcon />} activeView={activeView} onClick={handleNavClick} />
                    <NavItem viewId="spectre_browser" label="Spectre Browser" icon={<DataStructureIcon />} activeView={activeView} onClick={handleNavClick} />
                    <NavItem viewId="spectre_locus" label="Spectre Locus" icon={<CoreIcon />} activeView={activeView} onClick={handleNavClick} isAction />
                    <NavItem viewId="registry" label="User Registry" icon={<UsersIcon />} activeView={activeView} onClick={handleNavClick} />
                </div>
                <div className="flex flex-col items-center gap-2">
                    <NavItem viewId="system_options" label="System Options" icon={<SettingsIcon />} activeView={activeView} onClick={handleNavClick} />
                    <NavItem viewId="save_load_manager" label="Save/Load Manager" icon={<SaveIcon />} activeView={activeView} onClick={handleNavClick} />
                </div>
            </nav>

            {/* Main Content Area */}
            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeView}
                        className="w-full h-full"
                        {...{
                            initial: { opacity: 0 },
                            animate: { opacity: 1 },
                            exit: { opacity: 0 },
                        }}
                    >
                        {renderView()}
                    </motion.div>
                </AnimatePresence>

                <div className="absolute top-6 right-6 z-50 flex items-center gap-2">
                    <SystemTicker />
                    <button
                        onClick={onPause}
                        className="relative p-3 rounded-full filigree-border bg-black/50 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Pause Menu"
                    >
                        <PauseIcon />
                    </button>
                </div>


                {!is_blueprint_mode_active && <PublicChatConsole onSend={onSendToPublicChat} spectreState={spectreState} setSpectreState={setSpectreState} />}
            </div>
        </main>
    );
}

export default ArchitectConsole;