import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import SiteCard from './components/SiteCard.jsx'
import VoteModal from './components/VoteModal.jsx'
import AdminLogin from './components/AdminLogin.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import './App.css'

function VotePage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSite, setSelectedSite] = useState(null)
  const [config, setConfig] = useState(null)

  useEffect(() => {
    fetch('/api/get-config')
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => {
        setConfig({
          siteA: { previewUrl: '#', imageUrl: '' },
          siteB: { previewUrl: '#', imageUrl: '' },
        })
      })
  }, [])

  const handleVote = (siteId) => {
    setSelectedSite(siteId)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setSelectedSite(null)
  }

  return (
    <>
      <header className="header">
        <h1>Duel Web Dev</h1>
        <p className="subtitle">
          Deux développeurs, deux landing pages. Un seul gagnant.<br />
          Votez pour votre réalisation préférée.
        </p>
      </header>

      <main className="sites">
        <SiteCard
          name="Site A"
          previewUrl={config?.siteA?.previewUrl || '#'}
          imageUrl={config?.siteA?.imageUrl || ''}
          onVote={() => handleVote('siteA')}
        />
        <SiteCard
          name="Site B"
          previewUrl={config?.siteB?.previewUrl || '#'}
          imageUrl={config?.siteB?.imageUrl || ''}
          onVote={() => handleVote('siteB')}
        />
      </main>

      {modalOpen && (
        <VoteModal
          siteId={selectedSite}
          onClose={handleClose}
        />
      )}
    </>
  )
}

function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem('admin_token') || '')

  const handleLogin = (newToken) => {
    sessionStorage.setItem('admin_token', newToken)
    setToken(newToken)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token')
    setToken('')
  }

  if (!token) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return <AdminDashboard token={token} onLogout={handleLogout} />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<VotePage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  )
}

export default App
