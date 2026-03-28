import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/Admin.module.css';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/admin/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ password }) });
    if (res.ok) { router.push('/admin/dashboard'); }
    else { setError('Wrong password.'); setLoading(false); }
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <h1 className={styles.loginTitle + ' font-serif'}>Admin</h1>
        <p className={styles.loginSub}>The Leftover Wardrobe</p>
        <form onSubmit={handleLogin} className={styles.loginForm}>
          <input type="password" className={styles.input} placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} autoFocus />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.btn} disabled={loading}>{loading?'Checking…':'Sign in →'}</button>
        </form>
      </div>
    </div>
  );
}