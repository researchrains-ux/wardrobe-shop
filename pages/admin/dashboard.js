import { useState } from 'react';
import { useRouter } from 'next/router';
import { getServiceClient } from '../../lib/supabase';
import { isAdminAuthed } from '../../lib/auth';
import AddItemModal from '../../components/AddItemModal';
import SlotModal from '../../components/SlotModal';
import styles from '../../styles/Admin.module.css';

export default function Dashboard({ orders, items, slots }) {
  const router = useRouter();
  const [tab, setTab] = useState('orders');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [localItems, setLocalItems] = useState(items);
  const [localSlots, setLocalSlots] = useState(slots);
  const [localOrders, setLocalOrders] = useState(orders);

  async function toggleSold(item) {
    const res = await fetch('/api/admin/items', { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: item.id, sold: !item.sold }) });
    if (res.ok) setLocalItems(prev => prev.map(i => i.id===item.id ? {...i, sold: !i.sold} : i));
  }

  async function deleteItem(id) {
    if (!confirm('Delete this item?')) return;
    await fetch('/api/admin/items', { method: 'DELETE', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id }) });
    setLocalItems(prev => prev.filter(i => i.id !== id));
  }

  async function toggleSlot(slot) {
    const res = await fetch('/api/admin/slots', { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: slot.id, active: !slot.active }) });
    if (res.ok) setLocalSlots(prev => prev.map(s => s.id===slot.id ? {...s, active: !s.active} : s));
  }

  async function deleteSlot(id) {
    if (!confirm('Delete this slot?')) return;
    await fetch('/api/admin/slots', { method: 'DELETE', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id }) });
    setLocalSlots(prev => prev.filter(s => s.id !== id));
  }

  async function markOrderPaid(orderId) {
    const res = await fetch('/api/admin/orders', { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: orderId, payment_status: 'paid' }) });
    if (res.ok) setLocalOrders(prev => prev.map(o => o.id===orderId ? {...o, payment_status:'paid'} : o));
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  }

  const pendingCash = localOrders.filter(o => o.payment_method==='cash' && o.payment_status==='pending');
  const totalRevenue = localOrders.filter(o => o.payment_status==='paid').reduce((s,o) => s+Number(o.total), 0);

  return (
    <div className={styles.dashPage}>
      <nav className={styles.dashNav}>
        <span className={styles.dashBrand + ' font-serif'}>Admin Panel</span>
        <button className={styles.logoutBtn} onClick={logout}>Log out</button>
      </nav>

      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryNum}>{localOrders.length}</div>
          <div className={styles.summaryLabel}>Total orders</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryNum}>€{totalRevenue.toFixed(2)}</div>
          <div className={styles.summaryLabel}>Revenue collected</div>
        </div>
        <div className={styles.summaryCard + (pendingCash.length>0 ? ' '+styles.summaryAlert : '')}>
          <div className={styles.summaryNum}>{pendingCash.length}</div>
          <div className={styles.summaryLabel}>Cash pickups pending</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryNum}>{localItems.filter(i=>!i.sold).length}</div>
          <div className={styles.summaryLabel}>Items available</div>
        </div>
      </div>

      <div className={styles.tabs}>
        {['orders','items','slots'].map(t => (
          <button key={t} className={styles.tab + (tab===t?' '+styles.tabActive:'')} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
            {t==='orders' && pendingCash.length>0 && <span className={styles.tabBadge}>{pendingCash.length}</span>}
          </button>
        ))}
      </div>

      <div className={styles.dashBody}>
        {tab==='orders' && (
          <div className={styles.section}>
            {localOrders.length===0 ? <p className={styles.empty}>No orders yet.</p> : (
              <div className={styles.orderList}>
                {localOrders.map(order => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderTop}>
                      <div>
                        <div className={styles.orderName}>{order.customer_name}</div>
                        <div className={styles.orderContact}>{order.customer_contact}</div>
                      </div>
                      <div className={styles.orderRight}>
                        <span className={styles.payBadge + ' ' + (order.payment_status==='paid'?styles.payPaid:styles.payPending)}>
                          {order.payment_status==='paid'?'Paid ✓':order.payment_method==='cash'?'Cash due':'Pending'}
                        </span>
                        <div className={styles.orderTotal}>€{Number(order.total).toFixed(2)}</div>
                      </div>
                    </div>
                    <div className={styles.orderMeta}>
                      <span>📍 {order.pickup_slot_label}</span>
                      <span>·</span>
                      <span>{order.items.length} item{order.items.length>1?'s':''}: {order.items.map(i=>i.name).join(', ')}</span>
                    </div>
                    <div className={styles.orderDate}>{new Date(order.created_at).toLocaleDateString('de-DE',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
                    {order.payment_method==='cash' && order.payment_status==='pending' && (
                      <button className={styles.markPaidBtn} onClick={() => markOrderPaid(order.id)}>Mark as paid (cash received)</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab==='items' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Items ({localItems.length})</h2>
              <button className={styles.addBtn} onClick={() => setShowAddItem(true)}>+ Add item</button>
            </div>
            {localItems.length===0 ? <p className={styles.empty}>No items yet. Add your first one!</p> : (
              <div className={styles.itemTable}>
                {localItems.map(item => (
                  <div key={item.id} className={styles.itemRow + (item.sold?' '+styles.itemRowSold:'')}>
                    <div className={styles.itemThumb}>
                      {item.images?.[0] ? <img src={item.images[0]} alt={item.name} className={styles.thumbImg} /> : <div className={styles.thumbPlaceholder}>📷</div>}
                    </div>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemName}>{item.name}</div>
                      <div className={styles.itemMeta}>{item.gender} · Size {item.size} · {item.condition==='new'?'Never worn':'Used'} · €{Number(item.price).toFixed(2)}</div>
                    </div>
                    <div className={styles.itemActions}>
                      <button className={styles.actionBtn + (item.sold?' '+styles.actionBtnGhost:'')} onClick={() => toggleSold(item)}>
                        {item.sold?'Mark available':'Mark sold'}
                      </button>
                      <button className={styles.actionBtn+' '+styles.actionBtnDanger} onClick={() => deleteItem(item.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab==='slots' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Pickup slots</h2>
              <button className={styles.addBtn} onClick={() => setShowAddSlot(true)}>+ Add slot</button>
            </div>
            {localSlots.length===0 ? <p className={styles.empty}>No slots set yet.</p> : (
              <div className={styles.slotList}>
                {localSlots.map(slot => (
                  <div key={slot.id} className={styles.slotRow + (!slot.active?' '+styles.slotRowInactive:'')}>
                    <div>
                      <div className={styles.slotLabel}>{slot.label}</div>
                      <div className={styles.slotMeta}>📍 {slot.location}</div>
                    </div>
                    <div className={styles.slotActions}>
                      <button className={styles.actionBtn} onClick={() => toggleSlot(slot)}>{slot.active?'Hide':'Show'}</button>
                      <button className={styles.actionBtn+' '+styles.actionBtnDanger} onClick={() => deleteSlot(slot.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showAddItem && <AddItemModal onClose={() => setShowAddItem(false)} onAdded={item => { setLocalItems(prev => [item,...prev]); setShowAddItem(false); }} />}
      {showAddSlot && <SlotModal onClose={() => setShowAddSlot(false)} onAdded={slot => { setLocalSlots(prev => [...prev,slot]); setShowAddSlot(false); }} />}
    </div>
  );
}

export async function getServerSideProps({ req }) {
  if (!isAdminAuthed(req)) return { redirect: { destination: '/admin', permanent: false } };
  const supabase = getServiceClient();
  const [{ data: orders }, { data: items }, { data: slots }] = await Promise.all([
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
    supabase.from('items').select('*').order('created_at', { ascending: false }),
    supabase.from('pickup_slots').select('*').order('created_at', { ascending: true }),
  ]);
  return { props: { orders: orders||[], items: items||[], slots: slots||[] } };
}