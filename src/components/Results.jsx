import { useState, useEffect } from 'react'
import './Results.css'

function Results({ published }) {
  const [results, setResults] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!published) return
    fetch('/api/get-results')
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(setResults)
      .catch(() => setError(true))
  }, [published])

  if (!published) {
    return (
      <div className="results">
        <h2 className="results-title">Merci pour votre vote !</h2>
        <p className="results-pending">Les résultats seront publiés prochainement.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="results">
        <p className="results-error">Impossible de charger les résultats.</p>
      </div>
    )
  }

  if (!results) {
    return <div className="results"><p className="results-loading">Chargement des résultats...</p></div>
  }

  const total = results.siteA + results.siteB

  if (total === 0) {
    return (
      <div className="results">
        <h2 className="results-title">Résultats</h2>
        <p className="results-empty">Aucun vote pour l'instant</p>
      </div>
    )
  }

  const pctA = Math.round((results.siteA / total) * 100)
  const pctB = Math.round((results.siteB / total) * 100)
  const tie = results.siteA === results.siteB
  const aWins = results.siteA >= results.siteB

  return (
    <div className="results">
      <h2 className="results-title">Résultats</h2>

      <div className="results-row">
        <div className="results-label">
          <span className="results-name">Site A</span>
          <span className="results-count">{results.siteA} vote{results.siteA > 1 ? 's' : ''} — {pctA}%</span>
        </div>
        <div className="results-bar-track">
          <div
            className={`results-bar-fill ${tie || aWins ? 'leading' : 'trailing'}`}
            style={{ width: `${pctA}%` }}
          />
        </div>
      </div>

      <div className="results-row">
        <div className="results-label">
          <span className="results-name">Site B</span>
          <span className="results-count">{results.siteB} vote{results.siteB > 1 ? 's' : ''} — {pctB}%</span>
        </div>
        <div className="results-bar-track">
          <div
            className={`results-bar-fill ${tie || !aWins ? 'leading' : 'trailing'}`}
            style={{ width: `${pctB}%` }}
          />
        </div>
      </div>

      <p className="results-total">{total} vote{total > 1 ? 's' : ''} au total</p>
    </div>
  )
}

export default Results
