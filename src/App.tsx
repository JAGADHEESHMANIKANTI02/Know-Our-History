import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Auth/Login';
import { SignUp } from './components/Auth/SignUp';
import { Dashboard } from './components/Dashboard/Dashboard';

function App() {
  const { user, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return isSignUp ? (
      <SignUp onToggle={() => setIsSignUp(false)} />
    ) : (
      <Login onToggle={() => setIsSignUp(true)} />
    );
  }

  return <Dashboard />;
}

export default App;
