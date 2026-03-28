import { stripe } from '../../../lib/stripe';
import { getServiceClient } from '../../../lib/supabase';

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];
  let event;
  try { event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET); }
  catch (err) { return res.status(400).json({ error: 'Webhook error: ' + err.message }); }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    const itemIds = session.metadata?.itemIds?.split(',') || [];
    if (!orderId) return res.status(200).end();
    const supabase = getServiceClient();
    await supabase.from('orders').update({ payment_status:'paid', stripe_payment_intent: session.payment_intent }).eq('id', orderId);
    for (const itemId of itemIds) await supabase.from('items').update({ sold:true }).eq('id', itemId.trim());
  }
  res.status(200).json({ received: true });
}