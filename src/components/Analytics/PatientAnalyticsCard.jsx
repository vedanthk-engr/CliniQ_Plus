import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const CARD_THEMES = [
  {
    bg: 'bg-brand-yellow',
    text: 'text-[#584400]',
    subText: 'text-[#715800]',
    badge: 'bg-white/50 text-[#584400] border-[#584400]/20',
    sparkColor: '#755b00',
    adherenceBar: 'bg-[#755b00]',
    blobColor: 'text-[#715800]'
  },
  {
    bg: 'bg-brand-pink',
    text: 'text-[#39071f]',
    subText: 'text-[#b56f89]',
    badge: 'bg-white/50 text-[#39071f] border-[#39071f]/20',
    sparkColor: '#39071f',
    adherenceBar: 'bg-[#39071f]',
    blobColor: 'text-[#b56f89]'
  },
  {
    bg: 'bg-brand-green',
    text: 'text-brand-sidebar',
    subText: 'text-brand-sidebar/70',
    badge: 'bg-white/50 text-brand-sidebar border-brand-sidebar/20',
    sparkColor: '#1b1c1a',
    adherenceBar: 'bg-brand-sidebar',
    blobColor: 'text-brand-sidebar/10'
  },
  {
    bg: 'bg-brand-blue',
    text: 'text-[#0a314d]',
    subText: 'text-[#205072]',
    badge: 'bg-white/50 text-[#0a314d] border-[#0a314d]/20',
    sparkColor: '#0a314d',
    adherenceBar: 'bg-[#0a314d]',
    blobColor: 'text-[#205072]/20'
  }
];

const PatientAnalyticsCard = ({ patient, index = 0 }) => {
  const theme = CARD_THEMES[index % CARD_THEMES.length];

  // Get the display label for a lab
  const getLabLabel = (key) => {
    if (key === 'BP_Systolic') return 'Blood Pressure';
    if (key === 'HbA1c') return 'HbA1c';
    if (key === 'Creatinine') return 'Creatinine';
    if (key === 'ESR') return 'ESR';
    if (key === 'Hemoglobin') return 'Hemoglobin';
    return key;
  };

  // Get the display unit for a lab
  const getLabUnit = (key) => {
    if (key === 'BP_Systolic') return ''; // displayed as value/85
    if (key === 'HbA1c') return '%';
    if (key === 'Creatinine') return ' mg/dL';
    if (key === 'ESR') return ' mm/hr';
    if (key === 'Hemoglobin') return ' g/dL';
    return '';
  };

  // Format value
  const getLabValue = (key, val) => {
    if (key === 'BP_Systolic') return `${val}/${Math.round(val * 0.6 + 10)}`; // mock diastolic
    return val;
  };

  return (
    <div className={`${theme.bg} rounded-[24px] p-6 relative overflow-hidden group shadow-sm transition-all hover:shadow-md`}>
      {/* Decorative Blob */}
      <svg className={`absolute -right-6 -bottom-6 w-32 h-32 ${theme.blobColor} opacity-20 pointer-events-none`} fill="currentColor" viewBox="0 0 100 100">
        <path d="M40 20 h20 v20 h20 v20 h-20 v20 h-20 v-20 h-20 v-20 h20 z" rx="4" ry="4"></path>
      </svg>

      <div className="relative z-10 flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
        
        {/* Patient Info */}
        <div className="min-w-[220px]">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className={`text-2xl font-black ${theme.text}`}>{patient.name}</h3>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${theme.badge}`}>
              {patient.riskScore >= 70 ? 'Elevated Risk' : patient.riskScore >= 50 ? 'Review Required' : 'Stable'}
            </span>
          </div>
          <p className={`text-xs font-bold ${theme.subText}`}>
            ID: {patient.id} • Age: {patient.age} • {patient.diagnosis?.[0] || 'Cardiac'}
          </p>
        </div>

        {/* Biometrics Grid */}
        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 w-full xl:w-auto">
          {Object.keys(patient.labs).slice(0, 3).map((labKey) => {
            const history = patient.labs[labKey];
            if (!history || history.length === 0) return null;
            const latestVal = history[history.length - 1].val;
            const displayVal = getLabValue(labKey, latestVal);
            const unit = getLabUnit(labKey);

            return (
              <div key={labKey} className="flex flex-col">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${theme.subText}`}>
                  {getLabLabel(labKey)}
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className={`text-2xl font-black ${theme.text}`}>
                    {displayVal}
                  </span>
                  <span className={`text-[11px] font-bold ${theme.subText}`}>
                    {unit}
                  </span>
                </div>
                {/* Sparkline */}
                <div className="w-full h-8 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history} margin={{ top: 2, bottom: 2, left: 2, right: 2 }}>
                      <defs>
                        <linearGradient id={`grad-${patient.id}-${labKey}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.sparkColor} stopOpacity={0.2}/>
                          <stop offset="95%" stopColor={theme.sparkColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area 
                        type="monotone" 
                        dataKey="val" 
                        stroke={theme.sparkColor} 
                        strokeWidth={2} 
                        fill={`url(#grad-${patient.id}-${labKey})`}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>

        {/* Adherence */}
        <div className="min-w-[150px] w-full xl:w-auto">
          <span className={`text-[11px] font-bold uppercase tracking-wider block mb-2 ${theme.subText}`}>
            Med Adherence
          </span>
          <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
            <div 
              className={`h-full ${theme.adherenceBar} rounded-full`} 
              style={{ width: `${patient.adherenceScore || 85}%` }}
            />
          </div>
          <div className={`text-right mt-1 text-xs font-black ${theme.text}`}>
            {patient.adherenceScore || 85}%
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientAnalyticsCard;
