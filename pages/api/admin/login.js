export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (req.body.password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Invalid password' });
  res.setHeader('Set-Cookie', 'admin_session=' + process.env.ADMIN_PASSWORD + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400' + (process.env.NODE_ENV==='production'?'; Secure':''));
  return res.status(200).json({ ok: true });
}