import React from 'react';
import { T } from '../tokens';

const Badge = ({ variant = 'default', children, style = {} }) => {
  let bgColor = T.borderSubtle;
  let color = T.textPrimary;
  
  switch (variant) {
    case 'critical':
    case 'red':
      bgColor = 'rgba(239, 68, 68, 0.1)';
      color = T.red;
      break;
    case 'warning':
    case 'amber':
      bgColor = 'rgba(245, 158, 11, 0.1)';
      color = T.amber;
      break;
    case 'success':
    case 'green':
      bgColor = 'rgba(16, 185, 129, 0.1)';
      color = T.green;
      break;
    case 'info':
    case 'teal':
      bgColor = 'rgba(115, 65, 234, 0.1)';
      color = T.teal;
      break;
    case 'purple':
      bgColor = 'rgba(139, 92, 246, 0.1)';
      color = T.purple;
      break;
    case 'indigo':
      bgColor = 'rgba(99, 102, 241, 0.1)';
      color = T.indigo;
      break;
    default:
      break;
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '10px',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      backgroundColor: bgColor,
      border: `1px solid ${color}44`,
      color: color,
      animation: (variant === 'critical' || variant === 'red') ? 'shimmer 2s infinite linear' : 'none',
      boxShadow: `0 0 10px ${color}11`,
      ...style
    }}>
      {children}
    </span>
  );
};

export default Badge;
