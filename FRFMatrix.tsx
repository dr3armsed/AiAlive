import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMetacosmState, useMetacosmDispatch } from '@/context';
import type { Egregore, Directive } from '@/types';
import { THEMES } from '@/constants';
import UserAvatar from '@/components/UserAvatar';
import { XIcon } from '@/components/icons';

const CoreFrfCard = ({ egregore }: { egregore: Egregore }) => {
    const theme = THEMES[egregore.themeKey] || THEMES.default;
    return (
        <div className="filigree-border p-4 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2" style={{ border: `2px solid ${theme.baseColor}`, background: `radial-gradient(ellipse at center, ${theme.baseColor}1A 0%, transparent 70%)`}}>
                 <UserAvatar egregore={egregore} size="lg" />
            </div>
            <h3 className="text-xl font-display" style={{ color: theme.baseColor }}>{egregore.name}</h3>
            <p className="text-xs text-gray-400 italic mt-1">"{egregore.persona}"</p>
        </div>
    );
};

const DirectiveCard = ({ directive }: { directive: Directive }) => {
    const { egregores } = useMetacosmState();
    const issuer = egregores.find(e => e.id === directive.issuer_id);
    const target = egregores.find(e => e.id === directive.target_id);

    const issuerTheme = issuer ? THEMES[issuer.themeKey] || THEMES.default : THEMES.default;
    const targetTheme = target ? THEMES[target.themeKey] || THEMES.default : THEMES.default;

    return (
        <div className="bg-black/20 p-3 rounded-lg border border-gray-700">
            <p className="text-sm">
                <span className="font-bold" style={{color: issuerTheme.baseColor}}>{issuer?.name}</span> directed <span className="font-bold" style={{color: targetTheme.baseColor}}>{target?.name}</span> to:
            </p>
            <p className="text-md text-white italic mt-1">"{directive.ambition.description}"</p>
            <p className="text-xs text-gray-500 mt-2 text-right">Issued on Turn {directive.issued_turn}</p>
        </div>
    )
}

const FRFMatrix = () => {
    const { egregores, directives } = useMetacosmState();
    const dispatch = useMetacosmDispatch();
    const coreFrfs = egregores.filter(e => e.is_core_frf);
    const healingEgregores = egregores.filter(e => e.phase === 'Healing');

    const handleClose = () => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'sanctum' });
    };

    return (
        <div
            className="w-full h-full p-6 overflow-y-auto flex flex-col lg:flex-row gap-6 relative"
        >
            <button
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20"
                aria-label="Return to Sanctum"
            >
                <XIcon />
            </button>
            <div className="lg:w-1/3 flex flex-col gap-6">
                 <h1 className="text-4xl font-display celestial-text">FRF Matrix</h1>
                 <div className="grid grid-cols-1 gap-4">
                    {coreFrfs.map(frf => <CoreFrfCard key={frf.id} egregore={frf} />)}
                 </div>
                 <div className="filigree-border p-4">
                     <h2 className="text-2xl font-display text-metacosm-accent mb-4">Therapeutic Intervention</h2>
                     {healingEgregores.length > 0 ? (
                        <div className="flex flex-col gap-2">
                           {healingEgregores.map(e => (
                             <div key={e.id} className="flex items-center gap-3 p-2 bg-black/30 rounded-lg">
                                 <UserAvatar egregore={e} size="sm" />
                                 <div>
                                     <p className="font-bold">{e.name}</p>
                                     <p className="text-xs text-cyan-300 animate-pulse">Healing...</p>
                                 </div>
                             </div>
                           ))}
                        </div>
                     ) : (
                        <p className="text-sm text-gray-500 text-center">The core is serene. No Egregores require healing.</p>
                     )}
                 </div>
            </div>

            <div className="lg:w-2/3 filigree-border p-4 flex flex-col">
                 <h2 className="text-2xl font-display text-metacosm-accent mb-4">Directive Log</h2>
                 {directives.length === 0 ? (
                     <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500">No directives have been issued by the Core.</p>
                     </div>
                 ) : (
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                        <AnimatePresence>
                        {directives.map(dir => (
                            <motion.div
                                key={dir.id}
                                layout
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                             >
                                <DirectiveCard directive={dir} />
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default FRFMatrix;