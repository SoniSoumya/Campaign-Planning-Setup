import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Badge, Button, Card, Header, Input, Select, TextArea } from './components/UI';
import { SegmentPicker, TemplatePicker } from './components/Pickers';
import { seedActivityLogs, seedAgents, seedProgram, segments, stageOrder, STAGES, templates } from './data/mockData';

const statusTone = { Live: 'green', Draft: 'yellow', Paused: 'red' };

const defaultAgent = (programId, stage) => ({
  id: `agent-${Math.random().toString(16).slice(2)}`,
  programId,
  stage,
  name: `${stage} Agent`,
  description: '',
  status: 'Draft',
  startDate: '2026-03-26',
  endDate: '2026-12-31',
  goalEvent: '',
  strategyNotes: '',
  segmentId: segments[0].id,
  holdoutPct: 5,
  channels: [],
  channelPriority: [],
  templatesByChannel: {},
  guardrails: { inheritDnd: true, dndWindow: '22:00 - 08:00', maxMessages: 3, stopOnGoal: true, sendCap: 10000 },
  performance7d: { sent: 0, reached: 0, converted: 0 },
  history: ['Agent created as draft']
});

export default function App() {
  const [programs, setPrograms] = useState([seedProgram]);
  const [agents, setAgents] = useState(seedAgents);
  const [activityLogs, setActivityLogs] = useState(seedActivityLogs);
  const [route, setRoute] = useState({ page: 'programs' });

  const activeProgram = programs.find((p) => p.id === route.programId);
  const activeAgent = agents.find((a) => a.id === route.agentId);

  const upsertAgent = (updated) => setAgents((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));

  const createProgram = (programDraft) => {
    const id = `program-${Math.random().toString(16).slice(2, 8)}`;
    const newProgram = { ...programDraft, id, status: 'Draft', lastModified: '2026-03-26', kpis: { reach: 0, conversions: 0, conversionRate: 0, revenueLift: 0 }, trend: [] };
    const newAgents = STAGES.map((stage) => defaultAgent(id, stage));
    setPrograms((p) => [newProgram, ...p]);
    setAgents((a) => [...a, ...newAgents]);
    setActivityLogs((l) => ({ ...l, [id]: [{ ts: '2026-03-26 10:02', text: 'Program created from Lifecycle AI.' }] }));
    setRoute({ page: 'programDetail', programId: id, tab: 'overview' });
  };

  return (
    <div className="min-h-screen bg-ctBg p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex gap-2">
          <Button variant={route.page === 'programs' ? 'primary' : 'secondary'} onClick={() => setRoute({ page: 'programs' })}>Lifecycle Programs</Button>
          <Button variant={route.page === 'agents' ? 'primary' : 'secondary'} onClick={() => setRoute({ page: 'agents' })}>Stage Agents</Button>
        </div>
        {route.page === 'programs' && <ProgramsList programs={programs} agents={agents} onOpen={(id) => setRoute({ page: 'programDetail', programId: id, tab: 'overview' })} onCreate={() => setRoute({ page: 'createProgram', step: 0 })} />}
        {route.page === 'createProgram' && <CreateProgram onCancel={() => setRoute({ page: 'programs' })} onCreate={createProgram} />}
        {route.page === 'programDetail' && activeProgram && (
          <ProgramDetail program={activeProgram} agents={agents.filter((a) => a.programId === activeProgram.id).sort((a, b) => stageOrder[a.stage] - stageOrder[b.stage])}
            tab={route.tab} logs={activityLogs[activeProgram.id] || []}
            onTab={(tab) => setRoute((r) => ({ ...r, tab }))}
            onOpenAgent={(id) => setRoute({ page: 'agentDetail', programId: activeProgram.id, agentId: id, tab: 'overview', step: 0 })}
            onPause={(id) => upsertAgent({ ...agents.find((a) => a.id === id), status: 'Paused' })}
            onUpdateProgram={(next) => setPrograms((p) => p.map((x) => (x.id === next.id ? next : x)))}
          />
        )}
        {route.page === 'agents' && <AgentsList agents={agents} programs={programs} onOpen={(agent) => setRoute({ page: 'agentDetail', programId: agent.programId, agentId: agent.id, tab: 'overview', step: 0 })} />}
        {route.page === 'agentDetail' && activeAgent && activeProgram && (
          <AgentDetail agent={activeAgent} program={activeProgram} tab={route.tab} step={route.step || 0}
            onTab={(tab) => setRoute((r) => ({ ...r, tab }))} onStep={(step) => setRoute((r) => ({ ...r, step }))}
            onUpdate={(agent) => upsertAgent(agent)} onBack={() => setRoute({ page: 'programDetail', programId: activeProgram.id, tab: 'overview' })} />
        )}
      </div>
    </div>
  );
}

