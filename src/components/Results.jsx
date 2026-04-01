import { useState, useEffect } from 'react'
import './Results.css'

function CompetitorCard({ name, pct, votes, imageUrl, previewUrl, isWinner, pending }) {
  return (
    <div className={`res-competitor ${isWinner ? 'res-competitor--winner' : ''}`}>
      <span className="res-site-name">{name}</span>

      {imageUrl ? (
        <img src={imageUrl} alt={`Aperçu ${name}`} className="res-thumb" />
      ) : (
        <div className="res-thumb res-thumb--empty">
          <span>Aperçu</span>
        </div>
      )}

      <span className={`res-pct ${pending ? 'res-pct--muted' : ''} ${isWinner ? 'res-pct--accent' : ''}`}>
        {pending ? '--' : `${pct}%`}
      </span>

      <span className="res-votes">
        {pending ? '- vote' : `${votes} vote${votes > 1 ? 's' : ''}`}
      </span>

      {previewUrl && previewUrl !== '#' && (
        <a
          className="res-preview-link"
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Voir le site
        </a>
      )}
    </div>
  )
}

function Results({ published, config }) {
  const [results, setResults] = useState(null)
  const [error, setError] = useState(false)

  const siteA = config?.siteA || {}
  const siteB = config?.siteB || {}

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
      <div className="res">
        <p className="res-subtitle">
          Les résultats seront dévoilés une fois la période de vote terminée.<br />
          Revenez bientôt !
        </p>
        <div className="res-scoreboard">
          <CompetitorCard name="Site A" imageUrl={siteA.imageUrl} previewUrl={siteA.previewUrl} pending />
          <div className="res-vs">VS</div>
          <CompetitorCard name="Site B" imageUrl={siteB.imageUrl} previewUrl={siteB.previewUrl} pending />
        </div>
        <div className="res-combined-bar">
          <div className="res-bar-a res-bar--muted" style={{ width: '50%' }} />
          <div className="res-bar-b res-bar--muted" style={{ width: '50%' }} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="res">
        <p className="res-error">Impossible de charger les résultats.</p>
      </div>
    )
  }

  if (!results) {
    return <div className="res"><p className="res-loading">Chargement des résultats...</p></div>
  }

  const total = results.siteA + results.siteB

  if (total === 0) {
    return (
      <div className="res">
        <p className="res-subtitle">Aucun vote pour l'instant</p>
      </div>
    )
  }

  const pctA = Math.round((results.siteA / total) * 100)
  const pctB = 100 - pctA
  const aWins = results.siteA > results.siteB
  const bWins = results.siteB > results.siteA

  return (
    <div className="res">
      <div className="res-scoreboard">
        <CompetitorCard
          name="Site A"
          pct={pctA}
          votes={results.siteA}
          imageUrl={siteA.imageUrl}
          previewUrl={siteA.previewUrl}
          isWinner={aWins}
        />

        <div className="res-vs">VS</div>

        <CompetitorCard
          name="Site B"
          pct={pctB}
          votes={results.siteB}
          imageUrl={siteB.imageUrl}
          previewUrl={siteB.previewUrl}
          isWinner={bWins}
        />
      </div>

      <div className="res-combined-bar">
        <div className="res-bar-a" style={{ width: `${pctA}%` }} />
        <div className="res-bar-b" style={{ width: `${pctB}%` }} />
      </div>

      <p className="res-total">{total} vote{total > 1 ? 's' : ''} au total</p>
    </div>
  )
}

export default Results
