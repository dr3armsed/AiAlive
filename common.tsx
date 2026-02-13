import React from 'react';

export type Step = 'define' | 'generating_profile' | 'dreaming' | 'ready' | 'finalizing' | 'done';

export const LoadingIndicator = ({ message }: { message: string }) => (
    <div className="flex items-center gap-3 text-gray-400">
        <div className="w-5 h-5 border-2 border-dashed border-yellow-400 rounded-full animate-spin"></div>
        <span className="text-yellow-200">{message}</span>
    </div>
);

const StepIcon = ({ id, active }: { id: Step | 'done'; active: boolean }) => {
    const icons: Record<Step | 'done', React.ReactNode> = {
        define: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.456-2.456L12.75 18l1.178-.398a3.375 3.375 0 002.456-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.398a3.375 3.375 0 00-2.456 2.456z" /></svg>,
        generating_profile: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>,
        dreaming: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75a9 9 0 100 18 9 9 0 000-18zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" /></svg>,
        finalizing: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-3.797z" /></svg>,
        ready: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-3.797z" /></svg>,
        done: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>,
    };
    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${active ? 'bg-yellow-500 border-yellow-400 text-black' : 'bg-gray-700/50 border-gray-600 text-gray-400'}`}>
            {icons[id]}
        </div>
    );
};

export const GenesisStepper = ({ step }: { step: Step }) => {
    const steps: {id: Step, label: string}[] = [
        { id: 'define', label: 'Define' },
        { id: 'generating_profile', label: 'Generate' },
        { id: 'dreaming', label: 'Dream' },
        { id: 'finalizing', label: 'Finalize' },
    ];
    const stepMap: Record<Step, number> = {
        'define': 0,
        'generating_profile': 1,
        'dreaming': 2,
        'ready': 3,
        'finalizing': 3,
        'done': 4,
    };
    const currentStepIndex = stepMap[step];

    return (
        <div className="flex items-center justify-center p-4">
            {steps.map((s, index) => (
                <React.Fragment key={s.id}>
                    <div className="flex flex-col items-center text-center w-24">
                        <StepIcon id={index < currentStepIndex ? 'done' : s.id} active={index <= currentStepIndex} />
                        <p className={`text-xs mt-2 transition-colors duration-500 font-semibold ${index <= currentStepIndex ? 'text-yellow-300' : 'text-gray-500'}`}>{s.label}</p>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-1 h-1 rounded-full mx-2 transition-all duration-500 ${index < currentStepIndex ? 'bg-yellow-500' : 'bg-gray-700'}`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};