import './SiteCard.css'

function SiteCard({ name, previewUrl, imageUrl, onVote, disabled }) {
  return (
    <article className="card">
      <h2 className="card-title">{name}</h2>
      <div className="card-preview">
        {imageUrl ? (
          <img src={imageUrl} alt={`Aperçu ${name}`} className="card-image" />
        ) : (
          <span>Aperçu {name}</span>
        )}
      </div>
      <div className="card-actions">
        <a
          className="btn-preview"
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Voir le site
        </a>
        <button className="btn-vote" onClick={onVote} disabled={disabled}>
          {disabled ? 'Vote enregistré' : 'Voter'}
        </button>
      </div>
    </article>
  )
}

export default SiteCard
