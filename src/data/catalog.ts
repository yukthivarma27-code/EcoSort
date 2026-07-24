import { CatalogItem } from '../types';

export const CATALOG_ITEMS: CatalogItem[] = [
  {
    id: 'cat-1',
    name: 'PET Plastics (#1)',
    category: 'Recyclable Plastics',
    recommendedBin: 'Blue Bin (Recycling)',
    reusable: true,
    recyclable: true,
    compostable: false,
    commonExamples: ['Water bottles', 'Soda bottles', 'Peanut butter jars', 'Salad dressing containers'],
    preparationTips: [
      'Empty completely and rinse residual liquids with cold water',
      'Keep plastic cap on (modern facilities recover caps with bottles)',
      'Crush or compress bottle to save space in collection container'
    ],
    decompositionTime: '450 years',
    commonMistakes: 'Leaving half-filled liquids inside causes cross-contamination and rejects batches at optical sorters.'
  },
  {
    id: 'cat-2',
    name: 'HDPE Plastics (#2)',
    category: 'Recyclable Plastics',
    recommendedBin: 'Blue Bin (Recycling)',
    reusable: true,
    recyclable: true,
    compostable: false,
    commonExamples: ['Milk jugs', 'Detergent bottles', 'Shampoo containers', 'Bleach bottles'],
    preparationTips: [
      'Rinse thoroughly to remove viscous soap or dairy residue',
      'Remove non-HDPE pump spray handles if multi-material',
      'Flatten or stack jugs to optimize collection volume'
    ],
    decompositionTime: '100 - 500 years',
    commonMistakes: 'Not rinsing detergent residue, which degrades chemical recycling purity.'
  },
  {
    id: 'cat-3',
    name: 'Corrugated Cardboard',
    category: 'Paper & Cardboard',
    recommendedBin: 'Yellow Bin (Paper/Cardboard)',
    reusable: true,
    recyclable: true,
    compostable: true,
    commonExamples: ['Delivery boxes', 'Appliance packaging', 'Shoe boxes', 'Moving containers'],
    preparationTips: [
      'Remove plastic packing tape, shipping pouches, and styrofoam inserts',
      'Flatten all boxes completely to lie flush',
      'Ensure cardboard is completely dry'
    ],
    decompositionTime: '2 - 3 months',
    commonMistakes: 'Mixing grease-soaked pizza boxes with clean paper recycling. Oily cardboard belongs in compost or landfill!'
  },
  {
    id: 'cat-4',
    name: 'Organic Food Scraps',
    category: 'Compostable & Organic',
    recommendedBin: 'Green Bin (Compost/Organics)',
    reusable: false,
    recyclable: false,
    compostable: true,
    commonExamples: ['Fruit peels', 'Vegetable trimmings', 'Coffee grounds', 'Eggshells', 'Garden clippings'],
    preparationTips: [
      'Remove fruit stickers and rubber bands before disposal',
      'Store in certified BPI-compostable bags or unlined caddy',
      'Mix green (nitrogen) and brown (carbon) organic waste'
    ],
    decompositionTime: '2 - 6 weeks',
    commonMistakes: 'Disposing in sealed plastic bags, which prevents aerobic digestion and releases methane.'
  },
  {
    id: 'cat-5',
    name: 'Aluminum Cans & Foil',
    category: 'Metal & Aluminum',
    recommendedBin: 'Blue Bin (Recycling)',
    reusable: true,
    recyclable: true,
    compostable: false,
    commonExamples: ['Soda cans', 'Beer cans', 'Clean aluminum foil', 'Cat food tins'],
    preparationTips: [
      'Rinse out food or beverage leftovers',
      'Ball up clean aluminum foil into a single sphere (>2 inches wide)',
      'Do not flatten cans completely if your local facility uses eddy current separation'
    ],
    decompositionTime: '80 - 200 years (Can be recycled indefinitely!)',
    commonMistakes: 'Throwing away dirty foil covered in heavy cheese or oil grease.'
  },
  {
    id: 'cat-6',
    name: 'Lithium & Electronic Waste',
    category: 'E-Waste & Electronics',
    recommendedBin: 'Red Bin (E-Waste / Hazardous)',
    reusable: false,
    recyclable: true,
    compostable: false,
    commonExamples: ['Smartphones', 'Lithium batteries', 'Laptops', 'Power banks', 'Circuit boards'],
    preparationTips: [
      'NEVER place in standard municipal trash or recycling curbside bins',
      'Tape battery terminals with clear electrical tape to eliminate spark risks',
      'Drop off at designated EcoSort municipal collection kiosks or retail take-back programs'
    ],
    decompositionTime: 'Indefinite (High risk of toxic heavy metal leaching)',
    commonMistakes: 'Tossing batteries into blue bins — this is the #1 cause of recycling facility fires!'
  },
  {
    id: 'cat-7',
    name: 'Glass Containers & Jars',
    category: 'Glass & Glassware',
    recommendedBin: 'Blue Bin (Recycling)',
    reusable: true,
    recyclable: true,
    compostable: false,
    commonExamples: ['Wine bottles', 'Jam jars', 'Olive oil containers', 'Beverage glass'],
    preparationTips: [
      'Rinse out contents thoroughly',
      'Separate metal lids for individual metal recycling sorting',
      'Do not break intentionally before disposal'
    ],
    decompositionTime: '1,000,000+ years',
    commonMistakes: 'Mixing Pyrex heat-resistant glass or ceramic mugs with container glass — different melting points ruin batches.'
  }
];
