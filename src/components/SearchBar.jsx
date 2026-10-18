import { useState } from 'react'

/**
 * Reusable search input with an accessible label and submit button.
 */
export default function SearchBar({ initialValue = '', onSubmit, placeholder = 'Search items…' }) {
  const [value, setValue] = useState(initialValue)

  function submit(e) {
    e.preventDefault()
    onSubmit(value)
  }

  return (
    <form className="searchbar" role="search" onSubmit={submit}>
      <label htmlFor="search-input" className="sr-only">
        Search lost and found items
      </label>
      <input
        id="search-input"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
      />
      <button type="submit" className="btn btn--primary">
        Search
      </button>
    </form>
  )
}
