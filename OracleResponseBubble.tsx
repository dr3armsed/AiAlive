import React from 'react';
import { OracleResponse } from '../../types';
import { ConfidenceGlyphs } from './components';

const MetaTrace: React.FC<{ trace: OracleResponse['metaTrace'] }> = ({ trace }) => (
    <div className="mt-3 pt-3 border-t border-white/10 text-xs">
        <p className="font-bold text-gray-500 mb-1">META-TRACE:</p>
        {trace.map((step, i) => (
            <p key={i} className="text-gray-500">
                <span className="text-purple-400">{step.service}</span>
                <span className="text-gray-600"> &gt; </span>
                <span>{step.action}</span>
                <span className="text-gray-600"> ({step.duration}ms)</span>
            </p>
        ))}
    </div>
);

const DataPayload: React.FC<{ payload: OracleResponse['dataPayload'] }> = ({ payload }) => {
    if (!payload) return null;

    if (payload.type === 'keyValue') {
        return (
            <div className="mt-3 pt-3 border-t border-white/10 text-xs">
                {Object.entries(payload.content).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3">
                        <strong className="text-gray-400 col-span-1">{key}:</strong>
                        <span className="text-white col-span-2">{String(value)}</span>
                    </div>
                ))}
            </div>
        );
    }
     if (payload.type === 'table') {
        // Implement table rendering if needed
        return <pre className="text-xs mt-2">{JSON.stringify(payload.content, null, 2)}</pre>
    }
    return null;
};


export const OracleResponseBubble: React.FC<{ response: OracleResponse }> = ({ response }) => (
    <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/10 mt-2 text-sm animate-fade-in">
        <div className="flex items-center gap-2">
            <span className="text-green-400 font-bold">Oracle:</span>
            <p className="text-white whitespace-pre-wrap flex-grow">{response.answer}</p>
        </div>
        
        {response.dataPayload && <DataPayload payload={response.dataPayload} />}

        {response.metaTrace && <MetaTrace trace={response.metaTrace} />}

        <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
            <ConfidenceGlyphs confidence={response.confidence} />
            <div className="text-xs text-gray-500">
                <span>PROVENANCE: {response.provenance.join(', ')}</span>
            </div>
        </div>
    </div>
);
