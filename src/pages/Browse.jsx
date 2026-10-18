import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchItems, CATEGORIES, LOCATIONS, STATUSES } from '../services/items'
import SearchBar from '../components/SearchBar'
import ItemCard from '../components/ItemCard'
import Spinner from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'

export default function Browse() {
  const [params, setParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const filters = useMemo(
    () => ({
      q: params.get('q') || '',
      status: params.get('status') || '',
      category: params.get('category') || '',
      location: params.get('location') || '',
    }),
    [params]
  )

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    fetchItems(filters)
      .then((data) => active && setItems(data))
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [filters])

  function update(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  return (
    <div className="browse">
      <header className="page-head">
        <p className="page-head__kicker">Catalogue</p>
        <h1>Browse items</h1>
        <p className="page-head__lede">
          Search across lost and found reports filed across campus.
        </p>
        <SearchBar
          initialValue={filters.q}
          onSubmit={(q) => update('q', q)}
        />
      </header>

      <div className="browse__layout">
        <aside className="filters">
          <h2 className="filters__title">Filter</h2>

          <fieldset className="filter-group">
            <legend>Status</legend>
            <label className="filter-opt">
              <input
                type="radio"
                name="status"
                value=""
                checked={!filters.status}
                onChange={() => update('status', '')}
              />
              <span>All</span>
            </label>
            {STATUSES.map((s) => (
              <label className="filter-opt" key={s}>
                <input
                  type="radio"
                  name="status"
                  value={s}
                  checked={filters.status === s}
                  onChange={() => update('status', s)}
                />
                <span>{s === 'lost' ? 'Lost' : 'Found'}</span>
              </label>
            ))}
          </fieldset>

          <label className="filter-field">
            <span>Category</span>
            <select
              value={filters.category}
              onChange={(e) => update('category', e.target.value)}
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Location</span>
            <select
              value={filters.location}
              onChange={(e) => update('location', e.target.value)}
            >
              <option value="">All locations</option>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </label>

          {(filters.status || filters.category || filters.location || filters.q) && (
            <button
              className="btn btn--ghost"
              onClick={() => setParams(new URLSearchParams())}
            >
              Clear filters
            </button>
          )}
        </aside>

        <section className="browse__results">
          <p className="browse__count">
            {loading ? 'Searching…' : `${items.length} item${items.length === 1 ? '' : 's'} found`}
          </p>

          {loading && <Spinner />}
          {error && !loading && <ErrorState message={error.message} />}
          {!loading && !error && items.length === 0 && (
            <EmptyState
              title="No matching items"
              message="Try adjusting your search or clearing filters."
            />
          )}
          {!loading && !error && items.length > 0 && (
            <div className="item-grid">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
