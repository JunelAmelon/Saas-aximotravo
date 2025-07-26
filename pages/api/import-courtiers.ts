import type { NextApiRequest, NextApiResponse } from 'next';
import { parseCourtiers, addCourtiersToFirebase } from '@/hooks/courtiers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { tsv } = req.body;
  if (!tsv) return res.status(400).json({ error: 'TSV manquant' });

  try {
    const courtiers = parseCourtiers(tsv);
    await addCourtiersToFirebase(courtiers);
    res.status(200).json({ success: true, count: courtiers.length });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
