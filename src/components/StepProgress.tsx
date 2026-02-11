import { motion } from 'framer-motion';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

const StepProgress = ({ currentStep, totalSteps, labels }: StepProgressProps) => {
  return (
    <div className="flex items-center gap-2 w-full max-w-md mx-auto mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                i < currentStep
                  ? 'bg-primary text-primary-foreground'
                  : i === currentStep
                  ? 'bg-primary/20 text-primary border border-primary glow-border'
                  : 'bg-secondary text-muted-foreground'
              }`}
              initial={{ scale: 0.8 }}
              animate={{ scale: i === currentStep ? 1.1 : 1 }}
              transition={{ duration: 0.3 }}
            >
              {i < currentStep ? '✓' : i + 1}
            </motion.div>
            {labels?.[i] && (
              <span className="text-xs text-muted-foreground mt-1 text-center hidden sm:block">
                {labels[i]}
              </span>
            )}
          </div>
          {i < totalSteps - 1 && (
            <div className="h-0.5 flex-1 mx-1">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: '0%' }}
                animate={{
                  width: i < currentStep ? '100%' : '0%',
                  backgroundColor: i < currentStep ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
                }}
                style={{ backgroundColor: 'hsl(var(--secondary))' }}
                transition={{ duration: 0.4 }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StepProgress;
