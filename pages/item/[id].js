import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Head from 'next/head';
import styles from '../../styles/ItemPage.module.css';

const EMOJI = { tops:'👔', outerwear:'🧥', bottoms:'👖', dresses:'👗', knitwear:'🧶', accessories:'🎒', footwear:'👟', default:'👕' };

export default function ItemPage({ item }) {
  const router = useRouter();
  const [activePhoto, setActivePhoto] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [added, setAdded] = useState(false);

  if (!item) return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => router.push('/')}>← Back</button>
      <p className={styles.notFound}>Item not found.</p>
    </div>
  );

  const hasImages = item.images && item.images.length > 0;
  const emoji = EMOJI[item.category?.toLowerCase()] || EMOJI.default;
  const isMisc = item.gender === 'miscellaneous';

  function handleAddToBag() {
    const existing = JSON.parse(sessionStorage.getItem('cart') || '[]');
    if (!existing.find(i => i.id === item.id)) {
      sessionStorage.setItem('cart', JSON.stringify([...existing, item]));
    }
    setAdded(true);
    setTimeout(() => router.push('/'), 800);
  }

  return (
    <>
      <Head>
        <title>{item.name} — The Leftover Wardrobe</title>
      </Head>
      <div className={styles.page}>
        <nav className={styles.nav}>
          <button className={styles.back} onClick={() => router.back()}>← Back</button>
          <span className={styles.navBrand}>The Leftover Wardrobe</span>
          <span />
        </nav>

        <div className={styles.layout}>
          {/* Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainPhoto} onClick={() => hasImages && setZoomed(true)}>
              {hasImages ? (
                <img src={item.images[activePhoto]} alt={item.name} className={styles.mainImg} />
              ) : (
                <div className={styles.mainPlaceholder}><span>{emoji}</span></div>
              )}
              {hasImages && <div className={styles.zoomHint}>Tap to zoom</div>}
              {item.sold && <div className={styles.soldOverlay}><span className={styles.soldLabel}>Gone 👋</span></div>}
            </div>

            {hasImages && item.images.length > 1 && (
              <div className={styles.thumbs}>
                {item.images.map((img, i) => (
                  <div key={i} className={styles.thumb + (activePhoto === i ? ' ' + styles.thumbActive : '')} onClick={() => setActivePhoto(i)}>
                    <img src={img} alt="" className={styles.thumbImg} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className={styles.details}>
            <div className={styles.badges}>
              <span className={styles.badge + ' ' + (item.gender === 'women' ? styles.badgeWomen : item.gender === 'men' ? styles.badgeMen : styles.badgeMisc)}>
                {item.gender === 'miscellaneous' ? 'Misc' : item.gender?.charAt(0).toUpperCase() + item.gender?.slice(1)}
              </span>
              {item.category && <span className={styles.badgeCategory}>{item.category}</span>}
              {item.condition === 'new' && <span className={styles.badgeNew}>Never worn</span>}
            </div>

            <h1 className={styles.name}>{item.name}</h1>
            <div className={styles.price}>€{Number(item.price).toFixed(2)}</div>

            <div className={styles.meta}>
              {!isMisc && item.size && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Size</span>
                  <span className={styles.metaValue}>{item.size}</span>
                </div>
              )}
              {!isMisc && item.condition && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Condition</span>
                  <span className={styles.metaValue}>{item.condition === 'new' ? 'Never worn' : 'Used'}</span>
                </div>
              )}
              {item.description && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Details</span>
                  <span className={styles.metaValue}>{item.description}</span>
                </div>
              )}
            </div>

            {!item.sold ? (
              <button className={styles.addBtn + (added ? ' ' + styles.addBtnDone : '')} onClick={handleAddToBag} disabled={added}>
                {added ? 'Added! Going back…' : 'Add to bag'}
              </button>
            ) : (
              <div className={styles.goneBtn}>This item is gone 👋</div>
            )}

            <p className={styles.pickupNote}>📍 Pickup or delivery in Schweinfurt</p>
          </div>
        </div>

        {/* Zoom overlay */}
        {zoomed && hasImages && (
          <div className={styles.zoomOverlay} onClick={() => setZoomed(false)}>
            <button className={styles.zoomClose}>✕</button>
            <img src={item.images[activePhoto]} alt={item.name} className={styles.zoomedImg} />
            <p className={styles.zoomTap}>Tap anywhere to close</p>
          </div>
        )}
      </div>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const { data: item } = await supabase.from('items').select('*').eq('id', params.id).single();
  return { props: { item: item || null } };
}
