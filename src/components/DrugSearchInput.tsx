import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { drugs as defaultDrugs } from '@/data/mockData';
import { Input } from '@/components/ui/input';

interface DrugSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  drugs?: string[];
}

const DrugSearchInput = ({ value, onChange, placeholder = 'Type a medicine name...', drugs = defaultDrugs }: DrugSearchInputProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length > 0) {
      const filtered = drugs.filter(d => d.toLowerCase().includes(value.toLowerCase()));
      setSuggestions(filtered);
      setOpen(filtered.length > 0);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  }, [value, drugs]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-12 h-14 text-lg glass-card border-border focus:glow-border focus:border-primary/50 bg-secondary/50"
        />
      </div>
      {(open || (value.length > 0 && suggestions.length === 0)) && (
        <div className="absolute z-50 w-full mt-2 glass-card rounded-lg overflow-hidden shadow-2xl max-h-60 overflow-y-auto">
          {suggestions.length > 0 ? (
            suggestions.map(s => (
              <button
                key={s}
                className="w-full text-left px-4 py-3 hover:bg-primary/10 text-foreground transition-colors"
                onClick={() => { onChange(s); setOpen(false); }}
              >
                {s}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-muted-foreground text-sm">
              Sorry, we don&apos;t have that medicine on record. Please select from the list above or try another name.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DrugSearchInput;
