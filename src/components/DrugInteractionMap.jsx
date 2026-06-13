import React, { useState, useEffect } from 'react';
import { T } from '../tokens';
import { fetchInteractions } from '../api';

const DrugInteractionMap = ({ patient }) => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [interactions, setInteractions] = useState([]);

  useEffect(() => {
    if (patient) {
      fetchInteractions(patient.id).then(setInteractions);
    }
  }, [patient]);

  if (!patient || !patient.medications) return null;

  const meds = patient.medications;
  const cx = 80;
  const cy = 80;
  const radius = 55;

  const nodes = meds.map((med, i) => {
    const angle = (i / meds.length) * 2 * Math.PI - Math.PI / 2; // start top
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    const baseColor = med.color.startsWith('#') ? med.color : T.teal;

    return { ...med, index: i, x, y, baseColor };
  });

  let nodeA = null;
  let nodeB = null;
  let conflictAlert = null;

  for (const inter of interactions) {
    if (inter.severity !== 'none') {
      const nA = nodes.find(n => n.name.toLowerCase() === inter.drug_a.toLowerCase());
      const nB = nodes.find(n => n.name.toLowerCase() === inter.drug_b.toLowerCase());
      if (nA && nB) {
        nodeA = nA;
        nodeB = nB;
        conflictAlert = inter;
        break; // just show one for now
      }
    }
  }

  const hasInteractionEdge = nodeA && nodeB;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <svg width="200" height="200" viewBox="0 0 160 160" style={{ filter: 'drop-shadow(0 0 10px rgba(115, 65, 234, 0.05))' }}>

        {/* Draw Edges (Center to Meds) */}
        {nodes.map(node => (
          <line
            key={`edge-c-${node.index}`}
            x1={cx} y1={cy} x2={node.x} y2={node.y}
            stroke={hoveredNode !== null && hoveredNode !== node.index ? 'rgba(157, 0, 255, 0.03)' : 'rgba(115, 65, 234, 0.1)'}
            strokeWidth="1.5"
            style={{ transition: 'stroke 0.3s ease' }}
          />
        ))}

        {/* Draw Interaction Edges with Glow */}
        {hasInteractionEdge && (
          <g>
            <line
              x1={nodeA.x} y1={nodeA.y} x2={nodeB.x} y2={nodeB.y}
              stroke={T.amber} strokeWidth="3" opacity="0.1" filter="blur(3px)"
            />
            <line
              x1={nodeA.x} y1={nodeA.y} x2={nodeB.x} y2={nodeB.y}
              stroke={T.amber} strokeWidth="1.5" strokeDasharray="4 2"
              style={{ animation: 'shimmer 2s infinite linear' }}
            />
          </g>
        )}

        {/* Draw Center Node */}
        <circle cx={cx} cy={cy} r="20" fill="rgba(255, 255, 255, 0.5)" stroke="rgba(157, 0, 255, 0.4)" strokeWidth="2" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill={T.teal} fontSize="11" fontWeight="800" fontFamily={T.fontMono}>PHM</text>

        {/* Draw Med Nodes */}
        {nodes.map(node => {
          const isFaded = hoveredNode !== null && hoveredNode !== node.index;
          return (
            <g
              key={`node-${node.index}`}
              onMouseEnter={() => setHoveredNode(node.index)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: 'pointer', transition: 'all 0.3s ease', opacity: isFaded ? 0.3 : 1 }}
            >
              <circle
                cx={node.x} cy={node.y} r="16"
                fill="rgba(255, 255, 255, 0.5)"
                stroke={node.baseColor} strokeWidth="2"
                style={{ filter: `drop-shadow(0 0 6px ${node.baseColor}44)` }}
              />
              <text
                x={node.x} y={node.y + 28}
                textAnchor="middle" fill={node.baseColor}
                fontSize="8" fontWeight="800" fontFamily={T.fontMono}
                textTransform="uppercase" letterSpacing="0.05em"
              >
                {node.name.substring(0, 7)}
              </text>
            </g>
          );
        })}
      </svg>

      {hasInteractionEdge && (
        <>
          <div style={{
            marginTop: '16px',
            fontSize: '10px',
            color: T.amber,
            fontWeight: '800',
            letterSpacing: '0.1em',
            fontFamily: T.fontMono,
            background: 'rgba(245, 158, 11, 0.05)',
            padding: '6px 12px',
            borderRadius: '4px',
            border: '1px solid rgba(245, 158, 11, 0.1)',
            textTransform: 'uppercase'
          }}>
            1 CONFLICT INITIALIZED
          </div>
          <div style={{ marginTop: '4px', fontSize: '9px', color: T.textSecondary, textAlign: 'center' }}>
            {conflictAlert?.desc}
          </div>
        </>
      )}
    </div>
  );
};

export default DrugInteractionMap;
