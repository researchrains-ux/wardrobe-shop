import { getServiceClient } from '../../../lib/supabase';
import { isAdminAuthed } from '../../../lib/auth';
import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(JSON.parse(Buffer.concat(chunks).toString())));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
  const supabase = getServiceClient();

  if (req.method === 'POST') {
    const form = formidable({ multiples: true, maxFileSize: 10 * 1024 * 1024 });
    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(400).json({ error: 'Form parse error' });
      const imageUrls = [];
      const photoFiles = files.photos ? (Array.isArray(files.photos) ? files.photos : [files.photos]) : [];
      for (const file of photoFiles) {
        const buffer = fs.readFileSync(file.filepath);
        const ext = (file.originalFilename || 'jpg').split('.').pop();
        const fileName = Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + ext;
        const { error: uploadError } = await supabase.storage.from('items').upload(fileName, buffer, { contentType: file.mimetype });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('items').getPublicUrl(fileName);
          imageUrls.push(urlData.publicUrl);
        }
      }
      const get = k => Array.isArray(fields[k]) ? fields[k][0] : fields[k];
      const { data: item, error } = await supabase.from('items').insert({
        name: get('name'), description: get('description') || '', price: parseFloat(get('price')),
        gender: get('gender'), size: get('size'), condition: get('condition'),
        category: get('category'), images: imageUrls, sold: false,
      }).select().single();
      if (error) return res.status(500).json({ error: 'Could not save item.' });
      return res.status(200).json({ item });
    });
    return;
  }

  const body = await parseBody(req);

  if (req.method === 'PATCH') {
    const { id, ...updates } = body;
    const { error } = await supabase.from('items').update(updates).eq('id', id);
    if (error) return res.status(500).json({ error: 'Update failed.' });
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    await supabase.from('items').delete().eq('id', body.id);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}