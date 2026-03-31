import { useState } from 'react'
import './AdminLogin.css'

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur de connexion')
        return
      }

      onLogin(data.token)
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit(e)
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <h1>Administration</h1>
        <p className="admin-login-desc">Entrez le mot de passe pour accéder au tableau de bord.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-pwd">Mot de passe</label>
          <input
            id="admin-pwd"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Mot de passe admin"
            autoFocus
          />

          {error && <p className="admin-error">{error}</p>}

          <button type="submit" className="btn-admin" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
