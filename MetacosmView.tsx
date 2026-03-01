import React, { useContext, useRef, useState, useEffect } from 'react';
import { StateContext, DispatchContext } from './context';
import type { Action } from './types';
import ArchitecturalSanctum from './ArchitecturalSanctum';
import ChatInterface from './ChatInterface';
import { motion } from 'framer-motion';
import Minimap from './Minimap';
import { FileAttachment, Egregore, Room, Floor } from './types';
import { Window } from './Window';
import { SystemTicker } from './SystemTicker';
import { GlyphConductor } from './GlyphConductor';

interface MetacosmViewProps {
  onSend: (text: string, files: FileAttachment[]) => void;
}

const MetacosmView: React.FC<MetacosmViewProps> = ({ onSend }) => {
  const state = useContext(StateContext);
  const dispatch = useContext(DispatchContext) as React.Dispatch<Action>;
  const sanctumRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  
  const [windows, setWindows] = useState({
    chat: { z: 3, id: 'chat', title: 'Architect Console' },
    minimap: { z: 2, id: 'minimap', title: 'Minimap' },
    ticker: { z: 1, id: 'ticker', title: 'System Ticker' },
  });
  const [topZ, setTopZ] = useState(3);

  const bringToFront = (id: 'chat' | 'minimap' | 'ticker') => {
      const newTopZ = topZ + 1;
      setTopZ(newTopZ);
      setWindows(prev => ({
          ...prev,
          [id]: { ...prev[id], z: newTopZ }
      }));
  };

  if (!state || !dispatch) return null;

  const findRoomForEgregore = (egregore: Egregore, floor: Floor): Room | undefined => {
    return floor.rooms.find(room => 
      egregore.vector.x >= room.bounds.x &&
      egregore.vector.x <= room.bounds.x + room.bounds.width &&
      egregore.vector.y >= room.bounds.y &&
      egregore.vector.y <= room.bounds.y + room.bounds.height
    );
  };

  const handleRoomClick = (room: Room) => {
    if (!state.world.floors[state.activeFloor]) return;

    const egregoresInRoom = state.egregores.filter(e => {
      if (e.vector.z !== state.activeFloor) return false;
      const egregoreRoom = findRoomForEgregore(e, state.world.floors[state.activeFloor]);
      return egregoreRoom?.id === room.id;
    });
    
    if (egregoresInRoom.length > 0) {
      const mentions = egregoresInRoom.map(e => `@${e.name}`).join(' ');
      dispatch({ type: 'SET_PROMPT_INJECTION', payload: mentions });
    }
  };

  const handleCenterView = (coords: {x: number, y: number}) => {
    if (sanctumRef.current) {
        const container = sanctumRef.current;
        const targetX = coords.x * state.zoom - container.clientWidth / 2;
        const targetY = coords.y * state.zoom - container.clientHeight / 2;
        container.scrollTo({
            left: targetX,
            top: targetY,
            behavior: 'smooth'
        });
    }
  };

  const handleTargetSelect = (targetId: string) => {
    if (state.glyphTargetingMode) {
      dispatch({
        type: 'ACTIVATE_GLYPH',
        payload: { id: state.glyphTargetingMode, targetId },
      });
      dispatch({ type: 'SET_GLYPH_TARGETING_MODE', payload: null });
    }
  };

  const currentFloor = state.world.floors[state.activeFloor];
  const egregoresOnFloor = state.egregores.filter(e => e.vector.z === state.activeFloor);

  return (
    <div className={`w-full h-full relative overflow-hidden filigree-border transition-all duration-500 ${state.glyphTargetingMode ? 'glyph-targeting-active' : ''}`} ref={constraintsRef}>
        <div className="absolute inset-0" onClick={() => {
            if(state.glyphTargetingMode) {
                dispatch({ type: 'SET_GLYPH_TARGETING_MODE', payload: null });
                dispatch({ type: 'ADD_TICKER_MESSAGE', payload: '[Glyph Conductor]: Targeting cancelled.' });
            }
        }}>
            <ArchitecturalSanctum 
                ref={sanctumRef}
                floor={currentFloor} 
                egregores={egregoresOnFloor} 
                zoom={state.zoom}
                onRoomClick={handleRoomClick}
                world={state.world}
                factions={state.factions}
                anomalies={state.anomalies}
                great_works={state.great_works}
                automata={state.automata}
                glyphTargetingMode={state.glyphTargetingMode}
                onTargetSelect={handleTargetSelect}
            />
        </div>
        
        <motion.div drag dragMomentum={false} dragConstraints={constraintsRef} className="absolute top-8 left-8 z-20 cursor-move">
            <GlyphConductor />
        </motion.div>
        
        <motion.div drag dragMomentum={false} dragConstraints={constraintsRef} className="absolute bottom-8 left-8 z-20 cursor-move">
            <div className="flex flex-col gap-2">
                <button onClick={() => dispatch({type: 'ZOOM_IN'})} className="w-10 h-10 rounded-full btn btn-secondary flex items-center justify-center font-bold text-lg p-0">+</button>
                <button onClick={() => dispatch({type: 'ZOOM_OUT'})} className="w-10 h-10 rounded-full btn btn-secondary flex items-center justify-center font-bold text-xl p-0">-</button>
            </div>
        </motion.div>
        
        <Window 
          title={windows.minimap.title} 
          onFocus={() => bringToFront('minimap')} 
          zIndex={windows.minimap.z} 
          initialPosition={{ x: 100, y: 30 }} 
          initialSize={{ width: 208, height: 184 }}
          dragConstraintsRef={constraintsRef}
        >
          <Minimap world={state.world} egregores={state.egregores} activeFloor={state.activeFloor} onCenterView={handleCenterView} />
        </Window>

        <Window 
          title={windows.ticker.title} 
          onFocus={() => bringToFront('ticker')} 
          zIndex={windows.ticker.z} 
          initialPosition={{ x: 50, y: 500 }} 
          initialSize={{ width: 450, height: 200 }}
          dragConstraintsRef={constraintsRef}
        >
          <SystemTicker />
        </Window>

        <Window
            title={windows.chat.title}
            onFocus={() => bringToFront('chat')}
            zIndex={windows.chat.z}
            initialPosition={{ x: (constraintsRef.current?.clientWidth || 1200) - 520, y: 40 }}
            initialSize={{ width: 500, height: 'calc(100% - 80px)' }}
            dragConstraintsRef={constraintsRef}
        >
             <ChatInterface 
                messages={state.messages} 
                egregores={state.egregores}
                onSend={onSend}
                isLoading={state.isLoading}
                promptInjection={state.promptInjection}
                onClearInjection={() => dispatch({type: 'CLEAR_PROMPT_INJECTION'})}
            />
        </Window>
    </div>
  );
};

export default MetacosmView;
