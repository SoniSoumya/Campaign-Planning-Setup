import React, { useMemo, useState } from 'react';
import { Button, Card, Input, Badge } from './UI';

export function SegmentPicker({ open, segments, onClose, onSelect }) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => segments.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())), [q, segments]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
      <div className="h-full w-full max-w-xl overflow-auto bg-white p-4">
        <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold">Browse Segments</h3><Button variant="ghost" onClick={onClose}>Close</Button></div>
        <Input placeholder="Search segments" value={q} onChange={(e) => setQ(e.target.value)} />
        <a className="mt-2 inline-block text-sm text-blue-600" href="#">Open in Segments</a>
        <div className="mt-3 space-y-2">
          {filtered.map((s) => (
            <Card key={s.id} className="cursor-pointer" onClick={() => onSelect(s.id)}>
              <div className="flex items-center justify-between"><p className="font-medium">{s.name}</p><Badge>{s.users.toLocaleString()} users</Badge></div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TemplatePicker({ open, templates, onClose, onSelect, selected = [] }) {
  const [channel, setChannel] = useState('All');
  const [status, setStatus] = useState('All');
  if (!open) return null;
  const channels = ['All', ...new Set(templates.map((t) => t.channel))];
  const filtered = templates.filter((t) => (channel === 'All' || t.channel === channel) && (status === 'All' || t.status === status));
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
      <div className="h-full w-full max-w-2xl overflow-auto bg-white p-4">
        <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold">Browse Content Library</h3><Button variant="ghost" onClick={onClose}>Close</Button></div>
        <div className="grid grid-cols-2 gap-2">
          <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={channel} onChange={(e) => setChannel(e.target.value)}>{channels.map((c) => <option key={c}>{c}</option>)}</select>
          <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}><option>All</option><option>Approved</option><option>Draft</option></select>
        </div>
        <a className="mt-2 inline-block text-sm text-blue-600" href="#">Open in Content Library</a>
        <div className="mt-3 space-y-2">
          {filtered.map((t) => {
            const active = selected.includes(t.id);
            return (
              <Card key={t.id}>
                <div className="flex items-center justify-between gap-3">
                  <div><p className="font-medium">{t.name}</p><p className="text-xs text-slate-500">{t.channel}</p></div>
                  <div className="flex items-center gap-2"><Badge tone={t.status === 'Approved' ? 'green' : 'yellow'}>{t.status}</Badge><Button variant={active ? 'secondary' : 'primary'} onClick={() => onSelect(t.id)}>{active ? 'Selected' : 'Select'}</Button></div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
