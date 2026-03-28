import { getServiceClient } from '../../../lib/supabase';
import { isAdminAuthed } from '../../../lib/auth';

export default async function handler(req, res) {
  if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
  const supabase = getServiceClient();
  if (req.method === 'PATCH') {
    const { id, ...updates } = req.body;
    if (updates.payment_status === 'paid') {
      const { data: order } = await supabase.from('orders').select('items,payment_method').eq('id',id).single();
      if (order?.payment_method==='cash') for (const item of order.items||[]) await supabase.from('items').update({ sold:true }).eq('id',item.id);
    }
    const { error } = await supabase.from('orders').update(updates).eq('id', id);
    if (error) return res.status(500).json({ error: 'Update failed.' });
    return res.status(200).json({ ok: true });
  }
  return res.status(405).end();
}