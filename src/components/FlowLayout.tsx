import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AuthBar from '@/components/AuthBar';

interface FlowLayoutProps {
  children: React.ReactNode;
  title?: string;
  onBack?: () => void;
  showHome?: boolean;
  step: number;
}

const FlowLayout = ({ children, title, onBack, showHome = true, step }: FlowLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          {showHome && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <Home className="w-5 h-5" />
            </Button>
          )}
          </div>
          <AuthBar />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {title && (
              <h1 className="text-2xl sm:text-3xl font-semibold mb-8 gradient-text">{title}</h1>
            )}
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FlowLayout;
