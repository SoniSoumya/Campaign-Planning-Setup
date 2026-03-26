export const STAGES = ['Activation', 'First Transaction', 'Repeat', 'Win-back'];

export const segments = [
  { id: 'seg-1', name: 'Signed up in last 7 days but not activated', users: 42000, reachable: { Push: 31000, Email: 36000, SMS: 9000, WhatsApp: 5000, 'In-App': 41000 } },
  { id: 'seg-2', name: 'Activated but no purchase in 14 days', users: 26800, reachable: { Push: 21000, Email: 24000, SMS: 7000, WhatsApp: 6200, 'In-App': 25500 } },
  { id: 'seg-3', name: 'Purchased once in last 30 days', users: 18200, reachable: { Push: 14500, Email: 16000, SMS: 5200, WhatsApp: 4300, 'In-App': 15000 } },
  { id: 'seg-4', name: 'No purchase in last 45 days', users: 13900, reachable: { Push: 9800, Email: 11200, SMS: 6300, WhatsApp: 7100, 'In-App': 7600 } },
];

export const templates = [
  { id: 'tmp-1', name: 'Finish setup reminder', channel: 'Push', status: 'Approved' },
  { id: 'tmp-2', name: 'Welcome benefits', channel: 'Email', status: 'Approved' },
  { id: 'tmp-3', name: 'First order offer', channel: 'WhatsApp', status: 'Approved' },
  { id: 'tmp-4', name: 'We miss you', channel: 'SMS', status: 'Draft' },
  { id: 'tmp-5', name: 'Resume onboarding', channel: 'In-App', status: 'Approved' },
  { id: 'tmp-6', name: 'Repeat purchase nudges', channel: 'Push', status: 'Approved' },
  { id: 'tmp-7', name: 'Return and save', channel: 'Email', status: 'Approved' },
];

export const seedProgram = {
  id: 'program-1',
  name: 'User Lifecycle Journey',
  description: 'Cross-channel journey from sign-up to repeat and reactivation.',
  businessUnit: 'D2C Commerce',
  region: 'North America',
  timezone: 'America/New_York',
  owner: 'Anita Rao',
  status: 'Live',
  lastModified: '2026-03-25',
  stages: STAGES,
  sharedDefaults: {
    dndWindow: '22:00 - 08:00',
    startDate: '2026-03-20',
    endDate: '2026-12-31',
    frequencyPreset: 'Moderate',
    allowedChannels: ['Push', 'Email', 'SMS', 'WhatsApp', 'In-App'],
    inheritDnd: true,
  },
  kpis: { reach: 128400, conversions: 8420, conversionRate: 6.5, revenueLift: 12.8 },
  trend: [
    { day: 'Mon', converted: 980 },
    { day: 'Tue', converted: 1120 },
    { day: 'Wed', converted: 1210 },
    { day: 'Thu', converted: 1170 },
    { day: 'Fri', converted: 1290 },
    { day: 'Sat', converted: 1360 },
    { day: 'Sun', converted: 1290 },
  ]
};

export const seedAgents = [
  {
    id: 'agent-1',
    programId: 'program-1',
    stage: 'Activation',
    name: 'New User Activation',
    description: 'Drive app onboarding completion.',
    status: 'Live',
    startDate: '2026-03-20',
    endDate: '2026-12-31',
    goalEvent: 'onboarding_completed',
    strategyNotes: 'Prioritize push + in-app in first 48 hours.',
    segmentId: 'seg-1',
    holdoutPct: 5,
    channels: ['Push', 'Email', 'In-App'],
    channelPriority: ['Push', 'In-App', 'Email'],
    templatesByChannel: { Push: ['tmp-1'], Email: ['tmp-2'], 'In-App': ['tmp-5'] },
    guardrails: { inheritDnd: true, dndWindow: '22:00 - 08:00', maxMessages: 4, stopOnGoal: true, sendCap: 50000 },
    performance7d: { sent: 42000, reached: 36700, converted: 3180 },
    history: ['Created agent', 'Published by Anita Rao']
  },
  {
    id: 'agent-2', programId: 'program-1', stage: 'First Transaction', name: 'Drive First Order', description: 'Move activated users to first purchase.',
    status: 'Draft', startDate: '2026-03-21', endDate: '2026-12-31', goalEvent: 'first_purchase', strategyNotes: 'Mix email + WhatsApp incentive.',
    segmentId: 'seg-2', holdoutPct: 10, channels: ['Email', 'WhatsApp'], channelPriority: ['WhatsApp', 'Email'],
    templatesByChannel: { Email: ['tmp-2'], WhatsApp: ['tmp-3'] }, guardrails: { inheritDnd: true, dndWindow: '22:00 - 08:00', maxMessages: 5, stopOnGoal: true, sendCap: 30000 },
    performance7d: { sent: 16300, reached: 14200, converted: 820 }, history: ['Created agent']
  },
  {
    id: 'agent-3', programId: 'program-1', stage: 'Repeat', name: 'Boost Repeat Purchase', description: 'Encourage second and third order.',
    status: 'Live', startDate: '2026-03-22', endDate: '2026-12-31', goalEvent: 'repeat_purchase', strategyNotes: 'Use push urgency messaging.',
    segmentId: 'seg-3', holdoutPct: 8, channels: ['Push', 'Email'], channelPriority: ['Push', 'Email'],
    templatesByChannel: { Push: ['tmp-6'], Email: ['tmp-7'] }, guardrails: { inheritDnd: false, dndWindow: '21:00 - 09:00', maxMessages: 3, stopOnGoal: true, sendCap: 18000 },
    performance7d: { sent: 12200, reached: 10900, converted: 940 }, history: ['Created agent', 'Updated DND override']
  },
  {
    id: 'agent-4', programId: 'program-1', stage: 'Win-back', name: 'Dormant Win-back', description: 'Re-engage dormant users with offers.',
    status: 'Paused', startDate: '2026-03-23', endDate: '2026-12-31', goalEvent: 'purchase', strategyNotes: 'SMS fallback when push unreachable.',
    segmentId: 'seg-4', holdoutPct: 15, channels: ['SMS', 'Email'], channelPriority: ['SMS', 'Email'],
    templatesByChannel: { SMS: ['tmp-4'], Email: ['tmp-7'] }, guardrails: { inheritDnd: true, dndWindow: '22:00 - 08:00', maxMessages: 2, stopOnGoal: true, sendCap: 12000 },
    performance7d: { sent: 9800, reached: 7300, converted: 340 }, history: ['Created agent', 'Paused by Anita Rao']
  },
];

export const seedActivityLogs = {
  'program-1': [
    { ts: '2026-03-25 16:42', text: 'Shared defaults updated: default frequency set to Moderate.' },
    { ts: '2026-03-25 13:10', text: 'Agent Dormant Win-back paused.' },
    { ts: '2026-03-24 11:02', text: 'Program published and made eligible for execution.' },
  ]
};

export const stageOrder = {
  Activation: 0,
  'First Transaction': 1,
  Repeat: 2,
  'Win-back': 3,
};
