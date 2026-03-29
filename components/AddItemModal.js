import { useState, useRef } from 'react';
import styles from '../styles/Modal.module.css';

const CATEGORIES = {
  men: ['Tops', 'Outerwear', 'Bottoms', 'Footwear', 'Accessories'],
  women: ['Tops', 'Outerwear', 'Bottoms', 'Dresses', 'Footwear', 'Accessories'],
  miscellaneous: [],
};

export default function AddItemModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    name: '', description: '', price: '',
    gender: 'men', size: '', condition: 'new', category: 'Tops',
  });
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const isMisc = form.gender === 'miscellaneous';
  const subcategories = CATEGORIES[form.gender] || [];

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'gender') {
      const newSubs = CATEGORIES[value];
      setForm(prev => ({ ...prev, gender: value, category: newSubs?.[0] || '', condition: value === 'miscellaneous' ? '' : prev.condition }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  }

  function handlePhotos(e) {
    const files = Array.from(e.target.files);
    setPhotos(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.price) { setError('Name and price are required.'); return; }
    if (!isMisc && !form.size) { setError('Size is required.'); return; }
    setLoading(true); setError('');

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    photos.forEach(p => fd.append('photos', p));

    const res = await fetch('/api/admin/items', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Failed to add item.'); setLoading(false); return; }
    onAdded(data.item);
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add item</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Photos</label>
            <div className={styles.photoUpload} onClick={() => fileRef.current.click()}>
              {previews.length > 0 ? (
                <div className={styles.previews}>
                  {previews.map((p, i) => <img key={i} src={p} alt="" className={styles.preview} />)}
                  <div className={styles.addMorePhoto}>+ more</div>
                </div>
              ) : (
                <div className={styles.photoPlaceholder}>
                  <span className={styles.photoIcon}>📷</span>
                  <span className={styles.photoText}>Tap to add photos</span>
                  <span className={styles.photoHint}>From camera roll or files</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple capture="environment" onChange={handlePhotos} style={{ display: 'none' }} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Item name</label>
            <input className={styles.input} name="name" value={form.name} onChange={handleChange} placeholder="e.g. Linen blazer" />
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.label}>Price (€)</label>
              <input className={styles.input} name="price" type="number" min="1" step="0.01" value={form.price} onChange={handleChange} placeholder="35" />
            </div>
            {!isMisc && (
              <div className={styles.field}>
                <label className={styles.label}>Size</label>
                <input className={styles.input} name="size" value={form.size} onChange={handleChange} placeholder="S / M / 38 / …" />
              </div>
            )}
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.label}>Section</label>
              <select className={styles.select} name="gender" value={form.gender} onChange={handleChange}>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="miscellaneous">Miscellaneous</option>
              </select>
            </div>
            {!isMisc && (
              <div className={styles.field}>
                <label className={styles.label}>Condition</label>
                <select className={styles.select} name="condition" value={form.condition} onChange={handleChange}>
                  <option value="new">Never worn</option>
                  <option value="used">Used</option>
                </select>
              </div>
            )}
          </div>

          {!isMisc && subcategories.length > 0 && (
            <div className={styles.field}>
              <label className={styles.label}>Category</label>
              <select className={styles.select} name="category" value={form.category} onChange={handleChange}>
                {subcategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Description <span className={styles.optional}>(optional)</span></label>
            <textarea className={styles.textarea} name="description" value={form.description} onChange={handleChange} placeholder="Brand, fabric, any details worth mentioning…" rows={3} />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>{loading ? 'Uploading…' : 'Add item'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
