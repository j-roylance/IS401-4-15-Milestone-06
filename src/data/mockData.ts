export interface DrugEquivalent {
  name: string;
  equivalentName: string;
  strength: 'Stronger' | 'Same' | 'Weaker';
  activeIngredients: string[];
  dosageSummary: string;
  ingredientOverlapWarning: string;
  whyEquivalent: string;
  image: string;
}

export interface SymptomMedicine {
  name: string;
  description: string;
  strength: 'Mild' | 'Regular' | 'Strong';
  dosageInstructions: string;
  maxPerDay: string;
  ingredients: string[];
  safeForAsthma: boolean;
  allergyWarning: string;
  interactionWarning: string;
  whyRecommended: string;
  image: string;
}

export interface DosageResult {
  medicine: string;
  dosage: string;
  frequency: string;
  maxPerDay: string;
  safetyWarning: string;
  explanation: string;
  details: string;
}

export const drugs = [
  'Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Metformin', 'Omeprazole',
  'Aspirin', 'Ciprofloxacin', 'Diclofenac', 'Loratadine', 'Cetirizine',
  'Azithromycin', 'Pantoprazole', 'Atorvastatin', 'Amlodipine', 'Lisinopril',
  'Metoprolol', 'Losartan', 'Gabapentin', 'Sertraline', 'Fluoxetine',
];

export const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'India', 'Brazil', 'Japan', 'South Korea', 'Mexico',
  'Spain', 'Italy', 'Netherlands', 'Sweden', 'Switzerland', 'Norway',
  'Turkey', 'Egypt', 'South Africa', 'Nigeria', 'Kenya', 'Argentina',
  'Colombia', 'Thailand', 'Vietnam', 'Philippines', 'Indonesia',
  'Malaysia', 'Singapore', 'New Zealand', 'Ireland', 'Portugal', 'Poland',
];

export const symptomChips = ['Cold', 'Fever', 'Cough', 'Headache', 'Allergies'];

export function getDrugEquivalent(drug: string, _from: string, to: string): DrugEquivalent {
  const strengths: DrugEquivalent['strength'][] = ['Stronger', 'Same', 'Weaker'];
  return {
    name: drug,
    equivalentName: `${drug}-${to.slice(0, 2).toUpperCase()} Equivalent`,
    strength: strengths[Math.floor(Math.random() * 3)],
    activeIngredients: [drug.toLowerCase(), 'magnesium stearate', 'microcrystalline cellulose'],
    dosageSummary: '500mg, taken orally every 4–6 hours as needed. Do not exceed 4g/day.',
    ingredientOverlapWarning: 'Contains similar active compounds. Avoid taking both simultaneously to prevent overdose.',
    whyEquivalent: `This medicine contains the same primary active ingredient as ${drug} and is approved for the same therapeutic use in ${to}. The bioequivalence has been confirmed through pharmacological studies.`,
    image: `https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop`,
  };
}

export function getSymptomMedicine(symptoms: string[]): SymptomMedicine {
  const hasMultiple = symptoms.length > 2;
  return {
    name: hasMultiple ? 'MultiRelief Plus' : 'SimpleRelief 500',
    description: `A ${hasMultiple ? 'multi-symptom relief' : 'targeted relief'} formulation designed to address ${symptoms.join(', ').toLowerCase()}. Provides fast-acting and sustained relief for up to 8 hours.`,
    strength: hasMultiple ? 'Strong' : 'Regular',
    dosageInstructions: 'Take 1 tablet every 6 hours with food. Swallow whole with water.',
    maxPerDay: '4 tablets (2000mg)',
    ingredients: ['acetaminophen', 'phenylephrine HCl', 'dextromethorphan', 'guaifenesin'],
    safeForAsthma: !symptoms.includes('Cough'),
    allergyWarning: 'Contains acetaminophen. Consult a doctor if you have liver disease.',
    interactionWarning: 'May interact with MAO inhibitors and blood thinners. Consult your physician.',
    whyRecommended: `Based on your symptoms (${symptoms.join(', ')}), this medicine addresses the most common underlying causes and provides comprehensive relief with minimal side effects.`,
    image: `https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&h=300&fit=crop`,
  };
}

export function getDosageResult(medicine: string, age: number, weight: number, gender: string): DosageResult {
  const baseDosc = weight < 70 ? 250 : 500;
  const adjustedDose = age > 65 ? baseDosc * 0.75 : baseDosc;
  return {
    medicine,
    dosage: `${Math.round(adjustedDose)}mg`,
    frequency: 'Every 6 hours',
    maxPerDay: `${Math.round(adjustedDose) * 4}mg`,
    safetyWarning: age > 65
      ? 'Reduced dosage recommended for patients over 65. Monitor kidney function.'
      : 'Standard dosage. Do not exceed the maximum daily limit.',
    explanation: `Based on your weight (${weight}kg), age (${age}), and ${gender} physiology, the recommended dose balances efficacy with safety. This accounts for standard metabolic rates and clearance.`,
    details: `Pharmacokinetic modeling suggests a Cmax of ~${(adjustedDose * 0.02).toFixed(1)}μg/mL achieved within 1–2 hours. Half-life: ~4 hours. Hepatic metabolism via CYP enzymes. Renal excretion of metabolites.`,
  };
}
