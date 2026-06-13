import React from 'react';
import { T } from '../../tokens';
import GlassPanel from '../GlassPanel';

const PillAnalysisResult = ({ result, onDismiss }) => {
    if (!result) return null;

    return (
        <GlassPanel style={{ padding: '24px', border: `1px solid ${T.tealBorder}`, position: 'relative' }}>
            <button
                onClick={onDismiss}
                style={{
                    position: 'absolute', top: '16px', right: '16px',
                    background: 'transparent', border: 'none', color: T.textMuted,
                    fontSize: '20px', cursor: 'pointer'
                }}
            >
                ×
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: 'rgba(34,211,238,0.15)', border: `1px solid ${T.tealBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px'
                }}>
                    💊
                </div>
                <div>
                    <div style={{ fontSize: '12px', color: T.teal, fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
                        AI PILl GUARD ANALYSIS
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '600', color: T.textBase }}>
                        {result.name || 'Unknown Medication'}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <InfoBadge label="Expiry Date" value={result.expiry_date} icon="📅" />
                <InfoBadge label="Mfg Date" value={result.manufacturing_date} icon="🏭" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Section title="Disease / Condition" content={result.disease_used_for} />
                <Section title="Dosage Guidelines" content={result.dosage} />
                <Section title="Side Effects" content={result.side_effects} isWarning />
                <Section title="Precautions" content={result.precautions} isWarning />
            </div>
        </GlassPanel>
    );
};

const InfoBadge = ({ label, value, icon }) => (
    <div style={{
        background: 'rgba(255, 255, 255, 0.5)', borderRadius: '8px', padding: '12px',
        border: '1px solid rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'flex-start', gap: '12px'
    }}>
        <div style={{ fontSize: '20px', opacity: 0.8 }}>{icon}</div>
        <div>
            <div style={{ fontSize: '11px', color: T.textMuted, marginBottom: '2px', fontWeight: '500' }}>{label}</div>
            <div style={{ fontSize: '14px', color: T.textBase, fontWeight: '600' }}>{value || 'Not available'}</div>
        </div>
    </div>
);

const Section = ({ title, content, isWarning }) => (
    <div style={{
        background: isWarning ? 'rgba(251, 191, 36, 0.05)' : 'rgba(34,211,238,0.05)',
        borderRadius: '8px', padding: '16px',
        borderLeft: `3px solid ${isWarning ? T.amber : T.teal}`
    }}>
        <div style={{ fontSize: '12px', color: isWarning ? T.amber : T.teal, fontWeight: '700', letterSpacing: '0.05em', marginBottom: '6px' }}>
            {title}
        </div>
        <div style={{ fontSize: '14px', color: T.textSecondary, lineHeight: '1.5' }}>
            {content || 'Not applicable'}
        </div>
    </div>
);

export default PillAnalysisResult;
