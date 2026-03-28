export function isAdminAuthed(req) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/admin_session=([^;]+)/);
  if (!match) return false;
  return match[1] === process.env.ADMIN_PASSWORD;
}
