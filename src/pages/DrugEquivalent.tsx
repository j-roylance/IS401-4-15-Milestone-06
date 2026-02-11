import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, AlertTriangle, Shield } from 'lucide-react';
import FlowLayout from '@/components/FlowLayout';
import StepProgress from '@/components/StepProgress';
import DrugSearchInput from '@/components/DrugSearchInput';
import CountrySelect from '@/components/CountrySelect';
import ExpandableSection from '@/components/ExpandableSection';
import { Button } from '@/components/ui/button';
import { getDrugEquivalent, type DrugEquivalent as DrugEquivType } from '@/data/mockData';

const strengthColors: Record<string, string> = {
  Stronger: 'bg-destructive/20 text-destructive',
  Same: 'bg-success/20 text-success',
  Weaker: 'bg-info/20 text-info',
};

const DrugEquivalent = () => {
  const [step, setStep] = useState(0);
  const [drug, setDrug] = useState('');
  const [fromCountry, setFromCountry] = useState('');
  const [toCountry, setToCountry] = useState('');
  const [result, setResult] = useState<DrugEquivType | null>(null);

  const handleNext = () => {
    if (step === 2) {
      setResult(getDrugEquivalent(drug, fromCountry, toCountry));
      setStep(3);
    } else {
      setStep(step + 1);
    }
  };

  const canProceed = step === 0 ? drug.length > 0 : step === 1 ? fromCountry.length > 0 : toCountry.length > 0;

  const titles = [
    'What is the name of your medicine?',
    'What country are you from?',
    'What country would you like to find the medicine in?',
  ];

  return (
    <FlowLayout
      title={step < 3 ? titles[step] : undefined}
      onBack={step > 0 ? () => setStep(step - 1) : undefined}
      step={step}
    >
      {step < 3 && (
        <StepProgress
          currentStep={step}
          totalSteps={3}
          labels={['Medicine', 'Your Country', 'Target Country']}
        />
      )}

      {step === 0 && (
        <div className="space-y-6">
          <DrugSearchInput value={drug} onChange={setDrug} />
          <Button onClick={handleNext} disabled={!canProceed} className="w-full h-12 text-base gap-2">
            Next <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <CountrySelect value={fromCountry} onChange={setFromCountry} placeholder="Select your country" />
          <Button onClick={handleNext} disabled={!canProceed} className="w-full h-12 text-base gap-2">
            Next <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <CountrySelect
            value={toCountry}
            onChange={setToCountry}
            placeholder="Select target country"
            excludeCountry={fromCountry}
          />
          {toCountry === fromCountry && toCountry && (
            <p className="text-destructive text-sm">Please select a different country</p>
          )}
          <Button onClick={handleNext} disabled={!canProceed || toCountry === fromCountry} className="w-full h-12 text-base gap-2">
            Find Equivalent <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {step === 3 && result && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-semibold gradient-text">Equivalent Found</h1>

          <motion.div
            className="glass-card rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <img src={result.image} alt={result.equivalentName} className="w-full h-48 object-cover" />
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{result.equivalentName}</h2>
                  <p className="text-sm text-muted-foreground">Equivalent for {result.name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${strengthColors[result.strength]}`}>
                  {result.strength}
                </span>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/50">
                <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">{result.dosageSummary}</p>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">{result.ingredientOverlapWarning}</p>
              </div>

              <ExpandableSection title="Active Ingredients">
                <ul className="list-disc list-inside space-y-1">
                  {result.activeIngredients.map(i => <li key={i} className="capitalize">{i}</li>)}
                </ul>
              </ExpandableSection>

              <ExpandableSection title="Why This Is Equivalent">
                <p>{result.whyEquivalent}</p>
              </ExpandableSection>
            </div>
          </motion.div>
        </div>
      )}
    </FlowLayout>
  );
};

export default DrugEquivalent;
