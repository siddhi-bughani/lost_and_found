import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'

export default function ItemCard({ item }) {
  return (
    <article className="item-card">
      <Link to={`/items/${item.id}`} className="item-card__media">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} loading="lazy" />
        ) : (
          <span className="item-card__placeholder">No image</span>
        )}
      </Link>
      <div className="item-card__body">
        <div className="item-card__top">
          <StatusBadge status={item.status} />
          <span className="item-card__category">{item.category}</span>
        </div>
        <h3 className="item-card__title">
          <Link to={`/items/${item.id}`}>{item.name}</Link>
        </h3>
        <p className="item-card__desc">{item.description}</p>
        <dl className="item-card__meta">
          <div>
            <dt>Location</dt>
            <dd>{item.location}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{formatDate(item.date)}</dd>
          </div>
        </dl>
      </div>
    </article>
  )
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
