import { DbScanRecord } from '../types';

export const INITIAL_SCAN_HISTORY: DbScanRecord[] = [
  {
    id: 32,
    predicted_category: "Organic/Compostable",
    confidence: 98.0,
    image_analysis: "Visual identification confirmed biodegradable organic matter.",
    guidance: "Place in your green compost bin or home composting system.",
    created_at: "2026-10-03T02:33:08.104Z"
  },
  {
    id: 31,
    predicted_category: "Organic/Compostable",
    confidence: 98.0,
    image_analysis: "Visual identification confirmed fruit / vegetable scrap material.",
    guidance: "Place in your municipal organic waste or backyard compost bin.",
    created_at: "2026-10-03T02:29:48.695Z"
  },
  {
    id: 30,
    predicted_category: "Organic/Compostable",
    confidence: 99.0,
    image_analysis: "Visual identification confirmed compostable food matter.",
    guidance: "Place in your municipal green bin or home composting system.",
    created_at: "2026-10-03T02:25:36.654Z"
  },
  {
    id: 29,
    predicted_category: "Paper/Cardboard",
    confidence: 75.8,
    image_analysis: "Identified corrugated paper and fiberboard material.",
    guidance: "Flatten cardboard packaging and place in the dry paper recycling container.",
    created_at: "2026-10-02T19:01:25.630Z"
  },
  {
    id: 28,
    predicted_category: "Recyclable Plastic",
    confidence: 89.5,
    image_analysis: "Identified transparent PET #1 plastic beverage bottle.",
    guidance: "Empty and rinse the bottle, remove cap, and place in the blue plastic recycling bin.",
    created_at: "2026-10-02T18:57:55.216Z"
  },
  {
    id: 27,
    predicted_category: "clothes",
    confidence: 98.2,
    image_analysis: "Identified post-consumer textile / apparel item.",
    guidance: "If wearable, clean and donate to charity. If worn out, take to dedicated textile recycling containers.",
    created_at: "2026-10-02T18:42:25.451Z"
  },
  {
    id: 26,
    predicted_category: "battery",
    confidence: 89.3,
    image_analysis: "Identified dry cell battery requiring hazardous e-waste segregation.",
    guidance: "Do not dispose in curbside bins. Tape terminals and drop off at certified battery collection depots.",
    created_at: "2026-10-02T18:41:20.060Z"
  },
  {
    id: 25,
    predicted_category: "Recyclable Plastic",
    confidence: 87.2,
    image_analysis: "Identified rigid HDPE container.",
    guidance: "Empty remaining liquids, rinse container, and deposit into your blue recycling container.",
    created_at: "2026-10-02T18:37:09.433Z"
  },
  {
    id: 24,
    predicted_category: "Recyclable Plastic",
    confidence: 87.2,
    image_analysis: "Identified recyclable polymer container.",
    guidance: "Empty remaining liquids, rinse container, and deposit into your blue recycling container.",
    created_at: "2026-10-02T18:37:03.136Z"
  },
  {
    id: 23,
    predicted_category: "Paper/Cardboard",
    confidence: 99.7,
    image_analysis: "Identified clean dry cellulose paper sheet.",
    guidance: "Ensure paper is dry and clean of food stains before placing in the yellow paper recycling bin.",
    created_at: "2026-10-02T18:35:33.626Z"
  },
  {
    id: 22,
    predicted_category: "Hazardous & Special",
    confidence: 89.3,
    image_analysis: "Identified specialized hazardous e-waste item.",
    guidance: "Deposit at certified municipal hazardous waste collection bins or retail electronics depots.",
    created_at: "2026-10-02T18:30:18.289Z"
  },
  {
    id: 21,
    predicted_category: "Footwear & Apparel",
    confidence: 67.1,
    image_analysis: "Identified rubber/synthetic footwear.",
    guidance: "If usable, donate to footwear reuse initiatives. If heavily damaged, place in specialized rubber drop-offs.",
    created_at: "2026-10-02T18:29:45.443Z"
  },
  {
    id: 20,
    predicted_category: "Compostable & Organic",
    confidence: 99.9,
    image_analysis: "Identified organic compostable material.",
    guidance: "Remove stickers and deposit directly into your green organics bin or backyard compost pile.",
    created_at: "2026-10-02T18:29:20.254Z"
  },
  {
    id: 19,
    predicted_category: "Compostable & Organic",
    confidence: 99.1,
    image_analysis: "Identified biodegradable organic matter.",
    guidance: "Deposit directly into your green organics bin or backyard compost pile.",
    created_at: "2026-10-02T18:28:38.518Z"
  },
  {
    id: 18,
    predicted_category: "Recyclable Plastics",
    confidence: 85.0,
    image_analysis: "Identified recyclable plastic item.",
    guidance: "Empty remaining liquids, rinse container, and deposit into your blue recycling container.",
    created_at: "2026-10-02T18:27:34.036Z"
  },
  {
    id: 9,
    predicted_category: "Recyclable Plastics",
    confidence: 94.0,
    image_analysis: "Identified recyclable plastic bottle.",
    guidance: "Empty remaining liquids, rinse container, and deposit into your blue recycling container.",
    created_at: "2026-10-02T18:09:06.993Z"
  },
  {
    id: 8,
    predicted_category: "Recyclable Plastic",
    confidence: 91.0,
    image_analysis: "Identified plastic container.",
    guidance: "Empty and rinse container. Flatten bottle to save bin space.",
    created_at: "2026-10-02T17:29:54.364Z"
  },
  {
    id: 5,
    predicted_category: "Glass",
    confidence: 92.8,
    image_analysis: "Identified glass container.",
    guidance: "Rinse clean and deposit in glass bin.",
    created_at: "2026-10-02T17:15:50.822Z"
  },
  {
    id: 4,
    predicted_category: "Paper/Cardboard",
    confidence: 96.0,
    image_analysis: "Identified cardboard shipping box.",
    guidance: "Flatten box and place in yellow bin.",
    created_at: "2026-10-02T17:15:50.822Z"
  },
  {
    id: 3,
    predicted_category: "Recyclable Plastic",
    confidence: 94.2,
    image_analysis: "Identified plastic jug.",
    guidance: "Rinse and place in blue recycling bin.",
    created_at: "2026-10-02T17:15:50.822Z"
  },
  {
    id: 2,
    predicted_category: "Organic/Compostable",
    confidence: 97.5,
    image_analysis: "Identified banana peels and citrus peels.",
    guidance: "Compost in green bin. Remove fruit stickers.",
    created_at: "2026-10-02T17:15:50.822Z"
  },
  {
    id: 1,
    predicted_category: "Recyclable Plastic",
    confidence: 94.0,
    image_analysis: "Identified PET bottle.",
    guidance: "Empty and rinse container. Flatten bottle to save bin space.",
    created_at: "2026-10-02T17:12:09.656Z"
  }
];
