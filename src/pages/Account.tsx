import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Loader2 } from 'lucide-react';
import FlowLayout from '@/components/FlowLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CountrySelect from '@/components/CountrySelect';
import { useAuth, type ProfileUpdates } from '@/contexts/AuthContext';

const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL ?? '');

const Account = () => {
  const { user, updateProfile, refreshUser } = useAuth();
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [country, setCountry] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    fetch(`${API_BASE}/api/countries`)
      .then((res) => (res.ok ? res.json() : { countries: [] }))
      .then((data) => setCountries(data.countries || []))
      .catch(() => setCountries([]));
  }, []);

  useEffect(() => {
    if (user) {
      setUsername(user.username ?? '');
      setAge(user.age != null ? String(user.age) : '');
      setGender(user.gender ?? '');
      setHeightCm(user.height_cm != null ? String(user.height_cm) : '');
      setWeightKg(user.weight_kg != null ? String(user.weight_kg) : '');
      setCountry(user.country_name ?? '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const updates: Record<string, unknown> = {
        username: username.trim(),
        age: age === '' ? null : Number(age),
        gender: gender === '' ? null : gender,
        height_cm: heightCm === '' ? null : Number(heightCm),
        weight_kg: weightKg === '' ? null : Number(weightKg),
        country_name: country === '' ? null : country,
      };
      if (newPassword) updates.password = newPassword;
      await updateProfile(updates as ProfileUpdates);
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FlowLayout title="Account details" onBack={() => window.history.back()} step={0}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Username</label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="h-12 glass-card bg-secondary/50 border-border"
            required
            minLength={3}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">New password (leave blank to keep current)</label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            className="h-12 glass-card bg-secondary/50 border-border"
            minLength={6}
          />
        </div>
        {newPassword && (
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Confirm new password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="h-12 glass-card bg-secondary/50 border-border"
            />
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Age</label>
          <Input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g. 30"
            min={1}
            max={120}
            className="h-12 glass-card bg-secondary/50 border-border"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Gender</label>
          <div className="flex gap-2">
            {['Male', 'Female', 'Other'].map((g) => (
              <button
                key={g}
                type="button"
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
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Height (cm)</label>
          <Input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            placeholder="e.g. 175"
            min={50}
            max={250}
            step={0.1}
            className="h-12 glass-card bg-secondary/50 border-border"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Weight (kg)</label>
          <Input
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            placeholder="e.g. 70"
            min={20}
            max={300}
            step={0.1}
            className="h-12 glass-card bg-secondary/50 border-border"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Country</label>
          <CountrySelect
            value={country}
            onChange={setCountry}
            placeholder="Select your country"
            countries={countries.length > 0 ? countries : undefined}
          />
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}
        {success && <p className="text-success text-sm">Profile updated successfully.</p>}

        <Button type="submit" disabled={loading} className="w-full h-12 gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? 'Saving...' : 'Save changes'}
        </Button>
      </form>
    </FlowLayout>
  );
};

export default Account;
