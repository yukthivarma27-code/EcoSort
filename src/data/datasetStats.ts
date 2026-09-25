export interface ClassDistributionItem {
  name: string;
  rawKey: string;
  count: number;
  percentage: number;
  stream: 'Recyclable' | 'Organic' | 'Textiles' | 'Hazardous' | 'Residual';
  color: string;
}

export interface StreamDistributionItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export const RAW_DATASET_REPORT = {
  datasetName: "Garbage Classification Dataset",
  source: "mostafaabla/garbage-classification",
  totalImages: 15515,
  numClasses: 12,
  classDistribution: {
    clothes: 5325,
    shoes: 1977,
    paper: 1050,
    biological: 985,
    battery: 945,
    cardboard: 891,
    plastic: 865,
    'white-glass': 775,
    metal: 769,
    trash: 697,
    'green-glass': 629,
    'brown-glass': 607,
  } as Record<string, number>
};

export const DATASET_CLASSES: ClassDistributionItem[] = [
  { name: 'Clothes', rawKey: 'clothes', count: 5325, percentage: 34.32, stream: 'Textiles', color: '#8b5cf6' },
  { name: 'Shoes', rawKey: 'shoes', count: 1977, percentage: 12.74, stream: 'Textiles', color: '#a855f7' },
  { name: 'Paper', rawKey: 'paper', count: 1050, percentage: 6.77, stream: 'Recyclable', color: '#eab308' },
  { name: 'Biological', rawKey: 'biological', count: 985, percentage: 6.35, stream: 'Organic', color: '#16a34a' },
  { name: 'Battery', rawKey: 'battery', count: 945, percentage: 6.09, stream: 'Hazardous', color: '#dc2626' },
  { name: 'Cardboard', rawKey: 'cardboard', count: 891, percentage: 5.74, stream: 'Recyclable', color: '#f59e0b' },
  { name: 'Plastic', rawKey: 'plastic', count: 865, percentage: 5.58, stream: 'Recyclable', color: '#2563eb' },
  { name: 'White Glass', rawKey: 'white-glass', count: 775, percentage: 5.00, stream: 'Recyclable', color: '#38bdf8' },
  { name: 'Metal', rawKey: 'metal', count: 769, percentage: 4.96, stream: 'Recyclable', color: '#06b6d4' },
  { name: 'Trash', rawKey: 'trash', count: 697, percentage: 4.49, stream: 'Residual', color: '#64748b' },
  { name: 'Green Glass', rawKey: 'green-glass', count: 629, percentage: 4.05, stream: 'Recyclable', color: '#10b981' },
  { name: 'Brown Glass', rawKey: 'brown-glass', count: 607, percentage: 3.91, stream: 'Recyclable', color: '#d97706' },
];

export const INITIAL_STREAM_STATS: StreamDistributionItem[] = [
  { name: 'Textiles & Apparel', count: 7302, percentage: 47.06, color: '#8b5cf6' },
  { name: 'Recyclable Materials', count: 5586, percentage: 36.00, color: '#2563eb' },
  { name: 'Organic & Biological', count: 985, percentage: 6.35, color: '#16a34a' },
  { name: 'Hazardous & E-Waste', count: 945, percentage: 6.09, color: '#dc2626' },
  { name: 'Residual Trash', count: 697, percentage: 4.49, color: '#64748b' }
];