function ProgramsList({ programs, agents, onOpen, onCreate }) {
  const [q, setQ] = useState('');
  const filtered = programs.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  return <>
    <Header title="Lifecycle Programs" subtitle="Programs are containers for stage-level Lifecycle AI agents." actions={<Button onClick={onCreate}>Create Program</Button>} />
    <Input placeholder="Search program" value={q} onChange={(e) => setQ(e.target.value)} />
    <div className="mt-4 grid gap-3">
      {filtered.map((p) => {
        const count = agents.filter((a) => a.programId === p.id).length;
        return <Card key={p.id} className="cursor-pointer" onClick={() => onOpen(p.id)}>
          <div className="flex items-center justify-between"><div><h3 className="font-semibold">{p.name}</h3><p className="text-sm text-slate-500">{p.description}</p></div><Badge tone={statusTone[p.status] || 'slate'}>{p.status}</Badge></div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
            <p>Stage agents: <b>{count}</b></p><p>Owner: <b>{p.owner}</b></p><p>Last modified: <b>{p.lastModified}</b></p><p>KPI Conversion: <b>{p.kpis.conversionRate}%</b></p>
          </div>
        </Card>;
      })}
    </div>
  </>;
}

function CreateProgram({ onCancel, onCreate }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({ name: '', description: '', businessUnit: '', region: '', timezone: 'America/New_York', owner: '', stages: STAGES, sharedDefaults: { dndWindow: '22:00 - 08:00', startDate: '2026-04-01', endDate: '2026-12-31', frequencyPreset: 'Moderate', allowedChannels: ['Push', 'Email'], inheritDnd: true } });
  return <>
    <Header title="Create Lifecycle Program" subtitle="Configure container-level defaults, then manage each stage agent independently." actions={<Button variant="secondary" onClick={onCancel}>Cancel</Button>} />
    <Card>
      <p className="mb-2 text-sm text-slate-500">Step {step + 1} of 4</p>
      {step === 0 && <div className="grid gap-3 md:grid-cols-2"><Input placeholder="Program name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /><Input placeholder="Business unit / brand" value={draft.businessUnit} onChange={(e) => setDraft({ ...draft, businessUnit: e.target.value })} /><Input placeholder="Market / region" value={draft.region} onChange={(e) => setDraft({ ...draft, region: e.target.value })} /><Input placeholder="Owner" value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })} /><div className="md:col-span-2"><TextArea rows={3} placeholder="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div></div>}
      {step === 1 && <div><p className="mb-2 text-sm">Included lifecycle stages</p><div className="grid gap-2 md:grid-cols-4">{STAGES.map((s) => <Card key={s}><p className="text-sm font-medium">{s}</p></Card>)}</div></div>}
      {step === 2 && <div className="grid gap-3 md:grid-cols-2"><Input value={draft.timezone} onChange={(e) => setDraft({ ...draft, timezone: e.target.value })} /><Input value={draft.sharedDefaults.dndWindow} onChange={(e) => setDraft({ ...draft, sharedDefaults: { ...draft.sharedDefaults, dndWindow: e.target.value } })} /><Input type="date" value={draft.sharedDefaults.startDate} onChange={(e) => setDraft({ ...draft, sharedDefaults: { ...draft.sharedDefaults, startDate: e.target.value } })} /><Input type="date" value={draft.sharedDefaults.endDate} onChange={(e) => setDraft({ ...draft, sharedDefaults: { ...draft.sharedDefaults, endDate: e.target.value } })} /><Select value={draft.sharedDefaults.frequencyPreset} onChange={(e) => setDraft({ ...draft, sharedDefaults: { ...draft.sharedDefaults, frequencyPreset: e.target.value } })}><option>Conservative</option><option>Moderate</option><option>Aggressive</option></Select></div>}
      {step === 3 && <div className="space-y-2 text-sm"><p><b>{draft.name || 'Untitled Program'}</b></p><p>{draft.description || 'No description'}</p><p>Timezone: {draft.timezone}</p><p>Default DND: {draft.sharedDefaults.dndWindow}</p><p>Shared stages: {draft.stages.join(', ')}</p></div>}
    </Card>
    <div className="sticky bottom-3 mt-4 flex justify-between rounded-xl border border-slate-200 bg-white p-3">
      <Button variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))}>Back</Button>
      {step < 3 ? <Button onClick={() => setStep((s) => s + 1)}>Continue</Button> : <Button onClick={() => onCreate(draft)}>Review & Create</Button>}
    </div>
  </>;
}

