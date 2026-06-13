import React from 'react';
import { T } from '../tokens';

const LiveDot = ({ color = T.teal, size = 8 }) => {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: color,
      animation: 'livePulse 2s infinite ease-in-out',
      display: 'inline-block',
      boxShadow: `0 0 8px ${color}`
    }} />
  );
};

export default LiveDot;
