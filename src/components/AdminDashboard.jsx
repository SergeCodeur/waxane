import { useState, useEffect } from 'react'
import './AdminDashboard.css'

function AdminDashboard({ token, onLogout }) {
  const [config, setConfig] = useState({
    siteA: { previewUrl: '', imageUrl: '' },
    siteB: { previewUrl: '', imageUrl: '' },
  })
  const [resultsPublished, setResultsPublished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/get-config')
      .then((r) => r.json())
      .then((data) => {
        setConfig({
          siteA: { previewUrl: data.siteA?.previewUrl || '', imageUrl: data.siteA?.imageUrl || '' },
          siteB: { previewUrl: data.siteB?.previewUrl || '', imageUrl: data.siteB?.imageUrl || '' },
        })
        setResultsPublished(!!data.resultsPublished)
      })
      .catch(() => setMessage('Erreur lors du chargement de la config'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (site, field, value) => {
    setConfig((prev) => ({
      ...prev,
      [site]: { ...prev[site], [field]: value },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/update-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...config, resultsPublished }),
      })

      if (!res.ok) {
        const data = await res.json()
        setMessage(data.error || 'Erreur lors de la sauvegarde')
        return
      }

      setMessage('Configuration sauvegardée !')
    } catch {
      setMessage('Erreur réseau')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <p className="admin-loading">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Tableau de bord</h1>
        <button className="btn-logout" onClick={onLogout}>Déconnexion</button>
      </div>

      <div className="admin-sites">
        {['siteA', 'siteB'].map((site) => (
          <div className="admin-site-card" key={site}>
            <h2>{site === 'siteA' ? 'Site A' : 'Site B'}</h2>

            <label>URL de prévisualisation</label>
            <input
              type="url"
              placeholder="https://exemple.com"
              value={config[site].previewUrl}
              onChange={(e) => handleChange(site, 'previewUrl', e.target.value)}
            />

            <label>URL de l'image</label>
            <input
              type="url"
              placeholder="https://exemple.com/image.png"
              value={config[site].imageUrl}
              onChange={(e) => handleChange(site, 'imageUrl', e.target.value)}
            />

            {config[site].imageUrl && (
              <div className="admin-preview">
                <img src={config[site].imageUrl} alt={`Aperçu ${site}`} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="admin-results-toggle">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={resultsPublished}
            onChange={(e) => setResultsPublished(e.target.checked)}
          />
          <span className="toggle-switch" />
          <span className="toggle-text">
            {resultsPublished ? 'Résultats visibles par les votants' : 'Résultats masqués'}
          </span>
        </label>
      </div>

      {message && (
        <p className={`admin-message ${message.includes('sauvegardée') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}

      <button className="btn-admin-save" onClick={handleSave} disabled={saving}>
        {saving ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
      </button>
    </div>
  )
}

export default AdminDashboard
