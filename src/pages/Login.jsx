import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get('redirect');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message || 'Unable to sign in. Please check your credentials.');
      setLoading(false);
      return;
    }

    navigate(redirect || '/dashboard', { replace: true });
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="bg-warm-white rounded-2xl border border-light-warm-gray shadow-[0_2px_12px_rgba(45,42,38,0.08)] p-8">
          {/* Wordmark */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl text-sky-blue font-extrabold">
              Moves
            </h1>
            <p className="font-body text-warm-gray text-sm mt-1">
              What's the move?
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-burnt-orange/10 border border-burnt-orange/20 rounded-xl px-4 py-3 mb-6">
              <p className="font-body text-sm text-burnt-orange">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2"
              size="lg"
            >
              Sign In
            </Button>
          </form>

          {/* Sign up link */}
          <p className="text-center font-body text-sm text-warm-gray mt-6">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-sky-blue font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
