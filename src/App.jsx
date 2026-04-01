import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import SiteCard from './components/SiteCard.jsx'
import VoteModal from './components/VoteModal.jsx'
import Results from './components/Results.jsx'
import AdminLogin from './components/AdminLogin.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import './App.css'

function Nav() {
  const { pathname } = useLocation()
  return (
    <nav className="nav">
      <Link to="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>Vote</Link>
      <Link to="/results" className={`nav-link ${pathname === '/results' ? 'active' : ''}`}>Résultats</Link>
    </nav>
  )
}

function VotePage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSite, setSelectedSite] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [config, setConfig] = useState(null)
  const [resultsPublished, setResultsPublished] = useState(false)
  const [votingOpen, setVotingOpen] = useState(true)

  useEffect(() => {
    fetch('/api/get-config')
      .then((r) => r.json())
      .then((data) => {
        setConfig(data)
        setResultsPublished(!!data.resultsPublished)
        setVotingOpen(data.votingOpen !== false)
      })
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

  const handleClose = (voted) => {
    setModalOpen(false)
    setSelectedSite(null)
    if (voted) setHasVoted(true)
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
          disabled={hasVoted || !votingOpen}
          votingClosed={!votingOpen}
        />
        <SiteCard
          name="Site B"
          previewUrl={config?.siteB?.previewUrl || '#'}
          imageUrl={config?.siteB?.imageUrl || ''}
          onVote={() => handleVote('siteB')}
          disabled={hasVoted || !votingOpen}
          votingClosed={!votingOpen}
        />
      </main>

      {!votingOpen && !hasVoted && (
        <p className="voting-closed-msg">La période de vote est terminée.</p>
      )}

      {hasVoted && <Results published={resultsPublished} config={config} />}

      {modalOpen && (
        <VoteModal
          siteId={selectedSite}
          onClose={handleClose}
        />
      )}
    </>
  )
}

function ResultsPage() {
  const [published, setPublished] = useState(false)
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/get-config')
      .then((r) => r.json())
      .then((data) => {
        setPublished(!!data.resultsPublished)
        setConfig(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="results-page">
        <p className="results-page-loading">Chargement...</p>
      </div>
    )
  }

  return (
    <>
      <header className="header">
        <h1>Duel Web Dev</h1>
        <p className="subtitle">Résultats du vote</p>
      </header>
      <Results published={published} config={config} />
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
  const { pathname } = useLocation()
  const showNav = pathname === '/' || pathname === '/results'

  return (
    <>
      {showNav && <Nav />}
      <Routes>
        <Route path="/" element={<VotePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </>
  )
}

export default App
