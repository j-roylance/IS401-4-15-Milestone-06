import { LogOut, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <Link to="/account">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1">
          <User className="w-4 h-4" />
          {user.username}
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          logout();
          navigate('/login');
        }}
        className="text-muted-foreground hover:text-foreground"
      >
        <LogOut className="w-4 h-4 mr-1" />
        Log out
      </Button>
    </div>
  );
}
