import Image from 'next/image';
import styles from '../styles/ItemCard.module.css';

const EMOJI = { tops:'👔', outerwear:'🧥', bottoms:'👖', dresses:'👗', knitwear:'🧶', accessories:'🎒', default:'👕' };

export default function ItemCard({ item, onAdd }) {
  const emoji = EMOJI[item.category] || EMOJI.default;
  const hasImage = item.images && item.images.length > 0;

  return (
    <div className={styles.card + (item.sold?' '+styles.sold:'')}>
      <div className={styles.imageWrap}>
        {hasImage ? (
          <Image src={item.images[0]} alt={item.name} fill style={{objectFit:'cover'}} sizes="(max-width:500px) 50vw, 220px" />
        ) : (
          <div className={styles.placeholder}><span className={styles.emoji}>{emoji}</span></div>
        )}
        <div className={styles.badges}>
          <span className={styles.badge + ' ' + (item.gender==='women'?styles.badgeWomen:item.gender==='men'?styles.badgeMen:styles.badgeUnisex)}>
            {item.gender==='women'?'Women':item.gender==='men'?'Men':'Unisex'}
          </span>
        </div>
        {item.condition==='new' && !item.sold && <span className={styles.newBadge}>Never worn</span>}
        {item.sold && <div className={styles.soldOverlay}><span className={styles.soldLabel}>Gone 👋</span></div>}
      </div>
      <div className={styles.body}>
        <div className={styles.name}>{item.name}</div>
        <div className={styles.meta}>
          <span>Size {item.size}</span><span className={styles.dot}>·</span>
          <span>{item.condition==='new'?'New':'Used'}</span>
          {!item.sold && <><span className={styles.dot}>·</span><span className={styles.oneLeft}>1 left</span></>}
        </div>
        <div className={styles.footer}>
          <span className={styles.price + ' font-serif'}>€{Number(item.price).toFixed(2)}</span>
          {item.sold ? <span className={styles.goneText}>Sold</span> : <button className={styles.addBtn} onClick={() => onAdd(item)}>Add to bag</button>}
        </div>
      </div>
    </div>
  );
}