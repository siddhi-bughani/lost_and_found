import { Link, useNavigate } from 'react-router-dom'
import { useApi } from '../services/api'
import { fetchItems } from '../services/items'
import SearchBar from '../components/SearchBar'
import ItemCard from '../components/ItemCard'
import Spinner from '../components/Spinner'
import ErrorState from '../components/ErrorState'

export default function Home() {
  const navigate = useNavigate()
  const { data: recent, loading, error } = useApi(() => fetchItems(), [])

  return (
    <div className="home">
      <section className="hero">
        <p className="hero__kicker">Campus Lost &amp; Found</p>
        <h1 className="hero__title">
          Lost something?<br />
          Found something?<br />
          <em>Let&rsquo;s get it back.</em>
        </h1>
        <p className="hero__lede">
          A central place for our university community to report, search, and
          recover lost items across campus.
        </p>

        <SearchBar onSubmit={(q) => navigate(`/browse?q=${encodeURIComponent(q)}`)} />

        <div className="hero__actions">
          <Link to="/report?status=lost" className="action action--lost">
            <span className="action__label">I lost something</span>
            <span className="action__sub">File a lost report</span>
          </Link>
          <Link to="/report?status=found" className="action action--found">
            <span className="action__label">I found something</span>
            <span className="action__sub">Report a found item</span>
          </Link>
        </div>
      </section>

      <section className="recent">
        <div className="section-head">
          <h2>Recently reported</h2>
          <Link to="/browse" className="section-head__link">Browse all →</Link>
        </div>

        {loading && <Spinner label="Loading recent items…" />}
        {error && !loading && <ErrorState message={error.message} />}
        {!loading && !error && recent && recent.length === 0 && (
          <p>No items reported yet.</p>
        )}
        {!loading && !error && recent && recent.length > 0 && (
          <div className="item-grid">
            {recent.slice(0, 6).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
