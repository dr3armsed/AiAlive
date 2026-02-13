import React from 'react';

type Tab = {
    id: string;
    label: string;
};

type OptionsTabsProps = {
    tabs: Tab[];
    activeTab: string;
    setActiveTab: (id: string) => void;
};

export const OptionsTabs: React.FC<OptionsTabsProps> = ({ tabs, activeTab, setActiveTab }) => (
    <div className="flex border-b border-amber-300/20 mb-4 overflow-x-auto">
        {tabs.map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-bold text-sm sm:text-base transition-colors whitespace-nowrap ${activeTab === tab.id ? 'text-white border-b-2 border-amber-400' : 'text-gray-400 hover:text-gray-200'}`}
            >
                {tab.label}
            </button>
        ))}
    </div>
);
