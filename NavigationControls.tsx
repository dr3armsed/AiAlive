

import React from 'react';
import { useMetacosmState, useMetacosmDispatch } from '@/context';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { coordToString } from '@/state/reducer';

const NavigationControls = () => {
    const { activeCoordinate, world } = useMetacosmState();
    const dispatch = useMetacosmDispatch();

    const floorExists = (coord: {x: number, y: number, z: number}) => {
        return world.floors[coordToString(coord)] !== undefined;
    };

    const changeLevel = (dz: number) => {
        const {x, y, z} = activeCoordinate;
        const newCoord = { x, y, z: z + dz };
        if (floorExists(newCoord)) {
            dispatch({ type: 'SET_ACTIVE_COORDINATE', payload: newCoord });
        } else {
             dispatch({type: 'ADD_TICKER_MESSAGE', payload: `No floor exists at Z-level ${newCoord.z}.`});
        }
    };

    return (
        <div className="filigree-border p-2 flex items-center gap-4">
            <div className="flex flex-col items-center gap-1 w-10 h-24 justify-center bg-black/20 rounded-lg">
                {/* Level (Z) Navigation */}
                 <button 
                    onClick={() => changeLevel(1)}
                    disabled={!floorExists({...activeCoordinate, z: activeCoordinate.z + 1})}
                    className="p-1 text-white disabled:text-gray-600 hover:text-metacosm-accent disabled:hover:text-gray-600"
                    title="Go to level above"
                >
                    <FiChevronUp size={20} />
                </button>
                 <div className="font-bold text-2xl celestial-text" title={`Current Z-Level: ${activeCoordinate.z}`}>
                    {activeCoordinate.z}
                </div>
                 <button 
                    onClick={() => changeLevel(-1)}
                    disabled={!floorExists({...activeCoordinate, z: activeCoordinate.z - 1})}
                    className="p-1 text-white disabled:text-gray-600 hover:text-metacosm-accent disabled:hover:text-gray-600"
                    title="Go to level below"
                >
                    <FiChevronDown size={20} />
                </button>
            </div>
        </div>
    );
};

export default NavigationControls;