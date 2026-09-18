import dotenv from 'dotenv';
dotenv.config();

// Define validation engine matching server.ts & api/classify.ts
function validateClassificationConsistency(data: any): any {
  if (!data) return null;

  // 1. Unidentifiable / unclear image
  if (data.isIdentifiable === false || (data.category === 'Unknown' && data.isWasteItem !== false) || (typeof data.confidence === 'number' && data.confidence < 45)) {
    return {
      id: 'scan-' + Date.now(),
      timestamp: new Date().toISOString(),
      isWasteItem: false,
      isIdentifiable: false,
      visibleObjectDescription: data.visibleObjectDescription || 'Unclear visual input',
      itemName: 'Unknown / Cannot Determine',
      brandOrModel: 'Unclear Object',
      category: 'Unknown',
      primaryBin: 'Special / Local Collection',
      binColor: '#64748b',
      confidence: typeof data.confidence === 'number' ? Math.round(Math.min(100, Math.max(0, data.confidence))) : 30,
      recyclabilityScore: 0,
      contaminationRisk: 'High',
      composition: [{ material: 'Unidentified Material', percentage: 100 }],
      segregationSteps: [
        'Upload or capture a clear, well-lit photo of the item on a plain background.',
        'Verify item composition labels or markings before disposing.',
      ],
      impact: {
        co2SavedKg: 0,
        energySavedKwh: 0,
        waterSavedLiters: 0,
        decompositionYears: 0,
      },
      upcyclingIdeas: ['Inspect packaging labels or recycling resin codes on the container.'],
      localDisposalNotice: 'Image is too blurry, dark, or ambiguous to determine disposal stream with certainty. Never guess.',
      localGuidanceDisclaimer: 'Always follow your local waste authority guidelines when sorting unidentified items.',
      aiNotes: 'The visual AI model could not identify the item with sufficient certainty.',
    };
  }

  // 2. Non-waste entity gatekeeping
  if (data.isWasteItem === false) {
    return {
      id: 'scan-' + Date.now(),
      timestamp: new Date().toISOString(),
      isWasteItem: false,
      isIdentifiable: true,
      visibleObjectDescription: data.visibleObjectDescription || 'Non-waste subject',
      itemName: 'Not a waste item',
      brandOrModel: data.visibleObjectDescription || 'Non-waste entity',
      category: 'Unknown',
      primaryBin: 'Special / Local Collection',
      binColor: '#64748b',
      confidence: typeof data.confidence === 'number' ? Math.round(Math.min(100, Math.max(0, data.confidence))) : 90,
      recyclabilityScore: 0,
      contaminationRisk: 'Low',
      composition: [{ material: 'N/A (Non-waste entity)', percentage: 100 }],
      segregationSteps: [
        'This subject is not a household, commercial, or discarded waste item.',
        'Do not discard in municipal waste or recycling containers.',
      ],
      impact: {
        co2SavedKg: 0,
        energySavedKwh: 0,
        waterSavedLiters: 0,
        decompositionYears: 0,
      },
      upcyclingIdeas: [],
      localDisposalNotice: data.rejectionReason || 'Identified as a non-waste subject (e.g. person, living animal, natural vista, or software screenshot).',
      localGuidanceDisclaimer: 'Municipal waste streams are intended exclusively for discarded materials and packaging.',
      aiNotes: `Observed: ${data.visibleObjectDescription || 'Non-waste subject'}. Classification as waste declined.`,
    };
  }

  // 3. Category Normalization
  let category: string = data.category || 'General/Residual';
  const catLower = category.toLowerCase();
  const nameLower = (data.itemName || '').toLowerCase();
  const descLower = (data.visibleObjectDescription || '').toLowerCase();

  // Cross-check: If name or visible object explicitly indicates banana / fruit / food / plant
  if (
    nameLower.includes('banana') || nameLower.includes('apple') || nameLower.includes('peel') ||
    nameLower.includes('fruit') || nameLower.includes('vegetable') || nameLower.includes('food') ||
    descLower.includes('banana') || descLower.includes('peel') || descLower.includes('fruit') ||
    catLower.includes('organic') || catLower.includes('compost')
  ) {
    category = 'Organic/Compostable';
  } else if (
    catLower.includes('plastic') || (nameLower.includes('bottle') && !nameLower.includes('glass')) ||
    descLower.includes('plastic bottle')
  ) {
    category = 'Recyclable Plastic';
  } else if (catLower.includes('cardboard') || catLower.includes('paper') || nameLower.includes('cardboard') || nameLower.includes('box')) {
    category = 'Paper/Cardboard';
  } else if (catLower.includes('glass') || nameLower.includes('glass')) {
    category = 'Glass';
  } else if (catLower.includes('metal') || catLower.includes('aluminum') || (nameLower.includes('can') && !nameLower.includes('trash can'))) {
    category = 'Metal';
  } else if (catLower.includes('battery') || catLower.includes('e-waste') || catLower.includes('electronic')) {
    category = 'E-waste';
  } else if (catLower.includes('hazardous')) {
    category = 'Hazardous';
  }

  // Enforce Category -> Bin -> Color mapping
  let primaryBin = 'General Waste / Landfill';
  let binColor = '#4b5563';

  switch (category) {
    case 'Organic/Compostable':
      primaryBin = 'Compost / Organics Bin';
      binColor = '#16a34a';
      break;
    case 'Recyclable Plastic':
      primaryBin = 'Plastic Recycling Bin';
      binColor = '#2563eb';
      break;
    case 'Paper/Cardboard':
      primaryBin = 'Paper / Cardboard Bin';
      binColor = '#eab308';
      break;
    case 'Glass':
      primaryBin = 'Glass Recycling Bin';
      binColor = '#0891b2';
      break;
    case 'Metal':
      primaryBin = 'Metal Recycling Bin';
      binColor = '#2563eb';
      break;
    case 'E-waste':
      primaryBin = 'E-Waste Drop-off';
      binColor = '#dc2626';
      break;
    case 'Hazardous':
      primaryBin = 'Hazardous Waste Facility';
      binColor = '#dc2626';
      break;
    default:
      primaryBin = 'General Waste / Landfill';
      binColor = '#4b5563';
      break;
  }

  // Cross-check Composition consistency
  let composition = Array.isArray(data.composition) && data.composition.length > 0
    ? data.composition.map((c: any) => ({
        material: c.material || 'Standard Composition',
        percentage: typeof c.percentage === 'number' ? c.percentage : 100,
      }))
    : [{ material: 'Composite Material', percentage: 100 }];

  // If Organic, purge any plastics/metals from composition
  if (category === 'Organic/Compostable') {
    const hasInconsistentPlastic = composition.some((c: any) =>
      c.material.toLowerCase().includes('plastic') ||
      c.material.toLowerCase().includes('pet') ||
      c.material.toLowerCase().includes('polymer') ||
      c.material.toLowerCase().includes('aluminum')
    );
    if (hasInconsistentPlastic) {
      composition = [
        { material: 'Organic Plant Cellulose & Moisture', percentage: 92 },
        { material: 'Natural Bio-Minerals (Potassium, Nitrogen)', percentage: 8 },
      ];
    }
  }

  // Cross-check Preparation Steps consistency
  let steps = Array.isArray(data.segregationSteps) && data.segregationSteps.length > 0
    ? data.segregationSteps
    : ['Deposit in designated municipal container'];

  if (category === 'Organic/Compostable') {
    const hasPlasticStep = steps.some((s: string) =>
      s.toLowerCase().includes('crush bottle') ||
      s.toLowerCase().includes('rinse can') ||
      s.toLowerCase().includes('flatten box')
    );
    if (hasPlasticStep) {
      steps = [
        'Remove any non-compostable stickers, plastic ties, or tags',
        'Do not wrap in conventional plastic bags; use certified compostable liners or paper bags',
        'Deposit into your municipal compost/organics bin or backyard compost pile',
      ];
    }
  }

  return {
    id: data.id || 'scan-' + Date.now(),
    timestamp: data.timestamp || new Date().toISOString(),
    isWasteItem: true,
    isIdentifiable: true,
    visibleObjectDescription: data.visibleObjectDescription || data.itemName,
    itemName: data.itemName || 'Identified Waste Item',
    brandOrModel: data.brandOrModel || '',
    category,
    primaryBin,
    binColor,
    confidence: typeof data.confidence === 'number' ? Math.round(Math.min(100, Math.max(0, data.confidence))) : 90,
    recyclabilityScore: typeof data.recyclabilityScore === 'number' ? Math.round(Math.min(100, Math.max(0, data.recyclabilityScore))) : 80,
    contaminationRisk: data.contaminationRisk || 'Low',
    composition,
    segregationSteps: steps,
    impact: {
      co2SavedKg: typeof data.impact?.co2SavedKg === 'number' ? data.impact.co2SavedKg : 0.2,
      energySavedKwh: typeof data.impact?.energySavedKwh === 'number' ? data.impact.energySavedKwh : 0.4,
      waterSavedLiters: typeof data.impact?.waterSavedLiters === 'number' ? data.impact.waterSavedLiters : 1.5,
      decompositionYears: typeof data.impact?.decompositionYears === 'number' ? data.impact.decompositionYears : 10,
    },
    upcyclingIdeas: Array.isArray(data.upcyclingIdeas) ? data.upcyclingIdeas : [],
    localDisposalNotice: data.localDisposalNotice || 'Follow local municipal sorting guidelines for this item.',
    localGuidanceDisclaimer: 'Bin colors and sorting rules vary by local municipality; always follow your local waste management authority guidelines.',
    aiNotes: data.aiNotes || `Identified ${data.itemName} as ${category}.`,
  };
}

