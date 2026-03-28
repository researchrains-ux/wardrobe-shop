import { useState } from 'react';
import { supabase } from '../lib/supabase';
import ItemCard from '../components/ItemCard';
import CartDrawer from '../components/CartDrawer';
import styles from '../styles/Shop.module.css';

export default function Home({ items, pickupSlots }) {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);

  const filtered = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'new') return item.condition === 'new';
    return item.gender === filter;
  });

  function addToCart(item) {
    if (cart.find(i => i.id === item.id)) { showToast('Already in your bag'); return; }
    setCart(prev => [...prev, item]);
    showToast(item.name + ' added to bag');
  }

  function removeFromCart(id) { setCart(prev => prev.filter(i => i.id !== id)); }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div>
          <div className={styles.brand}>The Leftover Wardrobe</div>
          <div className={styles.brandSub}>Curated pieces · Nürnberg pickup</div>
        </div>
        <button className={styles.cartBtn} onClick={() => setCartOpen(true)}>
          Bag {cart.length > 0 && <span className={styles.cartBadge}>{cart.length}</span>}
        </button>
      </nav>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle + ' font-serif'}>Good clothes,<br/>better prices.</h1>
        <p className={styles.heroSub}>Every piece is one of a kind. Once it's gone, it's gone. Pickup in Nürnberg Südstadt.</p>
      </header>
      {pickupSlots.length > 0 && (
        <div className={styles.pickupBanner}>
          <span className={styles.pickupIcon}>📍</span>
          <div>
            <div className={styles.pickupTitle}>Pickup slots this week</div>
            <div className={styles.slots}>
              {pickupSlots.map(slot => <span key={slot.id} className={styles.slotPill}>{slot.label}</span>)}
            </div>
          </div>
        </div>
      )}
      <div className={styles.filters}>
        {['all','women','men','new'].map(f => (
          <button key={f} className={styles.chip + (filter===f?' '+styles.chipActive:'')} onClick={() => setFilter(f)}>
            {f==='all'?'All':f==='new'?'Never worn':f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>
      <main className={styles.grid}>
        {filtered.length===0 ? <p className={styles.empty}>Nothing here yet.</p>
          : filtered.map(item => <ItemCard key={item.id} item={item} onAdd={addToCart} />)}
      </main>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} onRemove={removeFromCart} pickupSlots={pickupSlots} />
      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}

export async function getServerSideProps() {
  const { data: items } = await supabase.from('items').select('*').order('created_at', { ascending: false });
  const { data: pickupSlots } = await supabase.from('pickup_slots').select('*').eq('active', true).order('created_at', { ascending: true });
  return { props: { items: items||[], pickupSlots: pickupSlots||[] } };
}