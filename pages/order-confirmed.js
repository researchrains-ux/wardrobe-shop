import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import styles from '../styles/OrderConfirmed.module.css';

export default function OrderConfirmed() {
  const router = useRouter();
  const { id, method } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase.from('orders').select('*').eq('id', id).single()
      .then(({ data }) => { setOrder(data); setLoading(false); });
  }, [id]);

  if (loading) return <div className={styles.page}><div className={styles.loading}>Loading your order…</div></div>;
  if (!order) return <div className={styles.page}><div className={styles.card}><p>Order not found. <Link href="/">Go back</Link></p></div></div>;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>{method==='cash'?'📋':'✅'}</div>
        <h1 className={styles.title}>{method==='cash'?'done. see you then.':'payment received.'}</h1>
        <p className={styles.sub}>{method==='cash'?'locked in. pay when you show up. don\'t ghost.':'sorted. the items are yours.'}</p>
        <div className={styles.details}>
          <div className={styles.row}><span className={styles.rowLabel}>Name</span><span>{order.customer_name}</span></div>
          <div className={styles.row}><span className={styles.rowLabel}>Contact</span><span>{order.customer_contact}</span></div>
          <div className={styles.row}><span className={styles.rowLabel}>Pickup</span><span>{order.pickup_slot_label}</span></div>
          <div className={styles.row}><span className={styles.rowLabel}>Total</span><span className={styles.total}>€{Number(order.total).toFixed(2)}</span></div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Payment</span>
            <span className={styles.status + ' ' + (order.payment_status==='paid'?styles.paid:styles.pending)}>
              {order.payment_status==='paid'?'Paid ✓':'Pay cash at pickup'}
            </span>
          </div>
        </div>
        <div className={styles.items}>
          <div className={styles.itemsLabel}>Your items</div>
          {order.items.map((item,i) => (
            <div key={i} className={styles.item}><span>{item.name}</span><span>€{Number(item.price).toFixed(2)}</span></div>
          ))}
        </div>
        <Link href="/" className={styles.backLink}>← Back to the shop</Link>
      </div>
    </div>
  );
}