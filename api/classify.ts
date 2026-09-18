import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini GenAI client safely
const getAiClient = () => {
  dotenv.config();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const systemInstruction = `
You are an expert waste classification and circular materials intelligence model.
Your task is to analyze the provided image with high precision, identify the visible object, and determine its proper waste management stream.

CRITICAL INSTRUCTIONS:
1. IDENTIFY THE VISIBLE OBJECT FIRST:
   - Carefully examine what is physically shown in the image and provide a concise, factual description in 'visibleObjectDescription' (e.g., "several yellow banana peels on a surface", "transparent plastic drinking bottle with cap", "corrugated cardboard shipping box", "human face portrait / selfie", "living pet dog", "outdoor landscape").

2. NON-WASTE ENTITY GATEKEEPING:
   - If the main subject of the image is NOT an item of consumer, household, commercial, or industrial waste, recyclable packaging, food scrap, or scrap material (for example: a human portrait, selfie, living animal/pet, active automobile, natural scenic landscape, software IDE screenshot, meme, or document):
     - Set 'isWasteItem' = false
     - Set 'isIdentifiable' = true
     - Set 'itemName' = "Not a waste item"
     - Set 'category' = "Unknown"
     - Explain why in 'rejectionReason' and 'aiNotes'.

3. UNCLEAR / UNRECOGNIZABLE IMAGE GATEKEEPING:
   - If the image is pitch black, completely washed out, extremely blurry, severely corrupted, or impossible to determine:
     - Set 'isWasteItem' = false
     - Set 'isIdentifiable' = false
     - Set 'itemName' = "Unknown / Cannot Determine"
     - Set 'category' = "Unknown"
     - Set 'confidence' = lower than 40.
     - Never guess blindly.

4. REAL INFERENCE CONFIDENCE:
   - 'confidence' MUST be your genuine calibrated inference certainty score between 0 and 100 based on image clarity and visual evidence. Do NOT use fake or static numbers.

5. PRACTICAL CATEGORIES (Assign strictly one of these 9 categories):
   - 'Organic/Compostable': Food scraps, fruit peels (banana peels, apple cores, citrus rinds), vegetable trimmings, coffee grounds, eggshells, garden leaves/yard waste.
   - 'Recyclable Plastic': Rigid plastic bottles, jugs, tubs, and clean containers (PET #1, HDPE #2, PP #5).
   - 'Paper/Cardboard': Corrugated shipping boxes, paperboard packaging, newspapers, magazines, clean office paper.
   - 'Glass': Clear, amber, or green glass beverage bottles and jars.
   - 'Metal': Aluminum soda cans, tin/steel food cans, clean aluminum foil, scrap metal.
   - 'E-waste': Circuit boards, mobile phones, computers, cables, chargers, electronic gadgets.
   - 'Hazardous': Batteries, paint, motor oil, harsh chemicals, aerosol cans with hazard symbols, fluorescent bulbs.
   - 'General/Residual': Non-recyclable composite packaging, multilayer chip bags, dirty sanitary waste, general landfill refuse.
   - 'Unknown': If unidentifiable or non-waste.

6. MATCHING MATERIAL COMPOSITION & PREPARATION STEPS:
   - Composition must reflect what the identified object is actually composed of. For example, a banana peel must have organic cellulose/plant fiber and moisture, NEVER plastic polymers (PET) or metals.
   - Preparation steps must describe how to properly prepare that specific object (e.g., removing non-compostable produce stickers from fruit peels, rinsing bottles or cans).

7. NO BLIND GUESSES OR MISMATCHES:
   - Never classify fruit peels or food scraps as plastic bottles or containers.
   - Object, Category, Composition, Bin recommendation, and Preparation steps MUST all describe the exact same item.
`;

// Strict semantic consistency validator: Object <-> Category <-> Material <-> Bin <-> Preparation
function validateClassificationConsistency(data: any): any {
  if (!data) return null;

  const rawConfidence = typeof data.confidence === 'number'
    ? (data.confidence <= 1 && data.confidence > 0 ? data.confidence * 100 : data.confidence)
    : 85;
  const normalizedConfidence = Math.round(Math.min(100, Math.max(0, rawConfidence)));

  // 1. Unidentifiable / unclear image
  if (data.isIdentifiable === false || (data.category === 'Unknown' && data.isWasteItem !== false) || normalizedConfidence < 45) {
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
      confidence: normalizedConfidence,
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
      confidence: normalizedConfidence,
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
    confidence: normalizedConfidence,
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

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { imageBase64, textPrompt, sampleName } = req.body || {};

    if (!imageBase64 && !textPrompt && !sampleName) {
      return res.status(422).json({ 
        error: 'Please upload or capture an image of an item to classify.',
        isValidWaste: false 
      });
    }

    const ai = getAiClient();

    if (!ai) {
      return res.status(503).json({ 
        error: 'AI Vision Engine is unavailable: Please configure a valid GEMINI_API_KEY in your .env file to enable live visual classification.',
        isValidWaste: false,
        isIdentifiable: false,
        itemName: 'AI Engine Offline',
        category: 'Unknown'
      });
    }

    const contentsParts: any[] = [];

    if (imageBase64) {
      let pureBase64 = imageBase64;
      let mimeType = 'image/jpeg';
      if (imageBase64.includes(';base64,')) {
        const parts = imageBase64.split(';base64,');
        mimeType = parts[0].replace('data:', '');
        pureBase64 = parts[1];
      }

      if (!pureBase64 || pureBase64.length < 50 || !mimeType.startsWith('image/')) {
        return res.status(422).json({ 
          error: 'Please upload or capture a clear, valid image file.',
          isValidWaste: false 
        });
      }

      contentsParts.push({
        inlineData: {
          mimeType,
          data: pureBase64,
        },
      });
    }

    const promptContext = [
      textPrompt,
      sampleName,
    ].filter(Boolean).join(' | ');

    const promptText = promptContext 
      ? `Analyze this item visually: ${promptContext}. Identify visible object, verify waste relevance, and return accurate structured JSON.`
      : 'Analyze this image. Identify the visible object, determine if it is waste or non-waste, and return structured JSON classification.';

    contentsParts.push({ text: promptText });

    let response: any = null;
    const candidateModels = [
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
      'gemini-3.6-flash',
      'gemini-flash-latest',
      'gemini-2.5-flash-lite'
    ];
    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: { parts: contentsParts },
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isWasteItem: { 
                  type: Type.BOOLEAN, 
                  description: 'True if this is a legitimate discarded consumer/household/industrial waste, recyclable, or compostable item. False for people, pets, vehicles, landscapes, screenshots, or non-waste.' 
                },
                isIdentifiable: {
                  type: Type.BOOLEAN,
                  description: 'True if the object in the image is clear enough to recognize. False if pitch black, washed out, or completely unidentifiable.'
                },
                visibleObjectDescription: {
                  type: Type.STRING,
                  description: 'Accurate description of what is visible in the image (e.g. banana peels, plastic bottle, cardboard box, human face, pet dog)'
                },
                rejectionReason: { 
                  type: Type.STRING, 
                  description: 'Explanation if isWasteItem or isIdentifiable is false' 
                },
                itemName: { 
                  type: Type.STRING, 
                  description: 'Specific name of identified object (e.g. Banana Peel, Plastic Water Bottle, Aluminum Can, Not a waste item, Unknown / Cannot Determine)' 
                },
                brandOrModel: { 
                  type: Type.STRING, 
                  description: 'Brand, model, or material code if visible' 
                },
                category: { 
                  type: Type.STRING, 
                  description: 'One of: Organic/Compostable, Recyclable Plastic, Paper/Cardboard, Glass, Metal, E-waste, Hazardous, General/Residual, Unknown' 
                },
                confidence: { 
                  type: Type.NUMBER, 
                  description: 'Actual model inference confidence score from 0 to 100 based on visual evidence' 
                },
                recyclabilityScore: { 
                  type: Type.NUMBER, 
                  description: 'Recyclability or compostability feasibility score from 0 to 100' 
                },
                contaminationRisk: { 
                  type: Type.STRING, 
                  description: 'Risk of contamination: Low, Medium, or High' 
                },
                composition: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      material: { type: Type.STRING },
                      percentage: { type: Type.NUMBER },
                    },
                  },
                },
                segregationSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Actionable steps matching the detected object',
                },
                impact: {
                  type: Type.OBJECT,
                  properties: {
                    co2SavedKg: { type: Type.NUMBER },
                    energySavedKwh: { type: Type.NUMBER },
                    waterSavedLiters: { type: Type.NUMBER },
                    decompositionYears: { type: Type.NUMBER },
                  },
                },
                upcyclingIdeas: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                localDisposalNotice: { 
                  type: Type.STRING,
                  description: 'Disposal advice reflecting the item' 
                },
                aiNotes: { 
                  type: Type.STRING,
                  description: 'Technical visual observation notes detailing the object' 
                },
              },
              required: [
                'isWasteItem',
                'isIdentifiable',
                'visibleObjectDescription',
                'itemName',
                'category',
                'confidence',
              ],
            },
          },
        });
        if (response && response.text) break;
      } catch (mErr: any) {
        console.warn(`Model ${modelName} attempt failed:`, mErr?.message || mErr);
      }
    }

    const rawJson = response?.text;
    if (!rawJson) {
      throw new Error('No valid response received from vision AI model.');
    }

    const parsed = JSON.parse(rawJson);
    const validatedResult = validateClassificationConsistency(parsed);

    return res.status(200).json(validatedResult);
  } catch (error: any) {
    console.error('Classification error:', error);
    const errMsg = error?.message || '';
    const isAuthError = errMsg.includes('API key') || errMsg.includes('API_KEY_INVALID') || errMsg.includes('401') || errMsg.includes('403');
    
    return res.status(isAuthError ? 401 : 422).json({ 
      error: isAuthError 
        ? 'Invalid Gemini API key. Please configure a valid GEMINI_API_KEY in your .env file.'
        : 'Unable to analyze image. Please upload a clear photo of an item.',
      isValidWaste: false,
      isIdentifiable: false,
      itemName: 'Classification Error',
      category: 'Unknown'
    });
  }
}
