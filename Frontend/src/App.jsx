import { useEffect } from 'react'
import { MainLayout } from './components/layout/MainLayout'
import LandingPage from './components/layout/LandingPage'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { useStore } from './store/useStore'

function AppContent() {
  const { user } = useAuth()
  const setUser = useStore(state => state.setUser)

  // Sync Auth User to Global Store (for API calls)
  useEffect(() => {
    setUser(user)
  }, [user, setUser])

  if (!user) {
    return <LandingPage />
  }

  return <MainLayout />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
