import { INITIAL_SCAN_HISTORY } from '../src/data/initialHistory';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const total = INITIAL_SCAN_HISTORY.length;
  const categoryCounts: Record<string, number> = {};
  
  for (const item of INITIAL_SCAN_HISTORY) {
    const cat = item.predicted_category || 'Unknown';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  let mostDetected: string | null = null;
  let maxCount = 0;
  for (const [cat, cnt] of Object.entries(categoryCounts)) {
    if (cnt > maxCount) {
      maxCount = cnt;
      mostDetected = cat;
    }
  }

  const categoryBreakdown = Object.entries(categoryCounts).map(([cat, cnt]) => ({
    category: cat,
    count: cnt,
    percentage: Math.round((cnt / (total || 1)) * 100),
    color: '#2563eb'
  }));

  res.status(200).json({
    total_scans: total,
    category_counts: categoryCounts,
    most_detected_category: mostDetected,
    category_breakdown: categoryBreakdown
  });
}
