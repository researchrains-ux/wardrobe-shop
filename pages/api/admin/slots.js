import { getServiceClient } from '../../../lib/supabase';
import { isAdminAuthed } from '../../../lib/auth';

export default async function handler(req, res) {
  if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
  const supabase = getServiceClient();
  const body = req.body || {};
  if (req.method==='POST') {
    const { label, date_str, time_range, location } = body;
    const { data: slot, error } = await supabase.from('pickup_slots').insert({ label, date_str, time_range, location, active:true }).select().single();
    if (error) return res.status(500).json({ error: 'Could not create slot.' });
    return res.status(200).json({ slot });
  }
  if (req.method==='PATCH') {
    const { id, ...updates } = body;
    await supabase.from('pickup_slots').update(updates).eq('id', id);
    return res.status(200).json({ ok: true });
  }
  if (req.method==='DELETE') {
    await supabase.from('pickup_slots').delete().eq('id', body.id);
    return res.status(200).json({ ok: true });
  }
  return res.status(405).end();
}