import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { countries } from '@/data/mockData';

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  excludeCountry?: string;
}

const CountrySelect = ({ value, onChange, placeholder = 'Select a country', excludeCountry }: CountrySelectProps) => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = countries
    .filter(c => c !== excludeCountry)
    .filter(c => c.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full h-14 px-4 flex items-center gap-3 text-left glass-card rounded-lg border border-border hover:border-primary/30 transition-colors"
      >
        <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {value || placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto shrink-0" />
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-2 glass-card rounded-lg overflow-hidden shadow-2xl">
          <div className="p-2 border-b border-border">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search countries..."
              className="w-full px-3 py-2 bg-secondary/50 rounded-md text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-1 focus:ring-primary/50"
              autoFocus
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.map(c => (
              <button
                key={c}
                className="w-full text-left px-4 py-3 hover:bg-primary/10 text-foreground transition-colors text-sm"
                onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
              >
                {c}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-4 py-3 text-muted-foreground text-sm">No countries found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountrySelect;
