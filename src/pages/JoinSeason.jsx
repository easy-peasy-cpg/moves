import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-3 border-light-warm-gray border-t-sky-blue rounded-full animate-spin" />
    </div>
  );
}

export default function JoinSeason() {
  const { code: urlCode } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState(urlCode || '');
  const [season, setSeason] = useState(null);
  const [creator, setCreator] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberCount, setMemberCount] = useState(0);

  const [loadingState, setLoadingState] = useState(urlCode ? 'loading' : 'idle'); // idle | loading | loaded | error
  const [errorMessage, setErrorMessage] = useState('');
  const [joining, setJoining] = useState(false);
  const [alreadyMember, setAlreadyMember] = useState(false);

  useEffect(() => {
    if (urlCode) {
      fetchSeason(urlCode);
    }
  }, [urlCode, user]);

  async function fetchSeason(inviteCode) {
    setLoadingState('loading');
    setErrorMessage('');
    setSeason(null);
    setCreator(null);
    setMembers([]);
    setAlreadyMember(false);

    try {
      // Fetch the season by invite code
      const { data: seasonData, error: seasonError } = await supabase
        .from('moves_seasons')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();

      if (seasonError || !seasonData) {
        setErrorMessage('No season found with that invite code. Double check and try again.');
        setLoadingState('error');
        return;
      }

      setSeason(seasonData);

      // Fetch creator profile
      const { data: creatorData } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_url')
        .eq('id', seasonData.created_by)
        .single();

      setCreator(creatorData);

      // Fetch current members
      const { data: memberData } = await supabase
        .from('moves_season_members')
        .select('user_id, join_order, profiles(id, display_name, username, avatar_url)')
        .eq('season_id', seasonData.id)
        .order('join_order', { ascending: true });

      const memberList = memberData || [];
      setMembers(memberList);
      setMemberCount(memberList.length);

      // Check if current user is already a member
      if (user) {
        const isMember = memberList.some((m) => m.user_id === user.id);
        setAlreadyMember(isMember);
      }

      setLoadingState('loaded');
    } catch (err) {
      console.error('Error fetching season:', err);
      setErrorMessage('Something went wrong. Please try again.');
      setLoadingState('error');
    }
  }

  function handleLookup(e) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    if (urlCode !== trimmed) {
      navigate(`/join/${trimmed}`, { replace: true });
    } else {
      fetchSeason(trimmed);
    }
  }

  async function handleJoin() {
    if (!user || !season) return;

    setJoining(true);
    setErrorMessage('');

    try {
      // Get the current max join_order
      const { data: maxData } = await supabase
        .from('moves_season_members')
        .select('join_order')
        .eq('season_id', season.id)
        .order('join_order', { ascending: false })
        .limit(1)
        .single();

      const nextOrder = (maxData?.join_order || 0) + 1;

      const { error: insertError } = await supabase
        .from('moves_season_members')
        .insert({
          season_id: season.id,
          user_id: user.id,
          join_order: nextOrder,
        });

      if (insertError) {
        if (insertError.message?.includes('unique') || insertError.message?.includes('duplicate')) {
          setErrorMessage('You are already a member of this season.');
          setAlreadyMember(true);
        } else {
          setErrorMessage(insertError.message || 'Could not join. Please try again.');
        }
        setJoining(false);
        return;
      }

      navigate(`/seasons/${season.id}`, { replace: true });
    } catch (err) {
      console.error('Error joining season:', err);
      setErrorMessage('Something went wrong. Please try again.');
      setJoining(false);
    }
  }

  // Unauthenticated view
  if (loadingState === 'loaded' && !user) {
    const signUpUrl = `/signup?invite=${code}&redirect=/join/${code}`;

    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-fade-up">
          <Card className="p-8 text-center">
            {/* Season info */}
            <h1 className="font-display text-2xl text-charcoal mb-1">
              {season?.name || 'Season'}
            </h1>

            {creator && (
              <p className="font-body text-sm text-warm-gray mb-4">
                Created by {creator.display_name || creator.username}
              </p>
            )}

            {/* Member preview */}
            {members.length > 0 && (
              <div className="flex items-center justify-center mb-4">
                <div className="flex -space-x-2">
                  {members.slice(0, 5).map((m) => (
                    <Avatar
                      key={m.user_id}
                      src={m.profiles?.avatar_url}
                      name={m.profiles?.display_name || m.profiles?.username || ''}
                      size="sm"
                      className="ring-2 ring-warm-white"
                    />
                  ))}
                </div>
                <span className="font-body text-sm text-warm-gray ml-3">
                  {memberCount} {memberCount === 1 ? 'member' : 'members'}
                  {season?.max_members ? ` of ${season.max_members}` : ''}
                </span>
              </div>
            )}

            <div className="border-t border-light-warm-gray pt-6 mt-4">
              <p className="font-body text-sm text-charcoal mb-4">
                Sign up to join this season and start making moves with the crew.
              </p>
              <Link to={signUpUrl}>
                <Button className="w-full" size="lg">
                  Sign Up to Join
                </Button>
              </Link>
              <p className="font-body text-sm text-warm-gray mt-3">
                Already have an account?{' '}
                <Link
                  to={`/login?redirect=/join/${code}`}
                  className="text-sky-blue font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Manual code entry (always shown if no URL code, or as fallback) */}
        {(!urlCode || loadingState === 'error' || loadingState === 'idle') && (
          <div className="animate-fade-up">
            <div className="text-center mb-6">
              <h1 className="font-display text-2xl text-charcoal">Join a Season</h1>
              <p className="font-body text-sm text-warm-gray mt-1">
                Enter the invite code your friend shared.
              </p>
            </div>

            <Card className="p-6">
              <form onSubmit={handleLookup} className="space-y-4">
                <Input
                  label="Invite Code"
                  placeholder="e.g. SUMM2026"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  autoFocus
                />

                {errorMessage && (
                  <div className="bg-burnt-orange/10 border border-burnt-orange/20 rounded-xl px-4 py-3">
                    <p className="font-body text-sm text-burnt-orange">{errorMessage}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={loadingState === 'loading'}
                  disabled={!code.trim()}
                >
                  Look Up Season
                </Button>
              </form>
            </Card>
          </div>
        )}

        {/* Loading */}
        {loadingState === 'loading' && urlCode && (
          <LoadingSpinner />
        )}

        {/* Loaded, authenticated view */}
        {loadingState === 'loaded' && user && season && (
          <div className="animate-fade-up">
            <Card className="p-8">
              {/* Season header */}
              <div className="text-center mb-6">
                <h1 className="font-display text-2xl text-charcoal mb-1">
                  {season.name}
                </h1>
                {season.description && (
                  <p className="font-body text-sm text-warm-gray mb-2">
                    {season.description}
                  </p>
                )}
                {creator && (
                  <p className="font-body text-xs text-warm-gray">
                    Created by {creator.display_name || creator.username}
                  </p>
                )}
              </div>

              {/* Season details */}
              <div className="flex justify-center gap-6 text-center mb-6">
                {season.start_date && (
                  <div>
                    <p className="font-body text-xs text-warm-gray uppercase tracking-wide">
                      Starts
                    </p>
                    <p className="font-body text-sm text-charcoal font-medium">
                      {new Date(season.start_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
                {season.end_date && (
                  <div>
                    <p className="font-body text-xs text-warm-gray uppercase tracking-wide">
                      Ends
                    </p>
                    <p className="font-body text-sm text-charcoal font-medium">
                      {new Date(season.end_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
                <div>
                  <p className="font-body text-xs text-warm-gray uppercase tracking-wide">
                    Crew
                  </p>
                  <p className="font-body text-sm text-charcoal font-medium">
                    {memberCount}
                    {season.max_members ? ` / ${season.max_members}` : ''}
                  </p>
                </div>
              </div>

              {/* Members */}
              {members.length > 0 && (
                <div className="mb-6">
                  <p className="font-body text-xs text-warm-gray uppercase tracking-wide mb-3 text-center">
                    Current Members
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {members.map((m) => (
                      <div key={m.user_id} className="flex flex-col items-center gap-1">
                        <Avatar
                          src={m.profiles?.avatar_url}
                          name={m.profiles?.display_name || m.profiles?.username || ''}
                          size="md"
                        />
                        <span className="font-body text-xs text-warm-gray">
                          {m.profiles?.display_name || m.profiles?.username || 'Member'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              {errorMessage && (
                <div className="bg-burnt-orange/10 border border-burnt-orange/20 rounded-xl px-4 py-3 mb-4">
                  <p className="font-body text-sm text-burnt-orange">{errorMessage}</p>
                </div>
              )}

              {/* Action */}
              {alreadyMember ? (
                <div className="text-center space-y-3">
                  <p className="font-body text-sm text-sage-green font-medium">
                    You are already part of this season.
                  </p>
                  <Button
                    onClick={() => navigate(`/seasons/${season.id}`)}
                    className="w-full"
                    size="lg"
                  >
                    Go to Season
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-body text-sm text-charcoal mb-4">
                    Join this season?
                  </p>
                  <Button
                    onClick={handleJoin}
                    loading={joining}
                    className="w-full"
                    size="lg"
                  >
                    Join the Crew
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
