import { stripe } from '../../lib/stripe';
import { getServiceClient } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
  const { cart, form, payMethod, pickupSlot } = req.body;
  if (!cart?.length || !form?.name || !form?.contact || !payMethod) return res.status(400).json({ error: 'Missing required fields.' });

  const supabase = getServiceClient();
  const total = cart.reduce((s, i) => s + Number(i.price), 0);

  if (payMethod === 'cash') {
    const { data: order, error } = await supabase.from('orders').insert({
      customer_name: form.name, customer_contact: form.contact, contact_type: form.contactType,
      pickup_slot_id: form.pickupSlotId, pickup_slot_label: pickupSlot?.label || '',
      items: cart, total, payment_method: 'cash', payment_status: 'pending',
    }).select().single();
    if (error) return res.status(500).json({ error: 'Could not create order.' });
    for (const item of cart) await supabase.from('items').update({ sold: true }).eq('id', item.id);
    return res.status(200).json({ orderId: order.id });
  }

  if (payMethod === 'card') {
    const { data: order, error: orderError } = await supabase.from('orders').insert({
      customer_name: form.name, customer_contact: form.contact, contact_type: form.contactType,
      pickup_slot_id: form.pickupSlotId, pickup_slot_label: pickupSlot?.label || '',
      items: cart, total, payment_method: 'card', payment_status: 'pending',
    }).select().single();
    if (orderError) return res.status(500).json({ error: 'Could not create order.' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cart.map(item => ({
        price_data: { currency: 'eur', product_data: { name: item.name, description: 'Size ' + item.size + ' · ' + (item.condition==='new'?'Never worn':'Used') + ' · ' + item.gender }, unit_amount: Math.round(Number(item.price)*100) },
        quantity: 1,
      })),
      mode: 'payment',
      success_url: process.env.NEXT_PUBLIC_BASE_URL + '/order-confirmed?id=' + order.id + '&method=card',
      cancel_url: process.env.NEXT_PUBLIC_BASE_URL + '/?cancelled=true',
      metadata: { orderId: order.id, itemIds: cart.map(i=>i.id).join(',') },
      customer_email: form.contactType==='email' ? form.contact : undefined,
    });

    await supabase.from('orders').update({ stripe_session_id: session.id }).eq('id', order.id);
    return res.status(200).json({ url: session.url });
  }

  return res.status(400).json({ error: 'Invalid payment method.' });
  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(500).json({ error: err.message });
  }
}