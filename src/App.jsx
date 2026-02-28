import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './lib/auth'
import Nav from './components/layout/Nav'
import BottomTabs from './components/layout/BottomTabs'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'
import CreateSeason from './pages/CreateSeason'
import BuildPool from './pages/BuildPool'
import Draft from './pages/Draft'
import SeasonDashboard from './pages/SeasonDashboard'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import UserProfile from './pages/UserProfile'
import JoinSeason from './pages/JoinSeason'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl text-sky-blue font-bold animate-pulse-slow">Moves</h1>
          <p className="text-warm-gray mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

function AppLayout({ children }) {
  return (
    <>
      <Nav />
      <BottomTabs />
      {children}
    </>
  )
}

export default function App() {
  const { user, loading } = useAuth()
  const location = useLocation()

  const publicRoutes = ['/', '/login', '/signup']
  const isPublicRoute = publicRoutes.includes(location.pathname) || location.pathname.startsWith('/join')
  const showLayout = user && !isPublicRoute && location.pathname !== '/onboarding'

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl text-sky-blue font-bold animate-pulse-slow">Moves</h1>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
      <Route path="/join/:code" element={<JoinSeason />} />
      <Route path="/join" element={<JoinSeason />} />

      {/* Protected routes */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout>
            <DashboardRedirect />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/seasons/new" element={
        <ProtectedRoute>
          <AppLayout>
            <CreateSeason />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/seasons/:id" element={
        <ProtectedRoute>
          <AppLayout>
            <SeasonDashboard />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/seasons/:id/pool" element={
        <ProtectedRoute>
          <AppLayout>
            <BuildPool />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/seasons/:id/draft" element={
        <ProtectedRoute>
          <AppLayout>
            <Draft />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/seasons/:id/feed" element={
        <ProtectedRoute>
          <AppLayout>
            <Feed />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout>
            <Profile />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/user/:username" element={
        <ProtectedRoute>
          <AppLayout>
            <UserProfile />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <AppLayout>
            <Notifications />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <AppLayout>
            <Settings />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function DashboardRedirect() {
  const { seasons, loading } = useSeasonsQuick()

  if (loading) {
    return (
      <div className="pt-20 pb-24 md:pb-8 px-4 max-w-6xl mx-auto">
        <div className="text-center py-20">
          <p className="text-warm-gray">Loading your seasons...</p>
        </div>
      </div>
    )
  }

  if (!seasons || seasons.length === 0) {
    return <DashboardEmpty />
  }

  const activeSeason = seasons.find(s => {
    const now = new Date()
    return new Date(s.end_date) >= now
  }) || seasons[0]

  return <Navigate to={`/seasons/${activeSeason.id}`} replace />
}

function DashboardEmpty() {
  return (
    <div className="pt-20 pb-24 md:pb-8 px-4 max-w-6xl mx-auto">
      <div className="text-center py-20 animate-fade-up">
        <h1 className="font-display text-4xl text-charcoal mb-4">What's the move?</h1>
        <p className="text-warm-gray text-lg mb-8 max-w-md mx-auto">
          Start a season with your crew, or join one that's already brewing.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/seasons/new">
            <button className="bg-sky-blue text-white font-semibold px-8 py-3.5 rounded-full text-lg hover:scale-[1.02] hover:shadow-lg transition-all">
              Start a Season
            </button>
          </a>
          <a href="/join">
            <button className="border-2 border-charcoal text-charcoal font-semibold px-8 py-3.5 rounded-full text-lg hover:bg-charcoal/5 transition-all">
              Join a Season
            </button>
          </a>
        </div>
      </div>
    </div>
  )
}

function useSeasonsQuick() {
  const { user } = useAuth()
  const [seasons, setSeasons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    async function fetch() {
      const { data: memberships } = await supabase
        .from('moves_season_members')
        .select('season_id')
        .eq('user_id', user.id)

      if (!memberships || memberships.length === 0) {
        setSeasons([])
        setLoading(false)
        return
      }

      const seasonIds = memberships.map(m => m.season_id)
      const { data } = await supabase
        .from('moves_seasons')
        .select('*')
        .in('id', seasonIds)
        .order('created_at', { ascending: false })

      setSeasons(data || [])
      setLoading(false)
    }

    fetch()
  }, [user])

  return { seasons, loading }
}

import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
