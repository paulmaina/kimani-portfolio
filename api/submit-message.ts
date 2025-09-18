import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '') as string;
const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '') as string;

const supabase = createClient(supabaseUrl, serviceKey);

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({ error: 'Server not configured: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' });
    }
    const { name, email, subject, message, company } = req.body || {};

    // Honeypot: if filled, treat as spam
    if (typeof company === 'string' && company.trim().length > 0) {
      return res.status(200).json({ ok: true });
    }

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';

    // Naive rate limiting: 1 message per minute per IP
    const now = new Date();
    const minuteWindowStart = new Date(now);
    minuteWindowStart.setSeconds(0, 0);

    const { data: recent, error: rateErr } = await supabase
      .from('messages')
      .select('id, created_at')
      .gte('created_at', minuteWindowStart.toISOString())
      .eq('ip', ip)
      .limit(1);

    if (rateErr) {
      return res.status(500).json({ error: 'Rate check failed' });
    }
    if (recent && recent.length > 0) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({ name, email, subject, message, ip })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true, message: data });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unknown error' });
  }
}