function ProgramDetail({ program, agents, tab, onTab, onOpenAgent, onPause, onUpdateProgram, logs }) {
  const tabs = ['overview', 'stageAgents', 'sharedSettings', 'activity'];
  return <>
    <p className="mb-2 text-sm text-slate-500">Lifecycle Programs / {program.name}</p>
    <Header title={program.name} subtitle={program.description} actions={<Badge tone={statusTone[program.status]}>{program.status}</Badge>} />
    <div className="mb-4 flex gap-2">{tabs.map((t) => <Button key={t} variant={tab === t ? 'primary' : 'secondary'} onClick={() => onTab(t)}>{t}</Button>)}</div>
    {tab === 'overview' && <ProgramOverview program={program} agents={agents} onOpenAgent={onOpenAgent} onPause={onPause} />}
    {tab === 'stageAgents' && <Card><table className="w-full text-sm"><thead><tr className="text-left text-slate-500"><th>Name</th><th>Stage</th><th>Status</th><th>Audience</th><th /></tr></thead><tbody>{agents.map((a) => <tr key={a.id} className="border-t"><td className="py-2">{a.name}</td><td>{a.stage}</td><td><Badge tone={statusTone[a.status]}>{a.status}</Badge></td><td>{(segments.find((s) => s.id === a.segmentId)?.users || 0).toLocaleString()}</td><td><Button variant="secondary" onClick={() => onOpenAgent(a.id)}>Open</Button></td></tr>)}</tbody></table></Card>}
    {tab === 'sharedSettings' && <SharedSettings program={program} onSave={onUpdateProgram} />}
    {tab === 'activity' && <Card>{logs.map((l, i) => <div key={i} className="border-l-2 border-blue-200 pl-3 pb-3"><p className="text-xs text-slate-500">{l.ts}</p><p className="text-sm">{l.text}</p></div>)}</Card>}
  </>;
}