// Automated Test Suite
function runTests() {
  console.log('====================================================');
  console.log('ECOSORT AI CLASSIFICATION CONSISTENCY VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      if (details) console.error(`       ${details}`);
      failed++;
    }
  }

  // Test 1: Banana Peel / Fruit Scrap
  const bananaInput = {
    isWasteItem: true,
    isIdentifiable: true,
    visibleObjectDescription: 'yellow banana peel on a kitchen countertop',
    itemName: 'Banana Peel',
    category: 'Organic/Compostable',
    confidence: 96,
    composition: [{ material: 'PET Plastic Polymer', percentage: 100 }], // simulated mismatch from buggy output
    segregationSteps: ['Crush bottle and replace cap'],                  // simulated mismatch
  };
  const bananaRes = validateClassificationConsistency(bananaInput);
  assert(bananaRes.category === 'Organic/Compostable', 'Test 1.1: Banana is categorized as Organic/Compostable');
  assert(bananaRes.primaryBin === 'Compost / Organics Bin', 'Test 1.2: Banana bin is Compost / Organics Bin');
  assert(bananaRes.binColor === '#16a34a', 'Test 1.3: Banana bin color is Green (#16a34a)');
  assert(!bananaRes.composition.some((c: any) => c.material.includes('PET') || c.material.includes('Plastic')), 'Test 1.4: Inconsistent plastic purged from banana composition');
  assert(!bananaRes.segregationSteps.some((s: string) => s.includes('Crush bottle')), 'Test 1.5: Inconsistent plastic steps purged from banana preparation');

  // Test 2: Plastic Drinking Bottle
  const plasticInput = {
    isWasteItem: true,
    isIdentifiable: true,
    visibleObjectDescription: 'transparent plastic beverage bottle with screw cap',
    itemName: 'Plastic Water Bottle',
    category: 'Recyclable Plastic',
    confidence: 98,
    composition: [{ material: 'Polyethylene Terephthalate (PET #1)', percentage: 95 }, { material: 'HDPE #2 Cap', percentage: 5 }],
    segregationSteps: ['Empty liquid residue', 'Crush bottle to reduce volume', 'Screw cap back on'],
  };
  const plasticRes = validateClassificationConsistency(plasticInput);
  assert(plasticRes.category === 'Recyclable Plastic', 'Test 2.1: Plastic bottle is categorized as Recyclable Plastic');
  assert(plasticRes.primaryBin === 'Plastic Recycling Bin', 'Test 2.2: Plastic bottle bin is Plastic Recycling Bin');
  assert(plasticRes.binColor === '#2563eb', 'Test 2.3: Plastic bottle bin color is Blue (#2563eb)');

  // Test 3: Cardboard Shipping Box
  const cardboardInput = {
    isWasteItem: true,
    isIdentifiable: true,
    visibleObjectDescription: 'brown corrugated cardboard shipping box',
    itemName: 'Cardboard Box',
    category: 'Paper/Cardboard',
    confidence: 94,
    composition: [{ material: 'Kraft Unbleached Wood Pulp', percentage: 100 }],
    segregationSteps: ['Remove plastic shipping tape', 'Flatten box flat'],
  };
  const cardboardRes = validateClassificationConsistency(cardboardInput);
  assert(cardboardRes.category === 'Paper/Cardboard', 'Test 3.1: Cardboard box categorized as Paper/Cardboard');
  assert(cardboardRes.primaryBin === 'Paper / Cardboard Bin', 'Test 3.2: Cardboard bin is Paper / Cardboard Bin');
  assert(cardboardRes.binColor === '#eab308', 'Test 3.3: Cardboard bin color is Yellow (#eab308)');

  // Test 4: Glass Beverage Bottle
  const glassInput = {
    isWasteItem: true,
    isIdentifiable: true,
    visibleObjectDescription: 'green glass beverage bottle',
    itemName: 'Glass Bottle',
    category: 'Glass',
    confidence: 92,
    composition: [{ material: 'Silica Soda-Lime Glass', percentage: 100 }],
    segregationSteps: ['Rinse cleanly', 'Separate metal crown cap'],
  };
  const glassRes = validateClassificationConsistency(glassInput);
  assert(glassRes.category === 'Glass', 'Test 4.1: Glass bottle categorized as Glass');
  assert(glassRes.primaryBin === 'Glass Recycling Bin', 'Test 4.2: Glass bottle bin is Glass Recycling Bin');
  assert(glassRes.binColor === '#0891b2', 'Test 4.3: Glass bottle bin color is Cyan (#0891b2)');

  // Test 5: Aluminum Can
  const canInput = {
    isWasteItem: true,
    isIdentifiable: true,
    visibleObjectDescription: 'aluminum soda beverage can with pull tab',
    itemName: 'Aluminum Can',
    category: 'Metal',
    confidence: 97,
    composition: [{ material: 'Aluminum Alloy 3104', percentage: 100 }],
    segregationSteps: ['Rinse out leftover beverage', 'Keep pull-tab intact on can'],
  };
  const canRes = validateClassificationConsistency(canInput);
  assert(canRes.category === 'Metal', 'Test 5.1: Aluminum can categorized as Metal');
  assert(canRes.primaryBin === 'Metal Recycling Bin', 'Test 5.2: Aluminum can bin is Metal Recycling Bin');

  // Test 6: Electronic Device / Motherboard / Smartphone
  const ewasteInput = {
    isWasteItem: true,
    isIdentifiable: true,
    visibleObjectDescription: 'computer motherboard circuit board with microchip components',
    itemName: 'Electronic Circuit Board',
    category: 'E-waste',
    confidence: 95,
    composition: [{ material: 'FR-4 Fiberglass & Copper Traces', percentage: 80 }, { material: 'Precious & Solder Metals', percentage: 20 }],
    segregationSteps: ['Do not crush or incinerate', 'Deliver to dedicated e-waste recycling depot'],
  };
  const ewasteRes = validateClassificationConsistency(ewasteInput);
  assert(ewasteRes.category === 'E-waste', 'Test 6.1: Circuit board categorized as E-waste');
  assert(ewasteRes.primaryBin === 'E-Waste Drop-off', 'Test 6.2: E-waste bin is E-Waste Drop-off');
  assert(ewasteRes.binColor === '#dc2626', 'Test 6.3: E-waste bin color is Red (#dc2626)');

  // Test 7: Non-Waste Item (Person Selfie / Pet Dog / Scenic View)
  const nonWasteInput = {
    isWasteItem: false,
    isIdentifiable: true,
    visibleObjectDescription: 'portrait of a smiling human face',
    itemName: 'Not a waste item',
    category: 'Unknown',
    confidence: 95,
    rejectionReason: 'Subject is a human person, not discarded waste or packaging',
  };
  const nonWasteRes = validateClassificationConsistency(nonWasteInput);
  assert(nonWasteRes.isWasteItem === false, 'Test 7.1: isWasteItem is false for non-waste subject');
  assert(nonWasteRes.itemName === 'Not a waste item', 'Test 7.2: itemName is "Not a waste item"');
  assert(nonWasteRes.category === 'Unknown', 'Test 7.3: Category is Unknown for non-waste');

  // Test 8: Unidentifiable / Pitch-Black / Unclear Image
  const unclearInput = {
    isWasteItem: false,
    isIdentifiable: false,
    visibleObjectDescription: 'pitch black / completely underexposed frame',
    itemName: 'Unknown / Cannot Determine',
    category: 'Unknown',
    confidence: 15,
  };
  const unclearRes = validateClassificationConsistency(unclearInput);
  assert(unclearRes.isIdentifiable === false, 'Test 8.1: isIdentifiable is false for unclear image');
  assert(unclearRes.itemName === 'Unknown / Cannot Determine', 'Test 8.2: itemName is "Unknown / Cannot Determine"');

  // Test 9: Municipal Disclaimer Present Across All Outputs
  assert(typeof bananaRes.localGuidanceDisclaimer === 'string' && bananaRes.localGuidanceDisclaimer.length > 10, 'Test 9.1: Banana result has localGuidanceDisclaimer');
  assert(typeof plasticRes.localGuidanceDisclaimer === 'string' && plasticRes.localGuidanceDisclaimer.length > 10, 'Test 9.2: Plastic bottle result has localGuidanceDisclaimer');

  console.log(`\nVerification Summary: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
