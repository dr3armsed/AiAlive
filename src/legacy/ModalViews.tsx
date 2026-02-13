import React from 'react';

export const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#2a2a2e] p-6 rounded-lg border border-gray-600 max-w-sm w-full">
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 mb-6">{message}</p>
                <div className="flex justify-end gap-4">
                    <button onClick={onCancel} className="px-4 py-2 rounded-md font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-md font-semibold text-white bg-red-600 hover:bg-red-500">Confirm</button>
                </div>
            </div>
        </div>
    );
};
