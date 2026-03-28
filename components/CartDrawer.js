import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/CartDrawer.module.css';

export default function CartDrawer({ open, onClose, cart, onRemove, pickupSlots }) {
  const router = useRouter();
  const [step, setStep] = useState('cart');
  const [form, setForm] = useState({ name:'', contact:'', contactType:'email', pickupSlotId: pickupSlots[0]?.id||'' });
  const [payMethod, setPayMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = cart.reduce((s,i) => s+Number(i.price), 0);

  function handleFormChange(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); }

  function validateDetails() {
    if (!form.name.trim()) return 'Please enter your name.';
    if (!form.contact.trim()) return 'Please enter your email or phone.';
    if (!form.pickupSlotId) return 'Please select a pickup slot.';
    return null;
  }

  async function handlePay() {
    if (!payMethod) { setError('Please choose a payment method.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ cart, form, payMethod, pickupSlot: pickupSlots.find(s=>s.id===form.pickupSlotId) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Something went wrong');
      if (payMethod==='card') { window.location.href = data.url; }
      else { router.push('/order-confirmed?id='+data.orderId+'&method=cash'); }
    } catch(e) { setError(e.message); setLoading(false); }
  }

  function resetAndClose() { setStep('cart'); setPayMethod(null); setError(''); onClose(); }
  const selectedSlot = pickupSlots.find(s => s.id===form.pickupSlotId);

  return (
    <>
      {open && <div className={styles.backdrop} onClick={resetAndClose} />}
      <div className={styles.drawer + (open?' '+styles.open:'')}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {step!=='cart' && <button className={styles.backBtn} onClick={() => setStep(step==='payment'?'details':'cart')}>← back</button>}
            <h2 className={styles.title + ' font-serif'}>{step==='cart'?'Your bag':step==='details'?'Your details':'Payment'}</h2>
          </div>
          <button className={styles.closeBtn} onClick={resetAndClose}>✕</button>
        </div>

        <div className={styles.stepBar}>
          {['Bag','Details','Payment'].map((s,i) => {
            const stepKeys = ['cart','details','payment'];
            const active = i <= stepKeys.indexOf(step);
            return (
              <div key={s} className={styles.stepDot + (active?' '+styles.stepActive:'')}>
                <span className={styles.stepNum}>{i+1}</span>
                <span className={styles.stepLabel}>{s}</span>
              </div>
            );
          })}
        </div>

        <div className={styles.body}>
          {step==='cart' && (
            cart.length===0 ? <p className={styles.empty}>Your bag is empty.</p> : (
              <>
                <div className={styles.items}>
                  {cart.map(item => (
                    <div key={item.id} className={styles.item}>
                      <div>
                        <div className={styles.itemName}>{item.name}</div>
                        <div className={styles.itemMeta}>Size {item.size} · {item.gender}</div>
                      </div>
                      <div className={styles.itemRight}>
                        <span className={styles.itemPrice}>€{Number(item.price).toFixed(2)}</span>
                        <button className={styles.removeBtn} onClick={() => onRemove(item.id)}>remove</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.total}><span>Total</span><span>€{total.toFixed(2)}</span></div>
              </>
            )
          )}

          {step==='details' && (
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Your name</label>
                <input className={styles.input} name="name" value={form.name} onChange={handleFormChange} placeholder="Anna Müller" autoComplete="name" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Contact</label>
                <div className={styles.contactRow}>
                  <select className={styles.select} name="contactType" value={form.contactType} onChange={handleFormChange} style={{width:'110px',flexShrink:0}}>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                  </select>
                  <input className={styles.input} name="contact" value={form.contact} onChange={handleFormChange}
                    placeholder={form.contactType==='email'?'you@example.com':'+49 151 …'}
                    type={form.contactType==='email'?'email':'tel'} />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Pickup slot</label>
                {pickupSlots.length===0 ? <p className={styles.noSlots}>No slots available right now.</p> : (
                  <div className={styles.slotOptions}>
                    {pickupSlots.map(slot => (
                      <label key={slot.id} className={styles.slotOpt + (form.pickupSlotId===slot.id?' '+styles.slotOptActive:'')}>
                        <input type="radio" name="pickupSlotId" value={slot.id} checked={form.pickupSlotId===slot.id} onChange={handleFormChange} className={styles.radioHidden} />
                        <div className={styles.slotOptLabel}>{slot.label}</div>
                        <div className={styles.slotOptLoc}>📍 {slot.location}</div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step==='payment' && (
            <div className={styles.payStep}>
              <div className={styles.orderSummary}>
                <div className={styles.summaryRow}><span>Items</span><span>{cart.length}</span></div>
                <div className={styles.summaryRow}><span>Total</span><span className={styles.summaryTotal}>€{total.toFixed(2)}</span></div>
                <div className={styles.summaryRow}><span>Pickup</span><span>{selectedSlot?.label}</span></div>
              </div>
              <div className={styles.payLabel}>How would you like to pay?</div>
              <div className={styles.payOptions}>
                <button className={styles.payOpt + (payMethod==='card'?' '+styles.payOptActive:'')} onClick={() => setPayMethod('card')}>
                  <span className={styles.payIcon}>💳</span>
                  <div><div className={styles.payOptTitle}>Pay by card</div><div className={styles.payOptSub}>Secure checkout via Stripe</div></div>
                  <span className={styles.check}>{payMethod==='card'?'✓':''}</span>
                </button>
                <button className={styles.payOpt + (payMethod==='cash'?' '+styles.payOptActive:'')} onClick={() => setPayMethod('cash')}>
                  <span className={styles.payIcon}>💵</span>
                  <div><div className={styles.payOptTitle}>Pay cash on pickup</div><div className={styles.payOptSub}>Reserve now, pay when you collect</div></div>
                  <span className={styles.check}>{payMethod==='cash'?'✓':''}</span>
                </button>
              </div>
              {error && <p className={styles.error}>{error}</p>}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {error && step!=='payment' && <p className={styles.error}>{error}</p>}
          {step==='cart' && cart.length>0 && <button className={styles.cta} onClick={() => { setStep('details'); setError(''); }}>Continue →</button>}
          {step==='details' && (
            <button className={styles.cta} onClick={() => { const e=validateDetails(); if(e){setError(e);return;} setError(''); setStep('payment'); }}>
              Choose payment →
            </button>
          )}
          {step==='payment' && (
            <button className={styles.cta} onClick={handlePay} disabled={loading||!payMethod}>
              {loading?'Please wait…':payMethod==='card'?'Pay €'+total.toFixed(2)+' →':'Confirm reservation →'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}