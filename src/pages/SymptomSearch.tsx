import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, X, AlertTriangle, Shield, CheckCircle, XCircle } from 'lucide-react';
import FlowLayout from '@/components/FlowLayout';
import StepProgress from '@/components/StepProgress';
import ExpandableSection from '@/components/ExpandableSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { symptomChips, getSymptomMedicine, type SymptomMedicine } from '@/data/mockData';

const strengthColors: Record<string, string> = {
  Mild: 'bg-info/20 text-info',
  Regular: 'bg-success/20 text-success',
  Strong: 'bg-destructive/20 text-destructive',
};

const SymptomSearch = () => {
  const [step, setStep] = useState(0);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<SymptomMedicine | null>(null);

  const addSymptom = (s: string) => {
    const trimmed = s.trim();
    if (trimmed && !symptoms.includes(trimmed)) {
      setSymptoms([...symptoms, trimmed]);
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      addSymptom(input);
    }
  };

  const handleFind = () => {
    setResult(getSymptomMedicine(symptoms));
    setStep(1);
  };

  return (
    <FlowLayout
      title={step === 0 ? 'What are your symptoms?' : undefined}
      onBack={step > 0 ? () => setStep(0) : undefined}
      step={step}
    >
      {step === 0 && <StepProgress currentStep={0} totalSteps={2} labels={['Symptoms', 'Results']} />}

      {step === 0 && (
        <div className="space-y-6">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a symptom and press Enter..."
            className="h-14 text-lg glass-card border-border bg-secondary/50 focus:glow-border"
          />

          <div className="flex flex-wrap gap-2">
            {symptomChips.map(chip => (
              <button
                key={chip}
                onClick={() => addSymptom(chip)}
                disabled={symptoms.includes(chip)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  symptoms.includes(chip)
                    ? 'bg-primary/20 text-primary cursor-default'
                    : 'bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {symptoms.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {symptoms.map(s => (
                <motion.span
                  key={s}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-sm"
                >
                  {s}
                  <button onClick={() => setSymptoms(symptoms.filter(x => x !== s))} className="hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.span>
              ))}
            </div>
          )}

          <Button onClick={handleFind} disabled={symptoms.length === 0} className="w-full h-12 text-base gap-2">
            Find Medicine <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {step === 1 && result && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-semibold gradient-text">Recommended Medicine</h1>

          <motion.div
            className="glass-card rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <img src={result.image} alt={result.name} className="w-full h-48 object-cover" />
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{result.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${strengthColors[result.strength]}`}>
                  {result.strength}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-secondary/50 space-y-2">
                <p className="text-sm text-foreground"><strong>Dosage:</strong> {result.dosageInstructions}</p>
                <p className="text-sm text-foreground"><strong>Max per day:</strong> {result.maxPerDay}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
                  {result.safeForAsthma ? (
                    <CheckCircle className="w-4 h-4 text-success shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive shrink-0" />
                  )}
                  <span className="text-sm text-foreground">
                    {result.safeForAsthma ? 'Safe for asthma' : 'Not recommended for asthma'}
                  </span>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/30">
                  <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground">{result.allergyWarning}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10">
                <Shield className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">{result.interactionWarning}</p>
              </div>

              <ExpandableSection title="Ingredients">
                <ul className="list-disc list-inside space-y-1">
                  {result.ingredients.map(i => <li key={i} className="capitalize">{i}</li>)}
                </ul>
              </ExpandableSection>

              <ExpandableSection title="Why Recommended">
                <p>{result.whyRecommended}</p>
              </ExpandableSection>
            </div>
          </motion.div>
        </div>
      )}
    </FlowLayout>
  );
};

export default SymptomSearch;
