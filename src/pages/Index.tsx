import { motion } from 'framer-motion';
import { Search, Stethoscope, Pill } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const cards = [
  {
    title: 'Search Drug Equivalents',
    description: 'Find local alternatives for your medicine in any country',
    icon: Search,
    path: '/drug-equivalent',
  },
  {
    title: 'Search by Symptoms',
    description: 'Get medicine recommendations based on how you feel',
    icon: Stethoscope,
    path: '/symptom-search',
  },
  {
    title: 'Find Medicine Dosage',
    description: 'Get personalized dosage recommendations',
    icon: Pill,
    path: '/dosage-finder',
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 glow-border border border-primary/20">
          <Pill className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-3">
          What would you like to do today?
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Your trusted medical utility companion
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl">
        {cards.map((card, i) => (
          <motion.button
            key={card.path}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
            onClick={() => navigate(card.path)}
            className="glass-card-hover rounded-2xl p-8 text-left group cursor-pointer focus:outline-none focus:glow-border focus:border-primary/50"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
              <card.icon className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">{card.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default Index;
