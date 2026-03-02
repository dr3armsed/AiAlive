import React from 'react';
import { useId } from '../../packages/react-chimera-renderer/index.ts';
import UsersIcon from '../icons/UsersIcon';

const AccessibleFormPanel: React.FC = () => {
    const nameId = useId();
    const emailId = useId();
    const termsId = useId();

    return (
        <div className="glass-panel p-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-teal-400" />
                Accessible Form (`useId`)
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                This form uses the `useId` hook to generate stable, unique IDs, ensuring that labels are correctly associated with inputs. This is critical for accessibility and prevents errors during hydration.
            </p>
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                <div>
                    <label htmlFor={nameId} className="block text-sm font-medium text-gray-300 mb-1">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id={nameId}
                        className="w-full bg-black/20 border-2 border-[var(--color-border-primary)] rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-[var(--color-border-interactive)] transition-colors"
                        placeholder="Enter your name"
                    />
                </div>
                <div>
                    <label htmlFor={emailId} className="block text-sm font-medium text-gray-300 mb-1">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id={emailId}
                        className="w-full bg-black/20 border-2 border-[var(--color-border-primary)] rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-[var(--color-border-interactive)] transition-colors"
                        placeholder="your@email.com"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id={termsId}
                        className="h-4 w-4 rounded bg-black/20 border-[var(--color-border-primary)] text-purple-500 focus:ring-purple-500"
                    />
                    <label htmlFor={termsId} className="text-sm text-gray-300">
                        I agree to the terms and conditions
                    </label>
                </div>
            </form>
        </div>
    );
};

export default AccessibleFormPanel;