function ProgramOverview({ program, agents, onOpenAgent, onPause }) {
  return <div className="space-y-4">
    <div className="grid gap-3 md:grid-cols-4">
      <Card><p className="text-xs text-slate-500">Total Reach</p><p className="text-2xl font-semibold">{program.kpis.reach.toLocaleString()}</p></Card>
      <Card><p className="text-xs text-slate-500">Conversions</p><p className="text-2xl font-semibold">{program.kpis.conversions.toLocaleString()}</p></Card>
      <Card><p className="text-xs text-slate-500">Conversion Rate</p><p className="text-2xl font-semibold">{program.kpis.conversionRate}%</p></Card>
      <Card><p className="text-xs text-slate-500">Revenue Lift</p><p className="text-2xl font-semibold">+{program.kpis.revenueLift}%</p></Card>
    </div>
    <Card>
      <p className="mb-2 font-semibold">Journey map</p>
      <div className="grid gap-3 md:grid-cols-4">{agents.map((a, idx) => {
        const seg = segments.find((s) => s.id === a.segmentId);
        return <div key={a.id} className="relative rounded-lg border border-slate-200 p-3">
          {idx < agents.length - 1 && <div className="absolute right-[-12px] top-1/2 h-0.5 w-6 bg-slate-300" />}
          <p className="text-xs text-slate-500">{a.stage}</p><p className="font-medium">{a.name}</p><div className="my-1"><Badge tone={statusTone[a.status]}>{a.status}</Badge></div>
          <p className="text-xs">Audience: {seg?.users.toLocaleString()}</p><p className="text-xs">Goal: {a.goalEvent || 'Not set'}</p>
          <p className="text-xs">Channels: {a.channels.join(', ') || 'None'}</p>
          <p className="mt-1 text-xs text-slate-500">7d conv: {a.performance7d.converted.toLocaleString()}</p>
          <div className="mt-2 flex gap-1"><Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => onOpenAgent(a.id)}>Open</Button><Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => onOpenAgent(a.id)}>Edit</Button><Button variant="danger" className="px-2 py-1 text-xs" onClick={() => onPause(a.id)}>Pause</Button></div>
        </div>;
      })}</div>
    </Card>
    <Card>
      <p className="mb-2 font-semibold">Performance snapshot</p>
      <div className="h-60"><ResponsiveContainer><LineChart data={program.trend}><XAxis dataKey="day" /><YAxis /><Tooltip /><Line dataKey="converted" stroke="#2563eb" strokeWidth={2} /></LineChart></ResponsiveContainer></div>
    </Card>
    <Card>
      <p className="font-semibold">Shared defaults summary</p>
      <p className="text-sm text-slate-600">Timezone: {program.timezone} · DND: {program.sharedDefaults.dndWindow} · Frequency: {program.sharedDefaults.frequencyPreset}</p>
      {agents.some((a) => a.channels.length === 0) && <p className="mt-2 text-sm text-amber-700">Warning: one or more stage agents have no channels selected.</p>}
    </Card>
  </div>;
}

function SharedSettings({ program, onSave }) {
  const [draft, setDraft] = useState(program);
  return <Card className="space-y-3">
    <div className="grid gap-3 md:grid-cols-2"><Input value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })} /><Input value={draft.timezone} onChange={(e) => setDraft({ ...draft, timezone: e.target.value })} /><Input value={draft.sharedDefaults.dndWindow} onChange={(e) => setDraft({ ...draft, sharedDefaults: { ...draft.sharedDefaults, dndWindow: e.target.value } })} /><Select value={draft.sharedDefaults.frequencyPreset} onChange={(e) => setDraft({ ...draft, sharedDefaults: { ...draft.sharedDefaults, frequencyPreset: e.target.value } })}><option>Conservative</option><option>Moderate</option><option>Aggressive</option></Select></div>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.sharedDefaults.inheritDnd} onChange={(e) => setDraft({ ...draft, sharedDefaults: { ...draft.sharedDefaults, inheritDnd: e.target.checked } })} /> Enable DND inheritance for new agents</label>
    <Button onClick={() => onSave(draft)}>Save Shared Settings</Button>
  </Card>;
}

