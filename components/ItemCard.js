import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from '../styles/ItemCard.module.css';

const EMOJI = { tops:'👔', outerwear:'🧥', bottoms:'👖', dresses:'👗', knitwear:'🧶', accessories:'🎒', footwear:'👟', default:'👕' };

export default function ItemCard({ item, onAdd }) {
  const router = useRouter();
  const emoji = EMOJI[item.category?.toLowerCase()] || EMOJI.default;
  const hasImage = item.images && item.images.length > 0;
  const isMisc = item.gender === 'miscellaneous';

  function handleClick() {
    router.push('/item/' + item.id);
  }

  return (
    <div className={styles.card + (item.sold ? ' ' + styles.sold : '')} onClick={handleClick}>
      <div className={styles.imageWrap}>
        {hasImage ? (
          <Image src={item.images[0]} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="(max-width:500px) 50vw, 33vw" />
        ) : (
          <div className={styles.placeholder}><span className={styles.emoji}>{emoji}</span></div>
        )}
        <div className={styles.badges}>
          <span className={styles.badge + ' ' + (item.gender === 'women' ? styles.badgeWomen : item.gender === 'men' ? styles.badgeMen : styles.badgeMisc)}>
            {item.gender === 'miscellaneous' ? 'Misc' : item.gender?.charAt(0).toUpperCase() + item.gender?.slice(1)}
          </span>
        </div>
        {item.condition === 'new' && !item.sold && <span className={styles.newBadge}>Never worn</span>}
        {item.sold && <div className={styles.soldOverlay}><span className={styles.soldLabel}>Gone 👋</span></div>}
      </div>
      <div className={styles.body}>
        <div className={styles.name}>{item.name}</div>
        <div className={styles.meta}>
          {!isMisc && item.size && <><span>Size {item.size}</span><span className={styles.dot}>·</span></>}
          {!isMisc && item.condition && <span>{item.condition === 'new' ? 'New' : 'Used'}</span>}
          {isMisc && item.category && <span>{item.category}</span>}
        </div>
        <div className={styles.footer}>
          <span className={styles.price}>€{Number(item.price).toFixed(2)}</span>
          {item.sold
            ? <span className={styles.goneText}>Sold</span>
            : <button className={styles.addBtn} onClick={e => { e.stopPropagation(); onAdd(item); }}>Add</button>}
        </div>
      </div>
    </div>
  );
}
