import { useState } from 'react';
import styles from '../styles/Modal.module.css';

export default function SlotModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ label:'', date_str:'', time_range:'', location:'Nürnberg Südstadt' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); }

  const autoLabel = form.label || ((form.date_str && form.time_range) ? form.date_str + ' ' + form.time_range : '');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.date_str || !form.time_range || !form.location) { setError('All fields are required.'); return; }
    setLoading(true); setError('');
    const res = await fetch('/api/admin/slots', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ label: autoLabel, date_str: form.date_str, time_range: form.time_range, location: form.location }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Failed.'); setLoading(false); return; }
    onAdded(data.slot);
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} style={{maxWidth:'400px'}}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle + ' font-serif'}>Add pickup slot</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Date</label>
            <input className={styles.input} name="date_str" value={form.date_str} onChange={handleChange} placeholder="e.g. Saturday 5 April" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Time range</label>
            <input className={styles.input} name="time_range" value={form.time_range} onChange={handleChange} placeholder="e.g. 2–5pm" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Location</label>
            <input className={styles.input} name="location" value={form.location} onChange={handleChange} placeholder="Nürnberg Südstadt" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Custom label <span className={styles.optional}>(optional — auto-generated if blank)</span></label>
            <input className={styles.input} name="label" value={form.label} onChange={handleChange} placeholder={'Auto: "' + (form.date_str||'Saturday 5 April') + ' ' + (form.time_range||'2–5pm') + '"'} />
          </div>
          {autoLabel && <div className={styles.previewPill}>Shows as: <strong>{autoLabel}</strong></div>}
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>{loading?'Saving…':'Add slot'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}