function AgentsList({ agents, programs, onOpen }) {
  const [q, setQ] = useState('');
  const filtered = agents.filter((a) => a.name.toLowerCase().includes(q.toLowerCase()));
  return <>
    <Header title="Stage Agents" subtitle="Configure stages independently while keeping journey-level visibility in programs." />
    <Input placeholder="Search agent" value={q} onChange={(e) => setQ(e.target.value)} />
    <Card className="mt-3">
      <table className="w-full text-sm"><thead><tr className="text-left text-slate-500"><th>Name</th><th>Program</th><th>Stage</th><th>Status</th><th /></tr></thead><tbody>{filtered.map((a) => <tr key={a.id} className="border-t"><td className="py-2">{a.name}</td><td>{programs.find((p) => p.id === a.programId)?.name || '-'}</td><td>{a.stage}</td><td><Badge tone={statusTone[a.status]}>{a.status}</Badge></td><td><Button variant="secondary" onClick={() => onOpen(a)}>Open</Button></td></tr>)}</tbody></table>
    </Card>
  </>;
}

function AgentDetail({ agent, program, tab, onTab, step, onStep, onUpdate, onBack }) {
  const tabs = ['overview', 'setup', 'content', 'history'];
  return <>
    <p className="mb-2 text-sm text-slate-500">Lifecycle Programs / {program.name} / {agent.name}</p>
    <Header title={agent.name} subtitle={`${agent.stage} stage agent`} actions={<Button variant="secondary" onClick={onBack}>Back to Program</Button>} />
    <div className="mb-4 flex gap-2">{tabs.map((t) => <Button key={t} variant={tab === t ? 'primary' : 'secondary'} onClick={() => onTab(t)}>{t}</Button>)}</div>
    {tab === 'overview' && <AgentOverview agent={agent} program={program} />}
    {tab === 'setup' && <AgentSetup agent={agent} program={program} step={step} onStep={onStep} onUpdate={onUpdate} />}
    {tab === 'content' && <AgentContent agent={agent} />}
    {tab === 'history' && <Card>{agent.history.map((h, i) => <p key={i} className="border-l-2 border-slate-200 pl-3 py-1 text-sm">{h}</p>)}</Card>}
  </>;
}

function AgentOverview({ agent, program }) {
  const seg = segments.find((s) => s.id === agent.segmentId);
  const data = [
    { metric: 'Sent', value: agent.performance7d.sent },
    { metric: 'Reached', value: agent.performance7d.reached },
    { metric: 'Converted', value: agent.performance7d.converted },
  ];
  return <div className="space-y-4"><Card><div className="grid gap-3 text-sm md:grid-cols-3"><p>Program: <b>{program.name}</b></p><p>Status: <Badge tone={statusTone[agent.status]}>{agent.status}</Badge></p><p>Goal: <b>{agent.goalEvent || '-'}</b></p><p>Audience size: <b>{seg?.users.toLocaleString()}</b></p><p>Holdout: <b>{agent.holdoutPct}%</b></p><p>Channels: <b>{agent.channels.join(', ') || 'None'}</b></p><p className="md:col-span-3">Guardrails: max {agent.guardrails.maxMessages} messages/user · send cap {agent.guardrails.sendCap.toLocaleString()} · {agent.guardrails.inheritDnd ? 'Inherited from program defaults' : `DND ${agent.guardrails.dndWindow}`}</p></div></Card><Card><p className="mb-2 font-semibold">Last 7 days performance</p><div className="h-56"><ResponsiveContainer><BarChart data={data}><XAxis dataKey="metric" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#2563eb" /></BarChart></ResponsiveContainer></div></Card></div>;
}

function AgentContent({ agent }) {
  return <Card>
    <div className="mb-2 flex items-center justify-between"><p className="font-semibold">Selected channel templates</p><div className="flex gap-2"><Button variant="secondary">Browse Content Library</Button><Button>Edit selected templates</Button></div></div>
    {agent.channels.map((c) => <div key={c} className="mb-2 rounded-lg border border-slate-200 p-3"><p className="font-medium">{c}</p><p className="text-sm text-slate-600">{(agent.templatesByChannel[c] || []).length ? (agent.templatesByChannel[c] || []).join(', ') : 'No templates selected for this enabled channel'}</p></div>)}
  </Card>;
}

