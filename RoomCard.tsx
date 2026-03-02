
import React from 'react';

const RoomCard: React.FC<any> = (props) => {
  return (
    <div className="p-2 border rounded border-dashed border-yellow-400">
      <p className="text-yellow-400 text-xs">Placeholder: RoomCard</p>
      {Object.keys(props).length > 0 && (
        <pre className="text-xs mt-2 text-yellow-600">{JSON.stringify(props, null, 2)}</pre>
      )}
    </div>
  );
};

export default RoomCard;
