import React, { createContext, useContext } from 'react';

export const DemoContext = createContext(null);

export const useDemoContext = () => {
  return useContext(DemoContext);
};
