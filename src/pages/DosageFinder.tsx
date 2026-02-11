import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, AlertTriangle, Shield } from 'lucide-react';
import FlowLayout from '@/components/FlowLayout';
import StepProgress from '@/components/StepProgress';
import DrugSearchInput from '@/components/DrugSearchInput';
import ExpandableSection from '@/components/ExpandableSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getDosageResult, type DosageResult } from '@/data/mockData';

const DosageFinder = () => {
  const [step, setStep] = useState(0);
  const [drug, setDrug] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [result, setResult] = useState<DosageResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!age || Number(age) < 1 || Number(age) > 120) e.age = 'Enter a valid age (1–120)';
    if (!gender) e.gender = 'Select a gender';
    if (!height || Number(height) <= 0) e.height = 'Enter a valid height';
    if (!weight || Number(weight) <= 0) e.weight = 'Enter a valid weight';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const weightKg = weightUnit === 'lb' ? Number(weight) * 0.453592 : Number(weight);
    setResult(getDosageResult(drug, Number(age), Math.round(weightKg), gender));
    setStep(2);
  };

  const stepLabels = ['Medicine', 'About You', 'Dosage'];

  return (
    <FlowLayout
      title={
        step === 0
          ? 'What is the name of your medicine?'
          : step === 1
          ? 'Tell us about yourself'
          : undefined
      }
      onBack={step > 0 ? () => setStep(step - 1) : undefined}
      step={step}
    >
      {step < 2 && <StepProgress currentStep={step} totalSteps={3} labels={stepLabels} />}

      {step === 0 && (
        <div className="space-y-6">
          <DrugSearchInput value={drug} onChange={setDrug} />
          <Button onClick={() => setStep(1)} disabled={!drug} className="w-full h-12 text-base gap-2">
            Next <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Age</label>
            <Input
              type="number"
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="e.g., 30"
              className="h-12 glass-card bg-secondary/50 border-border"
            />
            {errors.age && <p className="text-destructive text-xs mt-1">{errors.age}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Gender</label>
            <div className="flex gap-2">
              {['Male', 'Female', 'Other'].map(g => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 h-12 rounded-lg text-sm font-medium transition-all ${
                    gender === g
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-primary/10'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            {errors.gender && <p className="text-destructive text-xs mt-1">{errors.gender}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Height</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={height}
                onChange={e => setHeight(e.target.value)}
                placeholder={heightUnit === 'cm' ? 'e.g., 175' : 'e.g., 5.9'}
                className="h-12 flex-1 glass-card bg-secondary/50 border-border"
              />
              <div className="flex rounded-lg overflow-hidden border border-border">
                {(['cm', 'ft'] as const).map(u => (
                  <button
                    key={u}
                    onClick={() => setHeightUnit(u)}
                    className={`px-4 h-12 text-sm font-medium transition-colors ${
                      heightUnit === u ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            {errors.height && <p className="text-destructive text-xs mt-1">{errors.height}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Weight</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder={weightUnit === 'kg' ? 'e.g., 70' : 'e.g., 154'}
                className="h-12 flex-1 glass-card bg-secondary/50 border-border"
              />
              <div className="flex rounded-lg overflow-hidden border border-border">
                {(['kg', 'lb'] as const).map(u => (
                  <button
                    key={u}
                    onClick={() => setWeightUnit(u)}
                    className={`px-4 h-12 text-sm font-medium transition-colors ${
                      weightUnit === u ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            {errors.weight && <p className="text-destructive text-xs mt-1">{errors.weight}</p>}
          </div>

          <Button onClick={handleSubmit} className="w-full h-12 text-base gap-2 mt-2">
            Get Dosage <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {step === 2 && result && (
        <div className="space-y-6">
          <h1 className="text-xl sm:text-2xl font-semibold gradient-text leading-relaxed">
            Based on the information you have given us, here is our recommended drug dosage for{' '}
            <span className="text-primary">{result.medicine}</span>:
          </h1>

          <motion.div
            className="glass-card rounded-2xl p-6 sm:p-8 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center py-4">
              <motion.div
                className="text-6xl sm:text-7xl font-bold glow-text mb-2"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {result.dosage}
              </motion.div>
              <p className="text-lg text-muted-foreground">{result.frequency}</p>
              <p className="text-sm text-muted-foreground mt-1">Maximum per day: {result.maxPerDay}</p>
            </div>

            <div className="flex items-start gap-2 p-4 rounded-lg bg-warning/10">
              <AlertTriangle className="w-5 h-5 text-warning mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">{result.safetyWarning}</p>
            </div>

            <div className="flex items-start gap-2 p-4 rounded-lg bg-secondary/50">
              <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">{result.explanation}</p>
            </div>

            <ExpandableSection title="Pharmacokinetic Details">
              <p>{result.details}</p>
            </ExpandableSection>
          </motion.div>
        </div>
      )}
    </FlowLayout>
  );
};

export default DosageFinder;