function AgentSetup({ agent, program, step, onStep, onUpdate }) {
  const [draft, setDraft] = useState(agent);
  const [segmentOpen, setSegmentOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateChannel, setTemplateChannel] = useState('Push');
  const stages = ['Basics', 'Goal & Strategy', 'Audience', 'Content', 'Guardrails', 'Review & Publish'];

  const segment = segments.find((s) => s.id === draft.segmentId);
  const reachable = useMemo(() => draft.channels.reduce((acc, ch) => acc + (segment?.reachable[ch] || 0), 0), [draft.channels, segment]);
  const holdoutSize = Math.round((segment?.users || 0) * (draft.holdoutPct / 100));
  const warnings = [
    draft.channels.length === 0 && 'No channels selected.',
    draft.channels.some((ch) => !(draft.templatesByChannel[ch] || []).length) && 'No templates selected for one or more enabled channels.',
    draft.holdoutPct > 25 && 'Holdout is high and may slow learning.',
    (segment?.users || 0) < 5000 && 'Estimated audience may be too small for stable optimization.',
    draft.channels.some((ch) => (segment?.reachable[ch] || 0) === 0) && 'No reachable users on at least one selected channel.',
  ].filter(Boolean);

  const toggleChannel = (ch) => {
    const enabled = draft.channels.includes(ch);
    const channels = enabled ? draft.channels.filter((c) => c !== ch) : [...draft.channels, ch];
    const channelPriority = channels.filter((c) => draft.channelPriority.includes(c)).concat(channels.filter((c) => !draft.channelPriority.includes(c)));
    setDraft({ ...draft, channels, channelPriority });
  };

  const reorder = (idx, dir) => {
    const arr = [...draft.channelPriority];
    const next = idx + dir;
    if (next < 0 || next >= arr.length) return;
    [arr[idx], arr[next]] = [arr[next], arr[idx]];
    setDraft({ ...draft, channelPriority: arr });
  };

  const save = (status) => {
    const updated = { ...draft, status, history: [`${status === 'Live' ? 'Published' : 'Saved draft'} at setup`, ...(agent.history || [])] };
    setDraft(updated);
    onUpdate(updated);
  };

  return <>
    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
      <Card>{stages.map((s, i) => <button key={s} className={`mb-2 w-full rounded-lg px-3 py-2 text-left text-sm ${step === i ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`} onClick={() => onStep(i)}>{i + 1}. {s}</button>)}</Card>
      <Card>
        {step === 0 && <div className="grid gap-3 md:grid-cols-2"><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /><Input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /><Select value={draft.stage} onChange={(e) => setDraft({ ...draft, stage: e.target.value })}>{STAGES.map((s) => <option key={s}>{s}</option>)}</Select><Select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}><option>Draft</option><option>Live</option><option>Paused</option></Select><Input type="date" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} /><Input type="date" value={draft.endDate} onChange={(e) => setDraft({ ...draft, endDate: e.target.value })} /></div>}
        {step === 1 && <div className="space-y-3"><Input placeholder="Primary goal event" value={draft.goalEvent} onChange={(e) => setDraft({ ...draft, goalEvent: e.target.value })} /><TextArea rows={4} placeholder="Strategy notes" value={draft.strategyNotes} onChange={(e) => setDraft({ ...draft, strategyNotes: e.target.value })} /></div>}
        {step === 2 && <div className="space-y-3"><div className="flex items-center justify-between"><p className="font-medium">Target segment</p><Button variant="secondary" onClick={() => setSegmentOpen(true)}>Browse Segments</Button></div><p className="text-sm">{segment?.name}</p><a href="#" className="text-sm text-blue-600">Open in Segments</a><div className="grid gap-3 md:grid-cols-2"><Input type="number" value={draft.holdoutPct} onChange={(e) => setDraft({ ...draft, holdoutPct: Number(e.target.value) })} /><Input value={(segment?.users || 0).toLocaleString()} readOnly /></div><p className="text-sm text-slate-600">Estimated reachable audience: {reachable.toLocaleString()}</p></div>}
        {step === 3 && <div className="space-y-3"><p className="font-medium">Enabled channels</p><div className="flex flex-wrap gap-2">{['Push', 'Email', 'SMS', 'WhatsApp', 'In-App'].map((ch) => <button key={ch} className={`rounded-full border px-3 py-1 text-sm ${draft.channels.includes(ch) ? 'border-blue-600 bg-blue-100 text-blue-700' : 'border-slate-300'}`} onClick={() => toggleChannel(ch)}>{ch}</button>)}</div><p className="font-medium">Channel priority order</p>{draft.channelPriority.map((ch, idx) => <div key={ch} className="flex items-center justify-between rounded-lg border p-2 text-sm"><span>{idx + 1}. {ch}</span><div className="flex gap-1"><Button variant="secondary" className="px-2 py-1" onClick={() => reorder(idx, -1)}>↑</Button><Button variant="secondary" className="px-2 py-1" onClick={() => reorder(idx, 1)}>↓</Button><Button variant="ghost" className="px-2 py-1" onClick={() => { setTemplateChannel(ch); setTemplateOpen(true); }}>Browse Content Library</Button></div></div>)}<a href="#" className="text-sm text-blue-600">Open in Content Library</a></div>}
        {step === 4 && <div className="grid gap-3 md:grid-cols-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.guardrails.inheritDnd} onChange={(e) => setDraft({ ...draft, guardrails: { ...draft.guardrails, inheritDnd: e.target.checked } })} /> Inherit shared DND from program</label><Input value={draft.guardrails.dndWindow} disabled={draft.guardrails.inheritDnd} onChange={(e) => setDraft({ ...draft, guardrails: { ...draft.guardrails, dndWindow: e.target.value } })} /><Input type="number" value={draft.guardrails.maxMessages} onChange={(e) => setDraft({ ...draft, guardrails: { ...draft.guardrails, maxMessages: Number(e.target.value) } })} /><Input type="number" value={draft.guardrails.sendCap} onChange={(e) => setDraft({ ...draft, guardrails: { ...draft.guardrails, sendCap: Number(e.target.value) } })} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.guardrails.stopOnGoal} onChange={(e) => setDraft({ ...draft, guardrails: { ...draft.guardrails, stopOnGoal: e.target.checked } })} /> Stop messaging when goal is achieved</label><p className="text-xs text-slate-500">Program default DND: {program.sharedDefaults.dndWindow}</p></div>}
        {step === 5 && <div className="space-y-2 text-sm"><p className="font-semibold">Review</p><p>Estimated audience: {(segment?.users || 0).toLocaleString()}</p><p>Estimated reachable audience: {reachable.toLocaleString()}</p><p>Holdout size: {holdoutSize.toLocaleString()}</p><p className="text-slate-600">Publishing will make this agent eligible for execution.</p>{warnings.map((w) => <p key={w} className="text-amber-700">⚠ {w}</p>)}</div>}
      </Card>
    </div>
    <div className="sticky bottom-3 mt-4 flex justify-between rounded-xl border border-slate-200 bg-white p-3">
      <Button variant="secondary" onClick={() => onStep(Math.max(0, step - 1))}>Back</Button>
      <div className="flex gap-2"><Button variant="secondary" onClick={() => save('Draft')}>Save Draft</Button>{step < 5 ? <Button onClick={() => onStep(step + 1)}>Continue</Button> : <Button onClick={() => save('Live')}>Publish</Button>}</div>
    </div>
    <SegmentPicker open={segmentOpen} segments={segments} onClose={() => setSegmentOpen(false)} onSelect={(id) => { setDraft({ ...draft, segmentId: id }); setSegmentOpen(false); }} />
    <TemplatePicker open={templateOpen} templates={templates} onClose={() => setTemplateOpen(false)} selected={draft.templatesByChannel[templateChannel] || []} onSelect={(id) => setDraft({ ...draft, templatesByChannel: { ...draft.templatesByChannel, [templateChannel]: [...new Set([...(draft.templatesByChannel[templateChannel] || []), id])] } })} />
  </>;
}
