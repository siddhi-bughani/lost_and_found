import { Link } from 'react-router-dom'
import { useApi } from '../services/api'
import { fetchMyItems } from '../services/items'
import ItemCard from '../components/ItemCard'
import Spinner from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'

export default function MyReports() {
  const { data: items, loading, error } = useApi(() => fetchMyItems(), [])

  return (
    <div className="my-reports">
      <header className="page-head page-head--row">
        <div>
          <p className="page-head__kicker">Your posts</p>
          <h1>My reports</h1>
          <p className="page-head__lede">Items you have reported.</p>
        </div>
        <Link to="/report" className="btn btn--primary">New report</Link>
      </header>

      {loading && <Spinner />}
      {error && !loading && <ErrorState message={error.message} />}
      {!loading && !error && items && items.length === 0 && (
        <EmptyState
          title="No reports yet"
          message="You haven't reported any items. File your first report to see it here."
          action={<Link to="/report" className="btn btn--ghost">Report an item</Link>}
        />
      )}
      {!loading && !error && items && items.length > 0 && (
        <div className="item-grid">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
