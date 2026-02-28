import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const TOTAL_STEPS = 2;

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={[
            'w-2.5 h-2.5 rounded-full transition-all duration-300',
            i === current
              ? 'bg-sky-blue scale-125'
              : i < current
                ? 'bg-sky-blue/40'
                : 'bg-light-warm-gray',
          ].join(' ')}
        />
      ))}
    </div>
  );
}

function SunIcon() {
  return (
    <svg className="w-10 h-10 text-sunset-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg className="w-10 h-10 text-deep-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  );
}

export default function Onboarding() {
  const { updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const invite = searchParams.get('invite');
  const redirect = searchParams.get('redirect');

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [saving, setSaving] = useState(false);

  // Step 1 fields
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameManuallyEdited, setUsernameManuallyEdited] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null); // null = unchecked, true/false
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Step 2 selection
  const [selectedAction, setSelectedAction] = useState(invite ? 'join' : null);

  const usernameCheckTimeout = useRef(null);

  // Auto-suggest username from display name
  useEffect(() => {
    if (!usernameManuallyEdited && displayName) {
      const suggested = displayName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '.')
        .replace(/[^a-z0-9.]/g, '');
      setUsername(suggested);
      setUsernameAvailable(null);
    }
  }, [displayName, usernameManuallyEdited]);

  async function checkUsernameAvailability(value) {
    if (!value || value.length < 2) {
      setUsernameAvailable(null);
      return;
    }

    setUsernameChecking(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', value)
        .maybeSingle();

      if (error) {
        console.error('Username check error:', error);
        setUsernameAvailable(null);
      } else {
        setUsernameAvailable(!data);
      }
    } catch {
      setUsernameAvailable(null);
    } finally {
      setUsernameChecking(false);
    }
  }

  function handleUsernameChange(e) {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, '');
    setUsername(value);
    setUsernameManuallyEdited(true);
    setUsernameAvailable(null);

    // Debounced availability check
    if (usernameCheckTimeout.current) {
      clearTimeout(usernameCheckTimeout.current);
    }
    usernameCheckTimeout.current = setTimeout(() => {
      checkUsernameAvailability(value);
    }, 500);
  }

  function handleUsernameBlur() {
    if (usernameCheckTimeout.current) {
      clearTimeout(usernameCheckTimeout.current);
    }
    checkUsernameAvailability(username);
  }

  function validateStep1() {
    const errors = {};

    if (!displayName.trim()) {
      errors.displayName = 'Display name is required.';
    }

    if (!username.trim()) {
      errors.username = 'Username is required.';
    } else if (username.length < 2) {
      errors.username = 'Username must be at least 2 characters.';
    } else if (usernameAvailable === false) {
      errors.username = 'This username is taken. Try another.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleNext() {
    if (!validateStep1()) return;

    // If username availability hasn't been checked yet, check now
    if (usernameAvailable === null) {
      await checkUsernameAvailability(username);
      // Re-validate after check
      if (usernameAvailable === false) {
        setFieldErrors({ username: 'This username is taken. Try another.' });
        return;
      }
    }

    setSaving(true);
    const updates = {
      display_name: displayName.trim(),
      username: username.trim(),
      avatar_url: avatarUrl.trim() || null,
      city: city.trim() || null,
      bio: bio.trim() || null,
    };

    const { error } = await updateProfile(updates);
    setSaving(false);

    if (error) {
      if (error.message?.includes('unique') || error.message?.includes('duplicate')) {
        setFieldErrors({ username: 'This username is taken. Try another.' });
      } else {
        setFieldErrors({ general: error.message || 'Something went wrong. Please try again.' });
      }
      return;
    }

    setDirection('forward');
    setStep(1);
  }

  function handleActionSelect(action) {
    setSelectedAction(action);
  }

  function handleFinish() {
    if (selectedAction === 'start') {
      navigate('/seasons/new', { replace: true });
    } else if (selectedAction === 'join') {
      if (invite) {
        navigate(`/join/${invite}`, { replace: true });
      } else {
        navigate('/join', { replace: true });
      }
    } else if (redirect) {
      navigate(redirect, { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }

  function handleExplore() {
    if (redirect) {
      navigate(redirect, { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }

  const usernameHint = usernameChecking
    ? 'Checking...'
    : usernameAvailable === true
      ? 'Available'
      : usernameAvailable === false
        ? 'Taken'
        : null;

  const usernameHintColor = usernameChecking
    ? 'text-warm-gray'
    : usernameAvailable === true
      ? 'text-sage-green'
      : usernameAvailable === false
        ? 'text-burnt-orange'
        : '';

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="font-display text-2xl text-charcoal">
            {step === 0 ? 'Set up your profile' : 'What do you want to do first?'}
          </h1>
          <p className="font-body text-sm text-warm-gray mt-1">
            {step === 0 ? 'Tell your crew a little about yourself.' : 'Pick your first move.'}
          </p>
        </div>

        <StepIndicator current={step} total={TOTAL_STEPS} />

        {/* Step content with animation */}
        <div
          key={step}
          className={direction === 'forward' ? 'animate-fade-up' : 'animate-fade-up'}
        >
          {step === 0 && (
            <div className="bg-warm-white rounded-2xl border border-light-warm-gray shadow-[0_2px_12px_rgba(45,42,38,0.08)] p-6 space-y-4">
              {fieldErrors.general && (
                <div className="bg-burnt-orange/10 border border-burnt-orange/20 rounded-xl px-4 py-3">
                  <p className="font-body text-sm text-burnt-orange">{fieldErrors.general}</p>
                </div>
              )}

              <Input
                label="Display Name"
                placeholder="What should people call you?"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                error={fieldErrors.displayName}
                required
              />

              <div>
                <Input
                  label="Username"
                  placeholder="your.username"
                  value={username}
                  onChange={handleUsernameChange}
                  onBlur={handleUsernameBlur}
                  error={fieldErrors.username}
                  required
                />
                {usernameHint && !fieldErrors.username && (
                  <p className={`text-xs mt-1 font-body ${usernameHintColor}`}>
                    {usernameHint}
                  </p>
                )}
              </div>

              <Input
                label="Avatar URL"
                placeholder="https://example.com/photo.jpg (optional)"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                type="url"
              />

              <Input
                label="City"
                placeholder="Where are you based? (optional)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <div>
                <label className="block font-body font-medium text-sm text-charcoal mb-1.5">
                  Bio
                </label>
                <textarea
                  className={[
                    'w-full rounded-xl bg-cream border px-4 py-3 text-charcoal placeholder:text-warm-gray outline-none transition-all duration-200 font-body resize-none',
                    'border-warm-gray/30 focus:border-sky-blue focus:ring-2 focus:ring-sky-blue/20',
                  ].join(' ')}
                  placeholder="A quick line about yourself (optional)"
                  value={bio}
                  onChange={(e) => {
                    if (e.target.value.length <= 100) {
                      setBio(e.target.value);
                    }
                  }}
                  rows={2}
                  maxLength={100}
                />
                <p className="text-xs text-warm-gray font-body text-right mt-1">
                  {bio.length}/100
                </p>
              </div>

              <Button
                onClick={handleNext}
                loading={saving}
                className="w-full"
                size="lg"
              >
                Next
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card
                  onClick={() => handleActionSelect('start')}
                  className={[
                    'p-6 text-center transition-all duration-200',
                    selectedAction === 'start'
                      ? 'ring-2 ring-sky-blue border-sky-blue'
                      : 'hover:border-warm-gray',
                  ].join(' ')}
                >
                  <div className="flex justify-center mb-3">
                    <SunIcon />
                  </div>
                  <h3 className="font-display text-lg text-charcoal mb-1">
                    Start a Season
                  </h3>
                  <p className="font-body text-sm text-warm-gray leading-relaxed">
                    You're the commissioner. Create a season, invite your crew.
                  </p>
                </Card>

                <Card
                  onClick={() => handleActionSelect('join')}
                  className={[
                    'p-6 text-center transition-all duration-200',
                    selectedAction === 'join'
                      ? 'ring-2 ring-deep-purple border-deep-purple'
                      : 'hover:border-warm-gray',
                  ].join(' ')}
                >
                  <div className="flex justify-center mb-3">
                    <PeopleIcon />
                  </div>
                  <h3 className="font-display text-lg text-charcoal mb-1">
                    Join a Season
                  </h3>
                  <p className="font-body text-sm text-warm-gray leading-relaxed">
                    Got an invite code? Jump in.
                  </p>
                </Card>
              </div>

              <Button
                onClick={handleFinish}
                disabled={!selectedAction}
                className="w-full"
                size="lg"
              >
                {selectedAction === 'start'
                  ? "Let's Go"
                  : selectedAction === 'join'
                    ? 'Enter Code'
                    : 'Continue'}
              </Button>

              <div className="text-center">
                <button
                  onClick={handleExplore}
                  className="font-body text-sm text-warm-gray hover:text-charcoal transition-colors underline underline-offset-2"
                >
                  Explore first
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
