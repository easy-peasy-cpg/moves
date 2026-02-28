import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';

export default function Settings() {
  const { profile, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Populate fields from profile
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setCity(profile.city || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSaveSuccess(false);
    setSaving(true);

    if (!displayName.trim()) {
      setError('Display name is required.');
      setSaving(false);
      return;
    }

    if (!username.trim()) {
      setError('Username is required.');
      setSaving(false);
      return;
    }

    const updates = {
      display_name: displayName.trim(),
      username: username.trim(),
      bio: bio.trim() || null,
      city: city.trim() || null,
      avatar_url: avatarUrl.trim() || null,
    };

    const { error: updateError } = await updateProfile(updates);
    setSaving(false);

    if (updateError) {
      if (updateError.message?.includes('unique') || updateError.message?.includes('duplicate')) {
        setError('That username is already taken.');
      } else {
        setError(updateError.message || 'Could not save changes. Please try again.');
      }
      return;
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  async function handleLogout() {
    setLoggingOut(true);
    await signOut();
    navigate('/', { replace: true });
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Page header */}
      <div className="max-w-xl mx-auto px-4 pt-8 pb-6">
        <h1 className="font-display text-2xl text-charcoal">Settings</h1>
      </div>

      <div className="max-w-xl mx-auto px-4 pb-12 space-y-6">
        {/* Edit Profile */}
        <Card className="p-6">
          <h2 className="font-display text-lg text-charcoal mb-4">Edit Profile</h2>

          {error && (
            <div className="bg-burnt-orange/10 border border-burnt-orange/20 rounded-xl px-4 py-3 mb-4">
              <p className="font-body text-sm text-burnt-orange">{error}</p>
            </div>
          )}

          {saveSuccess && (
            <div className="bg-sage-green/10 border border-sage-green/20 rounded-xl px-4 py-3 mb-4">
              <p className="font-body text-sm text-sage-green">Changes saved.</p>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />

            <Input
              label="Username"
              value={username}
              onChange={(e) => {
                const value = e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, '');
                setUsername(value);
              }}
              required
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
                placeholder="A quick line about yourself"
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

            <Input
              label="City"
              placeholder="Where are you based?"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />

            <Input
              label="Avatar URL"
              placeholder="https://example.com/photo.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              type="url"
            />

            <Button
              type="submit"
              loading={saving}
              className="w-full"
              size="md"
            >
              Save Changes
            </Button>
          </form>
        </Card>

        {/* Log Out */}
        <Card className="p-6">
          <h2 className="font-display text-lg text-charcoal mb-2">Session</h2>
          <p className="font-body text-sm text-warm-gray mb-4">
            Sign out of your account on this device.
          </p>
          <Button
            variant="secondary"
            onClick={handleLogout}
            loading={loggingOut}
          >
            Log Out
          </Button>
        </Card>

        {/* Delete Account */}
        <Card className="p-6 border-burnt-orange/30">
          <h2 className="font-display text-lg text-burnt-orange mb-2">Danger Zone</h2>
          <p className="font-body text-sm text-warm-gray mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button
            variant="destructive"
            onClick={() => setDeleteModalOpen(true)}
          >
            Delete Account
          </Button>
        </Card>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Account"
        size="sm"
      >
        <div className="space-y-4">
          <p className="font-body text-sm text-charcoal">
            Are you sure you want to delete your account? All your seasons, moves, and progress will be permanently removed. This cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                // TODO: implement account deletion
                setDeleteModalOpen(false);
              }}
            >
              Yes, Delete My Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
