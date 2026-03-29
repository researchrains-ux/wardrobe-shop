import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/CartDrawer.module.css';
import RunawayButton from './RunawayButton';

const PICKUP_ADDRESS = 'Wilhelmstrasse 8, 97421 Schweinfurt';

export default function CartDrawer({ open, onClose, cart, onRemove, pickupSlots }) {
  const router = useRouter();
  const [step, setStep] = useState('cart');
  const [form, setForm] = useState({
    name: '',
    contact: '',
    contactType: 'email',
    pickupSlotId: pickupSlots[0]?.id || '',
    fulfillment: 'pickup',
    deliveryAddress: '',
  });
  const [payMethod, setPayMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const deliveryFee = form.fulfillment === 'delivery' ? 1 : 0;
  const subtotal = cart.reduce((s, i) => s + Number(i.price), 0);
  const total = subtotal + deliveryFee;

  function handleFormChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validateDetails() {
    if (!form.name.trim()) return 'Please enter your name.';
    if (!form.contact.trim()) return 'Please enter your email or phone.';
    if (form.fulfillment === 'pickup' && !form.pickupSlotId) return 'Please select a pickup slot.';
    if (form.fulfillment === 'delivery' && !form.deliveryAddress.trim()) return 'Please enter your delivery address.';
    return null;
  }

  async function handlePay() {
    if (!payMethod) { setError('Please choose a payment method.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart, form, payMethod,
          pickupSlot: pickupSlots.find(s => s.id === form.pickupSlotId),
          deliveryFee,
          total,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      if (payMethod === 'card') { window.location.href = data.url; }
      else { router.push('/order-confirmed?id=' + data.orderId + '&method=cash'); }
    } catch (e) { setError(e.message); setLoading(false); }
  }

  function resetAndClose() { setStep('cart'); setPayMethod(null); setError(''); onClose(); }
  const selectedSlot = pickupSlots.find(s => s.id === form.pickupSlotId);

  return (
    <>
      {open && <div className={styles.backdrop} onClick={resetAndClose} />}
      <div className={styles.drawer + (open ? ' ' + styles.open : '')}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {step !== 'cart' && <button className={styles.backBtn} onClick={() => setStep(step === 'payment' ? 'details' : 'cart')}>← back</button>}
            <h2 className={styles.title}>
              {step === 'cart' ? 'Your bag' : step === 'details' ? 'Your details' : 'Payment'}
            </h2>
          </div>
          <button className={styles.closeBtn} onClick={resetAndClose}>✕</button>
        </div>

        <div className={styles.stepBar}>
          {['Bag', 'Details', 'Payment'].map((s, i) => {
            const stepKeys = ['cart', 'details', 'payment'];
            const active = i <= stepKeys.indexOf(step);
            return (
              <div key={s} className={styles.stepDot + (active ? ' ' + styles.stepActive : '')}>
                <span className={styles.stepNum}>{i + 1}</span>
                <span className={styles.stepLabel}>{s}</span>
              </div>
            );
          })}
        </div>

        <div className={styles.body}>

          {/* STEP 1: Cart */}
          {step === 'cart' && (
            cart.length === 0 ? <p className={styles.empty}>nothing here.</p> : (
              <>
                <div className={styles.items}>
                  {cart.map(item => (
                    <div key={item.id} className={styles.item}>
                      <div>
                        <div className={styles.itemName}>{item.name}</div>
                        <div className={styles.itemMeta}>
                          {item.size ? 'Size ' + item.size + ' · ' : ''}{item.gender}
                        </div>
                      </div>
                      <div className={styles.itemRight}>
                        <span className={styles.itemPrice}>€{Number(item.price).toFixed(2)}</span>
                        <RunawayButton onConfirm={() => onRemove(item.id)} itemPrice={Number(item.price).toFixed(2)} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.total}><span>Total</span><span>€{subtotal.toFixed(2)}</span></div>

                {pickupSlots.length > 0 && (
                  <div className={styles.slotsInfo}>
                    <div className={styles.slotsInfoTitle}>Available pickup slots</div>
                    <div className={styles.slotsInfoList}>
                      {pickupSlots.map(slot => (
                        <div key={slot.id} className={styles.slotsInfoPill}>
                          {slot.label} · {slot.location}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )
          )}

          {/* STEP 2: Details */}
          {step === 'details' && (
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Your name</label>
                <input className={styles.input} name="name" value={form.name} onChange={handleFormChange} placeholder="Max Mustermann" autoComplete="name" />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Contact</label>
                <div className={styles.contactRow}>
                  <select className={styles.select} name="contactType" value={form.contactType} onChange={handleFormChange} style={{ width: '110px', flexShrink: 0 }}>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                  </select>
                  <input className={styles.input} name="contact" value={form.contact} onChange={handleFormChange}
                    placeholder={form.contactType === 'email' ? 'you@example.com' : '+49 151 …'}
                    type={form.contactType === 'email' ? 'email' : 'tel'} />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>How do you want to receive your items?</label>
                <div className={styles.fulfillmentOptions}>
                  <button
                    type="button"
                    className={styles.fulfillOpt + (form.fulfillment === 'pickup' ? ' ' + styles.fulfillOptActive : '')}
                    onClick={() => setForm(prev => ({ ...prev, fulfillment: 'pickup' }))}
                  >
                    <div className={styles.fulfillIcon}>📍</div>
                    <div>
                      <div className={styles.fulfillTitle}>Pickup — Free</div>
                      <div className={styles.fulfillSub}>{PICKUP_ADDRESS}</div>
                    </div>
                    <span className={styles.check}>{form.fulfillment === 'pickup' ? '✓' : ''}</span>
                  </button>

                  <button
                    type="button"
                    className={styles.fulfillOpt + (form.fulfillment === 'delivery' ? ' ' + styles.fulfillOptActive : '')}
                    onClick={() => setForm(prev => ({ ...prev, fulfillment: 'delivery' }))}
                  >
                    <div className={styles.fulfillIcon}>🚚</div>
                    <div>
                      <div className={styles.fulfillTitle}>Delivery — +€1.00</div>
                      <div className={styles.fulfillSub}>Schweinfurt city only</div>
                    </div>
                    <span className={styles.check}>{form.fulfillment === 'delivery' ? '✓' : ''}</span>
                  </button>
                </div>
              </div>

              {form.fulfillment === 'pickup' && (
                <div className={styles.field}>
                  <label className={styles.label}>Pickup slot</label>
                  {pickupSlots.length === 0 ? (
                    <p className={styles.noSlots}>No slots available right now.</p>
                  ) : (
                    <div className={styles.slotOptions}>
                      {pickupSlots.map(slot => (
                        <label key={slot.id} className={styles.slotOpt + (form.pickupSlotId === slot.id ? ' ' + styles.slotOptActive : '')}>
                          <input type="radio" name="pickupSlotId" value={slot.id} checked={form.pickupSlotId === slot.id} onChange={handleFormChange} className={styles.radioHidden} />
                          <div className={styles.slotOptLabel}>{slot.label}</div>
                          <div className={styles.slotOptLoc}>📍 {slot.location}</div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {form.fulfillment === 'delivery' && (
                <div className={styles.field}>
                  <label className={styles.label}>Delivery address</label>
                  <input className={styles.input} name="deliveryAddress" value={form.deliveryAddress} onChange={handleFormChange} placeholder="Musterstraße 12, 97421 Schweinfurt" />
                  <span className={styles.fieldHint}>Schweinfurt city only</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Payment */}
          {step === 'payment' && (
            <div className={styles.payStep}>
              <div className={styles.orderSummary}>
                <div className={styles.summaryRow}><span>Items</span><span>{cart.length}</span></div>
                <div className={styles.summaryRow}><span>Subtotal</span><span>€{subtotal.toFixed(2)}</span></div>
                {deliveryFee > 0 && <div className={styles.summaryRow}><span>Delivery</span><span>+€{deliveryFee.toFixed(2)}</span></div>}
                <div className={styles.summaryRow}>
                  <span>Total</span>
                  <span className={styles.summaryTotal}>€{total.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>{form.fulfillment === 'pickup' ? 'Pickup' : 'Delivery'}</span>
                  <span>{form.fulfillment === 'pickup' ? selectedSlot?.label : form.deliveryAddress}</span>
                </div>
              </div>

              <div className={styles.payLabel}>How would you like to pay?</div>
              <div className={styles.payOptions}>
                <button className={styles.payOpt + (payMethod === 'card' ? ' ' + styles.payOptActive : '')} onClick={() => setPayMethod('card')}>
                  <span className={styles.payIcon}>💳</span>
                  <div><div className={styles.payOptTitle}>Pay by card</div><div className={styles.payOptSub}>Secure checkout via Stripe</div></div>
                  <span className={styles.check}>{payMethod === 'card' ? '✓' : ''}</span>
                </button>
                <button className={styles.payOpt + (payMethod === 'cash' ? ' ' + styles.payOptActive : '')} onClick={() => setPayMethod('cash')}>
                  <span className={styles.payIcon}>💵</span>
                  <div><div className={styles.payOptTitle}>Pay cash on {form.fulfillment === 'pickup' ? 'pickup' : 'delivery'}</div><div className={styles.payOptSub}>pay when you show up. don't ghost.</div></div>
                  <span className={styles.check}>{payMethod === 'cash' ? '✓' : ''}</span>
                </button>
              </div>
              {error && <p className={styles.error}>{error}</p>}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {error && step !== 'payment' && <p className={styles.error}>{error}</p>}
          {step === 'cart' && cart.length > 0 && (
            <button className={styles.cta} onClick={() => { setStep('details'); setError(''); }}>Continue →</button>
          )}
          {step === 'details' && (
            <button className={styles.cta} onClick={() => {
              const e = validateDetails(); if (e) { setError(e); return; }
              setError(''); setStep('payment');
            }}>Choose payment →</button>
          )}
          {step === 'payment' && (
            <button className={styles.cta} onClick={handlePay} disabled={loading || !payMethod}>
              {loading ? 'hold on...' : payMethod === 'card' ? 'Pay €' + total.toFixed(2) + ' →' : 'lock it in →'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
