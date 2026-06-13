export const PATIENTS = [
  {
    id: 'P-00142',
    name: 'Arjun Mehta',
    age: 58,
    sex: 'Male',
    dob: '12 Mar 1967',
    diagnosis: ['Type 2 Diabetes', 'Hypertension', 'CKD Stage 2'],
    doctor: 'Dr. Priya Nair',
    ward: 'Endocrinology',
    riskScore: 78,
    adherenceScore: 61,
    medications: [
      { name:'Metformin',   dose:'500mg', freq:'Twice daily', color:'#22D3EE', shape:'Round',  markings:'MF500'  },
      { name:'Amlodipine',  dose:'5mg',   freq:'Once daily',  color:'#FBBF24', shape:'Oval',   markings:'AML5'   },
      { name:'Lisinopril',  dose:'10mg',  freq:'Once daily',  color:'#F87171', shape:'Round',  markings:'LIS10'  },
    ],
    labs: {
      HbA1c:       [{ date:'Sep 24', val:7.1 }, { date:'Nov 24', val:7.8 }, { date:'Jan 25', val:8.3 },
                    { date:'Mar 25', val:8.9 }, { date:'May 25', val:9.2 }, { date:'Jul 25', val:8.6 }],
      Creatinine:  [{ date:'Sep 24', val:1.1 }, { date:'Nov 24', val:1.2 }, { date:'Jan 25', val:1.4 },
                    { date:'Mar 25', val:1.6 }, { date:'May 25', val:1.7 }, { date:'Jul 25', val:1.9 }],
      BP_Systolic: [{ date:'Sep 24', val:132 }, { date:'Nov 24', val:138 }, { date:'Jan 25', val:141 },
                    { date:'Mar 25', val:145 }, { date:'May 25', val:148 }, { date:'Jul 25', val:143 }],
    },
    bodyFlags: ['Kidney', 'Heart'],
    clinicalPatterns: [
      { type: 'Lab Alert', time: '2h ago', description: 'HbA1c increased to 8.6% over 6 months.', severity: 'HIGH' },
      { type: 'Vitals', time: '5h ago', description: 'Blood pressure remains elevated despite medication.', severity: 'MEDIUM' },
      { type: 'Adherence', time: '1d ago', description: 'Missed 3 doses of Lisinopril this week.', severity: 'MEDIUM' },
      { type: 'Renal', time: '2d ago', description: 'Creatinine showing steady upward trend.', severity: 'HIGH' }
    ],
    adherenceCalendar: [false, true, false, false, true, true, false],
    consultBrief: 'Non-compliant with meds. BP elevated.',
  },
  {
    id: 'P-00284',
    name: 'Kavitha Rajan',
    age: 45,
    sex: 'Female',
    dob: '05 Aug 1980',
    diagnosis: ['Rheumatoid Arthritis', 'Anaemia'],
    doctor: 'Dr. Ananya Sharma',
    ward: 'Rheumatology',
    riskScore: 45,
    adherenceScore: 92,
    medications: [
      { name:'Methotrexate', dose:'15mg', freq:'Once weekly', color:'#818CF8', shape:'Capsule', markings:'MTX15' },
      { name:'Folic Acid',  dose:'5mg', freq:'Once daily',  color:'#34D399', shape:'Round',   markings:'FA5'   },
    ],
    labs: {
      ESR: [{ date:'Sep 24', val:45 }, { date:'Nov 24', val:38 }, { date:'Jan 25', val:30 },
            { date:'Mar 25', val:28 }, { date:'May 25', val:22 }, { date:'Jul 25', val:18 }],
      Hemoglobin: [{ date:'Sep 24', val:9.5 }, { date:'Nov 24', val:10.2 }, { date:'Jan 25', val:11.0 },
                   { date:'Mar 25', val:11.5 }, { date:'May 25', val:12.1 }, { date:'Jul 25', val:12.5 }],
    },
    bodyFlags: ['Joints'],
    clinicalPatterns: [
      { type: 'Lab Good', time: '12h ago', description: 'ESR steadily decreasing, reduced inflammation.', severity: 'LOW' },
      { type: 'Lab Good', time: '1d ago', description: 'Hemoglobin levels returning to normal range.', severity: 'LOW' }
    ],
    adherenceCalendar: [true, true, true, false, true, true, true],
    consultBrief: 'Responding well to therapy. Continue current regimen.',
  },
];
 
export const PILL_SCAN_EVENTS = [
  { id: 1, status: 'confirmed', drug: 'Metformin', time: '08:00 AM' },
  { id: 2, status: 'wrong', drug: 'Lisinopril', time: '08:05 AM', expected: 'Amlodipine' },
  { id: 3, status: 'unconfirmed', drug: 'Unknown', time: '12:00 PM' },
  { id: 4, status: 'confirmed', drug: 'Amlodipine', time: '08:00 PM' },
];

export const DRUG_INTERACTIONS = [
  { drugA: 'Lisinopril', drugB: 'Amlodipine', severity: 'low', desc: 'Monitor blood pressure.' },
  { drugA: 'Metformin', drugB: 'Amlodipine', severity: 'none', desc: 'No known interaction.' },
  { drugA: 'Methotrexate', drugB: 'Folic Acid', severity: 'none', desc: 'Beneficial interaction.' },
  { drugA: 'Metformin', drugB: 'Lisinopril', severity: 'none', desc: 'No known interaction.' },
  { drugA: 'Methotrexate', drugB: 'NSAID', severity: 'high', desc: 'Increased methotrexate toxicity risk.' },
  { drugA: 'Lisinopril', drugB: 'NSAID', severity: 'medium', desc: 'Reduced antihypertensive effect.' },
];
