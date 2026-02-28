import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get('redirect');
  const invite = searchParams.get('invite');

  function validate() {
    const errors = {};

    if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);

    const { error: signUpError } = await signUp(email, password);

    if (signUpError) {
      setError(signUpError.message || 'Unable to create account. Please try again.');
      setLoading(false);
      return;
    }

    // Build the onboarding URL, carrying through invite and redirect params
    const onboardingParams = new URLSearchParams();
    if (invite) onboardingParams.set('invite', invite);
    if (redirect) onboardingParams.set('redirect', redirect);

    const paramString = onboardingParams.toString();
    navigate(`/onboarding${paramString ? `?${paramString}` : ''}`, { replace: true });
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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: '' }));
                }
              }}
              error={fieldErrors.password}
              required
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) {
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }
              }}
              error={fieldErrors.confirmPassword}
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2"
              size="lg"
            >
              Create Account
            </Button>
          </form>

          {/* Sign in link */}
          <p className="text-center font-body text-sm text-warm-gray mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-sky-blue font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
