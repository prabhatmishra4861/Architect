import React, { createContext, useState, useContext } from 'react';

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const [walls, setWalls] = useState([]);

  return (
    <RoomContext.Provider value={{ walls, setWalls }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => useContext(RoomContext);
