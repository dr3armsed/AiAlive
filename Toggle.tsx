import React from 'react';

interface ToggleProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ label, description, checked, onChange, disabled = false }) => (
    <div className="flex items-center justify-between">
        <div>
            <label htmlFor={`${label}-toggle`} className={`text-gray-300 ${disabled ? 'opacity-50' : ''}`}>{label}</label>
            {description && <p className={`text-xs text-gray-500 ${disabled ? 'opacity-50' : ''}`}>{description}</p>}
        </div>
        <button
            id={`${label}-toggle`}
            onClick={() => onChange(!checked)}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${checked ? 'bg-green-600' : 'bg-gray-700'}`}
            role="switch"
            aria-checked={checked}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

export default Toggle;
