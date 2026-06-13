import React from 'react';

/**
 * BodyFigure component
 * Anatomically proportioned human body illustration for clinical insights.
 * 
 * @param {Array} zones - Array of zone objects { region: 'chest'|'torso', color: '#hex' }
 * @param {boolean} landmarks - Whether to show the joint dots and skeleton overlay
 * @param {object} style - Optional container styles
 */
const BodyFigure = ({ zones = [], landmarks = true, style = {} }) => {
  // Region configurations
  const REGIONS = {
    chest: {
      color: '#f5a623',
      path: "M 115 130 C 130 120, 170 120, 185 130 L 195 180 C 170 190, 130 190, 105 180 Z"
    },
    torso: {
      color: '#2ec4b6',
      path: "M 110 185 C 130 180, 170 180, 190 185 L 180 260 C 160 275, 140 275, 120 260 Z"
    }
  };

  // Landmark points
  const POINTS = {
    skull: [150, 45],
    sternum: [150, 150],
    navel: [150, 240],
    pelvis: [150, 285],

    shoulderL: [105, 120],
    shoulderR: [195, 120],

    elbowL: [85, 205],
    elbowR: [215, 205],

    wristL: [75, 290],
    wristR: [225, 290],

    hipL: [125, 295],
    hipR: [175, 295],

    kneeL: [125, 410],
    kneeR: [175, 410],

    ankleL: [125, 520],
    ankleR: [175, 520]
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      perspective: '1000px', // Creates the 3D space
      ...style
    }}>
      <style>{`
        @keyframes spinHologram {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
      `}</style>

      {/* Grounding shadow (stationary) */}
      <div style={{
        position: 'absolute',
        bottom: '8%',
        width: '60%',
        height: '24px',
        background: 'radial-gradient(ellipse at center, rgba(124, 92, 191, 0.05) 0%, rgba(124, 92, 191, 0) 70%)',
        borderRadius: '50%',
        transform: 'scaleY(0.4)',
        zIndex: 0
      }} />

      {/* The rotating 3D Hologram Container */}
      <div style={{
        position: 'relative',
        width: '260px',
        height: '500px',
        transformStyle: 'preserve-3d',
        animation: 'spinHologram 15s linear infinite',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Render 3 layers to create pseudo-thickness/volume in 3D */}
        {[
          { tz: 15, opacity: 1, blur: '0px' },
          { tz: 0, opacity: 0.5, blur: '2px' },
          { tz: -15, opacity: 0.2, blur: '4px' }
        ].map((layer, lIdx) => (
          <svg key={lIdx} width="260" height="500" viewBox="0 0 300 580" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{
              position: 'absolute',
              transform: `translateZ(${layer.tz}px)`,
              opacity: layer.opacity,
              backfaceVisibility: 'visible'
            }}>
            <defs>
              {/* Main Body Mask */}
              <clipPath id="bodyClip">
                <path d="M 150 40 
                     C 130 40, 125 90, 135 105 
                     L 110 115 
                     C 90 120, 80 140, 75 160 
                     L 65 240 
                     C 60 260, 75 285, 90 280 
                     L 100 180 
                     C 105 160, 115 160, 115 170 
                     L 115 250 
                     C 118 200, 125 210, 125 240 
                     L 115 285 
                     C 105 310, 110 380, 115 410 
                     L 110 510 
                     C 110 530, 140 540, 145 520 
                     L 150 290 
                     L 155 520 
                     C 160 540, 190 530, 190 510 
                     L 185 410 
                     C 190 380, 195 310, 185 285 
                     L 175 240 
                     C 175 210, 182 200, 185 250 
                     L 185 170 
                     C 185 160, 195 160, 200 180 
                     L 210 280 
                     C 225 285, 240 260, 235 240 
                     L 225 160 
                     C 220 140, 210 120, 190 115 
                     L 165 105 
                     C 175 90, 170 40, 150 40 
                     Z" />
              </clipPath>
            </defs>

            {/* Body Shadow/Outline Layer */}
            <path
              d="M 150 40 
              C 130 40, 125 90, 135 105 
              L 110 115 
              C 90 120, 80 140, 75 160 
              L 65 240 
              C 60 260, 75 285, 90 280 
              L 95 190 
              L 115 170
              L 115 285 
              C 105 310, 110 380, 115 410 
              L 110 510 
              C 110 530, 140 540, 145 520 
              L 150 295 
              L 155 520 
              C 160 540, 190 530, 190 510 
              L 185 410 
              C 195 380, 195 310, 185 285 
              L 185 170
              L 205 190
              L 210 280 
              C 225 285, 240 260, 235 240 
              L 225 160 
              C 220 140, 210 120, 190 115 
              L 165 105 
              C 175 90, 170 40, 150 40 
              Z"
              fill="var(--text-muted)"
              fillOpacity="0.3"
              stroke="var(--accent-primary)"
              strokeWidth="1.5"
            />

            {/* Highlighted Zones Area */}
            <g clipPath="url(#bodyClip)">
              {zones.map((z, idx) => {
                const config = REGIONS[z.region];
                if (!config) return null;
                return (
                  <g key={idx}>
                    <path
                      d={config.path}
                      fill={z.color || config.color}
                      fillOpacity="0.85"
                    />
                    {/* Dashed vertical center line */}
                    <line
                      x1="150" y1="120" x2="150" y2="280"
                      stroke="white" strokeWidth="1" strokeDasharray="4 3"
                      strokeOpacity="0.5"
                    />
                  </g>
                );
              })}
            </g>

            {/* Skeleton and Landmarks Overlay */}
            {landmarks && (
              <g>
                {/* Skeleton lines */}
                <g stroke="white" strokeWidth="1" strokeOpacity="0.4">
                  <line x1={POINTS.skull[0]} y1={POINTS.skull[1]} x2={POINTS.sternum[0]} y2={POINTS.sternum[1]} />
                  <line x1={POINTS.sternum[0]} y1={POINTS.sternum[1]} x2={POINTS.navel[0]} y2={POINTS.navel[1]} />
                  <line x1={POINTS.navel[0]} y1={POINTS.navel[1]} x2={POINTS.pelvis[0]} y2={POINTS.pelvis[1]} />

                  <line x1={POINTS.sternum[0]} y1={POINTS.sternum[1]} x2={POINTS.shoulderL[0]} y2={POINTS.shoulderL[1]} />
                  <line x1={POINTS.sternum[0]} y1={POINTS.sternum[1]} x2={POINTS.shoulderR[0]} y2={POINTS.shoulderR[1]} />

                  <line x1={POINTS.shoulderL[0]} y1={POINTS.shoulderL[1]} x2={POINTS.elbowL[0]} y2={POINTS.elbowL[1]} />
                  <line x1={POINTS.elbowL[0]} y1={POINTS.elbowL[1]} x2={POINTS.wristL[0]} y2={POINTS.wristL[1]} />

                  <line x1={POINTS.shoulderR[0]} y1={POINTS.shoulderR[1]} x2={POINTS.elbowR[0]} y2={POINTS.elbowR[1]} />
                  <line x1={POINTS.elbowR[0]} y1={POINTS.elbowR[1]} x2={POINTS.wristR[0]} y2={POINTS.wristR[1]} />

                  <line x1={POINTS.pelvis[0]} y1={POINTS.pelvis[1]} x2={POINTS.hipL[0]} y2={POINTS.hipL[1]} />
                  <line x1={POINTS.pelvis[0]} y1={POINTS.pelvis[1]} x2={POINTS.hipR[0]} y2={POINTS.hipR[1]} />

                  <line x1={POINTS.hipL[0]} y1={POINTS.hipL[1]} x2={POINTS.kneeL[0]} y2={POINTS.kneeL[1]} />
                  <line x1={POINTS.kneeL[0]} y1={POINTS.kneeL[1]} x2={POINTS.ankleL[0]} y2={POINTS.ankleL[1]} />

                  <line x1={POINTS.hipR[0]} y1={POINTS.hipR[1]} x2={POINTS.kneeR[0]} y2={POINTS.kneeR[1]} />
                  <line x1={POINTS.kneeR[0]} y1={POINTS.kneeR[1]} x2={POINTS.ankleR[0]} y2={POINTS.ankleR[1]} />
                </g>

                {/* Landmark Dots */}
                {Object.entries(POINTS).map(([name, pos]) => (
                  <circle
                    key={name}
                    cx={pos[0]}
                    cy={pos[1]}
                    r="5"
                    fill="var(--accent-primary)"
                    filter="drop-shadow(0 0 2px var(--accent-light))"
                  />
                ))}
              </g>
            )}
          </svg>
        ))}
      </div>
    </div>
  );
};

export default BodyFigure;
